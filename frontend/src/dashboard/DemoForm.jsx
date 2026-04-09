import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../api/client';
import { useDebounce } from '../hooks/useDebounce';

export const DemoForm = () => {
  const [village, setVillage] = useState('');
  const [selected, setSelected] = useState(null);
  const q = useDebounce(village, 350);

  const { data: options } = useQuery({
    queryKey: ['autocomplete', q],
    queryFn: async () => (await api.get(`/autocomplete?q=${encodeURIComponent(q)}`)).data.data,
    enabled: q.length >= 2,
  });

  return (
    <div className="card">
      <h3 className="font-semibold mb-2">Address Demo Client App</h3>
      <input className="input" value={village} onChange={(e) => setVillage(e.target.value)} placeholder="Search village" />
      <div className="mt-2 space-y-1">
        {options?.map((item) => (
          <button key={item.id} className="block text-left w-full hover:bg-slate-100 p-1" onClick={() => { setSelected(item); setVillage(item.name); }}>
            {item.name}, {item.subDistrict.name}, {item.district.name}, {item.state.name}
          </button>
        ))}
      </div>
      {selected && (
        <div className="mt-4 text-sm space-y-1">
          <p><b>Village:</b> {selected.name}</p>
          <p><b>Sub-District:</b> {selected.subDistrict.name}</p>
          <p><b>District:</b> {selected.district.name}</p>
          <p><b>State:</b> {selected.state.name}</p>
        </div>
      )}
    </div>
  );
};
