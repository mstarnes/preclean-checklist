// frontend/src/components/History.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEdit, FaTrash } from 'react-icons/fa';

const History: React.FC = () => {
  const navigate = useNavigate();
  const [checklists, setChecklists] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get('/api/checklists').then(res => setChecklists(res.data));
  }, []);

  const filtered = checklists.filter(cl => {
    if (!search) return true;
    if (cl.guestName.toLowerCase().includes(search.toLowerCase())) return true;
    if (cl.damagesDescription?.toLowerCase().includes(search.toLowerCase())) return true;
    if (search === 'cleanAC' && cl.cleanACFilter === 'Done') return true;
    if (search === 'lights' && (cl.bathCheckLights > 0 || cl.livingCheckLights > 0)) return true;
    if (search === 'batteries' && (cl.lockBattery > 0 || cl.smokeAlarmBattery > 0 || cl.motionDetectorBattery > 0 || cl.doorSensorBattery > 0)) return true;
    return false;
  });

  const handleDelete = async (id: string) => {
    await axios.delete(`/api/checklists/${id}`);
    setChecklists(prev => prev.filter(c => c._id !== id));
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl">History</h2>
      <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="border p-2 mb-4" />
      <table className="w-full border">
        <thead>
          <tr>
            <th className="text-left">Date</th>
            <th className="text-left">Cabin</th>
            <th className="text-left">Guest</th>
            <th className="text-left">Clean AC</th>
            <th className="text-left">Comments</th>
            <th className="text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(cl => (
            <tr key={cl._id}>
              <td>{cl.date}</td>
              <td>{cl.cabinNumber}</td>
              <td>{cl.guestName}</td>
              <td>{cl.cleanACFilter === 'Done' ? 'Done' : ''}</td>
              <td>{cl.damagesYesNo ? cl.damagesDescription : ''}</td>
              <td>
                {/* @ts-ignore */}
                <FaEdit onClick={() => navigate(`/checklist/${cl.cabinNumber}?edit=${cl._id}`)} className="cursor-pointer inline mr-2" />
                {/* @ts-ignore */}
                <FaTrash onClick={() => handleDelete(cl._id)} className="cursor-pointer inline" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default History;