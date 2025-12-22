// frontend/src/components/ChecklistForm.tsx
import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaUndo, FaCheck, FaLock } from "react-icons/fa";
import debounce from "lodash/debounce";
import Slider from '@mui/material/Slider';
import type { SyntheticEvent } from "react";  // Optional, for clarity

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
  pen: number;
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
  completed: boolean;
}

const initialFormData: FormDataType = {
  cabinNumber: 1,
  date: new Date().toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
  }),
  guestName: "",
  clearDoorCodes: false,
  resetThermostats: false,
  cleanACFilter: "Checked, Not Needed",
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
  pen: 1,
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
  stripFullBeds: "Not Needed",
  stripQueenBeds: "Not Needed",
  stripKingBeds: "Not Needed",
  shakeRugs: false,
  damagesYesNo: false,
  damagesDescription: "",
  completed: false,
};

const ChecklistForm: React.FC = () => {
  const { cabin } = useParams<{ cabin: string }>();
  const [searchParams] = useSearchParams();
  const edit = searchParams.get("edit");
  const cabinNum = parseInt(cabin || "1");
  const isCabin3 = cabinNum === 3;
  const isNotCabin3 = cabinNum !== 3;
  const today = new Date().toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
  });

  const [formData, setFormData] = useState<FormDataType>({
    ...initialFormData,
    date: today,
    cabinNumber: cabinNum,
  });
  const [isPosted, setIsPosted] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [id, setId] = useState(edit || undefined);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const addDebugLog = (message: string) => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3, // milliseconds
    });
    setDebugLogs(prev => [`${timestamp}: ${message}`, ...prev]);
  };

  /*
  useEffect(() => {
    const preventScroll = (e: TouchEvent) => {
      e.preventDefault();
    };

    const sliderThumbs = document.querySelectorAll('.slider-thumb'); // add class "slider-thumb" to your slider wrapper div
    sliderContainers.forEach(container => {
      (container as HTMLElement).addEventListener('touchmove', preventScroll, { passive: false});
      (container as HTMLElement).addEventListener('touchstart', preventScroll, { passive: false});
    });

    return () => {
      sliderContainers.forEach(container => {
        (container as HTMLElement).removeEventListener('touchmove', preventScroll);
        (container as HTMLElement).removeEventListener('touchstart', preventScroll);
      });
    };

  }, []);
  */

  useEffect(() => {
    if (id) {
      axios.get(`/api/checklists/${id}`).then((res) => {
        setFormData(res.data);
        setIsPosted(true);
      });
    } else {
      axios.get("/api/pending-summaries").then((res) => {
        const pending = res.data.pendings.find(
          (p: any) => p.cabinNumber === cabinNum
        );
        if (pending) {
          setId(pending._id);
          setFormData(pending);
          setIsPosted(true);
        } else {
          setFormData({
            ...initialFormData,
            cabinNumber: cabinNum,
            date: today,
          });
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
        const res = await axios.post("/api/checklists", updatedData);
        setId(res.data._id);
        setIsPosted(true);
      }
    } catch (err) {
      toast.error("Error saving changes");
    }
  }, 1000);

  useEffect(() => {
    debouncedPatch(formData);
    return () => debouncedPatch.cancel();
  }, [formData, debouncedPatch]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const getMinMax = (name: keyof FormDataType) => {
    switch (name) {
      case "bathTowels":
      case "washCloths":
      case "waterBottles":
      case "coffeeCupsCeramic":
      case "coffeeCupsPaper":
      case "coffeeCupLids":
        return { min: 0, max: 4 };
      case "handTowels":
      case "makeupCloths":
      case "emptyRelineTrashCans":
      case "toiletPaper":
        return { min: 0, max: 2 };
      case "bathMat":
      case "shampoo":
      case "conditioner":
      case "bodyWash":
      case "bodyLotion":
      case "barSoap":
      case "soapDispenser":
      case "kleenex":
      case "pen":
      case "paperTowels":
      case "dishSoap":
      case "doorSensorBattery":
        return { min: 0, max: 1 };
      case "bathCheckLights":
      case "livingCheckLights":
        return { min: 0, max: 5 };
      case "coffeePods":
      case "coffeeSweeteners":
      case "coffeeCreamer":
      case "coffeeStirrers":
        return { min: 0, max: 12 };
      case "bathroomCups":
        return { min: 0, max: 7 };
      case "lockBattery":
        return { min: 0, max: 4 };
      case "smokeAlarmBattery":
      case "motionDetectorBattery":
        return { min: 0, max: 2 };
      default:
        return { min: 0, max: 1 };
    }
  };

  // Helper to render a slider row
  const SliderRow = ({ label, field }: { label: string; field: keyof FormDataType }) => {
    const [value, setValue] = React.useState<number>(formData[field] as number);
    const { min, max } = getMinMax(field);

    const handleChange = (
      event: Event | SyntheticEvent,
      newValue: number | number[],
      activeThumb?: number  // Include this optional param to match exactly
    ) => {
        // activeThumb is ignored for single-value sliders
        const numericValue = Array.isArray(newValue) ? newValue[0] : newValue;
      addDebugLog(`onChange for ${label}: ${numericValue}`);
      addDebugLog( "value is " + value);
      addDebugLog( "numericValue is " + numericValue);
      try {
        addDebugLog( "form shows " + formData[field]);
        setValue(numericValue as number);  // Cast if your state is strictly number
        addDebugLog( "1 value is now " + value);
        addDebugLog(JSON.stringify(prev));
        setFormData(prev => ({ ...prev, [field]: numericValue as number }));
        addDebugLog( "form now has " + formData[field]);
        addDebugLog(JSON.stringify(prev));
      } catch (error) {
        addDebugLog(`Runtime error in SliderRow (${label}): ${error instanceof Error ? error.message : String(error)}`);
      }
      addDebugLog( "2 value is now " + value);

    };

    const handleOnChangeCommitted = (
      event: Event | SyntheticEvent,
      newValue: number | number[],
      activeThumb?: number
    ) => {
      const numericValue = Array.isArray(newValue) ? newValue[0] : newValue;

      addDebugLog(`handleOnChangeCommitted for ${label}: ${numericValue}`);
      setFormData(prev => ({ ...prev, [field]: numericValue as number }));
    };

    return (
      <div className="flex items-center justify-between py-3">
        <span className="text-base font-medium">{label}</span>
        <div className="flex items-center space-x-4 w-64">
          <span className="text-xl font-bold w-12 text-center">{value}</span>
          <Slider
            size="medium"
            value={value}
            onChange={handleChange}
            onChangeCommitted={handleOnChangeCommitted}
            min={min}
            max={max}
            valueLabelDisplay="on"
 
            sx={{
              color: '#3b82f6',
              height: 8,
              '& .MuiSlider-track': {
                backgroundColor: '#3b82f6',
                border: 'none',
              },
              '& .MuiSlider-rail': {
                backgroundColor: '#d1d5db',
                opacity: 1,
              },
              '& .MuiSlider-thumb': {
                backgroundColor: '#3b82f6',
                '& .MuiSlider-valueLabel': {
                  backgroundColor: '#3b82f6',
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  top: 40, // adjust label position (lower = closer to thumb)
                },
              },
            }}
         />
        </div>
      </div>
    );
  };

  /*
  const SliderRow = ({ label, field }: { label: string; field: keyof FormDataType }) => {
    const { min, max } = getMinMax(field);

    const sliderContainerRef = useRef<HTMLDivElement>(null);

    const forceCommit = () => {
      addDebugLog(`forceCommit called for ${label}`);

      if (sliderContainerRef.current) {
        addDebugLog(`containerRef.current found for ${label}`);

        const thumb = sliderContainerRef.current.querySelector('.slider-thumb');
        if (thumb && thumb.textContent) {
          const live = Number(thumb.textContent.trim());
          addDebugLog(`Committing live value for ${label}: ${live}`);
          setFormData(prev => ({ ...prev, [field]: live }));
        } else {
          addDebugLog(`No thumb or text found for ${label}`);
        }
      } else {
        addDebugLog(`No containerRef for ${label}`);
      }
    };

    return (
      <div className="flex items-center justify-between py-3">
        <span className="text-base font-medium">{label}</span>
        <div 
          className="flex items-center space-x-4 touch-none"
          ref={sliderContainerRef}
        >
          <span className="text-xl font-bold w-12 text-center">{formData[field] as number}</span>
          <Slider
            className="w-40 h-10 relative slider-row slider-container"
            trackClassName="h-4 bg-gray-300 rounded-full top-1/2 -translate-y-1/2"
            min={min}
            max={max}
            value={formData[field] as number}
            onAfterChange={forceCommit}   // iOS PWA release
            onTouchEnd={forceCommit}   // iOS PWA release
            onMouseUp={forceCommit}    // Desktop fallback
            renderThumb={(props: React.HTMLAttributes<HTMLDivElement>, state: { valueNow: number }) => (
              <div
                {...props}
                className="slider-thumb h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-base shadow-md border-4 border-white"
                style={{
                  ...props.style,
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              >
                {state.valueNow}
              </div>
            )}
          />
        </div>
      </div>
    );
  };
  */


  const handleReset = async () => {
    if (id) {
      await axios.delete(`/api/checklists/${id}`);
      setIsResetting(true);
      setId(undefined);
      setFormData({ ...initialFormData, cabinNumber: cabinNum, date: today });
      setIsPosted(false);
      toast.success("Reset successful");
      setIsResetting(false);
    }
  };

  const handleCompleteToggle = () => {
    const newCompleted = !formData.completed;
    setFormData((prev) => ({ ...prev, completed: newCompleted }));
    toast.success(newCompleted ? "Marked as completed!" : "Reopened for edits");
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white min-h-screen relative">
      {isPosted && (
        <>
          {/* Reset button — disabled when completed */}
          <button
            onClick={handleReset}
            disabled={formData.completed || isResetting}
            className="absolute top-4 right-14 bg-red-500 text-white p-2 rounded disabled:opacity-50"
          >
            {/* @ts-ignore */}
            <FaUndo className="h-6 w-6" />
          </button>

          {/* Complete / Reopen button */}
          <button
            onClick={handleCompleteToggle}
            className={`absolute top-4 right-4 p-2 rounded text-white font-bold ${
              formData.completed
                ? "bg-amber-600 hover:bg-amber-700" // lock style when completed
                : "bg-green-500 hover:bg-green-600" // checkmark style when incomplete
            }`}
          >
            {/* @ts-ignore */}
            {formData.completed ? (<FaLock className="h-6 w-6" />) : (<FaCheck className="h-6 w-6" />)}
          </button>
        </>
      )}

      {/* First section */}
      <section className="mb-8 bg-gray-50 p-4 rounded-lg shadow">
        <div className="space-y-4">
          <label className="block">
            Date:
            <input
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="mt-1 block w-full border rounded p-2"
            />
          </label>
          <label className="block">
            Guest Name:
            <input
              name="guestName"
              value={formData.guestName}
              onChange={handleChange}
              className="mt-1 block w-full border rounded p-2"
            />
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="clearDoorCodes"
              checked={formData.clearDoorCodes}
              onChange={handleChange}
              className="h-5 w-5"
            />
            <span>Clear Door Codes</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="resetThermostats"
              checked={formData.resetThermostats}
              onChange={handleChange}
              className="h-5 w-5"
            />
            <span>Reset Thermostats</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="tvRemoteUnderTV"
              checked={formData.tvRemoteUnderTV}
              onChange={handleChange}
              className="h-5 w-5"
            />
            <span>TV Remote under TV</span>
          </label>
          <SliderRow label="Pen for Guestbook" field="pen" />
          <SliderRow label="Check Lightbulbs" field="bathCheckLights" />
          <label className="block">
            Clean AC Filter:
            <select
              name="cleanACFilter"
              value={formData.cleanACFilter}
              onChange={handleChange}
              className="mt-1 block w-full border rounded p-2"
            >
              <option value="Checked, Not Needed">Checked, Not Needed</option>
              <option value="Done">Done</option>
            </select>
          </label>

        </div>
      </section>

      {/* Batteries */}
      <section className="mb-8 bg-gray-50 p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Batteries</h3>
        <SliderRow label="Lock (AA)" field="lockBattery" />
        <SliderRow label="Smoke Alarm (AA)" field="smokeAlarmBattery" />
        <SliderRow label="Motion Detector (AA)" field="motionDetectorBattery" />
        <SliderRow label="Door Sensor (CR2032)" field="doorSensorBattery" />
      </section>

      {/* Bath */}
      <section className="mb-8 bg-gray-50 p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Bath</h3>
        <SliderRow label="Bath Towels" field="bathTowels" />
        <SliderRow label="Hand Towels" field="handTowels" />
        <SliderRow label="Wash Cloths" field="washCloths" />
        <SliderRow label="Makeup Cloths" field="makeupCloths" />
        <SliderRow label="Bath Mat" field="bathMat" />
        <SliderRow label="Shampoo" field="shampoo" />
        <SliderRow label="Conditioner" field="conditioner" />
        <SliderRow label="Body Wash" field="bodyWash" />
        <SliderRow label="Body Lotion" field="bodyLotion" />
        <SliderRow label="Bar Soap" field="barSoap" />
        <SliderRow label="Soap Dispenser" field="soapDispenser" />
        <SliderRow label="Toilet Paper" field="toiletPaper" />
        <SliderRow label="Paper Cups, Bathroom" field="bathroomCups" />
        <SliderRow label="Kleenex" field="kleenex" />

        {/* Checkboxes — unchanged */}
        <label className="flex items-center space-x-2">
          <input type="checkbox" name="checkShower" checked={formData.checkShower} onChange={handleChange} className="h-5 w-5" />
          <span>Check Shower</span>
        </label>
        <label className="flex items-center space-x-2">
          <input type="checkbox" name="gatherTowels" checked={formData.gatherTowels} onChange={handleChange} className="h-5 w-5" />
          <span>Gather Towels</span>
        </label>
      </section>

      {/* Bedroom — unchanged except no quantity fields */}
      <section className="mb-8 bg-gray-50 p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Bedroom</h3>
        <div className="space-y-4">
          <label className="block">
            Strip Queen Bed:
            <select
              name="stripQueenBeds"
              value={formData.stripQueenBeds}
              onChange={handleChange}
              className="mt-1 block w-full border rounded p-2"
            >
              <option value="Not Needed">Not Needed</option>
              <option value="Bundled">Bundled</option>
              <option value="OK">OK</option>
            </select>
          </label>
          {isCabin3 && (
            <>
              <label className="block">
                Strip Full Bed:
                <select
                  name="stripFullBeds"
                  value={formData.stripFullBeds}
                  onChange={handleChange}
                  className="mt-1 block w-full border rounded p-2"
                >
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
                <select
                  name="stripKingBeds"
                  value={formData.stripKingBeds}
                  onChange={handleChange}
                  className="mt-1 block w-full border rounded p-2"
                >
                  <option value="Not Needed">Not Needed</option>
                  <option value="Bundled">Bundled</option>
                  <option value="OK">OK</option>
                </select>
              </label>
            </>
          )}
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="checkUnderBedsSofa"
              checked={formData.checkUnderBedsSofa}
              onChange={handleChange}
              className="h-5 w-5"
            />
            <span>Check under furniture</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="shakeRugs"
              checked={formData.shakeRugs}
              onChange={handleChange}
              className="h-5 w-5"
            />
            <span>Shake rugs outside</span>
          </label>
        </div>
      </section>

      {/* Kitchen */}
      <section className="mb-8 bg-gray-50 p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Kitchen</h3>
        <SliderRow label="Water Bottles" field="waterBottles" />
        <SliderRow label="Coffee Pods" field="coffeePods" />
        <SliderRow label="Coffee Sweeteners" field="coffeeSweeteners" />
        <SliderRow label="Coffee Creamer" field="coffeeCreamer" />
        <SliderRow label="Coffee Cups, Ceramic" field="coffeeCupsCeramic" />
        <SliderRow label="Coffee Cups, Paper" field="coffeeCupsPaper" />
        <SliderRow label="Coffee Cup Lids" field="coffeeCupLids" />
        <SliderRow label="Coffee Stirrers" field="coffeeStirrers" />
        <SliderRow label="Reline Trash Cans" field="emptyRelineTrashCans" />

        {isCabin3 && (
          <>
            <SliderRow label="Paper Towels" field="paperTowels" />
            <SliderRow label="Dish Soap" field="dishSoap" />
          </>
        )}

        {/* Checkboxes — unchanged */}
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

      {/* Comments — unchanged */}
      <section className="mb-8 bg-gray-50 p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Comments</h3>
        <div className="space-y-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="damagesYesNo"
              checked={formData.damagesYesNo}
              onChange={handleChange}
              className="h-5 w-5"
            />
            <span>Comments? Damages? Maintenance Issues?</span>
          </label>
          {formData.damagesYesNo && (
            <label className="block">
              Description:
              <textarea
                name="damagesDescription"
                value={formData.damagesDescription}
                onChange={handleChange}
                className="mt-1 block w-full border rounded p-2 h-24"
              />
            </label>
          )}
          <div className="h-16"></div>
        </div>
      </section>

      {/* Debug log area — fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-black text-white text-xs p-3 max-h-64 overflow-y-auto z-50 opacity-95">
        <div className="font-bold mb-2">Debug Logs (newest first):</div>
        <div className="mb-2 space-x-2">
          <button
            onClick={() => {
              const logText = debugLogs.join('\n');
              navigator.clipboard.writeText(logText).then(() => {
                toast.success('Debug logs copied to clipboard!');
              }).catch(() => {
                toast.error('Failed to copy logs');
              });
            }}
            className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs"
          >
            Copy Logs
          </button>
          <button
            onClick={() => setDebugLogs([])}
            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs"
          >
            Clear Logs
          </button>
        </div>
        <div className="font-mono">
          {debugLogs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ChecklistForm;