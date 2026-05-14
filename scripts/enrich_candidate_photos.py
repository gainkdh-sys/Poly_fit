#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Poly Fit - candidate photo enrichment helper

Priority:
1. Keep approved entries in data/candidate-photos.json.
2. Auto-approve Wikimedia Commons files only when the license is reusable and
   the filename/metadata strongly matches the candidate's Korean name.
3. Write uncertain official/search candidates to data/candidate-photo-review.json
   for manual review.
4. The web app falls back to party-colored generated avatars when no approved
   photo exists.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import ssl
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

ROOT_DIR = Path(__file__).resolve().parent.parent
REGION_DIR = ROOT_DIR / "data" / "regions"
APPROVED_PATH = ROOT_DIR / "data" / "candidate-photos.json"
REVIEW_PATH = ROOT_DIR / "data" / "candidate-photo-review.json"

COMMONS_API = "https://commons.wikimedia.org/w/api.php"
ALLOWED_LICENSE_HINTS = (
    "CC0",
    "Public domain",
    "PD",
    "CC BY",
    "CC-BY",
    "CC BY-SA",
    "CC-BY-SA",
)
BLOCKED_LICENSE_HINTS = ("NC", "ND", "Non-free", "Fair use")
ALLOWED_IMAGE_EXTENSIONS = (".jpg", ".jpeg", ".png", ".webp")


def now_iso() -> str:
    return dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat()


def normalize(value: str) -> str:
    return "".join(str(value or "").split()).lower()


def candidate_key(candidate: dict[str, Any]) -> str:
    region = candidate.get("region") or []
    return "|".join(
        [
            normalize(region[0] if len(region) > 0 else ""),
            normalize(region[1] if len(region) > 1 else ""),
            normalize(candidate.get("electionType", "")),
            normalize(candidate.get("name", "")),
        ]
    )


def load_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return default


def write_json(path: Path, payload: Any) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def iter_candidates() -> list[dict[str, Any]]:
    candidates: list[dict[str, Any]] = []
    seen: set[str] = set()

    for path in sorted(REGION_DIR.glob("*.json")):
        raw = load_json(path, {})
        if isinstance(raw, list):
            region_candidates = raw
        elif isinstance(raw, dict):
            region_candidates = (
                raw.get("governor", [])
                + raw.get("superintendent", [])
                + [
                    candidate
                    for district in raw.get("districts", {}).values()
                    if isinstance(district, dict)
                    for values in district.values()
                    if isinstance(values, list)
                    for candidate in values
                ]
            )
        else:
            region_candidates = []

        for candidate in region_candidates:
            key = candidate_key(candidate)
            if key and key not in seen:
                seen.add(key)
                candidates.append(candidate)

    return candidates


def request_commons(params: dict[str, Any]) -> dict[str, Any]:
    query = urllib.parse.urlencode(params)
    req = urllib.request.Request(
        f"{COMMONS_API}?{query}",
        headers={"User-Agent": "PolyFitCandidatePhotoBot/0.1 (local script)"},
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.URLError as exc:
        if "CERTIFICATE_VERIFY_FAILED" not in str(exc):
            raise
        context = ssl._create_unverified_context()
        with urllib.request.urlopen(req, timeout=20, context=context) as response:
            return json.loads(response.read().decode("utf-8"))


def search_commons(candidate: dict[str, Any], limit: int) -> list[dict[str, Any]]:
    name = candidate.get("name", "")
    if not name:
        return []

    payload = request_commons(
        {
            "action": "query",
            "format": "json",
            "generator": "search",
            "gsrnamespace": 6,
            "gsrlimit": limit,
            "gsrsearch": f'"{name}"',
            "prop": "imageinfo",
            "iiprop": "url|extmetadata",
            "iiurlwidth": 256,
            "origin": "*",
        }
    )

    pages = payload.get("query", {}).get("pages", {}) or {}
    results = []
    for page in pages.values():
        imageinfo = (page.get("imageinfo") or [{}])[0]
        metadata = imageinfo.get("extmetadata") or {}
        results.append(
            {
                "title": page.get("title", ""),
                "url": imageinfo.get("thumburl") or imageinfo.get("url", ""),
                "originalUrl": imageinfo.get("url", ""),
                "descriptionUrl": imageinfo.get("descriptionurl", ""),
                "license": metadata.get("LicenseShortName", {}).get("value")
                or metadata.get("UsageTerms", {}).get("value")
                or "",
                "attribution": metadata.get("Artist", {}).get("value")
                or metadata.get("Credit", {}).get("value")
                or "",
                "usageTerms": metadata.get("UsageTerms", {}).get("value") or "",
            }
        )
    return results


def license_is_allowed(license_text: str) -> bool:
    if not license_text:
        return False
    normalized_license = license_text.lower()
    if any(blocked.lower() in normalized_license for blocked in BLOCKED_LICENSE_HINTS):
        return False
    return any(allowed.lower() in normalized_license for allowed in ALLOWED_LICENSE_HINTS)


def is_supported_image_result(result: dict[str, Any]) -> bool:
    title = str(result.get("title") or "").lower()
    original_url = str(result.get("originalUrl") or result.get("url") or "").lower()
    return title.endswith(ALLOWED_IMAGE_EXTENSIONS) or original_url.split("?")[0].endswith(ALLOWED_IMAGE_EXTENSIONS)


def is_strong_match(candidate: dict[str, Any], result: dict[str, Any]) -> bool:
    name = normalize(candidate.get("name", ""))
    party = normalize(candidate.get("party", ""))
    region_parts = [normalize(part) for part in (candidate.get("region") or []) if part]
    haystack = normalize(
        " ".join(
            [
                result.get("title", ""),
                result.get("descriptionUrl", ""),
                result.get("attribution", ""),
            ]
        )
    )
    region_or_party_matches = any(part and part in haystack for part in region_parts) or bool(party and party in haystack)
    return bool(name and name in haystack and region_or_party_matches)


def build_review_entry(candidate: dict[str, Any], commons_results: list[dict[str, Any]]) -> dict[str, Any]:
    region = candidate.get("region") or []
    search_query = f"{candidate.get('name', '')} {candidate.get('party', '')} {' '.join(region)} 후보 사진"
    return {
        "key": candidate_key(candidate),
        "name": candidate.get("name", ""),
        "party": candidate.get("party", ""),
        "electionType": candidate.get("electionType", ""),
        "region": region,
        "status": "needs_review",
        "officialSearchUrl": f"https://www.google.com/search?q={urllib.parse.quote(search_query)}",
        "commonsCandidates": commons_results[:5],
        "note": "라이선스와 동일 인물 여부를 확인한 뒤 data/candidate-photos.json에 approved로 옮기세요.",
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Find approved/review candidate photo candidates.")
    parser.add_argument("--limit", type=int, default=0, help="Maximum candidates to scan. 0 means all.")
    parser.add_argument("--commons-limit", type=int, default=5, help="Wikimedia Commons search results per candidate.")
    parser.add_argument("--pause", type=float, default=0.2, help="Pause between Commons API calls.")
    parser.add_argument("--dry-run", action="store_true", help="Do not write candidate photo files.")
    args = parser.parse_args()

    approved = load_json(APPROVED_PATH, {"version": 1, "updatedAt": None, "photos": {}})
    approved.setdefault("photos", {})
    review_entries: list[dict[str, Any]] = []
    candidates = iter_candidates()
    if args.limit > 0:
        candidates = candidates[: args.limit]

    auto_count = 0
    review_count = 0

    for idx, candidate in enumerate(candidates, start=1):
        key = candidate_key(candidate)
        if not key or key in approved["photos"]:
            continue

        print(f"[{idx}/{len(candidates)}] {candidate.get('name')} 사진 후보 검색")
        try:
            commons_results = search_commons(candidate, args.commons_limit)
        except Exception as exc:
            print(f"  Commons 조회 실패: {exc}")
            commons_results = []

        reusable_results = [
            result
            for result in commons_results
            if result.get("url")
            and is_supported_image_result(result)
            and license_is_allowed(result.get("license", ""))
        ]
        strong_result = next((result for result in reusable_results if is_strong_match(candidate, result)), None)

        if strong_result:
            approved["photos"][key] = {
                "status": "approved",
                "url": strong_result["url"],
                "originalUrl": strong_result.get("originalUrl", ""),
                "source": strong_result.get("descriptionUrl", ""),
                "license": strong_result.get("license", ""),
                "attribution": strong_result.get("attribution", ""),
                "provider": "wikimedia-commons",
                "matchedAt": now_iso(),
            }
            auto_count += 1
            print(f"  자동 승인: {strong_result.get('title')} ({strong_result.get('license')})")
        else:
            review_entries.append(build_review_entry(candidate, reusable_results))
            review_count += 1
            print("  검수 대기")

        if args.pause:
            time.sleep(args.pause)

    review = {
        "version": 1,
        "updatedAt": now_iso(),
        "candidates": review_entries,
    }
    approved["updatedAt"] = now_iso()

    print(f"완료: 자동 승인 {auto_count}건, 검수 대기 {review_count}건")
    if not args.dry_run:
        write_json(APPROVED_PATH, approved)
        write_json(REVIEW_PATH, review)
        print(f"저장: {APPROVED_PATH}")
        print(f"저장: {REVIEW_PATH}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
