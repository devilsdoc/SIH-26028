"""
Synthetic Data Generator for Indian Railways ETA Forecasting System.
Generates 50 trains across 5 major trunk routes with realistic operational
characteristics, sectional congestion, weather variability, and delay propagation.
"""

import json
import random
import csv
import math
from datetime import datetime, timedelta

ROUTES_CONFIG = [
    {
        "route_id": "DELHI_MUMBAI",
        "route_name": "New Delhi - Mumbai Central (Western Corridor)",
        "stations": [
            {"code": "NDLS", "name": "New Delhi", "lat": 28.6142, "lon": 77.2090, "dist": 0},
            {"code": "MTJ", "name": "Mathura Jn", "lat": 27.4924, "lon": 77.6737, "dist": 141},
            {"code": "BTE", "name": "Bharatpur Jn", "lat": 27.2173, "lon": 77.4895, "dist": 175},
            {"code": "SWM", "name": "Sawai Madhopur", "lat": 25.9868, "lon": 76.3533, "dist": 358},
            {"code": "KOTA", "name": "Kota Jn", "lat": 25.2138, "lon": 75.8648, "dist": 466},
            {"code": "RMA", "name": "Ramganj Mandi", "lat": 24.6468, "lon": 75.9458, "dist": 538},
            {"code": "NAD", "name": "Nagda Jn", "lat": 23.4542, "lon": 75.4183, "dist": 691},
            {"code": "RTM", "name": "Ratlam Jn", "lat": 23.3315, "lon": 75.0367, "dist": 732},
            {"code": "MGN", "name": "Meghnagar", "lat": 22.8465, "lon": 74.5451, "dist": 813},
            {"code": "DHD", "name": "Dahod", "lat": 22.8335, "lon": 74.2562, "dist": 846},
            {"code": "GDA", "name": "Godhra Jn", "lat": 22.7758, "lon": 73.6149, "dist": 919},
            {"code": "BRC", "name": "Vadodara Jn", "lat": 22.3106, "lon": 73.1812, "dist": 993},
            {"code": "BH", "name": "Bharuch Jn", "lat": 21.7051, "lon": 72.9959, "dist": 1064},
            {"code": "ST", "name": "Surat", "lat": 21.1702, "lon": 72.8311, "dist": 1123},
            {"code": "NVS", "name": "Navsari", "lat": 20.9467, "lon": 72.9278, "dist": 1153},
            {"code": "BL", "name": "Valsad", "lat": 20.5992, "lon": 72.9342, "dist": 1192},
            {"code": "VAPI", "name": "Vapi", "lat": 20.3709, "lon": 72.9090, "dist": 1218},
            {"code": "PLG", "name": "Palghar", "lat": 19.6967, "lon": 72.7655, "dist": 1299},
            {"code": "BVI", "name": "Borivali", "lat": 19.2288, "lon": 72.8566, "dist": 1354},
            {"code": "MMCT", "name": "Mumbai Central", "lat": 18.9696, "lon": 72.8193, "dist": 1384}
        ]
    },
    {
        "route_id": "DELHI_HOWRAH",
        "route_name": "New Delhi - Howrah (Eastern Grand Trunk)",
        "stations": [
            {"code": "NDLS", "name": "New Delhi", "lat": 28.6142, "lon": 77.2090, "dist": 0},
            {"code": "GZB", "name": "Ghaziabad Jn", "lat": 28.6692, "lon": 77.4538, "dist": 26},
            {"code": "ALJN", "name": "Aligarh Jn", "lat": 27.8974, "lon": 78.0880, "dist": 132},
            {"code": "TDL", "name": "Tundla Jn", "lat": 27.2096, "lon": 78.2435, "dist": 210},
            {"code": "ETW", "name": "Etawah Jn", "lat": 26.7854, "lon": 79.0250, "dist": 302},
            {"code": "CNB", "name": "Kanpur Central", "lat": 26.4547, "lon": 80.3507, "dist": 441},
            {"code": "FTP", "name": "Fatehpur", "lat": 25.9282, "lon": 80.8128, "dist": 519},
            {"code": "PRYJ", "name": "Prayagraj Jn", "lat": 25.4358, "lon": 81.8463, "dist": 635},
            {"code": "MZP", "name": "Mirzapur", "lat": 25.1337, "lon": 82.5644, "dist": 725},
            {"code": "DDU", "name": "Pt. DD Upadhyaya", "lat": 25.2818, "lon": 83.1189, "dist": 788},
            {"code": "BXR", "name": "Buxar", "lat": 25.5647, "lon": 83.9777, "dist": 882},
            {"code": "ARA", "name": "Ara Jn", "lat": 25.5541, "lon": 84.6631, "dist": 950},
            {"code": "PNBE", "name": "Patna Jn", "lat": 25.6022, "lon": 85.1376, "dist": 999},
            {"code": "KIUL", "name": "Kiul Jn", "lat": 25.1764, "lon": 86.1082, "dist": 1123},
            {"code": "JAJ", "name": "Jhajha", "lat": 24.7734, "lon": 86.3831, "dist": 1177},
            {"code": "JSME", "name": "Jasidih Jn", "lat": 24.5165, "lon": 86.6437, "dist": 1221},
            {"code": "MDP", "name": "Madhupur Jn", "lat": 24.2612, "lon": 86.6508, "dist": 1250},
            {"code": "CRJ", "name": "Chittaranjan", "lat": 23.8647, "lon": 86.8711, "dist": 1306},
            {"code": "ASN", "name": "Asansol Jn", "lat": 23.6889, "lon": 86.9661, "dist": 1331},
            {"code": "DGR", "name": "Durgapur", "lat": 23.5204, "lon": 87.3119, "dist": 1373},
            {"code": "BWN", "name": "Barddhaman Jn", "lat": 23.2324, "lon": 87.8615, "dist": 1437},
            {"code": "HWH", "name": "Howrah Jn", "lat": 22.5839, "lon": 88.3433, "dist": 1445}
        ]
    },
    {
        "route_id": "MUMBAI_CHENNAI",
        "route_name": "Mumbai CSMT - Chennai Central (Deccan Corridor)",
        "stations": [
            {"code": "CSMT", "name": "Mumbai CSMT", "lat": 18.9400, "lon": 72.8354, "dist": 0},
            {"code": "DR", "name": "Dadar Central", "lat": 19.0178, "lon": 72.8478, "dist": 9},
            {"code": "TNA", "name": "Thane", "lat": 19.1860, "lon": 72.9759, "dist": 34},
            {"code": "KYN", "name": "Kalyan Jn", "lat": 19.2437, "lon": 73.1355, "dist": 54},
            {"code": "KJT", "name": "Karjat", "lat": 18.9102, "lon": 73.3276, "dist": 100},
            {"code": "LNL", "name": "Lonavala", "lat": 18.7546, "lon": 73.4062, "dist": 128},
            {"code": "PUNE", "name": "Pune Jn", "lat": 18.5284, "lon": 73.8744, "dist": 192},
            {"code": "DD", "name": "Daund Jn", "lat": 18.4627, "lon": 74.5824, "dist": 268},
            {"code": "KWV", "name": "Kurduvadi", "lat": 18.0886, "lon": 75.4334, "dist": 376},
            {"code": "SUR", "name": "Solapur", "lat": 17.6599, "lon": 75.9064, "dist": 455},
            {"code": "KLBG", "name": "Kalaburagi (Gulbarga)", "lat": 17.3297, "lon": 76.8343, "dist": 568},
            {"code": "WADI", "name": "Wadi Jn", "lat": 17.0543, "lon": 76.9934, "dist": 605},
            {"code": "YG", "name": "Yadgir", "lat": 16.7645, "lon": 77.1378, "dist": 644},
            {"code": "RC", "name": "Raichur", "lat": 16.2076, "lon": 77.3556, "dist": 713},
            {"code": "MALM", "name": "Mantralayam Road", "lat": 15.9388, "lon": 77.4258, "dist": 741},
            {"code": "AD", "name": "Adoni", "lat": 15.6297, "lon": 77.2728, "dist": 782},
            {"code": "GTL", "name": "Guntakal Jn", "lat": 15.1673, "lon": 77.3752, "dist": 834},
            {"code": "GY", "name": "Gooty Jn", "lat": 15.1158, "lon": 77.6329, "dist": 863},
            {"code": "HX", "name": "Kadapa (Cuddapah)", "lat": 14.4673, "lon": 78.8242, "dist": 1007},
            {"code": "RU", "name": "Renigunta Jn", "lat": 13.6393, "lon": 79.5165, "dist": 1132},
            {"code": "AJJ", "name": "Arakkonam Jn", "lat": 13.0784, "lon": 79.6677, "dist": 1215},
            {"code": "MAS", "name": "MGR Chennai Central", "lat": 13.0827, "lon": 80.2707, "dist": 1284}
        ]
    },
    {
        "route_id": "BENGALURU_DELHI",
        "route_name": "KSR Bengaluru - New Delhi (Karnataka Rajdhani)",
        "stations": [
            {"code": "SBC", "name": "KSR Bengaluru", "lat": 12.9781, "lon": 77.5694, "dist": 0},
            {"code": "YPR", "name": "Yesvantpur Jn", "lat": 13.0238, "lon": 77.5503, "dist": 6},
            {"code": "SSPN", "name": "Sri Sathya Sai Prasanthi", "lat": 14.1537, "lon": 77.8109, "dist": 160},
            {"code": "DMM", "name": "Dharmavaram Jn", "lat": 14.4137, "lon": 77.7126, "dist": 193},
            {"code": "ATP", "name": "Anantapur", "lat": 14.6819, "lon": 77.6006, "dist": 226},
            {"code": "GTL", "name": "Guntakal Jn", "lat": 15.1673, "lon": 77.3752, "dist": 294},
            {"code": "RC", "name": "Raichur", "lat": 16.2076, "lon": 77.3556, "dist": 415},
            {"code": "SC", "name": "Secunderabad Jn", "lat": 17.4344, "lon": 78.5011, "dist": 670},
            {"code": "KZJ", "name": "Kazipet Jn", "lat": 17.9784, "lon": 79.5204, "dist": 802},
            {"code": "BPQ", "name": "Balharshah Jn", "lat": 19.8525, "lon": 79.3512, "dist": 1037},
            {"code": "NGP", "name": "Nagpur Jn", "lat": 21.1524, "lon": 79.0882, "dist": 1245},
            {"code": "ET", "name": "Itarsi Jn", "lat": 22.6139, "lon": 77.7644, "dist": 1544},
            {"code": "BPL", "name": "Bhopal Jn", "lat": 23.2599, "lon": 77.4126, "dist": 1636},
            {"code": "VGLJ", "name": "V Lakshmibai Jhansi", "lat": 25.4484, "lon": 78.5685, "dist": 1928},
            {"code": "GWL", "name": "Gwalior Jn", "lat": 26.2183, "lon": 78.1828, "dist": 2025},
            {"code": "AGC", "name": "Agra Cantt", "lat": 27.1597, "lon": 77.9944, "dist": 2143},
            {"code": "NZM", "name": "Hazrat Nizamuddin", "lat": 28.5888, "lon": 77.2534, "dist": 2331},
            {"code": "NDLS", "name": "New Delhi", "lat": 28.6142, "lon": 77.2090, "dist": 2338}
        ]
    },
    {
        "route_id": "CHENNAI_COIMBATORE",
        "route_name": "Chennai - Coimbatore (Kongu Express/Vande Bharat)",
        "stations": [
            {"code": "MAS", "name": "MGR Chennai Central", "lat": 13.0827, "lon": 80.2707, "dist": 0},
            {"code": "PER", "name": "Perambur", "lat": 13.1098, "lon": 80.2435, "dist": 6},
            {"code": "TRL", "name": "Tiruvallur", "lat": 13.1438, "lon": 79.9079, "dist": 42},
            {"code": "AJJ", "name": "Arakkonam Jn", "lat": 13.0784, "lon": 79.6677, "dist": 69},
            {"code": "KPD", "name": "Katpadi Jn", "lat": 12.9698, "lon": 79.1368, "dist": 130},
            {"code": "JTJ", "name": "Jolarpettai Jn", "lat": 12.5847, "lon": 78.5772, "dist": 214},
            {"code": "TPT", "name": "Tirupattur", "lat": 12.4947, "lon": 78.5647, "dist": 222},
            {"code": "MAP", "name": "Morappur", "lat": 12.1158, "lon": 78.3972, "dist": 269},
            {"code": "BQI", "name": "Bommidi", "lat": 11.9744, "lon": 78.3122, "dist": 291},
            {"code": "SA", "name": "Salem Jn", "lat": 11.6643, "lon": 78.1460, "dist": 334},
            {"code": "SGE", "name": "Sankaridurg", "lat": 11.4789, "lon": 77.8689, "dist": 373},
            {"code": "ED", "name": "Erode Jn", "lat": 11.3410, "lon": 77.7172, "dist": 394},
            {"code": "TUP", "name": "Tiruppur", "lat": 11.1085, "lon": 77.3411, "dist": 444},
            {"code": "CBF", "name": "Coimbatore North", "lat": 11.0264, "lon": 76.9538, "dist": 494},
            {"code": "CBE", "name": "Coimbatore Main", "lat": 10.9967, "lon": 76.9634, "dist": 497}
        ]
    }
]

TRAIN_NAMES = [
    ("12951", "Mumbai Rajdhani Express", "DELHI_MUMBAI", "Superfast / Rajdhani"),
    ("12952", "New Delhi Rajdhani", "DELHI_MUMBAI", "Superfast / Rajdhani"),
    ("12953", "August Kranti Rajdhani", "DELHI_MUMBAI", "Superfast / Rajdhani"),
    ("12954", "Hazrat Nizamuddin AK Rajdhani", "DELHI_MUMBAI", "Superfast / Rajdhani"),
    ("12909", "Garib Rath Express", "DELHI_MUMBAI", "Garib Rath"),
    ("12910", "NZM Bandra Garib Rath", "DELHI_MUMBAI", "Garib Rath"),
    ("12925", "Paschim Express", "DELHI_MUMBAI", "Superfast Mail"),
    ("12926", "Amritsar Paschim Exp", "DELHI_MUMBAI", "Superfast Mail"),
    ("12955", "Mumbai Golden Temple Mail", "DELHI_MUMBAI", "Superfast Mail"),
    ("12956", "Jaipur Superfast", "DELHI_MUMBAI", "Superfast"),
    
    ("12301", "Howrah Rajdhani Express", "DELHI_HOWRAH", "Superfast / Rajdhani"),
    ("12302", "New Delhi Howrah Rajdhani", "DELHI_HOWRAH", "Superfast / Rajdhani"),
    ("12305", "Kolkata Rajdhani Express", "DELHI_HOWRAH", "Superfast / Rajdhani"),
    ("12313", "Sealdah Rajdhani Express", "DELHI_HOWRAH", "Superfast / Rajdhani"),
    ("12381", "Poorva Express (via Patna)", "DELHI_HOWRAH", "Superfast Mail"),
    ("12382", "Poorva Express Return", "DELHI_HOWRAH", "Superfast Mail"),
    ("12303", "Poorva Exp (via Gaya)", "DELHI_HOWRAH", "Superfast"),
    ("12801", "Purushottam Express", "DELHI_HOWRAH", "Superfast Mail"),
    ("12397", "Mahabodhi Express", "DELHI_HOWRAH", "Superfast"),
    ("12423", "Dibrugarh Town Rajdhani", "DELHI_HOWRAH", "Superfast / Rajdhani"),

    ("12163", "Mumbai Chennai Mail", "MUMBAI_CHENNAI", "Superfast Mail"),
    ("12164", "Chennai Mumbai Superfast", "MUMBAI_CHENNAI", "Superfast Mail"),
    ("22157", "CSMT MS Express", "MUMBAI_CHENNAI", "Superfast Express"),
    ("22158", "Chennai CSMT Superfast", "MUMBAI_CHENNAI", "Superfast Express"),
    ("11041", "Dadar Sainagar Express", "MUMBAI_CHENNAI", "Express"),
    ("11042", "Sainagar Dadar Express", "MUMBAI_CHENNAI", "Express"),
    ("16381", "Kanyakumari Jayanti Janata", "MUMBAI_CHENNAI", "Express"),
    ("16382", "Jayanti Janata Express", "MUMBAI_CHENNAI", "Express"),
    ("11027", "Mumbai CSMT - Chennai Mail", "MUMBAI_CHENNAI", "Mail"),
    ("11028", "Chennai Central - Mumbai Mail", "MUMBAI_CHENNAI", "Mail"),

    ("22691", "KSR Bengaluru Rajdhani", "BENGALURU_DELHI", "Superfast / Rajdhani"),
    ("22692", "Hazrat Nizamuddin Rajdhani", "BENGALURU_DELHI", "Superfast / Rajdhani"),
    ("12627", "Karnataka Express", "BENGALURU_DELHI", "Superfast Mail"),
    ("12628", "Karnataka Express Return", "BENGALURU_DELHI", "Superfast Mail"),
    ("12649", "Karnataka Sampark Kranti", "BENGALURU_DELHI", "Sampark Kranti"),
    ("12650", "YPR NZM Sampark Kranti", "BENGALURU_DELHI", "Sampark Kranti"),
    ("12975", "Mysuru Jaipur SF Express", "BENGALURU_DELHI", "Superfast"),
    ("12976", "Jaipur Mysuru SF Express", "BENGALURU_DELHI", "Superfast"),
    ("22693", "Bengaluru Rajdhani Exp", "BENGALURU_DELHI", "Rajdhani"),
    ("22694", "NZM SBC Rajdhani SF", "BENGALURU_DELHI", "Rajdhani"),

    ("20643", "Coimbatore Vande Bharat Express", "CHENNAI_COIMBATORE", "Vande Bharat"),
    ("20644", "Chennai Central Vande Bharat", "CHENNAI_COIMBATORE", "Vande Bharat"),
    ("12675", "Kovai Superfast Express", "CHENNAI_COIMBATORE", "Superfast"),
    ("12676", "Kovai Express Return", "CHENNAI_COIMBATORE", "Superfast"),
    ("12679", "Coimbatore Intercity SF", "CHENNAI_COIMBATORE", "Intercity SF"),
    ("12680", "Chennai Intercity SF", "CHENNAI_COIMBATORE", "Intercity SF"),
    ("12673", "Cheran Superfast Express", "CHENNAI_COIMBATORE", "Superfast Mail"),
    ("12674", "Cheran Express Return", "CHENNAI_COIMBATORE", "Superfast Mail"),
    ("12671", "Nilgiri (Blue Mountain) SF", "CHENNAI_COIMBATORE", "Superfast"),
    ("12672", "Nilgiri Express Return", "CHENNAI_COIMBATORE", "Superfast")
]

def generate_train_dataset():
    routes_map = {r["route_id"]: r for r in ROUTES_CONFIG}
    trains = []

    base_time = datetime(2026, 9, 29, 6, 0, 0)

    for idx, (train_id, train_name, route_id, category) in enumerate(TRAIN_NAMES):
        route_meta = routes_map[route_id]
        stations_data = []
        
        # Stagger departure times across the day
        dep_hour = (6 + (idx * 2)) % 24
        dep_min = (idx * 17) % 60
        start_time = base_time.replace(hour=dep_hour, minute=dep_min)

        total_stations = len(route_meta["stations"])
        avg_speed_kmh = 95.0 if "Rajdhani" in category or "Vande Bharat" in category else 75.0

        for s_idx, st in enumerate(route_meta["stations"]):
            dist = st["dist"]
            travel_hours = dist / avg_speed_kmh
            sched_time = start_time + timedelta(hours=travel_hours)
            
            # Distance from source
            stations_data.append({
                "code": st["code"],
                "name": st["name"],
                "lat": st["lat"],
                "lon": st["lon"],
                "distance_km": dist,
                "scheduled_arrival": sched_time.strftime("%H:%M"),
                "scheduled_day": (start_time + timedelta(hours=travel_hours)).day - start_time.day,
                "platform": (dist % 6) + 1
            })

        # Initialize current position along the route
        # Distribute progress: some just started, some mid-route, some near destination
        progress_pct = (idx * 0.17 + 0.1) % 0.85 + 0.05
        current_station_idx = min(int(progress_pct * total_stations), total_stations - 2)
        
        # Seed realistic delays based on route congestion
        # CNB-PRYJ is known for congestion
        chronic_route_factor = 1.4 if route_id == "DELHI_HOWRAH" else (1.1 if route_id == "DELHI_MUMBAI" else 0.8)
        current_delay = max(0, int(random.gauss(8 * chronic_route_factor, 12)))

        trains.append({
            "train_id": train_id,
            "train_name": train_name,
            "route_id": route_id,
            "route_name": route_meta["route_name"],
            "category": category,
            "current_station_index": current_station_idx,
            "current_station": stations_data[current_station_idx]["name"],
            "current_station_code": stations_data[current_station_idx]["code"],
            "next_station": stations_data[current_station_idx + 1]["name"],
            "next_station_code": stations_data[current_station_idx + 1]["code"],
            "current_delay_min": current_delay,
            "speed_kmh": round(avg_speed_kmh * random.uniform(0.85, 1.05), 1),
            "progress_between_stations": round(random.uniform(0.2, 0.8), 2),
            "stations": stations_data,
            "last_updated": datetime.now().isoformat()
        })

    return trains

def generate_historical_delay_records(trains, num_records=25000):
    """
    Generates historical journey station-hop delay observations with features:
    - current_delay_min
    - delay_velocity (min / 100km)
    - hour_of_day
    - day_of_week
    - distance_from_source
    - downstream_congestion_index (0.0 - 1.0)
    - weather_severity (0.0 - 1.0)
    - avg_delay_this_train_last_30d
    - scheduled_running_time
    - preceding_train_delay
    - lag_delay_1, lag_delay_2, lag_delay_3, lag_delay_4, lag_delay_5 (for LSTM/Seq)
    - TARGET: delay_at_next_station (minutes)
    """
    records = []
    
    for _ in range(num_records):
        train = random.choice(trains)
        st_count = len(train["stations"])
        st_idx = random.randint(0, st_count - 2)
        
        curr_st = train["stations"][st_idx]
        next_st = train["stations"][st_idx + 1]
        
        hop_dist = max(10, next_st["distance_km"] - curr_st["distance_km"])
        
        hour = random.randint(0, 23)
        day_of_week = random.randint(0, 6) # 0=Mon, 6=Sun
        
        # Sectional congestion hotspots (e.g. Kanpur-Prayagraj, Mathura-Kota, Ghaziabad)
        is_bottleneck = (curr_st["code"] in ["CNB", "GZB", "MTJ", "SUR", "JTJ", "DDU"])
        downstream_congestion = random.uniform(0.6, 0.95) if is_bottleneck else random.uniform(0.1, 0.5)
        
        # Weather severity: occasional fog or heavy rain
        weather_severity = random.choices([0.05, 0.2, 0.5, 0.85], weights=[0.65, 0.20, 0.10, 0.05])[0]
        
        # Peak hours: 7-10 AM and 17-21 PM
        is_peak = (7 <= hour <= 10) or (17 <= hour <= 21)
        peak_adder = random.uniform(3.0, 9.0) if is_peak else 0.0
        
        # Historical train profile
        avg_delay_30d = random.uniform(5.0, 25.0) if "Mail" in train["category"] else random.uniform(2.0, 12.0)
        
        # Current delay & delay lag sequence
        curr_delay = max(0.0, random.gauss(avg_delay_30d, 8.0))
        lag1 = max(0.0, curr_delay + random.gauss(-1.5, 3.0))
        lag2 = max(0.0, lag1 + random.gauss(-1.0, 3.0))
        lag3 = max(0.0, lag2 + random.gauss(-1.0, 3.0))
        lag4 = max(0.0, lag3 + random.gauss(-0.5, 2.5))
        lag5 = max(0.0, lag4 + random.gauss(-0.5, 2.0))
        
        preceding_train_delay = max(0.0, random.gauss(curr_delay * 0.7, 5.0))
        delay_velocity = (curr_delay - lag1) / (max(20, hop_dist) / 100.0)
        
        scheduled_running_time = (hop_dist / 85.0) * 60.0 # minutes
        
        # Realistic Target Delay Formulation:
        # Delay propagates + sectional friction + weather + recovery ability on long hops
        slack_recovery = max(0.0, scheduled_running_time * 0.08) if curr_delay > 15 else 0.0
        congestion_penalty = downstream_congestion * 14.0
        weather_penalty = weather_severity * 18.0
        preceding_interference = (preceding_train_delay / 15.0) * 3.5
        
        incremental_delay = (
            (congestion_penalty) +
            (weather_penalty) +
            (peak_adder) +
            (preceding_interference) +
            (delay_velocity * 0.8) -
            (slack_recovery) +
            random.gauss(0.0, 2.2)
        )
        
        target_delay = max(0.0, curr_delay + incremental_delay)
        
        records.append({
            "train_id": train["train_id"],
            "route_id": train["route_id"],
            "station_code": curr_st["code"],
            "next_station_code": next_st["code"],
            "current_delay_min": round(curr_delay, 2),
            "delay_velocity": round(delay_velocity, 2),
            "hour_of_day": hour,
            "day_of_week": day_of_week,
            "distance_from_source": curr_st["distance_km"],
            "downstream_congestion_index": round(downstream_congestion, 3),
            "weather_severity": round(weather_severity, 3),
            "avg_delay_this_train_last_30d": round(avg_delay_30d, 2),
            "scheduled_running_time": round(scheduled_running_time, 2),
            "preceding_train_delay": round(preceding_train_delay, 2),
            "lag_delay_1": round(lag1, 2),
            "lag_delay_2": round(lag2, 2),
            "lag_delay_3": round(lag3, 2),
            "lag_delay_4": round(lag4, 2),
            "lag_delay_5": round(lag5, 2),
            "target_delay_next_station": round(target_delay, 2)
        })

    return records

if __name__ == "__main__":
    print("Generating Indian Railways synthetic dataset...")
    trains = generate_train_dataset()
    with open("backend/data/trains.json", "w") as f:
        json.dump(trains, f, indent=2)
    print(f"Generated {len(trains)} trains in backend/data/trains.json")
    
    records = generate_historical_delay_records(trains, num_records=20000)
    keys = records[0].keys()
    with open("backend/data/history.csv", "w", newline="") as f:
        dict_writer = csv.DictWriter(f, fieldnames=keys)
        dict_writer.writeheader()
        dict_writer.writerows(records)
    print(f"Generated {len(records)} delay records in backend/data/history.csv")
