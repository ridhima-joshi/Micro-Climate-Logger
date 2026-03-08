import { useState, useEffect, useCallback, useRef } from "react";

export interface SensorReading {
  node_id: number;
  temperature: number;
  humidity: number;
  light: number;
  timestamp: string;
  online: boolean;
}

export interface HistoryEntry {
  timestamp: string;
  time: string;
  [key: string]: number | string;
}

const NODE_COUNT = 5;

const BASE_VALUES = [
  { temp: 24.5, hum: 55, light: 380 },
  { temp: 26.2, hum: 52, light: 420 },
  { temp: 28.1, hum: 48, light: 350 },
  { temp: 25.0, hum: 60, light: 500 },
  { temp: 29.5, hum: 45, light: 280 },
];

const NODE_LABELS = ["Shelf Top", "Shelf Upper", "Shelf Middle", "Shelf Lower", "Shelf Bottom"];

function generateReading(nodeIndex: number, prevTemp: number, prevHum: number, prevLight: number): SensorReading {
  const base = BASE_VALUES[nodeIndex];
  const now = new Date();
  return {
    node_id: nodeIndex + 1,
    temperature: +(prevTemp + (Math.random() - 0.5) * 0.6).toFixed(1),
    humidity: +(prevHum + (Math.random() - 0.5) * 1.2).toFixed(1),
    light: Math.round(prevLight + (Math.random() - 0.5) * 20),
    timestamp: now.toISOString(),
    online: Math.random() > 0.03,
  };
}

export function useSensorData() {
  const [nodes, setNodes] = useState<SensorReading[]>(() =>
    BASE_VALUES.map((b, i) => ({
      node_id: i + 1,
      temperature: b.temp,
      humidity: b.hum,
      light: b.light,
      timestamp: new Date().toISOString(),
      online: true,
    }))
  );

  const [tempHistory, setTempHistory] = useState<HistoryEntry[]>([]);
  const [humHistory, setHumHistory] = useState<HistoryEntry[]>([]);
  const [lightHistory, setLightHistory] = useState<HistoryEntry[]>([]);
  const [dataLog, setDataLog] = useState<SensorReading[]>([]);

  const MAX_HISTORY = 30;
  const MAX_LOG = 100;

  useEffect(() => {
    const interval = setInterval(() => {
      setNodes((prev) => {
        const updated = prev.map((n, i) =>
          generateReading(i, n.temperature, n.humidity, n.light)
        );

        const now = new Date();
        const timeStr = now.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });

        const tempEntry: HistoryEntry = { timestamp: now.toISOString(), time: timeStr };
        const humEntry: HistoryEntry = { timestamp: now.toISOString(), time: timeStr };
        const lightEntry: HistoryEntry = { timestamp: now.toISOString(), time: timeStr };

        updated.forEach((n) => {
          tempEntry[`Node ${n.node_id}`] = n.temperature;
          humEntry[`Node ${n.node_id}`] = n.humidity;
          lightEntry[`Node ${n.node_id}`] = n.light;
        });

        setTempHistory((h) => [...h, tempEntry].slice(-MAX_HISTORY));
        setHumHistory((h) => [...h, humEntry].slice(-MAX_HISTORY));
        setLightHistory((h) => [...h, lightEntry].slice(-MAX_HISTORY));
        setDataLog((log) => [...updated, ...log].slice(0, MAX_LOG));

        return updated;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return { nodes, tempHistory, humHistory, lightHistory, dataLog, nodeLabels: NODE_LABELS, nodeCount: NODE_COUNT };
}
