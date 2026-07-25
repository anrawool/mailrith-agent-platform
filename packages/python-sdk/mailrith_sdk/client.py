from __future__ import annotations

import json
import re
import uuid
from dataclasses import dataclass
from importlib import resources
from typing import Any, Callable, Mapping
from urllib import error, parse, request


TransportResponse = tuple[int, Mapping[str, str], Any]
Transport = Callable[[str, str, Mapping[str, str], str | None], TransportResponse]


def _load_package_json(file_name: str) -> Any:
    with resources.files("mailrith_sdk").joinpath(file_name).open(
        "r", encoding="utf-8"
    ) as handle:
        return json.load(handle)


_SDK_MANIFEST = _load_package_json("manifest.json")
_DISCOVERY_CATALOG = _load_package_json("operation_discovery.json")
_OPERATIONS = [
    operation
    for resource in _SDK_MANIFEST
    for operation in resource["operations"]
]
_OPERATIONS_BY_ID = {
    operation["operation_id"]: operation for operation in _OPERATIONS
}

_RESOURCE_ALIASES: dict[str, list[str]] = _DISCOVERY_CATALOG["resource_aliases"]
_ACTION_ALIASES: dict[str, list[str]] = _DISCOVERY_CATALOG["action_aliases"]
_OPERATION_INTENTS: dict[str, list[str]] = _DISCOVERY_CATALOG[
    "operation_intent_aliases"
]
_STOP_WORDS = frozenset(_DISCOVERY_CATALOG["stop_words"])


def _normalize_search_text(value: str) -> str:
    camel_spaced = re.sub(r"([a-z0-9])([A-Z])", r"\1 \2", value)
    return re.sub(r"[^a-zA-Z0-9]+", " ", camel_spaced).strip().lower()


def _token_variants(value: str) -> tuple[str, ...]:
    variants = [value]
    if value == "series":
        return tuple(variants)
    if len(value) > 4 and value.endswith("ies"):
        variants.append(f"{value[:-3]}y")
    elif len(value) > 4 and re.search(r"(sses|shes|ches|xes|zes)$", value):
        variants.append(value[:-2])
    elif value == "statuses":
        variants.append("status")
    elif (
        len(value) > 3
        and value.endswith("s")
        and not re.search(r"(ss|us|is)$", value)
    ):
        variants.append(value[:-1])
    return tuple(dict.fromkeys(variants))


def _search_terms(value: str) -> list[tuple[str, tuple[str, ...]]]:
    return [
        (token, _token_variants(token))
        for token in _normalize_search_text(value).split()
        if token and token not in _STOP_WORDS
    ]


def _search_tokens(value: str) -> frozenset[str]:
    return frozenset(
        variant
        for _source, variants in _search_terms(value)
        for variant in variants
    )


def _normalize_intent_text(value: str) -> str:
    return " ".join(source for source, _variants in _search_terms(value))


def _term_matches(
    term: tuple[str, tuple[str, ...]], tokens: frozenset[str]
) -> bool:
    return any(variant in tokens for variant in term[1])


_ACTION_SEARCH_TOKENS = _search_tokens(
    " ".join(
        value
        for action, aliases in _ACTION_ALIASES.items()
        for value in (action, *aliases)
    )
)


def _operation_category(operation: Mapping[str, Any]) -> str:
    if operation["risk"] == "read":
        return "read"
    if operation["risk"] == "delete":
        return "delete"
    if operation["requires_live_action"]:
        return "live"
    return "write"


def _build_search_entry(operation: dict[str, Any]) -> dict[str, Any]:
    operation_words = _normalize_search_text(operation["operation_id"]).split()
    primary_action = next(
        (word for word in operation_words if word in _ACTION_ALIASES),
        None,
    )
    action_words = [primary_action] if primary_action else []
    aliases = _ACTION_ALIASES.get(primary_action or "", [])
    resource_aliases = _RESOURCE_ALIASES.get(operation["namespace"], [])
    intents = _OPERATION_INTENTS.get(operation["operation_id"], [])
    normalized_text = _normalize_search_text(
        " ".join(
            [
                operation["operation_id"],
                operation["namespace"],
                operation["summary"],
                operation["description"],
                operation["path"],
                *aliases,
                *resource_aliases,
                *intents,
            ]
        )
    )
    return {
        "operation": operation,
        "normalized_text": normalized_text,
        "intent_phrase_tokens": tuple(
            tuple(_normalize_intent_text(intent).split())
            for intent in intents
        ),
        "tokens": _search_tokens(normalized_text),
        "action_tokens": _search_tokens(" ".join([*action_words, *aliases])),
        "namespace_tokens": _search_tokens(
            " ".join([operation["namespace"], *resource_aliases])
        ),
        "resource_tokens": _search_tokens(
            " ".join(
                [operation["namespace"], operation["path"], *resource_aliases]
            )
        ),
    }


_SEARCH_INDEX = tuple(_build_search_entry(operation) for operation in _OPERATIONS)
_CATALOG_RESOURCE_TOKENS = frozenset(
    token for entry in _SEARCH_INDEX for token in entry["resource_tokens"]
)


def _parse_credential_recovery(response_body: Any) -> dict[str, Any] | None:
    if not isinstance(response_body, dict):
        return None
    error_payload = response_body.get("error")
    if not isinstance(error_payload, dict):
        return None
    recovery = error_payload.get("recovery")
    credential_type = error_payload.get("credential_type")
    if (
        credential_type not in {"workspace_api_key", "oauth_access_token"}
        or not isinstance(recovery, dict)
        or recovery.get("action") not in {"replace_api_key", "reconnect_oauth"}
        or not isinstance(recovery.get("message"), str)
    ):
        return None
    missing_scopes = error_payload.get("missing_scopes")
    replacement_scopes = recovery.get("replacement_scopes")
    if not isinstance(replacement_scopes, list):
        replacement_scopes = error_payload.get("replacement_scopes")
    return {
        "credential_type": credential_type,
        "action": recovery["action"],
        "message": recovery["message"],
        "missing_scopes": [
            scope for scope in missing_scopes[:50] if isinstance(scope, str)
        ]
        if isinstance(missing_scopes, list)
        else [],
        "replacement_scopes": [
            scope for scope in replacement_scopes[:50] if isinstance(scope, str)
        ]
        if isinstance(replacement_scopes, list)
        else [],
        **(
            {"access_update_url": recovery["access_update_url"]}
            if isinstance(recovery.get("access_update_url"), str)
            else {}
        ),
        **(
            {"permissions_help_url": recovery["permissions_help_url"]}
            if isinstance(recovery.get("permissions_help_url"), str)
            else {}
        ),
    }


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
        self.credential_recovery = _parse_credential_recovery(response_body)


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

    def get_operation(
        self, operation_id_or_namespace: str, method_name: str | None = None
    ) -> dict[str, Any] | None:
        """Return one exact operation without scanning the full manifest.

        Pass an operation ID, or retain namespace/method-name lookup for
        generated-client introspection.
        """
        if method_name is None:
            return _OPERATIONS_BY_ID.get(operation_id_or_namespace)
        for resource in _SDK_MANIFEST:
            if resource["namespace"] != operation_id_or_namespace:
                continue
            for operation in resource["operations"]:
                if operation["method_name"] == method_name:
                    return operation
        return None

    def search_operations(
        self,
        query: str = "",
        *,
        resource: str | None = None,
        category: str | None = None,
        limit: int = 10,
    ) -> dict[str, Any]:
        """Search the bounded generated operation catalog using task language."""
        if category not in {None, "read", "write", "delete", "live"}:
            raise ValueError("category must be read, write, delete, or live.")
        bounded_limit = max(1, min(int(limit), 25))
        normalized_query = _normalize_search_text(query)
        intent_query_tokens = frozenset(
            _normalize_intent_text(normalized_query).split()
        )
        query_terms = _search_terms(normalized_query)
        requested_action_terms = [
            term for term in query_terms
            if _term_matches(term, _ACTION_SEARCH_TOKENS)
        ]
        requested_resource_terms = [
            term for term in query_terms
            if _term_matches(term, _CATALOG_RESOURCE_TOKENS)
        ]
        resource_terms = _search_terms(resource or "")
        matches: list[dict[str, Any]] = []

        for catalog_order, entry in enumerate(_SEARCH_INDEX):
            operation = entry["operation"]
            if category and _operation_category(operation) != category:
                continue
            if resource_terms and not all(
                _term_matches(term, entry["resource_tokens"])
                for term in resource_terms
            ):
                continue
            if not query_terms:
                matches.append({
                    "score": 0,
                    "catalog_order": catalog_order,
                    "operation": operation,
                    "exact_operation_id": False,
                    "exact_intent": False,
                    "intent_specificity": 0,
                })
                continue
            intent_specificity = max(
                (
                    len(phrase_tokens)
                    for phrase_tokens in entry["intent_phrase_tokens"]
                    if len(phrase_tokens) >= 2
                    and all(
                        token in intent_query_tokens
                        for token in phrase_tokens
                    )
                ),
                default=0,
            )
            exact_intent = intent_specificity > 0
            exact_phrase = (
                len(normalized_query) > 2
                and normalized_query in entry["normalized_text"]
            )
            matched_terms = [
                term for term in query_terms
                if _term_matches(term, entry["tokens"])
            ]
            if not matched_terms:
                continue
            action_match_count = sum(
                _term_matches(term, entry["action_tokens"])
                for term in matched_terms
            )
            if (
                not exact_intent
                and not exact_phrase
                and requested_action_terms
                and action_match_count == 0
            ):
                continue
            resource_match_count = sum(
                _term_matches(term, entry["resource_tokens"])
                for term in matched_terms
            )
            if (
                not exact_intent
                and not exact_phrase
                and requested_resource_terms
                and resource_match_count == 0
            ):
                continue
            coverage = len(matched_terms) / len(query_terms)
            namespace_match_count = sum(
                _term_matches(term, entry["namespace_tokens"])
                for term in matched_terms
            )
            exact_operation_id = normalized_query == _normalize_search_text(
                operation["operation_id"]
            )
            score = (
                len(matched_terms) * 12
                + coverage * 20
                + action_match_count * 36
                + resource_match_count * 44
                + namespace_match_count * 28
                + (50 if exact_phrase else 0)
                + (
                    240 + intent_specificity * 40
                    if exact_intent else 0
                )
                + (400 if exact_operation_id else 0)
            )
            matches.append({
                "score": score,
                "catalog_order": catalog_order,
                "operation": operation,
                "exact_operation_id": exact_operation_id,
                "exact_intent": exact_intent,
                "intent_specificity": intent_specificity,
            })

        matches.sort(
            key=lambda match: (-match["score"], match["catalog_order"])
        )
        visible = matches[:bounded_limit]
        first = matches[0] if matches else None
        second = matches[1] if len(matches) > 1 else None
        if not query.strip():
            selection: dict[str, Any] = {
                "status": "browse",
                "requires_clarification": False,
                "message": "Browse the bounded results or add a task or resource.",
            }
        elif first is None:
            selection = {
                "status": "no_match",
                "requires_clarification": True,
                "message": "No operation matched. Rephrase the task or add a resource and effect.",
            }
        elif (
            first["exact_operation_id"]
            or first["exact_intent"]
            or second is None
            or first["score"] - second["score"]
            >= max(24, first["score"] * 0.12)
        ):
            selection = {
                "status": "recommended",
                "requires_clarification": False,
                "recommended_operation_id":
                    first["operation"]["operation_id"],
                "message": "Load the recommended operation before calling it.",
            }
        else:
            selection = {
                "status": "ambiguous",
                "requires_clarification": True,
                "candidate_operation_ids": [
                    match["operation"]["operation_id"]
                    for match in matches[:3]
                ],
                "message": "Several operations match. Narrow the task before executing one.",
            }
        return {
            "matches": [
                {
                    "operation": match["operation"],
                    "score": match["score"],
                }
                for match in visible
            ],
            "selection": selection,
        }

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
