import { Thermometer, Droplets, Sun, Layers, Wifi } from "lucide-react";
import type { SensorReading } from "@/hooks/useSensorData";

interface Props {
  nodes: SensorReading[];
}

const SummaryCards = ({ nodes }: Props) => {
  const onlineNodes = nodes.filter((n) => n.online);
  const avgTemp = onlineNodes.length ? +(onlineNodes.reduce((s, n) => s + n.temperature, 0) / onlineNodes.length).toFixed(1) : 0;
  const avgHum = onlineNodes.length ? +(onlineNodes.reduce((s, n) => s + n.humidity, 0) / onlineNodes.length).toFixed(1) : 0;
  const avgLight = onlineNodes.length ? Math.round(onlineNodes.reduce((s, n) => s + n.light, 0) / onlineNodes.length) : 0;
  const tempGradient = onlineNodes.length ? +(Math.max(...onlineNodes.map((n) => n.temperature)) - Math.min(...onlineNodes.map((n) => n.temperature))).toFixed(1) : 0;

  const cards = [
    { label: "Avg Temperature", value: `${avgTemp}°C`, icon: Thermometer, color: "text-temp-warm" },
    { label: "Temp Gradient", value: `Δ ${tempGradient}°C`, icon: Layers, color: "text-temp-hot" },
    { label: "Avg Humidity", value: `${avgHum}%`, icon: Droplets, color: "text-sensor-humidity" },
    { label: "Avg Light", value: `${avgLight} lux`, icon: Sun, color: "text-sensor-light" },
    { label: "Active Nodes", value: `${onlineNodes.length}/${nodes.length}`, icon: Wifi, color: "text-primary" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {cards.map((c) => (
        <div key={c.label} className="metric-card">
          <div className="flex items-center gap-2 mb-2">
            <c.icon className={`w-4 h-4 ${c.color}`} />
            <span className="metric-label">{c.label}</span>
          </div>
          <p className={`metric-value ${c.color}`}>{c.value}</p>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
