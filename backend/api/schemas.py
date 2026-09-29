"""
Pydantic Schemas for Indian Railways Dynamic ETA System.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class StationInfo(BaseModel):
    code: str
    name: str
    lat: float
    lon: float
    distance_km: float
    scheduled_arrival: str
    scheduled_day: int = 0
    platform: int = 1

class StationPrediction(BaseModel):
    station_code: str
    station_name: str
    scheduled_arrival: str
    predicted_arrival: str
    confidence_lower: str
    confidence_upper: str
    delay_minutes: int
    confidence_score: float
    platform: int = 1
    distance_from_current_km: float = 0.0
    shap_explanations: Optional[List[Dict[str, Any]]] = None

class TrainETAResponse(BaseModel):
    train_id: str
    train_name: str
    category: str
    current_location: str
    current_station_code: str
    next_station: str
    current_delay_min: int
    speed_kmh: float
    status: str
    last_updated: str
    predictions: List[StationPrediction]

class TrainSummary(BaseModel):
    train_id: str
    train_name: str
    route_id: str
    route_name: str
    category: str
    current_station: str
    current_station_code: str
    next_station: str
    current_delay_min: int
    speed_kmh: float
    current_lat: float
    current_lon: float
    status: str
    progress_between_stations: float
    last_updated: str

class DisruptionRequest(BaseModel):
    section_code: Optional[str] = "CNB-PRYJ"
    delay_increment: int = 15
    disruption_type: str = "Signal & Interlocking Failure"
    affected_route_id: Optional[str] = "DELHI_HOWRAH"

class DashboardStats(BaseModel):
    total_trains: int
    on_time_trains: int
    delayed_trains: int
    average_delay_min: float
    worst_delay_min: int
    worst_delayed_train: str
    network_punctuality_rate: float
    active_disruptions: int
    route_delays: List[Dict[str, Any]]
    section_congestion: List[Dict[str, Any]]
    top_delayed_trains: List[Dict[str, Any]]
    models_comparison: List[Dict[str, Any]]
