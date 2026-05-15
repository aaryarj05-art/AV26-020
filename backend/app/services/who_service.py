"""
WHOService — Fetches and normalises WHO Disease Outbreak News.
Cache TTL: 15 minutes.  Falls back to MOCK_DATA on any network error.
"""

import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional

import httpx

logger = logging.getLogger("helix.who_service")

WHO_BASE_URL = "https://www.who.int/api/hubs/diseaseoutbreaknews"

KNOWN_DISEASES = [
    "Dengue", "Malaria", "Cholera", "Influenza", "Mpox", "Ebola",
    "Marburg", "COVID", "MERS", "Yellow Fever", "Nipah", "Plague"
]

MOCK_DATA: List[Dict] = [
    {
        "id": "mock-dengue-india-2024",
        "disease": "Dengue",
        "region": "India",
        "timestamp": "2024-10-01T00:00:00",
        "severity": "high",
        "source": "WHO",
        "summary": "Dengue cases rising across South-East Asia. Surge reported in urban centres with standing water accumulation post-monsoon.",
    },
    {
        "id": "mock-malaria-myanmar-2024",
        "disease": "Malaria",
        "region": "Myanmar",
        "timestamp": "2024-09-20T00:00:00",
        "severity": "high",
        "source": "WHO",
        "summary": "Malaria outbreak escalating in border regions of Myanmar. Surveillance teams deployed.",
    },
    {
        "id": "mock-cholera-bangladesh-2024",
        "disease": "Cholera",
        "region": "Bangladesh",
        "timestamp": "2024-09-15T00:00:00",
        "severity": "critical",
        "source": "WHO",
        "summary": "Rapid spread of Cholera reported following flooding events. Emergency response activated by health authorities.",
    },
    {
        "id": "mock-influenza-thailand-2024",
        "disease": "Influenza",
        "region": "Thailand",
        "timestamp": "2024-09-10T00:00:00",
        "severity": "medium",
        "source": "WHO",
        "summary": "Influenza monitoring ongoing in Thailand. Surveillance indicates moderate activity consistent with seasonal patterns.",
    },
    {
        "id": "mock-mpox-indonesia-2024",
        "disease": "Mpox",
        "region": "Indonesia",
        "timestamp": "2024-09-05T00:00:00",
        "severity": "high",
        "source": "WHO",
        "summary": "Mpox cases confirmed in multiple provinces. Cases rising amid ongoing vaccination campaigns.",
    },
]

# Simple in-memory cache
_cache: Dict = {"data": [], "fetched_at": None}
_CACHE_TTL_MINUTES = 15


class WHOService:
    async def fetch_outbreaks(self) -> List[Dict]:
        """GET request to WHO API with a 10-second timeout."""
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(WHO_BASE_URL, params={"sf_culture": "en", "$top": 50})
            resp.raise_for_status()
            payload = resp.json()
            # WHO API returns {"value": [...]} or a top-level list
            if isinstance(payload, dict):
                return payload.get("value", [])
            return payload

    def parse_item(self, raw: Dict) -> Dict:
        """Extract relevant fields from a raw WHO record."""
        url_name = raw.get("UrlName", raw.get("Id", "unknown"))
        title = raw.get("Title", "")
        summary = raw.get("Summary") or raw.get("Overview") or ""
        region = raw.get("regionscountries", raw.get("PrimaryCountry", "Unknown"))
        timestamp = raw.get("PublicationDate", datetime.utcnow().isoformat())
        url = f"https://www.who.int/emergencies/disease-outbreak-news/item/{url_name}"
        return {
            "id": url_name,
            "title": title,
            "summary": summary,
            "region": str(region),
            "timestamp": timestamp,
            "url": url,
        }

    def classify_severity(self, title: str, summary: str) -> str:
        """Keyword scan to derive severity level."""
        combined = (title + " " + summary).lower()
        critical_kw = ["death", "fatal", "emergency", "rapid spread", "widespread"]
        high_kw = ["outbreak", "cases rising", "surge", "escalating"]
        medium_kw = ["monitoring", "surveillance", "watch"]
        if any(kw in combined for kw in critical_kw):
            return "critical"
        if any(kw in combined for kw in high_kw):
            return "high"
        if any(kw in combined for kw in medium_kw):
            return "medium"
        return "low"

    def extract_disease(self, title: str) -> str:
        """Return the first known disease name found in the title."""
        for disease in KNOWN_DISEASES:
            if disease.lower() in title.lower():
                return disease
        return "Unknown"

    def normalize(self, item: Dict) -> Dict:
        """Convert a parsed WHO item to the canonical Helix schema."""
        return {
            "id": item["id"],
            "disease": self.extract_disease(item["title"]),
            "region": item["region"],
            "timestamp": item["timestamp"],
            "severity": self.classify_severity(item["title"], item["summary"]),
            "source": "WHO",
            "summary": item["summary"][:300] if item["summary"] else "",
        }

    async def get_normalized_outbreaks(self) -> List[Dict]:
        """Fetch, parse, and normalise all WHO outbreak items."""
        try:
            raw_items = await self.fetch_outbreaks()
            results = []
            for raw in raw_items:
                try:
                    parsed = self.parse_item(raw)
                    results.append(self.normalize(parsed))
                except Exception as item_err:
                    logger.warning("Skipping malformed WHO item: %s", item_err)
            return results if results else MOCK_DATA
        except Exception as e:
            logger.warning("WHO API unreachable (%s) — returning mock data.", e)
            return MOCK_DATA


async def get_cached() -> Dict:
    """Return cached WHO data (refreshed every 15 minutes)."""
    global _cache
    now = datetime.utcnow()
    if (
        _cache["fetched_at"] is None
        or now - _cache["fetched_at"] > timedelta(minutes=_CACHE_TTL_MINUTES)
    ):
        service = WHOService()
        data = await service.get_normalized_outbreaks()
        _cache = {"data": data, "fetched_at": now}
    return _cache
