"""
backend/app/services/realtime_service.py

Phase 3 + Phase 4: WebSocket-based realtime data broadcasting.
Broadcasts KPIs, heatmap points, predictions, alerts, and WHO outbreaks
to all connected WebSocket clients every 30 seconds.
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Dict, List, Set

from fastapi import WebSocket

logger = logging.getLogger("helix.realtime")

# Static region → coordinates lookup for geocoding WHO region names
REGION_COORDS: Dict[str, Dict[str, float]] = {
    "India": {"lat": 20.5937, "lng": 78.9629},
    "Myanmar": {"lat": 21.9162, "lng": 95.9560},
    "Bangladesh": {"lat": 23.6850, "lng": 90.3563},
    "Thailand": {"lat": 15.8700, "lng": 100.9925},
    "Indonesia": {"lat": -0.7893, "lng": 113.9213},
    "Brazil": {"lat": -14.2350, "lng": -51.9253},
    "Nigeria": {"lat": 9.0820, "lng": 8.6753},
    "South Africa": {"lat": -30.5595, "lng": 22.9375},
    "Egypt": {"lat": 26.8206, "lng": 30.8025},
    "Japan": {"lat": 36.2048, "lng": 138.2529},
    "United States of America": {"lat": 37.0902, "lng": -95.7129},
    "United Kingdom": {"lat": 55.3781, "lng": -3.4360},
    "Australia": {"lat": -25.2744, "lng": 133.7751},
    "China": {"lat": 35.8617, "lng": 104.1954},
    "France": {"lat": 46.2276, "lng": 2.2137},
    "Germany": {"lat": 51.1657, "lng": 10.4515},
    "Kenya": {"lat": -0.0236, "lng": 37.9062},
    "Democratic Republic of the Congo": {"lat": -4.0383, "lng": 21.7587},
    "Pakistan": {"lat": 30.3753, "lng": 69.3451},
    "Philippines": {"lat": 12.8797, "lng": 121.7740},
    "Mexico": {"lat": 23.6345, "lng": -102.5528},
    "Colombia": {"lat": 4.5709, "lng": -74.2973},
    "Peru": {"lat": -9.1900, "lng": -75.0152},
    "Afghanistan": {"lat": 33.9391, "lng": 67.7100},
    "Ethiopia": {"lat": 9.1450, "lng": 40.4897},
    "Unknown": {"lat": 0.0, "lng": 0.0},
}

# Severity → intensity mapping for heatmap
SEVERITY_INTENSITY = {
    "critical": 1.0,
    "high": 0.75,
    "medium": 0.5,
    "low": 0.25,
}


class ConnectionManager:
    """Manages active WebSocket connections."""

    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info("WebSocket client connected. Total: %d", len(self.active_connections))

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)
        logger.info("WebSocket client disconnected. Total: %d", len(self.active_connections))

    async def broadcast(self, message: dict):
        """Broadcast JSON message to all connected clients."""
        if not self.active_connections:
            return
        payload = json.dumps(message)
        disconnected = set()
        for connection in self.active_connections:
            try:
                await connection.send_text(payload)
            except Exception:
                disconnected.add(connection)
        for conn in disconnected:
            self.active_connections.discard(conn)


class RealtimeDataService:
    """Background task that fetches and broadcasts realtime data every 30 seconds."""

    def __init__(self, manager: ConnectionManager):
        self.manager = manager
        self._running = False

    async def start(self):
        """Start the background broadcast loop."""
        self._running = True
        logger.info("RealtimeDataService started.")
        while self._running:
            try:
                await self._broadcast_all()
            except Exception as e:
                logger.error("RealtimeDataService error: %s", e)
            await asyncio.sleep(30)

    def stop(self):
        self._running = False

    async def _broadcast_all(self):
        """Fetch all data sources and broadcast to clients."""
        if not self.manager.active_connections:
            return

        now = datetime.utcnow().isoformat()

        # Fetch WHO outbreaks
        try:
            from .who_service import get_cached
            who_cache = await get_cached()
            outbreaks = who_cache.get("data", [])
        except Exception as e:
            logger.warning("Failed to fetch WHO data for broadcast: %s", e)
            outbreaks = []

        # Broadcast WHO outbreaks
        await self.manager.broadcast({
            "type": "who_outbreaks",
            "payload": {"outbreaks": outbreaks, "count": len(outbreaks)},
            "timestamp": now,
            "source": "who_service",
        })

        # Broadcast KPIs
        try:
            from .kpi_service import KPIService
            from ..database import SessionLocal
            db = SessionLocal()
            try:
                service = KPIService(db)
                summary = service.get_summary()
                await self.manager.broadcast({
                    "type": "kpis",
                    "payload": {"kpis": summary},
                    "timestamp": now,
                    "source": "kpi_service",
                })
            finally:
                db.close()
        except Exception as e:
            logger.warning("Failed to fetch KPI data for broadcast: %s", e)

        # Broadcast heatmap points (Phase 4)
        heatmap_points = self._generate_heatmap_points(outbreaks)
        await self.manager.broadcast({
            "type": "heatmap_points",
            "payload": {"points": heatmap_points},
            "timestamp": now,
            "source": "heatmap_aggregator",
        })

        # Broadcast predictions (summary)
        await self.manager.broadcast({
            "type": "predictions",
            "payload": {"status": "active", "models": ["ensemble", "arima", "prophet", "lstm"]},
            "timestamp": now,
            "source": "ml_service",
        })

        # Broadcast alerts
        try:
            from ..database import SessionLocal
            from ..models.models import Alert
            db = SessionLocal()
            try:
                alerts = db.query(Alert).order_by(Alert.created_at.desc()).limit(20).all()
                alert_list = [
                    {
                        "id": a.id,
                        "severity": a.severity,
                        "region": a.region,
                        "disease": a.disease,
                        "message": a.message,
                        "created_at": a.created_at.isoformat() if a.created_at else None,
                    }
                    for a in alerts
                ]
            except Exception:
                alert_list = []
            finally:
                db.close()
        except Exception:
            alert_list = []

        await self.manager.broadcast({
            "type": "alerts",
            "payload": {"alerts": alert_list, "count": len(alert_list)},
            "timestamp": now,
            "source": "alert_engine",
        })

    def _generate_heatmap_points(self, outbreaks: List[Dict]) -> List[Dict]:
        """
        Generate heatmap points from WHO outbreaks + static data.
        Each point: { lat, lng, intensity, disease, region, caseCount }
        """
        points = []
        for outbreak in outbreaks:
            region = outbreak.get("region", "Unknown")
            coords = REGION_COORDS.get(region, REGION_COORDS.get("Unknown", {"lat": 0, "lng": 0}))
            severity = outbreak.get("severity", "low")
            intensity = SEVERITY_INTENSITY.get(severity, 0.25)
            disease = outbreak.get("disease", "Unknown")

            # Estimate case count from severity
            case_map = {"critical": 1200, "high": 800, "medium": 400, "low": 100}
            case_count = case_map.get(severity, 100)

            points.append({
                "lat": coords["lat"],
                "lng": coords["lng"],
                "intensity": intensity,
                "disease": disease,
                "region": region,
                "caseCount": case_count,
            })

        return points


# Global instances
connection_manager = ConnectionManager()
realtime_service = RealtimeDataService(connection_manager)
