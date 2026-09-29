export interface Station {
  code: string;
  name: string;
  lat: number;
  lon: number;
  distance_km: number;
  scheduled_arrival: string;
  scheduled_day: number;
  platform: number;
}

export interface ShapFactor {
  feature: string;
  impact: number;
  direction: 'positive' | 'negative' | 'neutral';
  description?: string;
}

export interface StationPrediction {
  station_code: string;
  station_name: string;
  scheduled_arrival: string;
  predicted_arrival: string;
  confidence_lower: string; // P10
  confidence_upper: string; // P90
  delay_minutes: number;
  confidence_score: number;
  platform: number;
  distance_from_current_km: number;
  shap_explanations: ShapFactor[];
  static_eta?: string;
}

export interface Train {
  train_id: string;
  train_name: string;
  route_id: string;
  route_name: string;
  category: string;
  current_station_index: number;
  current_station: string;
  current_station_code: string;
  next_station: string;
  next_station_code: string;
  current_delay_min: number;
  speed_kmh: number;
  progress_between_stations: number; // 0.0 to 1.0
  current_lat: number;
  current_lon: number;
  status: 'ON_TIME' | 'SLIGHTLY_DELAYED' | 'HEAVILY_DELAYED';
  stations: Station[];
  last_updated: string;
  disrupted_section?: string;
  disruption_reason?: string;
}

export interface ActiveDisruption {
  id: string;
  section_code: string;
  delay_increment: number;
  disruption_type: string;
  affected_route_id: string;
  timestamp: string;
  affected_trains_count: number;
}

export interface RouteDelaySummary {
  route_id: string;
  route_name: string;
  avg_delay: number;
  train_count: number;
}

export interface SectionCongestion {
  section: string;
  congestion_index: number;
  status: 'CLEAR' | 'MODERATE' | 'CONGESTED' | 'CRITICAL';
  trains_in_section: number;
  avg_speed_kmh: number;
}

export interface ModelMetric {
  model: string;
  mae: number;
  rmse: number;
  r2: number;
  color: string;
}

export interface DashboardStats {
  total_trains: number;
  on_time_trains: number;
  delayed_trains: number;
  average_delay_min: number;
  worst_delay_min: number;
  worst_delayed_train: string;
  network_punctuality_rate: number;
  active_disruptions: number;
  route_delays: RouteDelaySummary[];
  section_congestion: SectionCongestion[];
  top_delayed_trains: any[];
  models_comparison: ModelMetric[];
}

export interface ScalabilityResult {
  num_trains_simulated: number;
  compute_time_ms: number;
  estimated_api_latency_ms: number;
  redis_cache_hits_pct: number;
  throughput_trains_per_second: number;
  status: string;
  sla_threshold_ms: number;
  message: string;
}
