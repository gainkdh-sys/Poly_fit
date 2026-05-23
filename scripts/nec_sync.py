#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Poly Fit - NEC official candidate data sync

Fetches candidate/pre-candidate data from the National Election Commission
OpenAPI and writes Poly Fit region JSON files under data/regions.

Required environment:
  NEC_CANDIDATE_SERVICE_KEY  Candidate information API key
  NEC_PLEDGE_SERVICE_KEY     Pledge information API key

Backward-compatible fallback:
  NEC_SERVICE_KEY            Use one key for both APIs, if allowed

Common usage:
  NEC_CANDIDATE_SERVICE_KEY=... NEC_PLEDGE_SERVICE_KEY=... python3 scripts/nec_sync.py --kind auto --with-pledges
  python3 scripts/nec_sync.py --kind pre --sd-name 서울특별시 --dry-run
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

ROOT_DIR = Path(__file__).resolve().parent.parent
REGION_DIR = ROOT_DIR / "data" / "regions"
RAW_DIR = ROOT_DIR / "data" / "nec"
PARTY_POLICY_FALLBACK_PATH = ROOT_DIR / "data" / "party-policy-fallbacks.json"

CANDIDATE_BASE = "http://apis.data.go.kr/9760000/PofelcddInfoInqireService"
PLEDGE_BASE = "http://apis.data.go.kr/9760000/ElecPrmsInfoInqireService"
PRE_CANDIDATE_ENDPOINT = f"{CANDIDATE_BASE}/getPoelpcddRegistSttusInfoInqire"
CANDIDATE_ENDPOINT = f"{CANDIDATE_BASE}/getPofelcddRegistSttusInfoInqire"
PLEDGE_ENDPOINT = f"{PLEDGE_BASE}/getCnddtElecPrmsInfoInqire"

DEFAULT_SG_ID = "20260603"
OFFICIAL_CANDIDATE_START = dt.date(2026, 5, 14)

ELECTION_TYPE_MAP = {
    "3": "governor",
    "4": "mayor",
    "5": "provincial_council",
    "6": "city_council",
    "11": "superintendent",
}

ELECTION_TYPE_NAMES = {
    "3": "시·도지사",
    "4": "구·시·군의 장",
    "5": "시·도의회의원",
    "6": "구·시·군의회의원",
    "11": "교육감",
}

PLEDGE_SUPPORTED_CODES = {"3", "4", "11"}

METRO_CONFIG = {
    "seoul": {
        "metro": "서울특별시",
        "districts": [
            "종로구", "중구", "용산구", "성동구", "광진구", "동대문구", "중랑구",
            "성북구", "강북구", "도봉구", "노원구", "은평구", "서대문구", "마포구",
            "양천구", "강서구", "구로구", "금천구", "영등포구", "동작구", "관악구",
            "서초구", "강남구", "송파구", "강동구"
        ],
    },
    "busan": {
        "metro": "부산광역시",
        "districts": [
            "중구", "서구", "동구", "영도구", "부산진구", "동래구", "남구", "북구",
            "해운대구", "사하구", "금정구", "강서구", "연제구", "수영구", "사상구",
            "기장군"
        ],
    },
    "daegu": {
        "metro": "대구광역시",
        "districts": ["중구", "동구", "서구", "남구", "북구", "수성구", "달서구", "달성군", "군위군"],
    },
    "incheon": {
        "metro": "인천광역시",
        "districts": ["중구", "동구", "미추홀구", "연수구", "남동구", "부평구", "계양구", "서구", "강화군", "옹진군"],
    },
    "gwangju": {
        "metro": "광주광역시",
        "districts": ["동구", "서구", "남구", "북구", "광산구"],
    },
    "daejeon": {
        "metro": "대전광역시",
        "districts": ["동구", "중구", "서구", "유성구", "대덕구"],
    },
    "ulsan": {
        "metro": "울산광역시",
        "districts": ["중구", "남구", "동구", "북구", "울주군"],
    },
    "sejong": {
        "metro": "세종특별자치시",
        "districts": ["세종특별자치시"],
    },
    "gyeonggi": {
        "metro": "경기도",
        "districts": [
            "수원시", "성남시", "의정부시", "안양시", "부천시", "광명시", "평택시",
            "동두천시", "안산시", "고양시", "과천시", "구리시", "남양주시", "오산시",
            "시흥시", "군포시", "의왕시", "하남시", "용인시", "파주시", "이천시",
            "안성시", "김포시", "화성시", "광주시", "양주시", "포천시", "여주시",
            "연천군", "가평군", "양평군"
        ],
    },
    "gangwon": {
        "metro": "강원특별자치도",
        "districts": [
            "춘천시", "원주시", "강릉시", "동해시", "태백시", "속초시", "삼척시",
            "홍천군", "횡성군", "영월군", "평창군", "정선군", "철원군", "화천군",
            "양구군", "인제군", "고성군", "양양군"
        ],
    },
    "chungbuk": {
        "metro": "충청북도",
        "districts": ["청주시", "충주시", "제천시", "보은군", "옥천군", "영동군", "증평군", "진천군", "괴산군", "음성군", "단양군"],
    },
    "chungnam": {
        "metro": "충청남도",
        "districts": ["천안시", "공주시", "보령시", "아산시", "서산시", "논산시", "계룡시", "당진시", "금산군", "부여군", "서천군", "청양군", "홍성군", "예산군", "태안군"],
    },
    "jeonbuk": {
        "metro": "전북특별자치도",
        "districts": ["전주시", "군산시", "익산시", "정읍시", "남원시", "김제시", "완주군", "진안군", "무주군", "장수군", "임실군", "순창군", "고창군", "부안군"],
    },
    "jeonnam": {
        "metro": "전라남도",
        "districts": [
            "목포시", "여수시", "순천시", "나주시", "광양시", "담양군", "곡성군",
            "구례군", "고흥군", "보성군", "화순군", "장흥군", "강진군", "해남군",
            "영암군", "무안군", "함평군", "영광군", "장성군", "완도군", "진도군", "신안군"
        ],
    },
    "gyeongbuk": {
        "metro": "경상북도",
        "districts": [
            "포항시", "경주시", "김천시", "안동시", "구미시", "영주시", "영천시",
            "상주시", "문경시", "경산시", "의성군", "청송군", "영양군", "영덕군",
            "청도군", "고령군", "성주군", "칠곡군", "예천군", "봉화군", "울진군", "울릉군"
        ],
    },
    "gyeongnam": {
        "metro": "경상남도",
        "districts": [
            "창원시", "진주시", "통영시", "사천시", "김해시", "밀양시", "거제시",
            "양산시", "의령군", "함안군", "창녕군", "고성군", "남해군", "하동군",
            "산청군", "함양군", "거창군", "합천군"
        ],
    },
    "jeju": {
        "metro": "제주특별자치도",
        "districts": ["제주시", "서귀포시"],
    },
}

SD_NAME_TO_SLUG = {config["metro"]: slug for slug, config in METRO_CONFIG.items()}
METRO_LEVEL_TYPES = {"governor", "superintendent"}
COUNCIL_ELECTION_TYPES = {"provincial_council", "city_council"}

PARTY_COLORS = {
    "더불어민주당": ("1e40af", "fff"),
    "국민의힘": ("ef4444", "fff"),
    "개혁신당": ("f97316", "fff"),
    "진보당": ("7c3aed", "fff"),
    "정의당": ("facc15", "111827"),
    "무소속": ("64748b", "fff"),
}

PLEDGE_GROUPS = {
    "welfare": ["복지", "보건", "의료", "돌봄", "여성", "노인", "아동", "청년", "장애", "안전"],
    "education": ["교육", "학교", "학생", "대학", "평생", "인재", "학력"],
    "transport": ["교통", "철도", "도로", "버스", "지하철", "공항", "항만", "물류", "이동"],
    "culture": ["문화", "관광", "체육", "예술", "축제", "상권", "소상공"],
    "housing": ["주거", "주택", "부동산", "재개발", "재건축", "도시", "정비"],
    "environment": ["환경", "기후", "탄소", "녹색", "산업", "경제", "일자리", "기업", "첨단", "에너지"],
}

PLACEHOLDER_MARKERS = (
    "공식 공약 데이터가 선관위에 공개되면",
    "예비후보자 공약 데이터가 선관위에 공개되면",
    "공약 자료 준비 중",
    "개별 공약 공개자료 확인 중",
    "공개자료 확인 후 반영",
)

_PARTY_POLICY_FALLBACKS: dict[str, Any] | None = None


def log(message: str) -> None:
    now = dt.datetime.now().strftime("%H:%M:%S")
    print(f"[{now}] {message}")


def normalize_key(value: str) -> str:
    return "".join((value or "").split())


def normalize_service_key(service_key: str) -> str:
    # data.go.kr shows both encoded and decoded keys. Decode first, then urlencode
    # once with the rest of the query so either copied form works.
    return urllib.parse.unquote((service_key or "").strip())


def build_url(endpoint: str, params: dict[str, Any], service_key: str) -> str:
    query_params = {**params, "serviceKey": normalize_service_key(service_key)}
    query = urllib.parse.urlencode(query_params, doseq=True)
    return f"{endpoint}?{query}"


def request_json(endpoint: str, params: dict[str, Any], service_key: str, timeout: int = 20) -> dict[str, Any]:
    url = build_url(endpoint, params, service_key)
    req = urllib.request.Request(url, headers={"Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as res:
            raw = res.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"HTTP {exc.code} from NEC API: {body[:300]}") from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f"NEC API connection failed: {exc}") from exc

    try:
        return json.loads(raw)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"NEC API returned non-JSON response: {raw[:300]}") from exc


def find_body(payload: dict[str, Any]) -> dict[str, Any]:
    if "response" in payload:
        return payload.get("response", {}).get("body", {}) or {}

    for value in payload.values():
        if isinstance(value, dict) and "body" in value:
            return value.get("body", {}) or {}

    return payload.get("body", {}) or {}


def extract_items(payload: dict[str, Any]) -> tuple[list[dict[str, Any]], int]:
    body = find_body(payload)
    total_count = int(str(body.get("totalCount") or 0).strip() or 0)
    items = body.get("items", {})

    if isinstance(items, dict):
        item = items.get("item", [])
    else:
        item = items

    if isinstance(item, list):
        return [row for row in item if isinstance(row, dict)], total_count
    if isinstance(item, dict):
        return [item], total_count or 1

    return [], total_count


def get_result_message(payload: dict[str, Any]) -> str:
    if "response" in payload:
        header = payload.get("response", {}).get("header", {}) or {}
        return str(header.get("resultMsg") or header.get("resultCode") or "")

    for value in payload.values():
        if isinstance(value, dict):
            header = value.get("header", {}) or {}
            if header:
                return str(header.get("resultMsg") or header.get("resultCode") or "")
    return ""


def fetch_paged(endpoint: str, params: dict[str, Any], service_key: str, pause: float) -> list[dict[str, Any]]:
    page_no = 1
    num_of_rows = int(params.get("numOfRows", 100))
    rows: list[dict[str, Any]] = []

    max_pages = int(params.get("maxPages", 20))
    while True:
        page_params = {**params, "pageNo": page_no, "numOfRows": num_of_rows}
        page_params.pop("maxPages", None)
        payload = request_json(endpoint, page_params, service_key)
        items, total_count = extract_items(payload)
        rows.extend(items)

        if page_no == 1:
            msg = get_result_message(payload)
            if msg and msg not in {"NORMAL SERVICE", "INFO-00", "00"}:
                log(f"  API message: {msg}")

        if total_count <= len(rows) or not items or page_no >= max_pages:
            if page_no >= max_pages and total_count > len(rows):
                log(f"  페이지 상한 도달: {len(rows)}/{total_count}건만 수집")
            break

        page_no += 1
        if pause:
            time.sleep(pause)

    return rows


def choose_kind(kind: str, today: dt.date | None = None) -> str:
    if kind != "auto":
        return kind

    today = today or dt.date.today()
    return "candidate" if today >= OFFICIAL_CANDIDATE_START else "pre"


def official_endpoint_for(kind: str) -> str:
    return CANDIDATE_ENDPOINT if kind == "candidate" else PRE_CANDIDATE_ENDPOINT


def candidate_source_label(kind: str) -> str:
    return "공식 후보자" if kind == "candidate" else "예비후보자"


def fetch_nec_candidates(
    service_key: str,
    sg_id: str,
    kind: str,
    sd_names: list[str],
    sg_typecodes: list[str],
    pause: float,
) -> list[dict[str, Any]]:
    endpoint = official_endpoint_for(kind)
    all_rows: list[dict[str, Any]] = []

    for sd_name in sd_names:
        for sg_typecode in sg_typecodes:
            log(f"NEC {candidate_source_label(kind)} 조회: {sd_name} / {ELECTION_TYPE_NAMES.get(sg_typecode, sg_typecode)}")
            try:
                rows = fetch_paged(
                    endpoint,
                    {
                        "resultType": "json",
                        "sgId": sg_id,
                        "sgTypecode": sg_typecode,
                        "sdName": sd_name,
                        "numOfRows": 100,
                        "maxPages": 5,
                    },
                    service_key,
                    pause,
                )
            except RuntimeError as exc:
                log(f"  조회 실패, 계속 진행: {exc}")
                rows = []
            log(f"  수집 {len(rows)}건")
            all_rows.extend(rows)
            if pause:
                time.sleep(pause)

    return all_rows


def fetch_candidate_pledges(
    service_key: str,
    sg_id: str,
    sg_typecode: str,
    cnddt_id: str,
    pause: float,
) -> list[dict[str, str]]:
    payload = request_json(
        PLEDGE_ENDPOINT,
        {
            "resultType": "json",
            "sgId": sg_id,
            "sgTypecode": sg_typecode,
            "cnddtId": cnddt_id,
            "pageNo": 1,
            "numOfRows": 10,
        },
        service_key,
    )
    rows, _ = extract_items(payload)
    if pause:
        time.sleep(pause)

    pledges: list[dict[str, str]] = []
    for row in rows:
        for idx in range(1, 11):
            title = str(row.get(f"prmsTitle{idx}") or "").strip()
            content = str(row.get(f"prmsCont{idx}") or "").strip()
            realm = str(row.get(f"prmsRealmName{idx}") or "").strip()
            if title or content:
                pledges.append({"realm": realm, "title": title, "content": content})
    return pledges


def pledge_group_for(pledge: dict[str, str]) -> str:
    haystack = f"{pledge.get('realm', '')} {pledge.get('title', '')} {pledge.get('content', '')}"
    for group, keywords in PLEDGE_GROUPS.items():
        if any(keyword in haystack for keyword in keywords):
            return group
    return "environment"


def normalize_pledges(pledge_items: list[dict[str, str]]) -> dict[str, str]:
    grouped: dict[str, list[str]] = {group: [] for group in PLEDGE_GROUPS}

    for item in pledge_items:
        group = pledge_group_for(item)
        title = item.get("title", "").strip()
        content = item.get("content", "").strip()
        text = " - ".join(part for part in [title, content] if part)
        if text:
            grouped[group].append(text)

    return {
        group: " / ".join(values[:2])
        for group, values in grouped.items()
        if values
    }


def load_party_policy_fallbacks() -> dict[str, Any]:
    global _PARTY_POLICY_FALLBACKS

    if _PARTY_POLICY_FALLBACKS is not None:
        return _PARTY_POLICY_FALLBACKS

    if not PARTY_POLICY_FALLBACK_PATH.exists():
        _PARTY_POLICY_FALLBACKS = {}
        return _PARTY_POLICY_FALLBACKS

    _PARTY_POLICY_FALLBACKS = json.loads(PARTY_POLICY_FALLBACK_PATH.read_text(encoding="utf-8"))
    return _PARTY_POLICY_FALLBACKS


def is_placeholder_pledges(pledges: Any) -> bool:
    if not isinstance(pledges, dict) or not pledges:
        return True

    texts = [str(value or "") for value in pledges.values()]
    return all(any(marker in text for marker in PLACEHOLDER_MARKERS) for text in texts)


def council_policy_fallback(party: str) -> dict[str, Any]:
    config = load_party_policy_fallbacks()
    party_config = (config.get("parties") or {}).get(party)

    if party_config:
        return {
            "pledges": party_config.get("pledges", {}),
            "pledgeSource": "party_policy",
            "pledgeSourceLabel": config.get("sourceLabel", "정당정책 기반 참고"),
            "pledgeSourceUrl": party_config.get("sourceUrl") or config.get("sourceUrl"),
        }

    pending = config.get("pending") or {}
    return {
        "pledges": pending.get("pledges", {}),
        "pledgeSource": pending.get("source", "pending_public_search"),
        "pledgeSourceLabel": pending.get("sourceLabel", "개별 공약 공개자료 확인 중"),
        "pledgeSourceUrl": config.get("sourceUrl"),
    }


def placeholder_pledges(kind: str) -> dict[str, str]:
    label = "공식 공약" if kind == "candidate" else "예비후보자 공약"
    message = f"{label} 데이터가 선관위에 공개되면 자동 반영됩니다."
    return {
        "welfare": message,
        "education": message,
        "transport": message,
        "culture": message,
        "housing": message,
        "environment": message,
    }


def district_for_row(row: dict[str, Any], slug: str) -> str:
    districts = METRO_CONFIG[slug]["districts"]
    candidates = [
        str(row.get("wiwName") or "").strip(),
        str(row.get("sggName") or "").strip(),
        str(row.get("addr") or "").strip(),
    ]

    for value in candidates:
        if value in districts:
            return value

    compact_values = [normalize_key(value) for value in candidates]
    for district in sorted(districts, key=len, reverse=True):
        compact_district = normalize_key(district)
        if any(compact_district and compact_district in value for value in compact_values):
            return district

    if slug == "sejong":
        return "세종특별자치시"

    return str(row.get("wiwName") or row.get("sggName") or "기타").strip() or "기타"


def avatar_url(name: str, party: str) -> str:
    bg, color = PARTY_COLORS.get(party, PARTY_COLORS["무소속"])
    return (
        "https://ui-avatars.com/api/?"
        f"name={urllib.parse.quote(name)}&background={bg}&color={color}&size=128"
    )


def candidate_id(row: dict[str, Any]) -> int:
    raw = str(row.get("huboid") or row.get("cnddtId") or row.get("num") or "").strip()
    if raw.isdigit():
        return int(raw)

    fallback = normalize_key(
        "|".join(str(row.get(key) or "") for key in ["sgId", "sgTypecode", "sdName", "sggName", "name"])
    )
    return abs(hash(fallback)) % 900000000 + 100000000


def bio_for_row(row: dict[str, Any]) -> str:
    pieces = []
    for key in ["job", "edu", "career1", "career2"]:
        value = str(row.get(key) or "").strip()
        if value and value != "-":
            pieces.append(value)

    return " | ".join(pieces) if pieces else "선관위 공개 후보자 정보"


def existing_candidates() -> dict[tuple[str, str, str, str], dict[str, Any]]:
    index: dict[tuple[str, str, str, str], dict[str, Any]] = {}

    for path in REGION_DIR.glob("*.json"):
        try:
            raw = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue

        if isinstance(raw, list):
            candidates = raw
        elif isinstance(raw, dict):
            candidates = (
                raw.get("governor", [])
                + raw.get("superintendent", [])
                + [
                    cand
                    for district in raw.get("districts", {}).values()
                    if isinstance(district, dict)
                    for values in district.values()
                    if isinstance(values, list)
                    for cand in values
                ]
            )
        else:
            continue

        for cand in candidates:
            if not isinstance(cand, dict):
                continue
            regions = cand.get("region") or []
            sd_name = regions[0] if regions else ""
            district = regions[1] if len(regions) > 1 else ""
            key = (
                normalize_key(sd_name),
                normalize_key(district),
                normalize_key(cand.get("electionType", "")),
                normalize_key(cand.get("name", "")),
            )
            index[key] = cand

    return index


def merge_existing_fields(candidate: dict[str, Any], existing_index: dict[tuple[str, str, str, str], dict[str, Any]]) -> dict[str, Any]:
    regions = candidate.get("region") or []
    sd_name = regions[0] if regions else ""
    district = regions[1] if len(regions) > 1 else ""
    key = (
        normalize_key(sd_name),
        normalize_key(district),
        normalize_key(candidate.get("electionType", "")),
        normalize_key(candidate.get("name", "")),
    )
    old = existing_index.get(key)
    if not old:
        return candidate

    if old.get("pledges") and not candidate.get("pledgeItems") and not is_placeholder_pledges(old.get("pledges")):
        candidate["pledges"] = old["pledges"]
        for key in ("pledgeSource", "pledgeSourceLabel", "pledgeSourceUrl"):
            if old.get(key):
                candidate[key] = old[key]
    if old.get("imageUrl") and "ui-avatars.com" not in str(old.get("imageUrl")):
        candidate["imageUrl"] = old["imageUrl"]
    if old.get("desc") and "공식 공약 데이터" not in str(candidate.get("desc", "")):
        candidate["desc"] = old["desc"]

    return candidate


def convert_row(
    row: dict[str, Any],
    kind: str,
    pledge_items: list[dict[str, str]],
    existing_index: dict[tuple[str, str, str, str], dict[str, Any]],
) -> dict[str, Any] | None:
    sg_typecode = str(row.get("sgTypecode") or "").strip()
    election_type = ELECTION_TYPE_MAP.get(sg_typecode)
    sd_name = str(row.get("sdName") or "").strip()
    name = str(row.get("name") or row.get("krName") or "").strip()
    party = str(row.get("jdName") or row.get("partyName") or "무소속").strip() or "무소속"
    slug = SD_NAME_TO_SLUG.get(sd_name)

    if not election_type or not slug or not name:
        return None

    if election_type in METRO_LEVEL_TYPES:
        region = [sd_name]
    else:
        region = [sd_name, district_for_row(row, slug)]

    pledges = normalize_pledges(pledge_items)
    pledge_source = "nec_official" if pledges else "pending_nec"
    pledge_source_label = "선관위 공식 공약" if pledges else "선관위 공약 공개 전"
    pledge_source_url = ""

    if not pledges:
        if election_type in COUNCIL_ELECTION_TYPES:
            fallback = council_policy_fallback(party)
            pledges = fallback.get("pledges") or placeholder_pledges(kind)
            pledge_source = fallback.get("pledgeSource", "pending_public_search")
            pledge_source_label = fallback.get("pledgeSourceLabel", "개별 공약 공개자료 확인 중")
            pledge_source_url = fallback.get("pledgeSourceUrl", "")
        else:
            pledges = placeholder_pledges(kind)

    candidate = {
        "id": candidate_id(row),
        "electionType": election_type,
        "region": region,
        "name": name,
        "party": party,
        "bio": bio_for_row(row),
        "imageUrl": avatar_url(name, party),
        "desc": f"선관위 {candidate_source_label(kind)} 데이터 기반 후보자입니다.",
        "pledges": pledges,
        "pledgeSource": pledge_source,
        "pledgeSourceLabel": pledge_source_label,
        "source": "nec",
        "nec": {
            "sgId": str(row.get("sgId") or DEFAULT_SG_ID),
            "sgTypecode": sg_typecode,
            "huboid": str(row.get("huboid") or ""),
            "sggName": str(row.get("sggName") or ""),
            "sdName": sd_name,
            "wiwName": str(row.get("wiwName") or ""),
            "status": str(row.get("status") or ""),
            "regdate": str(row.get("regdate") or ""),
            "kind": kind,
        },
    }

    if pledge_source_url:
        candidate["pledgeSourceUrl"] = pledge_source_url

    if pledge_source == "party_policy":
        candidate["desc"] = "선관위 후보자 데이터와 선관위 정책·공약마당 정당정책을 함께 참고한 후보자입니다."
    elif pledge_source == "pending_public_search":
        candidate["desc"] = "선관위 후보자 데이터 기반 후보자입니다. 개별 공약은 공개자료 확인 후 반영됩니다."

    if pledge_items:
        candidate["pledgeItems"] = pledge_items

    return merge_existing_fields(candidate, existing_index)


def empty_region(slug: str) -> dict[str, Any]:
    config = METRO_CONFIG[slug]
    return {
        "metro": config["metro"],
        "metroSlug": slug,
        "governor": [],
        "superintendent": [],
        "districts": {district: {} for district in config["districts"]},
    }


def write_regions(candidates: list[dict[str, Any]], dry_run: bool) -> None:
    grouped = {slug: empty_region(slug) for slug in METRO_CONFIG}

    for cand in candidates:
        regions = cand.get("region") or []
        slug = SD_NAME_TO_SLUG.get(regions[0] if regions else "")
        if not slug:
            continue

        election_type = cand.get("electionType")
        if election_type in METRO_LEVEL_TYPES:
            grouped[slug][election_type].append(cand)
            continue

        district = regions[1] if len(regions) > 1 else "기타"
        if district not in grouped[slug]["districts"]:
            grouped[slug]["districts"][district] = {}
        grouped[slug]["districts"][district].setdefault(election_type, []).append(cand)

    for slug, payload in grouped.items():
        metro_count = len(payload["governor"]) + len(payload["superintendent"])
        district_count = sum(
            len(values)
            for district in payload["districts"].values()
            for values in district.values()
            if isinstance(values, list)
        )
        log(f"{payload['metro']}: 광역 {metro_count}명, 기초 {district_count}명")

        if dry_run:
            continue

        path = REGION_DIR / f"{slug}.json"
        path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def should_fetch_pledges(args: argparse.Namespace, kind: str) -> bool:
    if args.with_pledges:
        return True
    if args.no_pledges:
        return False
    return kind == "candidate"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Sync NEC official candidate data into Poly Fit region JSON files.")
    parser.add_argument(
        "--service-key",
        default=os.environ.get("NEC_SERVICE_KEY"),
        help="Shared Public Data Portal service key. Used as a fallback for both APIs.",
    )
    parser.add_argument(
        "--candidate-service-key",
        default=os.environ.get("NEC_CANDIDATE_SERVICE_KEY") or os.environ.get("NEC_SERVICE_KEY"),
        help="Candidate information API key. Defaults to NEC_CANDIDATE_SERVICE_KEY, then NEC_SERVICE_KEY.",
    )
    parser.add_argument(
        "--pledge-service-key",
        default=os.environ.get("NEC_PLEDGE_SERVICE_KEY") or os.environ.get("NEC_SERVICE_KEY"),
        help="Pledge information API key. Defaults to NEC_PLEDGE_SERVICE_KEY, then NEC_SERVICE_KEY.",
    )
    parser.add_argument("--sg-id", default=DEFAULT_SG_ID, help="Election ID. Defaults to 20260603.")
    parser.add_argument("--kind", choices=["auto", "pre", "candidate"], default="auto", help="Fetch pre-candidates, official candidates, or auto-switch by date.")
    parser.add_argument("--sd-name", action="append", choices=list(SD_NAME_TO_SLUG), help="Limit sync to a specific 시도명. Can be repeated.")
    parser.add_argument("--sg-typecode", action="append", choices=list(ELECTION_TYPE_MAP), help="Limit sync to a NEC election type code. Can be repeated.")
    parser.add_argument("--with-pledges", action="store_true", help="Fetch candidate pledge API too.")
    parser.add_argument("--no-pledges", action="store_true", help="Skip candidate pledge API.")
    parser.add_argument("--write-raw", action="store_true", help="Write raw NEC rows to data/nec/latest.json.")
    parser.add_argument("--dry-run", action="store_true", help="Fetch and summarize without writing data/regions.")
    parser.add_argument("--pause", type=float, default=0.08, help="Pause between API requests in seconds.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if args.service_key:
        args.candidate_service_key = args.candidate_service_key or args.service_key
        args.pledge_service_key = args.pledge_service_key or args.service_key

    if not args.candidate_service_key:
        print(
            "ERROR: candidate API key is required. Set NEC_CANDIDATE_SERVICE_KEY or NEC_SERVICE_KEY.",
            file=sys.stderr,
        )
        return 2

    kind = choose_kind(args.kind)
    sd_names = args.sd_name or [config["metro"] for config in METRO_CONFIG.values()]
    sg_typecodes = args.sg_typecode or list(ELECTION_TYPE_MAP)
    fetch_pledges = should_fetch_pledges(args, kind)
    if fetch_pledges and not args.pledge_service_key:
        print(
            "ERROR: pledge API key is required when pledge sync is enabled. "
            "Set NEC_PLEDGE_SERVICE_KEY, or run with --no-pledges.",
            file=sys.stderr,
        )
        return 2

    log(f"NEC sync start: sgId={args.sg_id}, kind={kind}, pledges={fetch_pledges}, dryRun={args.dry_run}")
    raw_rows = fetch_nec_candidates(args.candidate_service_key, args.sg_id, kind, sd_names, sg_typecodes, args.pause)
    log(f"NEC raw rows: {len(raw_rows)}")

    if args.write_raw and not args.dry_run:
        RAW_DIR.mkdir(parents=True, exist_ok=True)
        raw_path = RAW_DIR / "latest.json"
        raw_path.write_text(json.dumps(raw_rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        log(f"Raw snapshot written: {raw_path}")

    existing_index = existing_candidates()
    candidates: list[dict[str, Any]] = []

    for idx, row in enumerate(raw_rows, start=1):
        sg_typecode = str(row.get("sgTypecode") or "").strip()
        huboid = str(row.get("huboid") or row.get("cnddtId") or "").strip()
        pledge_items: list[dict[str, str]] = []

        if fetch_pledges and huboid and sg_typecode in PLEDGE_SUPPORTED_CODES:
            try:
                pledge_items = fetch_candidate_pledges(args.pledge_service_key, args.sg_id, sg_typecode, huboid, args.pause)
            except RuntimeError as exc:
                log(f"  공약 조회 실패: {row.get('name', '?')} / {exc}")

        candidate = convert_row(row, kind, pledge_items, existing_index)
        if candidate:
            candidates.append(candidate)

        if idx % 100 == 0:
            log(f"변환 진행: {idx}/{len(raw_rows)}")

    log(f"Poly Fit candidates: {len(candidates)}")
    write_regions(candidates, args.dry_run)
    log("NEC sync complete")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
