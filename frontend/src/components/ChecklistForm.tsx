// frontend/src/components/ChecklistForm.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaUndo } from 'react-icons/fa';
import debounce from 'lodash/debounce';

interface FormDataType {
  cabinNumber: number;
  date: string;
  guestName: string;
  clearDoorCodes: boolean;
  resetThermostats: boolean;
  cleanACFilter: string;
  checkUnderBedsSofa: boolean;
  checkShower: boolean;
  bathTowels: number;
  handTowels: number;
  washCloths: number;
  makeupCloths: number;
  bathMat: number;
  shampoo: number;
  conditioner: number;
  bodyWash: number;
  bodyLotion: number;
  barSoap: number;
  soapDispenser: number;
  toiletPaper: number;
  bathroomCups: number;
  kleenex: number;
  bathCheckLights: number;
  gatherTowels: boolean;
  waterBottles: number;
  coffeePods: number;
  coffeeSweeteners: number;
  coffeeCreamer: number;
  coffeeCupsCeramic: number;
  coffeeCupsPaper: number;
  coffeeCupLids: number;
  coffeeStirrers: number;
  emptyRelineTrashCans: number;
  emptyCoffeeWater: boolean;
  emptyCoffeePod: boolean;
  paperTowels: number;
  dishSoap: number;
  emptyRefrigerator: boolean;
  emptyMicrowaveOven: boolean;
  lockBattery: number;
  smokeAlarmBattery: number;
  motionDetectorBattery: number;
  doorSensorBattery: number;
  livingCheckLights: number;
  tvRemoteUnderTV: boolean;
  stripQueenBeds: string;
  stripKingBeds: string;
  shakeRugs: boolean;
  damagesYesNo: boolean;
  damagesDescription: string;
}

const initialFormData: FormDataType = {
  cabinNumber: 1,
  date: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }),
  guestName: '',
  clearDoorCodes: false,
  resetThermostats: false,
  cleanACFilter: 'Checked, Not Needed',
  checkUnderBedsSofa: false,
  checkShower: false,
  bathTowels: 4,
  handTowels: 2,
  washCloths: 4,
  makeupCloths: 2,
  bathMat: 1,
  shampoo: 1,
  conditioner: 1,
  bodyWash: 1,
  bodyLotion: 1,
  barSoap: 1,
  soapDispenser: 0,
  toiletPaper: 2,
  bathroomCups: 0,
  kleenex: 1,
  bathCheckLights: 0,
  gatherTowels: false,
  waterBottles: 4,
  coffeePods: 0,
  coffeeSweeteners: 0,
  coffeeCreamer: 0,
  coffeeCupsCeramic: 0,
  coffeeCupsPaper: 4,
  coffeeCupLids: 4,
  coffeeStirrers: 0,
  emptyRelineTrashCans: 2,
  emptyCoffeeWater: false,
  emptyCoffeePod: false,
  paperTowels: 0,
  dishSoap: 0,
  emptyRefrigerator: false,
  emptyMicrowaveOven: false,
  lockBattery: 0,
  smokeAlarmBattery: 0,
  motionDetectorBattery: 0,
  doorSensorBattery: 0,
  livingCheckLights: 0,
  tvRemoteUnderTV: false,
  stripQueenBeds: 'Not Needed',
  stripKingBeds: 'Not Needed',
  shakeRugs: false,
  damagesYesNo: false,
  damagesDescription: '',
};

const ChecklistForm: React.FC<{ editId?: string }> = ({ editId }) => {
  const { cabin } = useParams<{ cabin: string }>();
  const cabinNum = parseInt(cabin || '1');
  const isCabin3 = cabinNum === 3;
  const today = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });

  const [formData, setFormData] = useState<FormDataType>({ ...initialFormData, date: today, cabinNumber: cabinNum });
  const [isPosted, setIsPosted] = useState(false);
  const [id, setId] = useState(editId);

  useEffect(() => {
    if (id) {
      axios.get(`/api/checklists/${id}`).then(res => {
        setFormData(res.data);
        setIsPosted(true);
      });
    } else {
      axios.get('/api/pending-summaries').then(res => {
        const pending = res.data.pendings.find((p: any) => p.cabinNumber === cabinNum);
        if (pending) {
          setId(pending._id);
          setFormData(pending);
          setIsPosted(true);
        } else {
          setFormData({ ...initialFormData, cabinNumber: cabinNum, date: today });
        }
      });
    }
  }, [id, cabinNum, today]);

  const debouncedPatch = debounce(async (updatedData: FormDataType) => {
    try {
      if (id) {
        await axios.put(`/api/checklists/${id}`, updatedData);
      } else {
        const res = await axios.post('/api/checklists', updatedData);
        setId(res.data._id);
        setIsPosted(true);
      }
    } catch (err) {
      toast.error('Error saving changes');
    }
  }, 1000);

  useEffect(() => {
    debouncedPatch(formData);
    return () => debouncedPatch.cancel();
  }, [formData, debouncedPatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleNumberChange = (name: keyof FormDataType, delta: number) => {
    setFormData(prev => {
      const current = prev[name] as number;
      const minMax = getMinMax(name);
      return { ...prev, [name]: Math.max(minMax.min, Math.min(minMax.max, current + delta)) };
    });
  };

  const handleNumberInput = (name: keyof FormDataType, value: string) => {
    const num = Number(value);
    if (isNaN(num)) return;
    const minMax = getMinMax(name);
    setFormData(prev => ({ ...prev, [name]: Math.max(minMax.min, Math.min(minMax.max, num)) }));
  };

  const getMinMax = (name: keyof FormDataType) => {
    switch (name) {
      case 'bathTowels':
      case 'washCloths':
      case 'waterBottles':
      case 'coffeeCupsCeramic':
      case 'coffeeCupsPaper':
      case 'coffeeCupLids': return { min: 0, max: 4 };
      case 'handTowels':
      case 'makeupCloths':
      case 'emptyRelineTrashCans':
      case 'toiletPaper': return { min: 0, max: 2 };
      case 'bathMat':
      case 'shampoo':
      case 'conditioner':
      case 'bodyWash':
      case 'bodyLotion':
      case 'barSoap':
      case 'soapDispenser':
      case 'kleenex':
      case 'paperTowels':
      case 'dishSoap':
      case 'doorSensorBattery': return { min: 0, max: 1 };
      case 'bathCheckLights':
      case 'livingCheckLights': return { min: 0, max: 5 };
      case 'coffeePods':
      case 'coffeeSweeteners':
      case 'coffeeCreamer':
      case 'coffeeStirrers': return { min: 0, max: 12 };
      case 'bathroomCups': return { min: 0, max: 7 };
      case 'lockBattery': return { min: 0, max: 4 };
      case 'smokeAlarmBattery':
      case 'motionDetectorBattery': return { min: 0, max: 2 };
      default: return { min: 0, max: 1 };
    }
  };

  const handleReset = async () => {
    if (id) {
      await axios.delete(`/api/checklists/${id}`);
      setId(undefined);
      setFormData({ ...initialFormData, cabinNumber: cabinNum, date: today });
      setIsPosted(false);
      toast.success('Reset successful');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white min-h-screen relative">
      {isPosted && (
        <button onClick={handleReset} className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded">
          {/* @ts-ignore */}
          <FaUndo />
        </button>
      )}
      {/* Form fields */}
      <label className="block">
        Date:
        <input name="date" value={formData.date} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
      </label>
      // Expand Bath and Kitchen with all fields as per specs, using handleChange, handleNumberChange, etc.
      // Example for Bath:
      <div className="flex items-center justify-between">
        <span>Bath Towels</span>
        <div className="flex items-center">
          <button type="button" onClick={() => handleNumberChange('bathTowels', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
          <input
            type="number"
            value={formData.bathTowels}
            onChange={(e) => handleNumberInput('bathTowels', e.target.value)}
            className="w-16 text-center border rounded mx-2"
            min={0}
            max={4}
          />
          <button type="button" onClick={() => handleNumberChange('bathTowels', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
        </div>
      </div>
      // Repeat for handTowels, washCloths, makeupCloths, bathMat, shampoo, conditioner, bodyWash, bodyLotion, barSoap, soapDispenser, toiletPaper, bathroomCups (Paper Cups), kleenex, bathCheckLights, gatherTowels
      // Kitchen similar: waterBottles, coffeePods, coffeeSweeteners, coffeeCreamer, coffeeCupsCeramic, coffeeCupsPaper, coffeeCupLids, coffeeStirrers, emptyRelineTrashCans (Reline Trash Cans), emptyCoffeeWater, emptyCoffeePod, paperTowels, dishSoap, emptyRefrigerator, emptyMicrowaveOven
      {/* Comments */}
      <section className="mb-8 bg-gray-50 p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Comments</h3>
        <div className="space-y-4">
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="damagesYesNo" checked={formData.damagesYesNo} onChange={handleChange} className="h-5 w-5" />
            <span>Comments?</span>
          </label>
          {formData.damagesYesNo && (
            <label className="block">
              Description:
              <textarea name="damagesDescription" value={formData.damagesDescription} onChange={handleChange} className="mt-1 block w-full border rounded p-2 h-24" />
            </label>
          )}
          <div className="h-16"></div>
        </div>
      </section>
    </div>
  );
};

export default ChecklistForm;