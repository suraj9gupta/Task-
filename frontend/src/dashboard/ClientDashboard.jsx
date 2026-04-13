import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { authStore } from '../store/authStore';

export const ClientDashboard = () => {
  const setApiCredentials = authStore((s) => s.setApiCredentials);
  const { data: keys, refetch } = useQuery({
    queryKey: ['keys'],
    queryFn: async () => (await api.get('/api-keys')).data.data,
  });

  const create = async () => {
    const { data } = await api.post('/api-keys/create', { name: `key-${Date.now()}` });
    setApiCredentials({ apiKey: data.data.apiKey, apiSecret: data.data.apiSecret });
    refetch();
  };

  return (
    <div className="grid gap-4">
      <section className="card">
        <h3 className="font-semibold mb-3">API Key Management</h3>
        <button className="btn" onClick={create}>Create API Key</button>
        <ul className="mt-3 text-sm space-y-1">
          {keys?.map((k) => <li key={k.id}>{k.name} ({k.keyPrefix}...) - {k.isRevoked ? 'Revoked' : 'Active'}</li>)}
        </ul>
      </section>
      <section className="card">
        <h3 className="font-semibold">Subscription Plans</h3>
        <p>Free: 5k/day • Premium: 50k/day</p>
      </section>
    </div>
  );
};
