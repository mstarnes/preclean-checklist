// History.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaTrash } from 'react-icons/fa';

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
    if (window.confirm('Are you sure you want to delete this checklist?')) {
      await axios.delete(`/api/checklists/${id}`);
      setChecklists(prev => prev.filter(c => c._id !== id));
    }
  };

  const handleRowClick = (cl: any) => {
    navigate(`/checklist/${cl.cabinNumber}?edit=${cl._id}`);
  };

  return (
    <div className="p-4 overflow-x-auto">
      <h2 className="text-2xl">History</h2>
      <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="border p-2 mb-4 w-full" />
      {/* Desktop Table View */}
      <table className="hidden sm:table w-full border min-w-max">
        <thead>
          <tr>
            <th className="text-left p-2">Date</th>
            <th className="text-left p-2">Cab</th>
            <th className="text-left p-2">Guest</th>
            <th className="text-left p-2">AC</th>
            <th className="text-left p-2">Comments</th>
            <th className="text-left p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(cl => (
            <tr key={cl._id} onClick={() => handleRowClick(cl)} className="cursor-pointer">
              <td className="p-2">{cl.date}</td>
              <td className="p-2">{cl.cabinNumber}</td>
              <td className="p-2">{cl.guestName}</td>
              <td className="p-2">{cl.cleanACFilter === 'Done' ? '✓' : ''}</td>
              <td className="p-2 whitespace-normal break-words max-w-xs">{cl.damagesYesNo ? cl.damagesDescription : ''}</td>
              <td className="p-2" onClick={e => e.stopPropagation()}>
                {FaTrash({ onClick: () => handleDelete(cl._id), className: "cursor-pointer inline h-6 w-6" })}              
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Mobile Card View */}
      <div className="sm:hidden space-y-4">
        {filtered.map(cl => (
          <div key={cl._id} className="border p-4 rounded-lg shadow cursor-pointer" onClick={() => handleRowClick(cl)}>
            <div className="flex justify-between items-start">
              <div>
                <p><strong>Date:</strong> {cl.date}</p>
                <p><strong>Cab:</strong> {cl.cabinNumber}</p>
                <p><strong>Guest:</strong> {cl.guestName}</p>
                <p><strong>AC:</strong> {cl.cleanACFilter === 'Done' ? '✓' : ''}</p>
                <p><strong>Comments:</strong> {cl.damagesYesNo ? cl.damagesDescription : ''}</p>
              </div>
              <FaTrash
                onClick={(e) => {
                  e.stopPropagation();           // keep this!
                  handleDelete(cl._id);
                }}
                className="cursor-pointer h-6 w-6 text-red-600"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;