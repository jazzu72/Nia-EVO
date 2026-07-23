import { useEffect, useState } from 'react';
import { LineChart, Activity, TrendingUp, Users } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    revenue: 0,
    pipeline: 0,
    leads: 0,
    deals: 0,
  });
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tractionRes, grantsRes, fundraisingRes] = await Promise.all([
          fetch('/api/traction'),
          fetch('/api/grants'),
          fetch('/api/fundraising'),
        ]);
        const traction = await tractionRes.json();
        const grants = await grantsRes.json();
        const fundraising = await fundraisingRes.json();

        setStats({
          revenue: traction.totalRevenue || 0,
          pipeline: grants.reduce((s, g) => s + g.amount, 0),
          leads: fundraising.summary?.contacted || 0,
          deals: fundraising.summary?.closed || 0,
        });
        setLogs(traction.logs || []);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <p className="text-gray-400">Welcome back, Nia.</p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-400">Revenue</h3>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-3xl font-bold mt-2">${stats.revenue.toLocaleString()}</p>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-400">Pipeline</h3>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-3xl font-bold mt-2">${stats.pipeline.toLocaleString()}</p>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-400">Active Leads</h3>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-3xl font-bold mt-2">{stats.leads}</p>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-400">Deals Closed</h3>
            <LineChart className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-3xl font-bold mt-2">{stats.deals}</p>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="text-lg font-medium mb-4">Live Activity Feed</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-500 text-sm">No recent activity</p>
          ) : (
            logs.slice(-8).reverse().map((log, i) => (
              <div key={i} className="text-sm text-gray-400 border-b border-border/50 py-2">
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
