import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { SensorReading } from "@/hooks/useSensorData";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

interface Props {
  nodes: SensorReading[];
}

const NodeComparisonChart = ({ nodes }: Props) => {
  const data = nodes.map((n) => ({
    name: `Node ${n.node_id}`,
    Temperature: n.temperature,
    Humidity: n.humidity,
  }));

  return (
    <div className="chart-container">
      <h3 className="text-sm font-medium text-foreground mb-3">Node Comparison — Temperature</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 22%)" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(215 12% 55%)" }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "hsl(215 12% 55%)" }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: "hsl(220 18% 13%)", border: "1px solid hsl(220 14% 20%)", borderRadius: 8, fontSize: 12 }}
          />
          <Bar dataKey="Temperature" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NodeComparisonChart;
