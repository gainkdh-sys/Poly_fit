#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Apply sourced party-policy fallback pledges to local council candidates."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

ROOT_DIR = Path(__file__).resolve().parent.parent
REGION_DIR = ROOT_DIR / "data" / "regions"
FALLBACK_PATH = ROOT_DIR / "data" / "party-policy-fallbacks.json"

COUNCIL_TYPES = {"provincial_council", "city_council"}
METRO_NAME_TO_SLUG = {
    "서울특별시": "seoul",
    "부산광역시": "busan",
    "대구광역시": "daegu",
    "인천광역시": "incheon",
    "광주광역시": "gwangju",
    "대전광역시": "daejeon",
    "울산광역시": "ulsan",
    "세종특별자치시": "sejong",
    "경기도": "gyeonggi",
    "강원특별자치도": "gangwon",
    "충청북도": "chungbuk",
    "충청남도": "chungnam",
    "전북특별자치도": "jeonbuk",
    "전라남도": "jeonnam",
    "경상북도": "gyeongbuk",
    "경상남도": "gyeongnam",
    "제주특별자치도": "jeju",
}
PLACEHOLDER_MARKERS = (
    "공식 공약 데이터가 선관위에 공개되면",
    "공약 자료 준비 중",
    "개별 공약 공개자료 확인 중",
    "공개자료 확인 후 반영",
)


def is_placeholder_pledges(pledges: Any) -> bool:
    if not isinstance(pledges, dict) or not pledges:
        return True

    texts = [str(value or "") for value in pledges.values()]
    return all(any(marker in text for marker in PLACEHOLDER_MARKERS) for text in texts)


def fallback_for(candidate: dict[str, Any], config: dict[str, Any]) -> dict[str, Any]:
    party = str(candidate.get("party") or "무소속")
    metro_name = str((candidate.get("region") or [""])[0] or "")
    metro_slug = METRO_NAME_TO_SLUG.get(metro_name, "")
    regional_config = config.get("regionalParties", {}).get(metro_slug, {}).get(party)
    party_config = config.get("parties", {}).get(party)

    if regional_config:
        party_source_url = party_config.get("sourceUrl") if party_config else ""
        return {
            "pledges": regional_config.get("pledges", {}),
            "pledgeSource": "party_policy",
            "pledgeSourceLabel": regional_config.get("sourceLabel")
            or config.get("regionalSourceLabel", "시·도당 지역정책 기반 참고"),
            "pledgeSourceUrl": regional_config.get("sourceUrl") or party_source_url or config.get("sourceUrl"),
        }

    if party_config:
        return {
            "pledges": party_config.get("pledges", {}),
            "pledgeSource": "party_policy",
            "pledgeSourceLabel": config.get("sourceLabel", "정당정책 기반 참고"),
            "pledgeSourceUrl": party_config.get("sourceUrl") or config.get("sourceUrl"),
        }

    pending = config.get("pending", {})
    return {
        "pledges": pending.get("pledges", {}),
        "pledgeSource": pending.get("source", "pending_public_search"),
        "pledgeSourceLabel": pending.get("sourceLabel", "개별 공약 공개자료 확인 중"),
        "pledgeSourceUrl": config.get("sourceUrl"),
    }


def apply_to_candidate(candidate: dict[str, Any], config: dict[str, Any]) -> bool:
    if candidate.get("electionType") not in COUNCIL_TYPES:
        return False

    if not is_placeholder_pledges(candidate.get("pledges")):
        return False

    fallback = fallback_for(candidate, config)
    candidate.update(fallback)

    if fallback["pledgeSource"] == "party_policy":
        candidate["desc"] = "선관위 후보자 데이터와 선관위 정책·공약마당 정당정책을 함께 참고한 후보자입니다."
    else:
        candidate["desc"] = "선관위 후보자 데이터 기반 후보자입니다. 개별 공약은 공개자료 확인 후 반영됩니다."

    return True


def visit(value: Any, config: dict[str, Any]) -> int:
    changed = 0

    if isinstance(value, list):
        for item in value:
            changed += visit(item, config)
        return changed

    if isinstance(value, dict):
        if "electionType" in value and "pledges" in value:
            changed += int(apply_to_candidate(value, config))
        for item in value.values():
            changed += visit(item, config)

    return changed


def main() -> int:
    config = json.loads(FALLBACK_PATH.read_text(encoding="utf-8"))
    total_changed = 0

    for path in sorted(REGION_DIR.glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        changed = visit(data, config)
        if changed:
            path.write_text(
                json.dumps(data, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
            total_changed += changed
            print(f"{path.name}: {changed} candidates updated")

    print(f"total: {total_changed} candidates updated")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
