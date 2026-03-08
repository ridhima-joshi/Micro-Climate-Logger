# 🌡️ Micro-Climate Gradient Monitoring System

A real-time environmental monitoring and visualization system that captures **temperature, humidity, and light intensity across multiple spatial sensor nodes** to detect **micro-climate gradients** inside indoor environments such as shelves, racks, classrooms, and storage spaces.

The system combines **ESP8266 sensor nodes** with a **modern web dashboard** to visualize environmental variations and thermal stratification in real time.

---

# 📌 Project Overview

Traditional monitoring systems measure environmental conditions at a **single location**, which often hides localized variations inside a room.

This project focuses on **micro-climate analysis**, measuring environmental conditions at **multiple spatial points** to detect gradients that influence:

* thermal comfort
* energy efficiency
* storage conditions
* lighting distribution

The system provides **real-time visualization of environmental differences across nodes**, enabling detailed environmental mapping.

---

# 🏗️ System Architecture

```
ESP8266 Sensor Nodes
        │
        │ WiFi
        ▼
Backend API (planned)
        │
        ▼
React Dashboard
        │
        ▼
Environmental Visualization
```

Sensor nodes periodically send environmental readings which are processed and visualized on the dashboard.

---

# ⚙️ Hardware Components

Each sensor node consists of:

* **ESP8266 microcontroller**
* **Temperature & Humidity sensor**

  * DHT11 / DHT22 / SHT series
* **Light sensor**

  * BH1750 or LDR
* WiFi communication

Nodes are placed at **different spatial positions** to capture environmental gradients.

Example layout:

```
Top Shelf        Node 1
Middle Shelf     Node 2
Bottom Shelf     Node 3
```

---

# 📊 Dashboard Features

The web dashboard provides real-time visualization of environmental data.

### 🔹 Real-Time Sensor Monitoring

Displays current readings from each node:

* temperature
* humidity
* light intensity
* node status

---

### 🔹 Temperature Trend Visualization

Time-series charts show temperature variations across nodes.

```
Temperature vs Time
Node 1 | Node 2 | Node 3
```

---

### 🔹 Humidity and Light Monitoring

Separate charts visualize humidity and light intensity trends.

---

### 🔹 Node Comparison

Compare environmental conditions between nodes.

Example:

```
Node1 : 26°C
Node2 : 28°C
Node3 : 30°C
```

---

### 🔹 Micro-Climate Gradient Heatmap

Visual heatmap showing spatial environmental variations across sensor nodes.

This highlights:

* thermal stratification
* uneven cooling
* localized hot spots

---

### 🔹 Spatial Layout Visualization

Nodes are displayed according to their physical placement in the environment.

Example:

```
Node1 ---- Node2 ---- Node3
 26°C       28°C       30°C
```

---

### 🔹 Data Logging

The dashboard stores recent sensor readings for analysis and debugging.

---

# 🧠 Environmental Insights

The system calculates key environmental metrics.

### Temperature Gradient

```
Gradient = max(node temperature) − min(node temperature)
```

Used to detect **thermal stratification** inside rooms or racks.

---

### Humidity Variation

Detects moisture pockets or uneven ventilation.

---

### Light Distribution

Identifies uneven lighting conditions across shelves or rooms.

---

# 💻 Software Stack

Frontend

* React
* Vite
* Tailwind CSS
* shadcn/ui
* Recharts / Nivo visualization

Hardware

* ESP8266 sensor nodes

Future backend

* Node.js
* Express API

---

# 🚀 Current Development Status

✅ Frontend dashboard implemented
✅ Real-time simulated sensor data
✅ Gradient visualization
⬜ ESP8266 hardware integration
⬜ Backend API for sensor data

---

# 📂 Project Structure

```
micro-climate-dashboard
│
├── frontend-new
│   ├── src
│   │   ├── components
│   │   ├── hooks
│   │   ├── pages
│   │   └── utils
│   ├── package.json
│   └── vite.config
│
├── frontend-old (prototype dashboard)
│
└── README.md
```

---

# 🔧 Running the Project

Clone the repository:

```
git clone https://github.com/YOUR_USERNAME/micro-climate-dashboard.git
```

Navigate to the frontend:

```
cd frontend-new
```

Install dependencies:

```
npm install
```

Start the dashboard:

```
npm run dev
```

Open in browser:

```
http://localhost:8080
```

---

# 🔮 Future Improvements

* real ESP8266 sensor integration
* backend data storage
* 3D environmental mapping
* predictive micro-climate modeling
* automated HVAC optimization

---

# 👩‍💻 Authors

Ridhima Joshi
Medhini

Embedded Systems Project — Micro-Climate Gradient Monitoring

---

# 📜 License

This project is developed for educational and research purposes.
