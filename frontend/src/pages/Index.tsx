import { useSensorData } from "@/hooks/useSensorData";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import SummaryCards from "@/components/dashboard/SummaryCards";
import SensorNodeCards from "@/components/dashboard/SensorNodeCards";
import TrendChart from "@/components/dashboard/TrendChart";
import NodeComparisonChart from "@/components/dashboard/NodeComparisonChart";
import HeatmapGradient from "@/components/dashboard/HeatmapGradient";
import SpatialLayout from "@/components/dashboard/SpatialLayout";
import DataTable from "@/components/dashboard/DataTable";

const Index = () => {
  const { nodes, tempHistory, humHistory, lightHistory, dataLog, nodeLabels, nodeCount } = useSensorData();

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="p-4 md:p-6 space-y-4 max-w-[1600px] mx-auto">
        <SummaryCards nodes={nodes} />
        <SensorNodeCards nodes={nodes} labels={nodeLabels} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TrendChart title="Temperature Trend" data={tempHistory} nodeCount={nodeCount} unit="°C" />
          <TrendChart title="Humidity Trend" data={humHistory} nodeCount={nodeCount} unit="%" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TrendChart title="Light Intensity Trend" data={lightHistory} nodeCount={nodeCount} unit="lux" />
          <NodeComparisonChart nodes={nodes} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <HeatmapGradient nodes={nodes} labels={nodeLabels} />
          <SpatialLayout nodes={nodes} labels={nodeLabels} />
        </div>

        <DataTable data={dataLog} />
      </main>
    </div>
  );
};

export default Index;
