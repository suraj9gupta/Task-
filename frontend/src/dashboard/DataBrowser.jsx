import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../api/client';

export const DataBrowser = () => {
  const [stateId, setStateId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [subDistrictId, setSubDistrictId] = useState('');

  const { data: states } = useQuery({ queryKey: ['states'], queryFn: async () => (await api.get('/states')).data.data });
  const { data: districts } = useQuery({
    queryKey: ['districts', stateId],
    queryFn: async () => (await api.get(`/states/${stateId}/districts`)).data.data,
    enabled: !!stateId,
  });
  const { data: subDistricts } = useQuery({
    queryKey: ['subDistricts', districtId],
    queryFn: async () => (await api.get(`/districts/${districtId}/subdistricts`)).data.data,
    enabled: !!districtId,
  });
  const { data: villages } = useQuery({
    queryKey: ['villages', subDistrictId],
    queryFn: async () => (await api.get(`/subdistricts/${subDistrictId}/villages?limit=25`)).data.data,
    enabled: !!subDistrictId,
  });

  return (
    <div className="card space-y-3">
      <h3 className="font-semibold">Data Browser</h3>
      <div className="grid grid-cols-4 gap-2">
        <select className="input" onChange={(e) => setStateId(e.target.value)}><option value="">State</option>{states?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
        <select className="input" onChange={(e) => setDistrictId(e.target.value)}><option value="">District</option>{districts?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
        <select className="input" onChange={(e) => setSubDistrictId(e.target.value)}><option value="">Sub-District</option>{subDistricts?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
      </div>
      <table className="w-full text-sm">
        <thead><tr><th className="text-left">Village</th><th className="text-left">Postal</th></tr></thead>
        <tbody>{villages?.map((v) => <tr key={v.id}><td>{v.name}</td><td>{v.postalCode || '-'}</td></tr>)}</tbody>
      </table>
    </div>
  );
};
