// frontend/src/components/Summary.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-toastify';
import { ClipboardIcon } from '@heroicons/react/24/outline';
import { FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../context/CartContext';

const labels = {
  bathTowels: 'Bath Towels',
  handTowels: 'Hand Towels',
  washCloths: 'Wash Cloths',
  makeupCloths: 'Makeup Cloths',
  bathMat: 'Bath Mat',
  shampoo: 'Shampoo',
  conditioner: 'Conditioner',
  bodyWash: 'Body Wash',
  bodyLotion: 'Body Lotion',
  barSoap: 'Bar Soap',
  soapDispenser: 'Soap Dispenser',
  toiletPaper: 'Toilet Paper',
  bathroomCups: 'Paper Cups, Bathroom',
  kleenex: 'Kleenex',
  bathCheckLights: 'Bath Check Lights',
  waterBottles: 'Water Bottles',
  coffeePods: 'Coffee Pods',
  coffeeSweeteners: 'Coffee Sweeteners',
  coffeeCreamer: 'Coffee Creamer',
  coffeeCupsCeramic: 'Coffee Cups, Ceramic',
  coffeeCupsPaper: 'Coffee Cups, Paper',
  coffeeCupLids: 'Coffee Cup Lids',
  coffeeStirrers: 'Coffee Stirrers',
  emptyRelineTrashCans: 'Reline Trash Cans',
  paperTowels: 'Paper Towels',
  dishSoap: 'Dish Soap',
  lockBattery: 'Lock Battery (AA)',
  smokeAlarmBattery: 'Smoke Alarm Battery (AA)',
  motionDetectorBattery: 'Motion Detector Battery (AA)',
  doorSensorBattery: 'Door Sensor Battery (CR2032)',
  livingCheckLights: 'Living Check Lights',
};

const Summary: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isGlobal = id === 'global';
  const [data, setData] = useState<{ aggregated: Record<string, number>; perCabin: Record<string, Record<string, number>>; pendings: any[] }>({
    aggregated: {},
    perCabin: {},
    pendings: [],
  });
  const { cart, addToCart } = useCart();
  const componentRef = useRef<HTMLDivElement>(null);
  const print = useReactToPrint({
    contentRef: componentRef,
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('/api/pending-summaries').then(res => {
      setData(res.data);
      if (!isGlobal) {
        const cl = res.data.pendings.find((p: any) => p._id === id);
        if (cl) {
          let msg = `Cabin ${cl.cabinNumber} has been pre-cleaned.`;
          if (cl.damagesYesNo && cl.damagesDescription) msg += ` Comments: ${cl.damagesDescription}`;
          setMessage(msg);
        }
      }
    });
  }, [id, isGlobal]);

  const cabins = Object.keys(data.perCabin).sort();
  const items = Object.keys(data.aggregated);

  const isInCart = (key: string) => cart.some(c => c.item === labels[key as keyof typeof labels]);

  const handleAddToCart = (key: string) => {
    addToCart(labels[key as keyof typeof labels], 1, null);
  };

  const handleCabinClick = (cabin: string) => {
    const pending = data.pendings.find((p: any) => p.cabinNumber === Number(cabin));
    if (pending) {
      navigate(`/checklist/${cabin}?edit=${pending._id}`);
    }
  };

  return (
    <div className="p-4">
      <button onClick={print} className="float-right bg-blue-500 text-white p-2 rounded">Print</button>
      <h2 className="text-2xl mb-4">Restock Summary</h2>
      {!isGlobal && message && (
        <div className="mb-4">
          <p>{message}</p>
          <button onClick={() => navigator.clipboard.writeText(message).then(() => toast.success('Copied!'))}><ClipboardIcon className="h-6 w-6" /></button>
        </div>
      )}
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2 text-left">Item</th>
            {cabins.map(cabin => (
              <th key={cabin} className="border p-2 text-left cursor-pointer" onClick={() => handleCabinClick(cabin)}>
                Cabin {cabin}
              </th>
            ))}
            <th className="border p-2 text-left">Total</th>
            <th className="border p-2 text-left">Buy</th>
          </tr>
        </thead>
        <tbody>
          {items.map(key => (
            <tr key={key}>
              <td className="border p-2">{labels[key as keyof typeof labels] || key}</td>
              {cabins.map(cabin => (
                <td key={cabin} className="border p-2">{data.perCabin[cabin][key] || 0}</td>
              ))}
              <td className="border p-2">{data.aggregated[key]}</td>
              <td className="border p-2">
                {!isInCart(key) && data.aggregated[key] > 0 && (
                  FaShoppingCart({ className: "cursor-pointer", onClick: () => handleAddToCart(key) })
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div ref={componentRef} className="hidden print:block">
        <h2>Restock Summary</h2>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              {cabins.map(cabin => <th key={cabin}>Cabin {cabin}</th>)}
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map(key => (
              <tr key={key}>
                <td>{labels[key as keyof typeof labels] || key}</td>
                {cabins.map(cabin => (
                  <td key={cabin}>{data.perCabin[cabin][key] || 0}</td>
                ))}
                <td>{data.aggregated[key]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Summary;