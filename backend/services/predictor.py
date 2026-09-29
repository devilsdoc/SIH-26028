"""
ETA Prediction Service for Indian Railways.
Computes multi-hop dynamic arrival times, confidence intervals (P10/P90),
and SHAP feature attribution for each station stop.
"""

from datetime import datetime, timedelta
from typing import Dict, Any, List
from backend.models.eta_model import HybridETAPredictor

predictor = HybridETAPredictor()

def format_clock_time(base_clock_str: str, add_minutes: float) -> str:
    try:
        parts = base_clock_str.split(":")
        h, m = int(parts[0]), int(parts[1])
        total_m = h * 60 + m + int(round(add_minutes))
        norm_h = (total_m // 60) % 24
        norm_m = total_m % 60
        return f"{norm_h:02d}:{norm_m:02d}"
    except Exception:
        return base_clock_str

def calculate_train_eta_predictions(train: Dict[str, Any], weather_override: float = None) -> List[Dict[str, Any]]:
    stations = train.get("stations", [])
    curr_idx = train.get("current_station_index", 0)
    current_delay = train.get("current_delay_min", 0)
    
    predictions = []
    accumulated_delay = float(current_delay)
    
    # Track delay lag history
    recent_lags = [current_delay, current_delay, current_delay]

    for idx in range(curr_idx, len(stations)):
        st = stations[idx]
        is_current_stop = (idx == curr_idx)

        if is_current_stop:
            sched = st["scheduled_arrival"]
            pred_arrival = format_clock_time(sched, accumulated_delay)
            p10 = format_clock_time(sched, max(0, accumulated_delay - 2))
            p90 = format_clock_time(sched, accumulated_delay + 3)
            
            predictions.append({
                "station_code": st["code"],
                "station_name": st["name"],
                "scheduled_arrival": sched,
                "predicted_arrival": pred_arrival,
                "confidence_lower": p10,
                "confidence_upper": p90,
                "delay_minutes": int(round(accumulated_delay)),
                "confidence_score": 0.96,
                "platform": st.get("platform", 1),
                "distance_from_current_km": 0.0,
                "shap_explanations": [
                    {"feature": "Current Platform State", "impact": round(accumulated_delay, 1), "direction": "positive"}
                ]
            })
            continue

        prev_st = stations[idx - 1]
        hop_dist = max(15.0, st["distance_km"] - prev_st["distance_km"])
        
        # Sectional congestion
        is_hotspot = prev_st["code"] in ["CNB", "GZB", "MTJ", "SUR", "JTJ", "DDU"]
        congestion = 0.82 if is_hotspot else 0.25
        
        # Weather
        weather = weather_override if weather_override is not None else (0.4 if train.get("route_id") == "DELHI_HOWRAH" else 0.1)

        features = {
            "current_delay_min": accumulated_delay,
            "delay_velocity": (accumulated_delay - recent_lags[-1]) / (hop_dist / 100.0) if hop_dist > 0 else 0,
            "hour_of_day": 14,
            "day_of_week": 1,
            "distance_from_source": st["distance_km"],
            "downstream_congestion_index": congestion,
            "weather_severity": weather,
            "avg_delay_this_train_last_30d": 12.0,
            "scheduled_running_time": (hop_dist / 85.0) * 60.0,
            "preceding_train_delay": accumulated_delay * 0.65
        }

        pred_result = predictor.predict_single(features, recent_lags)
        accumulated_delay = pred_result["predicted_delay_min"]
        recent_lags.append(accumulated_delay)
        if len(recent_lags) > 5:
            recent_lags.pop(0)

        sched = st["scheduled_arrival"]
        pred_arrival = format_clock_time(sched, accumulated_delay)
        p10 = format_clock_time(sched, pred_result["p10_min"])
        p90 = format_clock_time(sched, pred_result["p90_min"])

        dist_from_curr = round(st["distance_km"] - stations[curr_idx]["distance_km"], 1)

        predictions.append({
            "station_code": st["code"],
            "station_name": st["name"],
            "scheduled_arrival": sched,
            "predicted_arrival": pred_arrival,
            "confidence_lower": p10,
            "confidence_upper": p90,
            "delay_minutes": int(round(accumulated_delay)),
            "confidence_score": pred_result["confidence_score"],
            "platform": st.get("platform", 1),
            "distance_from_current_km": dist_from_curr,
            "shap_explanations": pred_result["top_shap_features"]
        })

    return predictions
