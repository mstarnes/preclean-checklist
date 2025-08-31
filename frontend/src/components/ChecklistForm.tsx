// frontend/src/components/ChecklistForm.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaUndo, FaCheck } from 'react-icons/fa';
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
  stripFullBeds: string;
  stripQueenBeds: string;
  stripKingBeds: string;
  shakeRugs: boolean;
  damagesYesNo: boolean;
  damagesDescription: string;
  completed: boolean; // Assuming this field exists or add it to schema
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
  soapDispenser: 1,
  toiletPaper: 2,
  bathroomCups: 7,
  kleenex: 1,
  bathCheckLights: 0,
  gatherTowels: false,
  waterBottles: 4,
  coffeePods: 12,
  coffeeSweeteners: 12,
  coffeeCreamer: 12,
  coffeeCupsCeramic: 4,
  coffeeCupsPaper: 4,
  coffeeCupLids: 4,
  coffeeStirrers: 12,
  emptyRelineTrashCans: 2,
  emptyCoffeeWater: false,
  emptyCoffeePod: false,
  paperTowels: 0,
  dishSoap: 0,
  emptyRefrigerator: false,
  emptyMicrowaveOven: false,
  lockBattery: 4,
  smokeAlarmBattery: 2,
  motionDetectorBattery: 2,
  doorSensorBattery: 2,
  livingCheckLights: 0,
  tvRemoteUnderTV: false,
  stripFullBeds: 'Not Needed',
  stripQueenBeds: 'Not Needed',
  stripKingBeds: 'Not Needed',
  shakeRugs: false,
  damagesYesNo: false,
  damagesDescription: '',
  completed: false,
};

const ChecklistForm: React.FC = () => {
  const { cabin } = useParams<{ cabin: string }>();
  const [searchParams] = useSearchParams();
  const edit = searchParams.get('edit');
  const cabinNum = parseInt(cabin || '1');
  const isCabin3 = cabinNum === 3;
  const isNotCabin3 = cabinNum !== 3;
  const today = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });

  const [formData, setFormData] = useState<FormDataType>({ ...initialFormData, date: today, cabinNumber: cabinNum });
  const [isPosted, setIsPosted] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [id, setId] = useState(edit || undefined);

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
      if (isResetting) return;
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
      setIsResetting(true);
      setId(undefined);
      setFormData({ ...initialFormData, cabinNumber: cabinNum, date: today });
      setIsPosted(false);
      toast.success('Reset successful');
      setIsResetting(false);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handleCompleteToggle = () => {
    const newCompleted = !formData.completed;
    setFormData(prev => ({ ...prev, completed: newCompleted }));
    toast.success(newCompleted ? 'Marked as completed!' : 'Reopened for edits');
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white min-h-screen relative">
      {isPosted && (
        <>
          <button onClick={handleReset} disabled={formData.completed || isResetting} className="absolute top-4 right-12 bg-red-500 text-white p-2 rounded disabled:opacity-50">
            {FaUndo({})}
          </button>
          <button onClick={handleCompleteToggle} className="absolute top-4 right-4 bg-green-500 text-white p-2 rounded">
            {FaCheck({ className: formData.completed ? 'text-yellow-300' : '' })}
          </button>
        </>
      )}

      {/* Untitled first section */}
      <section className="mb-8 bg-gray-50 p-4 rounded-lg shadow">
        <div className="space-y-4">
          <label className="block">
            Date:
            <input name="date" value={formData.date} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
          </label>
          <label className="block">
            Guest Name:
            <input name="guestName" value={formData.guestName} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="clearDoorCodes" checked={formData.clearDoorCodes} onChange={handleChange} className="h-5 w-5" />
            <span>Clear Door Codes</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="resetThermostats" checked={formData.resetThermostats} onChange={handleChange} className="h-5 w-5" />
            <span>Reset Thermostats</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="tvRemoteUnderTV" checked={formData.tvRemoteUnderTV} onChange={handleChange} className="h-5 w-5" />
            <span>TV Remote under TV</span>
          </label>
          <div className="flex items-center justify-between">
            <span>Check Lightbulbs</span>
            <div className="flex items-center">
              <button type="button" onClick={() => handleNumberChange('bathCheckLights', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
              <input
                type="number"
                value={formData.bathCheckLights}
                onChange={(e) => handleNumberInput('bathCheckLights', e.target.value)}
                onFocus={handleFocus}
                className="w-16 text-center border rounded mx-2"
                min={0}
                max={5}
              />
              <button type="button" onClick={() => handleNumberChange('bathCheckLights', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
            </div>
          </div>
          <label className="block">
            Clean AC Filter:
            <select name="cleanACFilter" value={formData.cleanACFilter} onChange={handleChange} className="mt-1 block w-full border rounded p-2">
              <option value="Checked, Not Needed">Checked, Not Needed</option>
              <option value="Done">Done</option>
            </select>
          </label>
        </div>
      </section>
      <section className="mb-8 bg-gray-50 p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Batteries</h3>
          <div className="flex items-center justify-between">
            <span>Lock (AA)</span>
            <div className="flex items-center">
              <button type="button" onClick={() => handleNumberChange('lockBattery', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
              <input
                type="number"
                value={formData.lockBattery}
                onChange={(e) => handleNumberInput('lockBattery', e.target.value)}
                onFocus={handleFocus}
                className="w-16 text-center border rounded mx-2"
                min={0}
                max={4}
              />
              <button type="button" onClick={() => handleNumberChange('lockBattery', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span>Smoke Alarm (AA)</span>
            <div className="flex items-center">
              <button type="button" onClick={() => handleNumberChange('smokeAlarmBattery', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
              <input
                type="number"
                value={formData.smokeAlarmBattery}
                onChange={(e) => handleNumberInput('smokeAlarmBattery', e.target.value)}
                onFocus={handleFocus}
                className="w-16 text-center border rounded mx-2"
                min={0}
                max={2}
              />
              <button type="button" onClick={() => handleNumberChange('smokeAlarmBattery', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span>Motion Detector (AA)</span>
            <div className="flex items-center">
              <button type="button" onClick={() => handleNumberChange('motionDetectorBattery', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
              <input
                type="number"
                value={formData.motionDetectorBattery}
                onChange={(e) => handleNumberInput('motionDetectorBattery', e.target.value)}
                onFocus={handleFocus}
                className="w-16 text-center border rounded mx-2"
                min={0}
                max={2}
              />
              <button type="button" onClick={() => handleNumberChange('motionDetectorBattery', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span>Door Sensor (CR2032)</span>
            <div className="flex items-center">
              <button type="button" onClick={() => handleNumberChange('doorSensorBattery', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
              <input
                type="number"
                value={formData.doorSensorBattery}
                onChange={(e) => handleNumberInput('doorSensorBattery', e.target.value)}
                onFocus={handleFocus}
                className="w-16 text-center border rounded mx-2"
                min={0}
                max={2}
              />
              <button type="button" onClick={() => handleNumberChange('doorSensorBattery', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
            </div>
          </div>
      </section>
      <section className="mb-8 bg-gray-50 p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Bath</h3>
      <div className="flex items-center justify-between">
        <span>Bath Towels</span>
        <div className="flex items-center">
          <button type="button" onClick={() => handleNumberChange('bathTowels', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
          <input
            type="number"
            value={formData.bathTowels}
            onChange={(e) => handleNumberInput('bathTowels', e.target.value)}
            onFocus={handleFocus}
            className="w-16 text-center border rounded mx-2"
            min={0}
            max={4}
          />
          <button type="button" onClick={() => handleNumberChange('bathTowels', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span>Hand Towels</span>
        <div className="flex items-center">
          <button type="button" onClick={() => handleNumberChange('handTowels', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
          <input
            type="number"
            value={formData.handTowels}
            onChange={(e) => handleNumberInput('handTowels', e.target.value)}
            onFocus={handleFocus}
            className="w-16 text-center border rounded mx-2"
            min={0}
            max={2}
          />
          <button type="button" onClick={() => handleNumberChange('handTowels', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span>Wash Cloths</span>
        <div className="flex items-center">
          <button type="button" onClick={() => handleNumberChange('washCloths', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
            <input
              type="number"
              value={formData.washCloths}
              onChange={(e) => handleNumberInput('washCloths', e.target.value)}
              onFocus={handleFocus}
              className="w-16 text-center border rounded mx-2"
              min={0}
              max={4}
            />
          <button type="button" onClick={() => handleNumberChange('washCloths', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span>Makeup Cloths</span>
        <div className="flex items-center">
          <button type="button" onClick={() => handleNumberChange('makeupCloths', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
          <input
            type="number"
            value={formData.makeupCloths}
            onChange={(e) => handleNumberInput('makeupCloths', e.target.value)}
            onFocus={handleFocus}
            className="w-16 text-center border rounded mx-2"
            min={0}
            max={2}
          />
          <button type="button" onClick={() => handleNumberChange('makeupCloths', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span>Bath Mat</span>
        <div className="flex items-center">
          <button type="button" onClick={() => handleNumberChange('bathMat', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
          <input
            type="number"
            value={formData.bathMat}
            onChange={(e) => handleNumberInput('bathMat', e.target.value)}
            onFocus={handleFocus}
            className="w-16 text-center border rounded mx-2"
            min={0}
            max={1}
          />
          <button type="button" onClick={() => handleNumberChange('bathMat', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span>Shampoo</span>
        <div className="flex items-center">
          <button type="button" onClick={() => handleNumberChange('shampoo', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
          <input
            type="number"
            value={formData.shampoo}
            onChange={(e) => handleNumberInput('shampoo', e.target.value)}
            onFocus={handleFocus}
            className="w-16 text-center border rounded mx-2"
            min={0}
            max={1}
          />
          <button type="button" onClick={() => handleNumberChange('shampoo', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span>Conditioner</span>
        <div className="flex items-center">
          <button type="button" onClick={() => handleNumberChange('conditioner', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
          <input
            type="number"
            value={formData.conditioner}
            onChange={(e) => handleNumberInput('conditioner', e.target.value)}
            onFocus={handleFocus}
            className="w-16 text-center border rounded mx-2"
            min={0}
            max={1}
          />
          <button type="button" onClick={() => handleNumberChange('conditioner', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span>Body Wash</span>
        <div className="flex items-center">
          <button type="button" onClick={() => handleNumberChange('bodyWash', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
          <input
            type="number"
            value={formData.bodyWash}
            onChange={(e) => handleNumberInput('bodyWash', e.target.value)}
            onFocus={handleFocus}
            className="w-16 text-center border rounded mx-2"
            min={0}
            max={1}
          />
          <button type="button" onClick={() => handleNumberChange('bodyWash', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span>Body Lotion</span>
        <div className="flex items-center">
          <button type="button" onClick={() => handleNumberChange('bodyLotion', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
          <input
            type="number"
            value={formData.bodyLotion}
            onChange={(e) => handleNumberInput('bodyLotion', e.target.value)}
            onFocus={handleFocus}
            className="w-16 text-center border rounded mx-2"
            min={0}
            max={1}
          />
          <button type="button" onClick={() => handleNumberChange('bodyLotion', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span>Bar Soap</span>
        <div className="flex items-center">
          <button type="button" onClick={() => handleNumberChange('barSoap', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
          <input
            type="number"
            value={formData.barSoap}
            onChange={(e) => handleNumberInput('barSoap', e.target.value)}
            onFocus={handleFocus}
            className="w-16 text-center border rounded mx-2"
            min={0}
            max={1}
          />
          <button type="button" onClick={() => handleNumberChange('barSoap', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span>Soap Dispenser</span>
        <div className="flex items-center">
          <button type="button" onClick={() => handleNumberChange('soapDispenser', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
          <input
            type="number"
            value={formData.soapDispenser}
            onChange={(e) => handleNumberInput('soapDispenser', e.target.value)}
            onFocus={handleFocus}
            className="w-16 text-center border rounded mx-2"
            min={0}
            max={1}
          />
          <button type="button" onClick={() => handleNumberChange('soapDispenser', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span>Toilet Paper</span>
        <div className="flex items-center">
          <button type="button" onClick={() => handleNumberChange('toiletPaper', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
          <input
            type="number"
            value={formData.toiletPaper}
            onChange={(e) => handleNumberInput('toiletPaper', e.target.value)}
            onFocus={handleFocus}
            className="w-16 text-center border rounded mx-2"
            min={0}
            max={2}
          />
          <button type="button" onClick={() => handleNumberChange('toiletPaper', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span>Paper Cups</span>
        <div className="flex items-center">
          <button type="button" onClick={() => handleNumberChange('bathroomCups', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
          <input
            type="number"
            value={formData.bathroomCups}
            onChange={(e) => handleNumberInput('bathroomCups', e.target.value)}
            onFocus={handleFocus}
            className="w-16 text-center border rounded mx-2"
            min={0}
            max={7}
          />
          <button type="button" onClick={() => handleNumberChange('bathroomCups', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span>Kleenex</span>
        <div className="flex items-center">
          <button type="button" onClick={() => handleNumberChange('kleenex', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
          <input
            type="number"
            value={formData.kleenex}
            onChange={(e) => handleNumberInput('kleenex', e.target.value)}
            onFocus={handleFocus}
            className="w-16 text-center border rounded mx-2"
            min={0}
            max={1}
          />
          <button type="button" onClick={() => handleNumberChange('kleenex', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
        </div>
      </div>
      <label className="flex items-center space-x-2">
        <input type="checkbox" name="checkShower" checked={formData.checkShower} onChange={handleChange} className="h-5 w-5" />
        <span>Check Shower</span>
      </label>
      <label className="flex items-center space-x-2">
        <input type="checkbox" name="gatherTowels" checked={formData.gatherTowels} onChange={handleChange} className="h-5 w-5" />
        <span>Gather Towels</span>
      </label>
      </section>
      {/* Bedroom */}
      <section className="mb-8 bg-gray-50 p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Bedroom</h3>
        <div className="space-y-4">
          <label className="block">
            Strip Queen Bed:
            <select name="stripQueenBeds" value={formData.stripQueenBeds} onChange={handleChange} className="mt-1 block w-full border rounded p-2">

              <option value="Not Needed">Not Needed</option>
              <option value="Bundled">Bundled</option>
              <option value="OK">OK</option>
            </select>
          </label>
      {isCabin3 && (
        <>
          <label className="block">
            Strip Full Bed:
            <select name="stripFullBeds" value={formData.stripFullBeds} onChange={handleChange} className="mt-1 block w-full border rounded p-2">

              <option value="Not Needed">Not Needed</option>
              <option value="Bundled">Bundled</option>
              <option value="OK">OK</option>
            </select>
          </label>
        </>
      )}
      {isNotCabin3 && (
        <>
          <label className="block">
            Strip King Bed:
            <select name="stripKingBeds" value={formData.stripKingBeds} onChange={handleChange} className="mt-1 block w-full border rounded p-2">

              <option value="Not Needed">Not Needed</option>
              <option value="Bundled">Bundled</option>
              <option value="OK">OK</option>
            </select>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="checkUnderBedsSofa" checked={formData.checkUnderBedsSofa} onChange={handleChange} className="h-5 w-5" />
            <span>Check under furniture</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="shakeRugs" checked={formData.shakeRugs} onChange={handleChange} className="h-5 w-5" />
            <span>Shake rugs outside</span>
          </label>
        </>
      )}
        </div>
      </section>
      <section className="mb-8 bg-gray-50 p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Kitchen</h3>

      <div className="flex items-center justify-between">
        <span>Water Bottles</span>
        <div className="flex items-center">
          <button type="button" onClick={() => handleNumberChange('waterBottles', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
          <input
            type="number"
            value={formData.waterBottles}
            onChange={(e) => handleNumberInput('waterBottles', e.target.value)}
            onFocus={handleFocus}
            className="w-16 text-center border rounded mx-2"
            min={0}
            max={4}
          />
          <button type="button" onClick={() => handleNumberChange('waterBottles', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span>Coffee Pods</span>
        <div className="flex items-center">
          <button type="button" onClick={() => handleNumberChange('coffeePods', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
          <input
            type="number"
            value={formData.coffeePods}
            onChange={(e) => handleNumberInput('coffeePods', e.target.value)}
            onFocus={handleFocus}
            className="w-16 text-center border rounded mx-2"
            min={0}
            max={12}
          />
          <button type="button" onClick={() => handleNumberChange('coffeePods', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span>Coffee Sweeteners</span>
        <div className="flex items-center">
          <button type="button" onClick={() => handleNumberChange('coffeeSweeteners', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
          <input
            type="number"
            value={formData.coffeeSweeteners}
            onChange={(e) => handleNumberInput('coffeeSweeteners', e.target.value)}
            onFocus={handleFocus}
            className="w-16 text-center border rounded mx-2"
            min={0}
            max={12}
          />
          <button type="button" onClick={() => handleNumberChange('coffeeSweeteners', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span>Coffee Creamer</span>
        <div className="flex items-center">
          <button type="button" onClick={() => handleNumberChange('coffeeCreamer', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
          <input
            type="number"
            value={formData.coffeeCreamer}
            onChange={(e) => handleNumberInput('coffeeCreamer', e.target.value)}
            onFocus={handleFocus}
            className="w-16 text-center border rounded mx-2"
            min={0}
            max={12}
          />
          <button type="button" onClick={() => handleNumberChange('coffeeCreamer', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span>Coffee Cups, Ceramic</span>
        <div className="flex items-center">
          <button type="button" onClick={() => handleNumberChange('coffeeCupsCeramic', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
          <input
            type="number"
            value={formData.coffeeCupsCeramic}
            onChange={(e) => handleNumberInput('coffeeCupsCeramic', e.target.value)}
            onFocus={handleFocus}
            className="w-16 text-center border rounded mx-2"
            min={0}
            max={4}
          />
          <button type="button" onClick={() => handleNumberChange('coffeeCupsCeramic', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span>Coffee Cups, Paper</span>
        <div className="flex items-center">
          <button type="button" onClick={() => handleNumberChange('coffeeCupsPaper', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
          <input
            type="number"
            value={formData.coffeeCupsPaper}
            onChange={(e) => handleNumberInput('coffeeCupsPaper', e.target.value)}
            onFocus={handleFocus}
            className="w-16 text-center border rounded mx-2"
            min={0}
            max={4}
          />
          <button type="button" onClick={() => handleNumberChange('coffeeCupsPaper', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span>Coffee Cup Lids</span>
        <div className="flex items-center">
          <button type="button" onClick={() => handleNumberChange('coffeeCupLids', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
          <input
            type="number"
            value={formData.coffeeCupLids}
            onChange={(e) => handleNumberInput('coffeeCupLids', e.target.value)}
            onFocus={handleFocus}
            className="w-16 text-center border rounded mx-2"
            min={0}
            max={4}
          />
          <button type="button" onClick={() => handleNumberChange('coffeeCupLids', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span>Coffee Stirrers</span>
        <div className="flex items-center">
          <button type="button" onClick={() => handleNumberChange('coffeeStirrers', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
          <input
            type="number"
            value={formData.coffeeStirrers}
            onChange={(e) => handleNumberInput('coffeeStirrers', e.target.value)}
            onFocus={handleFocus}
            className="w-16 text-center border rounded mx-2"
            min={0}
            max={12}
          />
          <button type="button" onClick={() => handleNumberChange('coffeeStirrers', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span>Reline Trash Cans</span>
        <div className="flex items-center">
          <button type="button" onClick={() => handleNumberChange('emptyRelineTrashCans', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
          <input
            type="number"
            value={formData.emptyRelineTrashCans}
            onChange={(e) => handleNumberInput('emptyRelineTrashCans', e.target.value)}
            onFocus={handleFocus}
            className="w-16 text-center border rounded mx-2"
            min={0}
            max={2}
          />
          <button type="button" onClick={() => handleNumberChange('emptyRelineTrashCans', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
        </div>
      </div>
      {isCabin3 && (
        <>
          <div className="flex items-center justify-between">
            <span>Paper Towels</span>
            <div className="flex items-center">
              <button type="button" onClick={() => handleNumberChange('paperTowels', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
              <input
                type="number"
                value={formData.paperTowels}
                onChange={(e) => handleNumberInput('paperTowels', e.target.value)}
                onFocus={handleFocus}
                className="w-16 text-center border rounded mx-2"
                min={0}
                max={1}
              />
              <button type="button" onClick={() => handleNumberChange('paperTowels', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span>Dish Soap</span>
            <div className="flex items-center">
              <button type="button" onClick={() => handleNumberChange('dishSoap', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
              <input
                type="number"
                value={formData.dishSoap}
                onChange={(e) => handleNumberInput('dishSoap', e.target.value)}
                onFocus={handleFocus}
                className="w-16 text-center border rounded mx-2"
                min={0}
                max={1}
              />
              <button type="button" onClick={() => handleNumberChange('dishSoap', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
            </div>
          </div>
        </>
      )}
      <label className="flex items-center space-x-2">
        <input type="checkbox" name="emptyCoffeeWater" checked={formData.emptyCoffeeWater} onChange={handleChange} className="h-5 w-5" />
        <span>Empty Coffee Water</span>
      </label>
      <label className="flex items-center space-x-2">
        <input type="checkbox" name="emptyCoffeePod" checked={formData.emptyCoffeePod} onChange={handleChange} className="h-5 w-5" />
        <span>Empty Coffee Pod</span>
      </label>
      <label className="flex items-center space-x-2">
        <input type="checkbox" name="emptyRefrigerator" checked={formData.emptyRefrigerator} onChange={handleChange} className="h-5 w-5" />
        <span>Empty Refrigerator</span>
      </label>
      <label className="flex items-center space-x-2">
        <input type="checkbox" name="emptyMicrowaveOven" checked={formData.emptyMicrowaveOven} onChange={handleChange} className="h-5 w-5" />
        <span>Empty Microwave and Oven</span>
      </label>
      </section>
      {/* Comments */}
      <section className="mb-8 bg-gray-50 p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Comments</h3>
        <div className="space-y-4">
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="damagesYesNo" checked={formData.damagesYesNo} onChange={handleChange} className="h-5 w-5" />
            <span>Comments? Damages? Maintenance Issues?</span>
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