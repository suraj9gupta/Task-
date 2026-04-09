import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from './pages/LoginPage';
import { authStore } from './store/authStore';
import { Layout } from './components/Layout';
import { ClientDashboard } from './dashboard/ClientDashboard';
import { AdminDashboard } from './dashboard/AdminDashboard';
import { DataBrowser } from './dashboard/DataBrowser';
import { DemoForm } from './dashboard/DemoForm';

const queryClient = new QueryClient();

function AppShell() {
  const token = authStore((s) => s.token);
  const [tab, setTab] = useState('client');

  if (!token) return <LoginPage />;

  return (
    <Layout tab={tab} setTab={setTab}>
      {tab === 'client' && <ClientDashboard />}
      {tab === 'admin' && <AdminDashboard />}
      {tab === 'browser' && <DataBrowser />}
      {tab === 'demo' && <DemoForm />}
    </Layout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppShell />
    </QueryClientProvider>
  );
}
