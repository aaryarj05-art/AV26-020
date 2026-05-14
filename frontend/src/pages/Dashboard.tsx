import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import SkeletonCard from '../components/SkeletonCard';

const fetchDashboardSummary = async () => {
  const { data } = await axios.get('http://localhost:8000/api/dashboard/summary');
  return data;
};

// Recharts Global Defaults as defined in PART 4
const chartConfig = {
  grid: <CartesianGrid strokeDasharray="3 3" stroke="#1E2D40" vertical={false} />,
  xAxis: <XAxis tick={{ fill: '#8A9BB0', fontSize: 11 }} axisLine={false} tickLine={false} />,
  yAxis: <YAxis tick={{ fill: '#8A9BB0', fontSize: 11 }} axisLine={false} tickLine={false} />,
  tooltip: (
    <Tooltip
      contentStyle={{
        backgroundColor: '#111827',
        border: '1px solid #1E2D40',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#F0F4F8'
      }}
      cursor={{ stroke: '#1E2D40' }}
    />
  )
};

const fetchFusionStatus = async () => {
  const { data } = await axios.get('http://localhost:8000/api/fusion/status');
  return data;
};

export default function Dashboard() {
  const { isLoading: isSummaryLoading } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: fetchDashboardSummary,
    refetchInterval: 30000,
  });

  const { data: fusionData, isLoading: isFusionLoading } = useQuery({
    queryKey: ['fusionStatus'],
    queryFn: fetchFusionStatus,
    refetchInterval: 15000,
  });

  if (isSummaryLoading || isFusionLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <SkeletonCard height="h-32" />
          <SkeletonCard height="h-32" />
          <SkeletonCard height="h-32" />
          <SkeletonCard height="h-32" />
        </div>
        <div className="grid grid-cols-10 gap-4">
          <SkeletonCard className="col-span-6" height="h-[300px]" />
          <SkeletonCard className="col-span-4" height="h-[300px]" />
        </div>
        <SkeletonCard height="h-[200px]" />
      </div>
    );
  }

  // Mock data for trend and probability since we are rebuilding UI
  const trendData = [
    { name: '05/01', Dengue: 400, Malaria: 240, Influenza: 500, Cholera: 100, Typhoid: 150 },
    { name: '05/05', Dengue: 300, Malaria: 139, Influenza: 480, Cholera: 120, Typhoid: 180 },
    { name: '05/10', Dengue: 200, Malaria: 980, Influenza: 390, Cholera: 150, Typhoid: 200 },
    { name: '05/15', Dengue: 278, Malaria: 390, Influenza: 430, Cholera: 180, Typhoid: 250 },
    { name: '05/20', Dengue: 189, Malaria: 480, Influenza: 350, Cholera: 200, Typhoid: 300 },
    { name: '05/25', Dengue: 239, Malaria: 380, Influenza: 290, Cholera: 220, Typhoid: 280 },
    { name: '05/30', Dengue: 349, Malaria: 430, Influenza: 320, Cholera: 240, Typhoid: 260 },
  ];

  const probabilities = [
    { disease: 'Dengue', probability: 78, color: '#EF4444' },
    { disease: 'Malaria', probability: 52, color: '#F59E0B' },
    { disease: 'Influenza', probability: 65, color: '#F59E0B' },
    { disease: 'Cholera', probability: 24, color: '#10B981' },
    { disease: 'Typhoid', probability: 12, color: '#10B981' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return '#10B981';
      case 'warning': return '#F59E0B';
      case 'critical': return '#EF4444';
      default: return '#8A9BB0';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* ROW 1: KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'ACTIVE CASES', value: '12,847', trend: '↑ 12% vs last week', trendColor: '#EF4444' },
          { label: 'HIGH RISK REGIONS', value: '08', trend: '↑ 2 regions', trendColor: '#F59E0B' },
          { label: 'ALERTS TODAY', value: '24', trend: '↓ 5% vs yesterday', trendColor: '#10B981' },
          { label: 'MODEL ACCURACY', value: '94.2%', trend: '↑ 0.4% improvement', trendColor: '#10B981' },
        ].map((kpi, i) => (
          <div key={i} className="bg-[#111827] border border-[#1E2D40] rounded-2xl p-5">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-[#8A9BB0] mb-2">{kpi.label}</div>
            <div className="text-[36px] font-mono font-semibold text-[#F0F4F8] leading-none mb-2">{kpi.value}</div>
            <div className="text-[12px]" style={{ color: kpi.trendColor }}>{kpi.trend}</div>
          </div>
        ))}
      </div>

      {/* ROW 2: Trend & Data Fusion */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        <div className="lg:col-span-6 bg-[#111827] border border-[#1E2D40] rounded-2xl p-5">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-[#8A9BB0] mb-6">OUTBREAK TREND — LAST 30 DAYS</div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                {chartConfig.grid}
                {chartConfig.xAxis}
                {chartConfig.yAxis}
                {chartConfig.tooltip}
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }} />
                <Line type="monotone" dataKey="Dengue" stroke="#3B82F6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Malaria" stroke="#EF4444" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Influenza" stroke="#F59E0B" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Cholera" stroke="#10B981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Typhoid" stroke="#8B5CF6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-[#111827] border border-[#1E2D40] rounded-2xl p-5">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-[#8A9BB0] mb-6">DATA FUSION STATUS</div>
          <div className="space-y-4">
            {fusionData?.sources.map((source: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-[#1E2D40] last:border-0">
                <span className="text-[14px] text-[#F0F4F8]">{source.name}</span>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getStatusColor(source.status) }} />
                  <span className="text-[12px] text-[#8A9BB0]">{source.updated}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-[#1E2D40]">
            <div className="text-[11px] font-semibold text-[#8A9BB0] uppercase tracking-widest mb-1">Fusion Confidence</div>
            <div className="text-[32px] font-mono font-semibold text-[#F0F4F8]">
              {fusionData?.overall_confidence || 0}%
            </div>
          </div>
        </div>
      </div>

      {/* ROW 3: Outbreak Probability */}
      <div className="bg-[#111827] border border-[#1E2D40] rounded-2xl p-5">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-[#8A9BB0] mb-6">30-DAY OUTBREAK PROBABILITY BY DISEASE</div>
        <div className="h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={probabilities} margin={{ left: 20 }}>
              {chartConfig.grid}
              <XAxis type="number" hide />
              <YAxis 
                dataKey="disease" 
                type="category" 
                tick={{ fill: '#F0F4F8', fontSize: 12 }} 
                axisLine={false} 
                tickLine={false}
                width={80}
              />
              {chartConfig.tooltip}
              <Bar dataKey="probability" radius={[0, 4, 4, 0]} barSize={20} fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
