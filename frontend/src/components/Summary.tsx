import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-toastify';
import { ClipboardIcon } from '@heroicons/react/24/outline';

const Summary: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState<any>(null);
  const [aggregated, setAggregated] = useState<Record<string, number>>({});
  const [perCabin, setPerCabin] = useState<Record<string, Record<string, number>>>({});
  const [showAggregated, setShowAggregated] = useState(false);
  const [message, setMessage] = useState('');
  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    axios.get(`/api/checklists/${id}`).then(res => {
      setChecklist(res.data);
      generateMessage(res.data);
    });
    axios.get('/api/pending-summaries').then(res => {
      setAggregated(res.data.aggregated);
      setPerCabin(res.data.perCabin);
    });
  }, [id]);

  const generateMessage = (cl: any) => {
    let msg = `Cabin ${cl.cabinNumber} has been pre-cleaned.`;
    if (cl.damagesYesNo && cl.damagesDescription) msg += ` Damages: ${cl.damagesDescription}`;
    setMessage(msg);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    toast.success('Copied!');
  };

  const handleMarkRestockOK = async () => {
    try {
      const updated = { ...checklist, restockInventory: 'OK', completed: true };
      await axios.put(`/api/checklists/${id}`, updated);
      setChecklist(updated);
      toast.success('Marked as OK');
    } catch (err) {
      toast.error('Error');
    }
  };

  const print = useReactToPrint({
    contentRef: componentRef,
  });

  if (!checklist) return <div>Loading...</div>;

  const renderSummary = (data: Record<string, number>, title: string) => (
    <div>
      <h3>{title}</h3>
      <ul>
        {Object.entries(data).map(([key, value]) => 
          value > 0 ? <li key={key}>{key}: {value}</li> : null
        )}
      </ul>
    </div>
  );

  return (
    <div className="p-4" ref={componentRef}>
      <h2 className="text-2xl">Restock Summary for Cabin {checklist.cabinNumber}</h2>
      {renderSummary(checklist, 'Per Cabin Needs')}
      <button onClick={() => setShowAggregated(!showAggregated)} className="bg-gray-500 text-white p-2">Toggle Aggregated</button>
      {showAggregated && (
        <>
          {renderSummary(aggregated, 'Total Across Pendings')}
          {Object.entries(perCabin).map(([cabin, items]) => renderSummary(items, `Cabin ${cabin}`))}
        </>
      )}
      <button onClick={handleMarkRestockOK} className="bg-green-500 text-white p-2 mt-4">Mark Restock OK</button>
      <div className="mt-4">
        <p>{message}</p>
        <button onClick={handleCopy}><ClipboardIcon className="h-6 w-6" /></button>
      </div>
      <button onClick={print} className="bg-blue-500 text-white p-2 mt-4">Print Summary</button>
      <button onClick={() => navigate('/')} className="bg-gray-500 text-white p-2 mt-4">Back to Home</button>
    </div>
  );
};

export default Summary;