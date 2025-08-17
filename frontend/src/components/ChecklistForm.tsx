import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

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

const ChecklistForm: React.FC<{ editId?: string }> = ({ editId }) => {
  const { cabin } = useParams<{ cabin: string }>();
  const navigate = useNavigate();
  const cabinNum = parseInt(cabin || '1');
  const isCabin3 = cabinNum === 3;
  const today = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });

  const [formData, setFormData] = useState<FormDataType>({
    cabinNumber: cabinNum,
    date: today,
    guestName: '',
    clearDoorCodes: false,
    resetThermostats: false,
    cleanACFilter: '',
    checkUnderBedsSofa: false,
    checkShower: false,
    bathTowels: 4,
    handTowels: 2,
    washCloths: 4,
    makeupCloths: 2,
    bathMat: 1,
    shampoo: 0,
    conditioner: 1,
    bodyWash: 1,
    bodyLotion: 0,
    barSoap: 0,
    soapDispenser: 0,
    toiletPaper: 1,
    bathroomCups: 0,
    kleenex: 0,
    bathCheckLights: 0,
    gatherTowels: false,
    waterBottles: 4,
    coffeePods: 0,
    coffeeSweeteners: 0,
    coffeeCreamer: 0,
    coffeeCupsCeramic: 0,
    coffeeCupsPaper: 0,
    coffeeCupLids: 0,
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
    stripQueenBeds: '',
    stripKingBeds: '',
    shakeRugs: false,
    damagesYesNo: false,
    damagesDescription: '',
  });

  useEffect(() => {
    if (editId) {
      axios.get(`/api/checklists/${editId}`).then(res => setFormData(res.data));
    }
  }, [editId]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.damagesYesNo && !formData.damagesDescription) {
      toast.error('Damages description required');
      return;
    }
    try {
      let res;
      if (editId) {
        res = await axios.put(`/api/checklists/${editId}`, formData);
      } else {
        res = await axios.post('/api/checklists', formData);
      }
      navigate(`/summary/${res.data._id}`);
    } catch (err) {
      toast.error('Error saving');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-md mx-auto bg-white min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-center">Checklist for Cabin {cabin}</h2>
      
      {/* Untitled first section (Everywhere + moved Living Room fields) */}
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
          <div className="flex items-center space-x-2">
            <span>Lock Battery: {formData.lockBattery}</span>
            <button type="button" onClick={() => handleNumberChange('lockBattery', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
            <button type="button" onClick={() => handleNumberChange('lockBattery', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
          </div>
          <div className="flex items-center space-x-2">
            <span>Smoke Alarm Battery: {formData.smokeAlarmBattery}</span>
            <button type="button" onClick={() => handleNumberChange('smokeAlarmBattery', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
            <button type="button" onClick={() => handleNumberChange('smokeAlarmBattery', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
          </div>
          <div className="flex items-center space-x-2">
            <span>Motion Detector Battery: {formData.motionDetectorBattery}</span>
            <button type="button" onClick={() => handleNumberChange('motionDetectorBattery', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
            <button type="button" onClick={() => handleNumberChange('motionDetectorBattery', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
          </div>
          <div className="flex items-center space-x-2">
            <span>Door Sensor Battery: {formData.doorSensorBattery}</span>
            <button type="button" onClick={() => handleNumberChange('doorSensorBattery', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
            <button type="button" onClick={() => handleNumberChange('doorSensorBattery', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
          </div>
          <div className="flex items-center space-x-2">
            <span>Check Lights: {formData.livingCheckLights}</span>
            <button type="button" onClick={() => handleNumberChange('livingCheckLights', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
            <button type="button" onClick={() => handleNumberChange('livingCheckLights', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
          </div>
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="tvRemoteUnderTV" checked={formData.tvRemoteUnderTV} onChange={handleChange} className="h-5 w-5" />
            <span>TV Remote under TV</span>
          </label>
          <label className="block">
            Clean AC Filter:
            <select name="cleanACFilter" value={formData.cleanACFilter} onChange={handleChange} className="mt-1 block w-full border rounded p-2">
              <option value=""></option>
              <option value="Checked, Not Needed">Checked, Not Needed</option>
              <option value="Done">Done</option>
            </select>
          </label>
        </div>
      </section>

      {/* Bath */}
      <section className="mb-8 bg-gray-50 p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Bath</h3>
        <div className="space-y-4">
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="checkShower" checked={formData.checkShower} onChange={handleChange} className="h-5 w-5" />
            <span>Check Shower</span>
          </label>
          <div className="flex items-center space-x-2">
            <span>Bath Towels: {formData.bathTowels}</span>
            <button type="button" onClick={() => handleNumberChange('bathTowels', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
            <button type="button" onClick={() => handleNumberChange('bathTowels', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
          </div>
          <div className="flex items-center space-x-2">
            <span>Hand Towels: {formData.handTowels}</span>
            <button type="button" onClick={() => handleNumberChange('handTowels', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
            <button type="button" onClick={() => handleNumberChange('handTowels', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
          </div>
          <div className="flex items-center space-x-2">
            <span>Wash Cloths: {formData.washCloths}</span>
            <button type="button" onClick={() => handleNumberChange('washCloths', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
            <button type="button" onClick={() => handleNumberChange('washCloths', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
          </div>
          <div className="flex items-center space-x-2">
            <span>Makeup Cloths: {formData.makeupCloths}</span>
            <button type="button" onClick={() => handleNumberChange('makeupCloths', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
            <button type="button" onClick={() => handleNumberChange('makeupCloths', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
          </div>
          <div className="flex items-center space-x-2">
            <span>Bath Mat: {formData.bathMat}</span>
            <button type="button" onClick={() => handleNumberChange('bathMat', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
            <button type="button" onClick={() => handleNumberChange('bathMat', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
          </div>
          <div className="flex items-center space-x-2">
            <span>Shampoo: {formData.shampoo}</span>
            <button type="button" onClick={() => handleNumberChange('shampoo', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
            <button type="button" onClick={() => handleNumberChange('shampoo', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
          </div>
          <div className="flex items-center space-x-2">
            <span>Conditioner: {formData.conditioner}</span>
            <button type="button" onClick={() => handleNumberChange('conditioner', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
            <button type="button" onClick={() => handleNumberChange('conditioner', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
          </div>
          <div className="flex items-center space-x-2">
            <span>Body Wash: {formData.bodyWash}</span>
            <button type="button" onClick={() => handleNumberChange('bodyWash', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
            <button type="button" onClick={() => handleNumberChange('bodyWash', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
          </div>
          <div className="flex items-center space-x-2">
            <span>Body Lotion: {formData.bodyLotion}</span>
            <button type="button" onClick={() => handleNumberChange('bodyLotion', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
            <button type="button" onClick={() => handleNumberChange('bodyLotion', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
          </div>
          <div className="flex items-center space-x-2">
            <span>Bar Soap: {formData.barSoap}</span>
            <button type="button" onClick={() => handleNumberChange('barSoap', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
            <button type="button" onClick={() => handleNumberChange('barSoap', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
          </div>
          <div className="flex items-center space-x-2">
            <span>Soap Dispenser: {formData.soapDispenser}</span>
            <button type="button" onClick={() => handleNumberChange('soapDispenser', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
            <button type="button" onClick={() => handleNumberChange('soapDispenser', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
          </div>
          <div className="flex items-center space-x-2">
            <span>Toilet Paper: {formData.toiletPaper}</span>
            <button type="button" onClick={() => handleNumberChange('toiletPaper', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
            <button type="button" onClick={() => handleNumberChange('toiletPaper', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
          </div>
          <div className="flex items-center space-x-2">
            <span>Cups for bathroom sink: {formData.bathroomCups}</span>
            <button type="button" onClick={() => handleNumberChange('bathroomCups', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
            <button type="button" onClick={() => handleNumberChange('bathroomCups', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
          </div>
          <div className="flex items-center space-x-2">
            <span>Kleenex: {formData.kleenex}</span>
            <button type="button" onClick={() => handleNumberChange('kleenex', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
            <button type="button" onClick={() => handleNumberChange('kleenex', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
          </div>
          <div className="flex items-center space-x-2">
            <span>Check Lights: {formData.bathCheckLights}</span>
            <button type="button" onClick={() => handleNumberChange('bathCheckLights', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
            <button type="button" onClick={() => handleNumberChange('bathCheckLights', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
          </div>
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="gatherTowels" checked={formData.gatherTowels} onChange={handleChange} className="h-5 w-5" />
            <span>Gather Towels</span>
          </label>
        </div>
      </section>

      {/* Bedroom */}
      <section className="mb-8 bg-gray-50 p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Bedroom</h3>
        <div className="space-y-4">
          <label className="block">
            Strip Queen Beds:
            <select name="stripQueenBeds" value={formData.stripQueenBeds} onChange={handleChange} className="mt-1 block w-full border rounded p-2">
              <option value=""></option>
              <option value="Not Needed">Not Needed</option>
              <option value="Bundled">Bundled</option>
              <option value="OK">OK</option>
            </select>
          </label>
          <label className="block">
            Strip King Beds:
            <select name="stripKingBeds" value={formData.stripKingBeds} onChange={handleChange} className="mt-1 block w-full border rounded p-2">
              <option value=""></option>
              <option value="Not Needed">Not Needed</option>
              <option value="Bundled">Bundled</option>
              <option value="OK">OK</option>
            </select>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="checkUnderBedsSofa" checked={formData.checkUnderBedsSofa} onChange={handleChange} className="h-5 w-5" />
            <span>Check under beds/sofa</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="shakeRugs" checked={formData.shakeRugs} onChange={handleChange} className="h-5 w-5" />
            <span>Shake Rugs</span>
          </label>
        </div>
      </section>

      {/* Kitchen */}
      <section className="mb-8 bg-gray-50 p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Kitchen</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <span>Water Bottles: {formData.waterBottles}</span>
            <button type="button" onClick={() => handleNumberChange('waterBottles', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
            <button type="button" onClick={() => handleNumberChange('waterBottles', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
          </div>
          <div className="flex items-center space-x-2">
            <span>Coffee Pods: {formData.coffeePods}</span>
            <button type="button" onClick={() => handleNumberChange('coffeePods', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
            <button type="button" onClick={() => handleNumberChange('coffeePods', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
          </div>
          <div className="flex items-center space-x-2">
            <span>Coffee Sweeteners: {formData.coffeeSweeteners}</span>
            <button type="button" onClick={() => handleNumberChange('coffeeSweeteners', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
            <button type="button" onClick={() => handleNumberChange('coffeeSweeteners', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
          </div>
          <div className="flex items-center space-x-2">
            <span>Coffee Creamer: {formData.coffeeCreamer}</span>
            <button type="button" onClick={() => handleNumberChange('coffeeCreamer', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
            <button type="button" onClick={() => handleNumberChange('coffeeCreamer', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
          </div>
          <div className="flex items-center space-x-2">
            <span>Coffee Cups, Ceramic: {formData.coffeeCupsCeramic}</span>
            <button type="button" onClick={() => handleNumberChange('coffeeCupsCeramic', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
            <button type="button" onClick={() => handleNumberChange('coffeeCupsCeramic', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
          </div>
          <div className="flex items-center space-x-2">
            <span>Coffee Cups, Paper: {formData.coffeeCupsPaper}</span>
            <button type="button" onClick={() => handleNumberChange('coffeeCupsPaper', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
            <button type="button" onClick={() => handleNumberChange('coffeeCupsPaper', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
          </div>
          <div className="flex items-center space-x-2">
            <span>Coffee Cup Lids: {formData.coffeeCupLids}</span>
            <button type="button" onClick={() => handleNumberChange('coffeeCupLids', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
            <button type="button" onClick={() => handleNumberChange('coffeeCupLids', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
          </div>
          <div className="flex items-center space-x-2">
            <span>Coffee Stirrers: {formData.coffeeStirrers}</span>
            <button type="button" onClick={() => handleNumberChange('coffeeStirrers', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
            <button type="button" onClick={() => handleNumberChange('coffeeStirrers', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
          </div>
          <div className="flex items-center space-x-2">
            <span>Empty/Reline Trash Cans: {formData.emptyRelineTrashCans}</span>
            <button type="button" onClick={() => handleNumberChange('emptyRelineTrashCans', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
            <button type="button" onClick={() => handleNumberChange('emptyRelineTrashCans', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
          </div>
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="emptyCoffeeWater" checked={formData.emptyCoffeeWater} onChange={handleChange} className="h-5 w-5" />
            <span>Empty Coffee Water</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="emptyCoffeePod" checked={formData.emptyCoffeePod} onChange={handleChange} className="h-5 w-5" />
            <span>Empty Coffee Pod</span>
          </label>
          {isCabin3 && (
            <>
              <div className="flex items-center space-x-2">
                <span>Paper Towels: {formData.paperTowels}</span>
                <button type="button" onClick={() => handleNumberChange('paperTowels', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
                <button type="button" onClick={() => handleNumberChange('paperTowels', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
              </div>
              <div className="flex items-center space-x-2">
                <span>Dish Soap: {formData.dishSoap}</span>
                <button type="button" onClick={() => handleNumberChange('dishSoap', -1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
                <button type="button" onClick={() => handleNumberChange('dishSoap', 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
              </div>
            </>
          )}
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="emptyRefrigerator" checked={formData.emptyRefrigerator} onChange={handleChange} className="h-5 w-5" />
            <span>Empty Refrigerator</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="emptyMicrowaveOven" checked={formData.emptyMicrowaveOven} onChange={handleChange} className="h-5 w-5" />
            <span>Empty Microwave and Oven</span>
          </label>
        </div>
      </section>

      {/* Damages */}
      <section className="mb-8 bg-gray-50 p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Damages</h3>
        <div className="space-y-4">
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="damagesYesNo" checked={formData.damagesYesNo} onChange={handleChange} className="h-5 w-5" />
            <span>Damages to report?</span>
          </label>
          {formData.damagesYesNo && (
            <label className="block">
              Description:
              <textarea name="damagesDescription" value={formData.damagesDescription} onChange={handleChange} className="mt-1 block w-full border rounded p-2 h-24" />
            </label>
          )}
        </div>
      </section>

      <button type="submit" className="fixed bottom-0 left-0 w-full bg-blue-500 text-white py-4 text-lg font-semibold">Submit and View Summary</button>
    </form>
  );
};

export default ChecklistForm;