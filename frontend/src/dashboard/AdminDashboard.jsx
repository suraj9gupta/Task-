import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../api/client';

export const AdminDashboard = () => {
  const { data: analytics } = useQuery({ queryKey: ['analytics'], queryFn: async () => (await api.get('/admin/analytics')).data.data });
  const { data: users } = useQuery({ queryKey: ['users'], queryFn: async () => (await api.get('/admin/users?limit=5')).data.data });
  const { data: logs } = useQuery({ queryKey: ['logs'], queryFn: async () => (await api.get('/admin/logs?limit=10')).data.data });

  const chartData = analytics
    ? [
        { name: 'Users', value: analytics.users },
        { name: 'Keys', value: analytics.activeKeys },
        { name: 'Req 24h', value: analytics.requestsLast24h },
      ]
    : [];

  return (
    <div className="grid gap-4">
      <section className="card">
        <h3 className="font-semibold">Analytics</h3>
        <BarChart width={500} height={220} data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#4f46e5" />
        </BarChart>
      </section>
      <section className="card">
        <h3 className="font-semibold mb-2">Recent Users</h3>
        {users?.map((u) => <p key={u.id} className="text-sm">{u.email} ({u.subscription?.plan})</p>)}
      </section>
      <section className="card">
        <h3 className="font-semibold mb-2">API Logs</h3>
        {logs?.map((l) => <p key={l.id} className="text-sm">{l.method} {l.endpoint} - {l.statusCode}</p>)}
      </section>
    </div>
  );
};
