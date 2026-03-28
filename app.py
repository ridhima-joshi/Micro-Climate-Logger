from flask import Flask, jsonify, request
from flask_cors import CORS
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from datetime import datetime, timedelta
import math, random, collections

app = Flask(__name__)
CORS(app)

# ─── In-memory ring buffer: last 60 readings per node ────────────────────────
MAX_READINGS = 60
node_buffers = {
    1: collections.deque(maxlen=MAX_READINGS),
    2: collections.deque(maxlen=MAX_READINGS),
}

# ─── Synthetic Data Generator (fallback when no hardware connected) ───────────
def generate_synthetic_data(n_points=60, scenario="classroom"):
    base_time = datetime.now() - timedelta(minutes=n_points * 2)
    timestamps = [base_time + timedelta(minutes=i * 2) for i in range(n_points)]
    scenarios = {
        "classroom": {
            "temp1_base": 30.5, "temp2_base": 27.0,
            "hum1_base": 65,    "hum2_base": 58,
            "ldr1_base": 720,   "ldr2_base": 480,
            "noise": 0.8,       "trend": 0.03,
            "label": "Warm Classroom (Chennai Summer)"
        },
        "lab": {
            "temp1_base": 24.0, "temp2_base": 22.5,
            "hum1_base": 48,    "hum2_base": 45,
            "ldr1_base": 600,   "ldr2_base": 580,
            "noise": 0.4,       "trend": 0.01,
            "label": "Controlled Laboratory"
        },
        "cold_storage": {
            "temp1_base": 6.0,  "temp2_base": 4.5,
            "hum1_base": 80,    "hum2_base": 85,
            "ldr1_base": 120,   "ldr2_base": 90,
            "noise": 0.3,       "trend": -0.005,
            "label": "Cold Storage Unit"
        }
    }
    s = scenarios.get(scenario, scenarios["classroom"])
    records = []
    for i, ts in enumerate(timestamps):
        t = i / n_points
        drift = s["trend"] * i
        noise = s["noise"]
        hour_cycle = math.sin(2 * math.pi * t * 3)
        anomaly = i in [15, 35, 52]
        spike = random.choice([-4.5, 5.0, -3.5]) if anomaly else 0
        records.append({
            "timestamp": ts.isoformat(),
            "unix_ts": int(ts.timestamp()),
            "node1_temp": round(s["temp1_base"] + drift + hour_cycle * 1.2 + np.random.normal(0, noise) + spike, 2),
            "node1_hum":  round(s["hum1_base"]  + np.random.normal(0, noise * 2) + spike * 0.5, 2),
            "node1_ldr":  int(s["ldr1_base"]    + np.random.normal(0, 20) + spike * 15),
            "node2_temp": round(s["temp2_base"] + drift * 0.8 + hour_cycle * 0.8 + np.random.normal(0, noise * 0.7), 2),
            "node2_hum":  round(s["hum2_base"]  + np.random.normal(0, noise * 1.5), 2),
            "node2_ldr":  int(s["ldr2_base"]    + np.random.normal(0, 15)),
            "_injected_anomaly": anomaly,
            "_source": "synthetic"
        })
    return records, s["label"]


# ─── Analysis Engine ──────────────────────────────────────────────────────────
ASHRAE_TEMP_MIN, ASHRAE_TEMP_MAX = 20, 26
ASHRAE_HUM_MIN,  ASHRAE_HUM_MAX  = 30, 60
GRAD_TEMP_THRESHOLD = 2.5
GRAD_HUM_THRESHOLD  = 6.0
GRAD_LDR_THRESHOLD  = 150


def ashrae_classify(temp, hum):
    t_ok = ASHRAE_TEMP_MIN <= temp <= ASHRAE_TEMP_MAX
    h_ok = ASHRAE_HUM_MIN  <= hum  <= ASHRAE_HUM_MAX
    if t_ok and h_ok:   return "comfort"
    if temp > ASHRAE_TEMP_MAX: return "too_hot"
    if temp < ASHRAE_TEMP_MIN: return "too_cold"
    if hum  > ASHRAE_HUM_MAX:  return "too_humid"
    return "too_dry"


def ac_advice(n1_temp, n2_temp, n1_comfort, n2_comfort):
    """Generate plain-English AC recommendation based on both corners."""
    diff = round(n1_temp - n2_temp, 1)
    lines = []

    status_map = {
        "comfort":   "✅ comfortable",
        "too_hot":   "🔴 too hot",
        "too_cold":  "🔵 too cold",
        "too_humid": "💧 too humid",
        "too_dry":   "🌵 too dry",
    }

    lines.append(f"Front-Left corner is {status_map[n1_comfort]} ({n1_temp:.1f}°C)")
    lines.append(f"Back-Right corner is {status_map[n2_comfort]} ({n2_temp:.1f}°C)")

    if abs(diff) > GRAD_TEMP_THRESHOLD:
        hotter = "Front-Left" if diff > 0 else "Back-Right"
        cooler = "Back-Right" if diff > 0 else "Front-Left"
        lines.append(f"⚠️ {abs(diff):.1f}°C stratification — {hotter} is warmer than {cooler}.")
        lines.append("💡 Consider repositioning the AC vent or using a fan to circulate air.")

    both_hot  = n1_comfort == "too_hot"  and n2_comfort == "too_hot"
    both_cold = n1_comfort == "too_cold" and n2_comfort == "too_cold"
    avg_temp  = (n1_temp + n2_temp) / 2

    if both_hot:
        suggest = round(avg_temp - 2, 0)
        lines.append(f"❄️ Both corners are warm. Lower AC setpoint to ~{suggest:.0f}°C.")
    elif both_cold:
        suggest = round(avg_temp + 2, 0)
        lines.append(f"🌡️ Both corners are cold. Raise AC setpoint to ~{suggest:.0f}°C.")
    elif n1_comfort == "comfort" and n2_comfort == "comfort":
        lines.append("👍 Room is uniformly comfortable. No AC change needed.")
    elif n1_comfort == "too_hot" and n2_comfort != "too_hot":
        lines.append("💡 Front-Left is hot. Redirect AC airflow toward front of room.")
    elif n2_comfort == "too_hot" and n1_comfort != "too_hot":
        lines.append("💡 Back-Right is hot. Redirect AC airflow toward back of room.")

    return lines


def run_isolation_forest(df):
    features = df[["node1_temp","node1_hum","node1_ldr","node2_temp","node2_hum","node2_ldr"]].values
    if len(features) < 6:
        return [False] * len(features), [0.0] * len(features)
    model = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)
    preds  = model.fit_predict(features)
    scores = model.score_samples(features)
    return (preds == -1).tolist(), scores.tolist()


def compute_trend(series, window=10):
    trends = []
    for i in range(len(series)):
        start   = max(0, i - window)
        segment = series[start:i+1]
        if len(segment) < 3:
            trends.append(0.0)
        else:
            x     = np.arange(len(segment), dtype=float)
            slope = np.polyfit(x, segment, 1)[0]
            trends.append(round(float(slope), 4))
    return trends


def full_analysis(records):
    df = pd.DataFrame(records)

    df["grad_temp"] = df["node1_temp"] - df["node2_temp"]
    df["grad_hum"]  = df["node1_hum"]  - df["node2_hum"]
    df["grad_ldr"]  = df["node1_ldr"]  - df["node2_ldr"]

    df["strat_flag"] = df["grad_temp"].abs() > GRAD_TEMP_THRESHOLD
    df["hum_pocket"] = df["grad_hum"].abs()  > GRAD_HUM_THRESHOLD
    df["light_diff"] = df["grad_ldr"].abs()  > GRAD_LDR_THRESHOLD

    df["n1_comfort"] = df.apply(lambda r: ashrae_classify(r.node1_temp, r.node1_hum), axis=1)
    df["n2_comfort"] = df.apply(lambda r: ashrae_classify(r.node2_temp, r.node2_hum), axis=1)

    anomaly_flags, anomaly_scores = run_isolation_forest(df)
    df["if_anomaly"] = anomaly_flags
    df["if_score"]   = [round(s, 4) for s in anomaly_scores]

    df["trend_n1_temp"] = compute_trend(df["node1_temp"].tolist())
    df["trend_n2_temp"] = compute_trend(df["node2_temp"].tolist())
    df["trend_n1_hum"]  = compute_trend(df["node1_hum"].tolist())

    # Latest reading AC advice
    last = df.iloc[-1]
    advice = ac_advice(last.node1_temp, last.node2_temp, last.n1_comfort, last.n2_comfort)

    summary = {
        "total_readings":        len(df),
        "anomalies_detected":    int(df["if_anomaly"].sum()),
        "stratification_events": int(df["strat_flag"].sum()),
        "humidity_pockets":      int(df["hum_pocket"].sum()),
        "n1_comfort_pct":        round(100 * (df["n1_comfort"] == "comfort").mean(), 1),
        "n2_comfort_pct":        round(100 * (df["n2_comfort"] == "comfort").mean(), 1),
        "avg_grad_temp":         round(df["grad_temp"].mean(), 2),
        "avg_grad_hum":          round(df["grad_hum"].mean(), 2),
        "n1_temp_range":         [round(df["node1_temp"].min(),1), round(df["node1_temp"].max(),1)],
        "n2_temp_range":         [round(df["node2_temp"].min(),1), round(df["node2_temp"].max(),1)],
        "ac_advice":             advice,
        "latest_n1_temp":        round(float(last.node1_temp), 2),
        "latest_n2_temp":        round(float(last.node2_temp), 2),
        "latest_n1_hum":         round(float(last.node1_hum), 2),
        "latest_n2_hum":         round(float(last.node2_hum), 2),
        "latest_n1_comfort":     str(last.n1_comfort),
        "latest_n2_comfort":     str(last.n2_comfort),
    }

    return df.replace({np.nan: None}).to_dict(orient="records"), summary


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.route("/api/ingest", methods=["POST"])
def ingest():
    """
    Receives JSON from ESP8266 nodes.
    Expected payload:
      { "node_id": 1, "location": "Front-Left", "temp": 29.5, "humidity": 63.2, "ldr": 712 }
    """
    data = request.get_json(force=True, silent=True)
    if not data:
        return jsonify({"error": "Invalid JSON"}), 400

    node_id = int(data.get("node_id", 0))
    if node_id not in (1, 2):
        return jsonify({"error": "node_id must be 1 or 2"}), 400

    reading = {
        "timestamp":  datetime.now().isoformat(),
        "unix_ts":    int(datetime.now().timestamp()),
        "location":   data.get("location", f"Node {node_id}"),
        "temp":       float(data.get("temp", 0)),
        "humidity":   float(data.get("humidity", 0)),
        "ldr":        int(data.get("ldr", 0)),
    }
    node_buffers[node_id].append(reading)

    print(f"[INGEST] Node {node_id} | {reading['temp']}°C | {reading['humidity']}% | LDR {reading['ldr']}")
    return jsonify({"status": "ok", "node_id": node_id, "buffered": len(node_buffers[node_id])}), 200


def _merge_buffers():
    """Zip node1 and node2 readings into paired records for analysis."""
    b1 = list(node_buffers[1])
    b2 = list(node_buffers[2])
    n  = min(len(b1), len(b2))
    if n == 0:
        return None
    records = []
    for i in range(n):
        records.append({
            "timestamp":  b1[i]["timestamp"],
            "unix_ts":    b1[i]["unix_ts"],
            "node1_temp": b1[i]["temp"],
            "node1_hum":  b1[i]["humidity"],
            "node1_ldr":  b1[i]["ldr"],
            "node2_temp": b2[i]["temp"],
            "node2_hum":  b2[i]["humidity"],
            "node2_ldr":  b2[i]["ldr"],
            "_source":    "hardware",
        })
    return records


@app.route("/api/data/<scenario>")
def get_data(scenario):
    """
    Returns analyzed data. Uses real hardware readings if both nodes
    have sent data; otherwise falls back to synthetic data.
    """
    records = _merge_buffers()
    if records and len(records) >= 5:
        source_label = "Live Hardware (Both Nodes)"
    else:
        records, _ = generate_synthetic_data(60, scenario if scenario != "live" else "classroom")
        source_label = f"Synthetic Demo ({scenario})"

    analyzed, summary = full_analysis(records)
    summary["data_source"] = source_label

    return jsonify({
        "scenario":       scenario,
        "scenario_label": source_label,
        "summary":        summary,
        "readings":       analyzed
    })


@app.route("/api/live")
def live_tick():
    """
    Returns the single latest reading from both nodes.
    Uses real hardware if available, otherwise generates synthetic tick.
    """
    b1 = list(node_buffers[1])
    b2 = list(node_buffers[2])

    if b1 and b2:
        r1, r2 = b1[-1], b2[-1]
        r = {
            "timestamp":   datetime.now().isoformat(),
            "node1_temp":  r1["temp"],    "node1_hum": r1["humidity"], "node1_ldr": r1["ldr"],
            "node2_temp":  r2["temp"],    "node2_hum": r2["humidity"], "node2_ldr": r2["ldr"],
            "data_source": "hardware",
        }
    else:
        r = {
            "timestamp":   datetime.now().isoformat(),
            "node1_temp":  round(29.5 + np.random.normal(0, 0.6), 2),
            "node1_hum":   round(63.0 + np.random.normal(0, 1.2), 2),
            "node1_ldr":   int(700    + np.random.normal(0, 25)),
            "node2_temp":  round(26.8 + np.random.normal(0, 0.5), 2),
            "node2_hum":   round(57.5 + np.random.normal(0, 1.0), 2),
            "node2_ldr":   int(470    + np.random.normal(0, 20)),
            "data_source": "synthetic",
        }

    r["grad_temp"]  = round(r["node1_temp"] - r["node2_temp"], 2)
    r["grad_hum"]   = round(r["node1_hum"]  - r["node2_hum"],  2)
    r["n1_comfort"] = ashrae_classify(r["node1_temp"], r["node1_hum"])
    r["n2_comfort"] = ashrae_classify(r["node2_temp"], r["node2_hum"])
    r["strat_flag"] = abs(r["grad_temp"]) > GRAD_TEMP_THRESHOLD
    r["hum_pocket"] = abs(r["grad_hum"])  > GRAD_HUM_THRESHOLD
    r["if_anomaly"] = False
    r["ac_advice"]  = ac_advice(r["node1_temp"], r["node2_temp"], r["n1_comfort"], r["n2_comfort"])

    return jsonify(r)


@app.route("/api/status")
def status():
    """Quick health check — shows how many readings each node has buffered."""
    return jsonify({
        "node1_readings": len(node_buffers[1]),
        "node2_readings": len(node_buffers[2]),
        "node1_connected": len(node_buffers[1]) > 0,
        "node2_connected": len(node_buffers[2]) > 0,
    })


@app.route("/api/scenarios")
def scenarios():
    return jsonify(["classroom", "lab", "cold_storage"])


if __name__ == "__main__":
    print("=" * 50)
    print("  Micro-Climate Logger — Flask Backend")
    print("  Running on http://0.0.0.0:5000")
    print("  POST sensor data to /api/ingest")
    print("  Dashboard: open dashboard.html in browser")
    print("=" * 50)
    #app.run(host="192.168.17.152", debug=True, port=5000) 
    app.run(host="0.0.0.0", debug=True, port=5000)
