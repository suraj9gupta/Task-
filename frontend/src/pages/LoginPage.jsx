import { useState } from 'react';
import { api } from '../api/client';
import { authStore } from '../store/authStore';

export const LoginPage = () => {
  const setAuth = authStore((s) => s.setAuth);
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const submit = async (e) => {
    e.preventDefault();
    const url = isRegister ? '/auth/register' : '/auth/login';
    const { data } = await api.post(url, form);
    setAuth({ token: data.data.token, user: data.data.user });
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={submit} className="card w-full max-w-md space-y-3">
        <h2 className="text-xl font-semibold">{isRegister ? 'Register' : 'Login'}</h2>
        {isRegister && <input className="input" placeholder="Name" onChange={(e) => setForm({ ...form, name: e.target.value })} />}
        <input className="input" placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="input" placeholder="Password" type="password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="btn w-full">Submit</button>
        <button type="button" className="text-indigo-600" onClick={() => setIsRegister((s) => !s)}>
          {isRegister ? 'Already have account?' : 'Create new account'}
        </button>
      </form>
    </div>
  );
};
