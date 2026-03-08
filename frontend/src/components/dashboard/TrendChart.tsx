import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { HistoryEntry } from "@/hooks/useSensorData";

const NODE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

interface Props {
  title: string;
  data: HistoryEntry[];
  nodeCount: number;
  unit: string;
  domain?: [number, number];
}

const TrendChart = ({ title, data, nodeCount, unit, domain }: Props) => (
  <div className="chart-container">
    <h3 className="text-sm font-medium text-foreground mb-3">{title}</h3>
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 22%)" />
        <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(215 12% 55%)" }} tickLine={false} axisLine={false} />
        <YAxis domain={domain || ["auto", "auto"]} tick={{ fontSize: 10, fill: "hsl(215 12% 55%)" }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ background: "hsl(220 18% 13%)", border: "1px solid hsl(220 14% 20%)", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "hsl(210 20% 92%)" }}
        />
        <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
        {Array.from({ length: nodeCount }, (_, i) => (
          <Line
            key={i}
            type="monotone"
            dataKey={`Node ${i + 1}`}
            stroke={NODE_COLORS[i]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default TrendChart;
