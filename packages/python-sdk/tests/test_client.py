import unittest

from mailrith_sdk import MailrithApiError, MailrithClient


class MailrithClientTest(unittest.TestCase):
    def test_exposes_generated_namespaces(self) -> None:
        client = MailrithClient(transport=lambda *_args: (200, {}, {"version": "v1"}))

        self.assertTrue(callable(client.discovery.get_metadata))
        self.assertTrue(callable(client.subscribers.list))
        self.assertTrue(callable(client.landing_pages.create))
        self.assertTrue(callable(client.broadcasts.send))
        self.assertTrue(callable(client.broadcasts.cancel))
        self.assertIn(
            "email",
            client.get_operation("subscribers", "list")["query_params"],
        )

    def test_builds_authenticated_requests(self) -> None:
        calls = []

        def transport(method, url, headers, body):
            calls.append((method, url, dict(headers), body))
            return 200, {"content-type": "application/json"}, {"data": {"id": "subscriber-1"}}

        client = MailrithClient(
            base_url="https://api.mailrith.com/",
            api_key="mrk_secret",
            transport=transport,
            default_headers={"x-client": "mailrith-python-sdk-test"},
        )

        response = client.broadcasts.send(
            path={"broadcast_id": "broadcast 123"},
            query={"dry_run": True, "limit": 5},
            body={"confirm": True},
            idempotency_key="broadcast-send-1",
        )

        self.assertEqual(response, {"data": {"id": "subscriber-1"}})
        self.assertEqual(len(calls), 1)

        method, url, headers, body = calls[0]
        self.assertEqual(method, "POST")
        self.assertEqual(
            url,
            "https://api.mailrith.com/v1/broadcasts/broadcast%20123/send?dry_run=true&limit=5",
        )
        self.assertEqual(headers["authorization"], "Bearer mrk_secret")
        self.assertEqual(headers["idempotency-key"], "broadcast-send-1")
        self.assertEqual(headers["x-client"], "mailrith-python-sdk-test")
        self.assertEqual(body, '{"confirm": true}')

    def test_lowercases_boolean_query_values(self) -> None:
        calls = []

        def transport(method, url, headers, body):
            calls.append((method, url, dict(headers), body))
            return 200, {"content-type": "application/json"}, {"data": []}

        client = MailrithClient(api_key="mrk_secret", transport=transport)

        client.subscribers.list(
            query={
                "cold_only": True,
                "include_archived": False,
                "tag": ["vip", True],
            }
        )

        self.assertEqual(len(calls), 1)
        self.assertEqual(
            calls[0][1],
            "https://api.mailrith.com/v1/subscribers?cold_only=true&include_archived=false&tag=vip&tag=true",
        )

    def test_raises_typed_api_errors(self) -> None:
        def transport(*_args):
            return (
                403,
                {"content-type": "application/json"},
                {
                    "error": {
                        "type": "permission_error",
                        "code": "insufficient_scope",
                        "message": "Missing broadcasts:send",
                    }
                },
            )

        client = MailrithClient(api_key="mrk_secret", transport=transport)

        with self.assertRaises(MailrithApiError) as raised:
            client.broadcasts.send(path={"broadcast_id": "broadcast-123"})

        self.assertEqual(raised.exception.status, 403)
        self.assertEqual(raised.exception.type, "permission_error")
        self.assertEqual(raised.exception.code, "insufficient_scope")


if __name__ == "__main__":
    unittest.main()
