"""Wrapper: inject GH token into requests so camoufox fetch can call GitHub API."""
import os
import sys

import requests

token = os.environ.get("GH_TOKEN")
if not token:
    print("ERROR: GH_TOKEN env var not set", file=sys.stderr)
    sys.exit(1)

_orig_get = requests.get


def _patched_get(url, **kwargs):
    headers = kwargs.pop("headers", {}) or {}
    if "api.github.com" in url:
        headers.setdefault("Authorization", f"Bearer {token}")
        headers.setdefault("Accept", "application/vnd.github+json")
    return _orig_get(url, headers=headers, **kwargs)


requests.get = _patched_get

from camoufox.__main__ import cli  # noqa: E402

sys.argv = ["camoufox", "fetch"]
cli()
