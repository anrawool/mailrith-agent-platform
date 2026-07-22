from __future__ import annotations

import json
import uuid
from dataclasses import dataclass
from importlib import resources
from typing import Any, Callable, Mapping
from urllib import error, parse, request


TransportResponse = tuple[int, Mapping[str, str], Any]
Transport = Callable[[str, str, Mapping[str, str], str | None], TransportResponse]


def _load_manifest() -> list[dict[str, Any]]:
    with resources.files("mailrith_sdk").joinpath("manifest.json").open(
        "r", encoding="utf-8"
    ) as handle:
        return json.load(handle)


_SDK_MANIFEST = _load_manifest()


class MailrithApiError(RuntimeError):
    def __init__(
        self,
        *,
        status: int,
        message: str,
        error_type: str | None = None,
        code: str | None = None,
        response_body: Any = None,
    ) -> None:
        super().__init__(message)
        self.status = status
        self.type = error_type
        self.code = code
        self.response_body = response_body


@dataclass(frozen=True)
class _Operation:
    namespace: str
    method_name: str
    operation_id: str
    method: str
    path: str
    auth_required: bool


def _default_transport(
    method: str,
    url: str,
    headers: Mapping[str, str],
    body: str | None,
) -> TransportResponse:
    http_request = request.Request(
        url=url,
        method=method,
        headers=dict(headers),
        data=body.encode("utf-8") if body is not None else None,
    )

    try:
        with request.urlopen(http_request) as response:
            payload = response.read().decode("utf-8")
            content_type = response.headers.get("Content-Type", "")
            parsed = json.loads(payload) if payload and "application/json" in content_type else payload or None
            return response.status, dict(response.headers.items()), parsed
    except error.HTTPError as exc:
        payload = exc.read().decode("utf-8")
        content_type = exc.headers.get("Content-Type", "")
        parsed = json.loads(payload) if payload and "application/json" in content_type else payload or None
        return exc.code, dict(exc.headers.items()), parsed


def _normalize_base_url(value: str | None) -> str:
    return (value or "https://api.mailrith.com").rstrip("/")


def _encode_path(pathname: str, path_params: Mapping[str, str | int] | None) -> str:
    encoded = pathname
    for segment in _extract_path_params(pathname):
        if path_params is None or segment not in path_params:
            raise ValueError(f"Missing required path parameter: {segment}.")
        encoded = encoded.replace(
            "{" + segment + "}",
            parse.quote(str(path_params[segment]), safe=""),
        )
    return encoded


def _extract_path_params(pathname: str) -> list[str]:
    parts: list[str] = []
    cursor = 0
    while True:
        start = pathname.find("{", cursor)
        if start < 0:
            return parts
        end = pathname.find("}", start)
        if end < 0:
            return parts
        parts.append(pathname[start + 1 : end])
        cursor = end + 1


def _append_query(url: str, query: Mapping[str, Any] | None) -> str:
    if not query:
        return url

    items: list[tuple[str, str]] = []
    for key, value in query.items():
        if value is None:
            continue
        if isinstance(value, list):
            for item in value:
                if item is not None:
                    items.append((key, _stringify_query_value(item)))
            continue
        items.append((key, _stringify_query_value(value)))

    if not items:
        return url
    separator = "&" if "?" in url else "?"
    return f"{url}{separator}{parse.urlencode(items)}"


def _stringify_query_value(value: Any) -> str:
    if isinstance(value, bool):
        return "true" if value else "false"
    return str(value)


class _ResourceNamespace:
    def __init__(self, client: "MailrithClient", resource: dict[str, Any]) -> None:
        self._client = client
        self._operations = {
            operation["method_name"]: _Operation(
                namespace=resource["namespace"],
                method_name=operation["method_name"],
                operation_id=operation["operation_id"],
                method=operation["method"],
                path=operation["path"],
                auth_required=bool(operation["auth_required"]),
            )
            for operation in resource["operations"]
        }

    def __getattr__(self, method_name: str):
        operation = self._operations.get(method_name)
        if operation is None:
            raise AttributeError(method_name)

        def invoke(
            *,
            path: Mapping[str, str | int] | None = None,
            query: Mapping[str, Any] | None = None,
            body: Any = None,
            headers: Mapping[str, str] | None = None,
            idempotency_key: str | None = None,
            api_key: str | None = None,
        ) -> Any:
            return self._client.request(
                operation,
                path=path,
                query=query,
                body=body,
                headers=headers,
                idempotency_key=idempotency_key,
                api_key=api_key,
            )

        return invoke


class MailrithClient:
    def __init__(
        self,
        *,
        base_url: str | None = None,
        api_key: str | None = None,
        transport: Transport | None = None,
        default_headers: Mapping[str, str] | None = None,
    ) -> None:
        self.base_url = _normalize_base_url(base_url)
        self.api_key = api_key
        self.transport = transport or _default_transport
        self.default_headers = dict(default_headers or {})
        self.operations = _SDK_MANIFEST

        for resource in _SDK_MANIFEST:
            setattr(self, resource["namespace"], _ResourceNamespace(self, resource))

    def with_api_key(self, api_key: str) -> "MailrithClient":
        return MailrithClient(
            base_url=self.base_url,
            api_key=api_key,
            transport=self.transport,
            default_headers=self.default_headers,
        )

    def get_operation(self, namespace: str, method_name: str) -> dict[str, Any] | None:
        for resource in _SDK_MANIFEST:
            if resource["namespace"] != namespace:
                continue
            for operation in resource["operations"]:
                if operation["method_name"] == method_name:
                    return operation
        return None

    def request(
        self,
        operation: _Operation,
        *,
        path: Mapping[str, str | int] | None = None,
        query: Mapping[str, Any] | None = None,
        body: Any = None,
        headers: Mapping[str, str] | None = None,
        idempotency_key: str | None = None,
        api_key: str | None = None,
    ) -> Any:
        resolved_api_key = api_key or self.api_key
        if operation.auth_required and not resolved_api_key:
            raise ValueError(
                f"Mailrith operation {operation.operation_id} requires a bearer credential."
            )

        url = self.base_url + _encode_path(operation.path, path)
        url = _append_query(url, query)

        request_headers: dict[str, str] = {
            "accept": "application/json",
            "x-mailrith-client": "python_sdk/dev",
            "x-mailrith-request-id": f"req_{uuid.uuid4()}",
            **self.default_headers,
            **dict(headers or {}),
        }
        if resolved_api_key:
            request_headers["authorization"] = f"Bearer {resolved_api_key}"
        if idempotency_key:
            request_headers["idempotency-key"] = idempotency_key

        serialized_body: str | None = None
        if body is not None:
            request_headers["content-type"] = "application/json"
            serialized_body = body if isinstance(body, str) else json.dumps(body)

        status, response_headers, response_body = self.transport(
            operation.method,
            url,
            request_headers,
            serialized_body,
        )

        if status < 200 or status >= 300:
            error_payload = (
                response_body.get("error")
                if isinstance(response_body, dict) and isinstance(response_body.get("error"), dict)
                else {}
            )
            raise MailrithApiError(
                status=status,
                message=error_payload.get(
                    "message",
                    f"Mailrith request failed with status {status}.",
                ),
                error_type=error_payload.get("type"),
                code=error_payload.get("code"),
                response_body=response_body,
            )

        return response_body
