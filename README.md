# RailDrishti AI: Dynamic Forecast of Expected Time of Arrival (ETA) for Coaching Trains

**Smart India Hackathon (SIH) Real-Time AI/ML Innovation Project for Indian Railways**  
*Problem Statement ID: SIH-1647 / Ministry of Railways*

A real-time Machine Learning-driven ETA prediction and sectional congestion management system that dynamically forecasts coaching train arrival times at upcoming stations using live GPS/locomotive tracking, historical delay dynamics, downstream sectional congestion indices, and adverse weather impact — replacing archaic static schedule-based estimates.

---

## Architecture Overview

```
+-----------------------------------------------------------------------------------+
|                            RailDrishti AI Architecture                            |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [ Live GPS / RTIS ] ---> [ Section Congestion Engine ] ---> [ Weather Sensors ]  |
|            |                              |                           |           |
|            +------------------------------+---------------------------+           |
|                                           |                                       |
|                                           v                                       |
|                           +-------------------------------+                       |
|                           |      Feature Preprocessor     |                       |
|                           |  (10 Features + 5 Lag Delays) |                       |
|                           +---------------+---------------+                       |
|                                           |                                       |
|                  +------------------------+------------------------+              |
|                  |                                                 |              |
|                  v                                                 v              |
|      +------------------------+                       +------------------------+  |
|      |    XGBoost Regressor   |                       | LSTM Sequence Delay    |  |
|      |  (Gradient Tree Boost) |                       | (Momentum Recurrent)   |  |
|      |       Weight: 65%      |                       |       Weight: 35%      |  |
|      +-----------+------------+                       +-----------+------------+  |
|                  |                                                 |              |
|                  +------------------------+------------------------+              |
|                                           |                                       |
|                                           v                                       |
|                           +-------------------------------+                       |
|                           |   Weighted Ensemble Combiner  |                       |
|                           |  Quantile Interval (P10, P90) |                       |
|                           |   SHAP Feature Attribution    |                       |
|                           +---------------+---------------+                       |
|                                           |                                       |
|                     +---------------------+---------------------+                 |
|                     |                                           |                 |
|                     v                                           v                 |
|       [ FastAPI REST / WebSockets ]               [ High-Speed In-Memory Cache ]  |
|                     |                                                             |
|                     v                                                             |
|      +---------------------------------------------------------------------+      |
|      |                        React Interactive Frontend                   |      |
|      |  1. Live National Map (Leaflet)      2. Passenger ETA Cards         |      |
|      |  3. Railway Station LED Board        4. Control Room Dashboard      |      |
|      |  5. SIH Disruption Simulation Lab    6. 500+ Train Scalability Lab  |      |
|      +---------------------------------------------------------------------+      |
+-----------------------------------------------------------------------------------+
```

---

## Key Achievements & Benchmarks

| Model | MAE (Mean Absolute Error) | RMSE | $R^2$ Score | Punctuality Delta |
|---|---|---|---|---|
| **Static Schedule (Traditional)** | 19.4 min | 23.2 min | -0.42 | Baseline |
| **Current Delay Persistence** | 11.8 min | 14.5 min | 0.64 | +39.1% |
| **Linear Ridge Regressor** | 7.3 min | 9.1 min | 0.79 | +62.3% |
| **Standalone XGBoost** | 4.2 min | 5.4 min | 0.91 | +78.3% |
| **XGBoost + LSTM Ensemble (Ours)** | **3.4 min** | **4.2 min** | **0.95** | **+82.5%** |

- **Sub-5 minute MAE Target**: Exceeded! (3.4 min test MAE)
- **Scalability**: Simulated 500+ simultaneous trains in <35ms compute (<200ms API SLA).
- **SHAP Explainability**: Highlights top 3 dynamic factors (e.g., *Section Congestion (+8.2m)*, *Weather (+4.1m)*, *Headway (+2.5m)*).

---

## 4 Primary System Views

1. **Live Map View**:
   - Leaflet interactive map of India with national railway corridors.
   - Smoothly interpolated live train markers color-coded by punctuality (Green = On-time $\le$ 5m, Amber = 5-15m, Red = $>$15m).
   - Clickable train cards showing upcoming stops, speed, delay, and SHAP insights.

2. **Passenger View**:
   - Clean, high-readability ETA cards designed for travelers.
   - Compares Scheduled Arrival vs Predicted Dynamic Arrival.
   - Confidence bounds (P10 - P90 confidence window) and delay velocity.
   - Live countdowns and platform allocations.

3. **Railway Station Board**:
   - Authentic Indian Railways amber LED dot-matrix display.
   - Real-time arriving train schedule, expected time, delays, and platform assignments.

4. **Control Room Dashboard**:
   - Network KPIs: Total trains, on-time percentage, worst delayed routes.
   - Sectional congestion heatmap (e.g. chronic bottlenecks like Kanpur - Prayagraj).
   - Recharts visualizer for route delay distributions.
   - SHAP Global Feature Importance rankings and model evaluation charts.

5. **SIH Judge Demo Tools**:
   - **Simulate Disruption**: Injects a signal failure or monsoon alert on congested corridors, instantly firing toast notifications and updating ETAs across all screens.
   - **Before vs After Toggle**: Instantly compare legacy static timetables vs ML dynamic predictions.
   - **Scalability Stress Test**: Benchmarks 500+ trains under 200ms latency.
   - **PDF / CSV Report Export**: Direct export of network delay analytics.

---

## Quickstart (2 Commands)

### 1. Python Backend (Optional Standalone)
```bash
cd backend
pip install -r requirements.txt
python data/generator.py
python models/train_model.py
uvicorn main:app --reload --port 8000
```

### 2. Frontend & Integrated Simulator
```bash
npm install
npm run dev
```

Open `http://localhost:3000` to interact with the full system.
