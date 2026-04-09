import { authStore } from '../store/authStore';

const tabs = [
  { key: 'client', label: 'Client Dashboard' },
  { key: 'admin', label: 'Admin Dashboard' },
  { key: 'browser', label: 'Data Browser' },
  { key: 'demo', label: 'Demo Form' },
];

export const Layout = ({ tab, setTab, children }) => {
  const user = authStore((s) => s.user);
  const logout = authStore((s) => s.logout);

  return (
    <div className="min-h-screen p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">India Village API</h1>
        <div className="flex gap-3 items-center">
          {user && <p className="text-sm">{user.email}</p>}
          <button className="btn" onClick={logout}>Logout</button>
        </div>
      </header>
      <nav className="flex gap-2 mb-6">
        {tabs.map((item) => (
          <button key={item.key} onClick={() => setTab(item.key)} className={`px-3 py-2 rounded-lg ${tab === item.key ? 'bg-indigo-600 text-white' : 'bg-white border'}`}>
            {item.label}
          </button>
        ))}
      </nav>
      {children}
    </div>
  );
};
