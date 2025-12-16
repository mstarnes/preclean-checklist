// frontend/src/components/Summary.tsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useReactToPrint } from "react-to-print";
import { toast } from "react-toastify";
import { ClipboardIcon } from "@heroicons/react/24/outline";
import { FaShoppingCart } from "react-icons/fa";
import { useCart } from "../context/CartContext";

const labels = {
  bathTowels: "Bath Towels",
  handTowels: "Hand Towels",
  washCloths: "Wash Cloths",
  makeupCloths: "Makeup Cloths",
  bathMat: "Bath Mat",
  shampoo: "Shampoo",
  conditioner: "Conditioner",
  bodyWash: "Body Wash",
  bodyLotion: "Body Lotion",
  barSoap: "Bar Soap",
  soapDispenser: "Soap Dispenser",
  toiletPaper: "Toilet Paper",
  bathroomCups: "Paper Cups, Bathroom",
  kleenex: "Kleenex",
  bathCheckLights: "Bath Check Lights",
  pen: "Pen for Guestbook",
  waterBottles: "Water Bottles",
  coffeePods: "Coffee Pods",
  coffeeSweeteners: "Coffee Sweeteners",
  coffeeCreamer: "Coffee Creamer",
  coffeeCupsCeramic: "Coffee Cups, Ceramic",
  coffeeCupsPaper: "Coffee Cups, Paper",
  coffeeCupLids: "Coffee Cup Lids",
  coffeeStirrers: "Coffee Stirrers",
  emptyRelineTrashCans: "Reline Trash Cans",
  paperTowels: "Paper Towels",
  dishSoap: "Dish Soap",
  lockBattery: "Lock Battery (AA)",
  smokeAlarmBattery: "Smoke Alarm Battery (AA)",
  motionDetectorBattery: "Motion Detector Battery (AA)",
  doorSensorBattery: "Door Sensor Battery (CR2032)",
  livingCheckLights: "Living Check Lights",
};

const itemOrder = [
  "bathTowels",
  "handTowels",
  "washCloths",
  "makeupCloths",
  "bathMat",
  "shampoo",
  "conditioner",
  "bodyWash",
  "bodyLotion",
  "barSoap",
  "soapDispenser",
  "toiletPaper",
  "bathroomCups",
  "kleenex",
  "pen",
  "bathCheckLights",
  "waterBottles",
  "coffeePods",
  "coffeeSweeteners",
  "coffeeCreamer",
  "coffeeCupsCeramic",
  "coffeeCupsPaper",
  "coffeeCupLids",
  "coffeeStirrers",
  "emptyRelineTrashCans",
  "paperTowels",
  "dishSoap",
  "lockBattery",
  "smokeAlarmBattery",
  "motionDetectorBattery",
  "doorSensorBattery",
  "livingCheckLights",
];

const Summary: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isGlobal = id === "global";
  const [data, setData] = useState<{
    aggregated: Record<string, number>;
    perCabin: Record<string, Record<string, number>>;
    pendings: any[];
  }>({
    aggregated: {},
    perCabin: {},
    pendings: [],
  });
  const { cart, addToCart } = useCart();
  const componentRef = useRef<HTMLDivElement>(null);
  const print = useReactToPrint({
    contentRef: componentRef,
    pageStyle: `
      @page { size: A4 portrait; margin: 1cm; }
      @media print {
        body { -webkit-print-color-adjust: exact; }
      }
    `,
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("/api/pending-summaries").then((res) => {
      setData(res.data);
      if (!isGlobal) {
        const cl = res.data.pendings.find((p: any) => p._id === id);
        if (cl) {
          let msg = `Cabin ${cl.cabinNumber} has been pre-cleaned.`;
          if (cl.damagesYesNo && cl.damagesDescription)
            msg += ` Comments: ${cl.damagesDescription}`;
          setMessage(msg);
        }
      }
    });
  }, [id, isGlobal]);

  const cabins = Object.keys(data.perCabin).sort(
    (a, b) => Number(a) - Number(b)
  );
  const items = Object.keys(data.aggregated).sort(
    (a, b) => itemOrder.indexOf(a) - itemOrder.indexOf(b)
  );

  const isInCart = (key: string) =>
    cart.some((c) => c.item === labels[key as keyof typeof labels]);

  const handleAddToCart = (key: string) => {
    addToCart(labels[key as keyof typeof labels], data.aggregated[key], null);
  };

  const handleCabinClick = (cabin: string) => {
    const pending = data.pendings.find(
      (p: any) => p.cabinNumber === Number(cabin)
    );
    if (pending) {
      navigate(`/checklist/${cabin}?edit=${pending._id}`);
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={print}
        className="mb-4 bg-blue-500 text-white px-4 py-2 rounded float-right"
      >
        Print
      </button>
      <h2 className="text-2xl font-bold mb-4 clear-both">
        Restock Summary{" "}
        {isGlobal
          ? ""
          : `- Cabin ${
              data.pendings.find((p) => p._id === id)?.cabinNumber || ""
            }`}
      </h2>
      {!isGlobal && message && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
          <p className="font-medium">{message}</p>
          <button
            onClick={() =>
              navigator.clipboard
                .writeText(message)
                .then(() => toast.success("Copied to clipboard!"))
            }
            className="mt-2"
          >
            <ClipboardIcon className="h-6 w-6 text-green-700" />
          </button>
        </div>
      )}
      <div className="overflow-x-auto -mx-4 px-4">
        <table className="w-full border-collapse table-fixed">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-3 text-left font-semibold w-[30%]">
                Item
              </th>
              {cabins.map((cabin) => (
                <th
                  key={cabin}
                  className="border border-gray-300 p-3 text-center font-semibold cursor-pointer hover:bg-gray-200"
                  onClick={() => handleCabinClick(cabin)}
                >
                  Cabin {cabin}
                </th>
              ))}
              <th className="border border-gray-300 p-3 text-center font-semibold">
                Total
              </th>
              <th className="border border-gray-300 p-3 text-center font-semibold">
                Buy
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((key) => (
              <tr
                key={key}
                className={data.aggregated[key] > 0 ? "bg-red-50" : ""}
              >
                <td className="border border-gray-300 p-3 font-medium break-words">
                  {labels[key as keyof typeof labels] || key}
                </td>
                {cabins.map((cabin) => (
                  <td
                    key={cabin}
                    className="border border-gray-300 p-3 text-center"
                  >
                    {data.perCabin[cabin][key] || 0}
                  </td>
                ))}
                <td className="border border-gray-300 p-3 text-center font-bold text-lg">
                  {data.aggregated[key]}
                </td>
                <td className="border border-gray-300 p-3 text-center">
                  {isInCart(key) ? (
                    <span className="text-green-600 font-bold text-xl">✓</span>
                  ) : data.aggregated[key] > 0 ? (
                    /* @ts-ignore */
                    <FaShoppingCart
                      className="cursor-pointer text-blue-600 h-7 w-7 mx-auto hover:text-blue-800"
                      onClick={() => handleAddToCart(key)}
                    />
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Printable version */}
      <div ref={componentRef}>
        <style type="text/css" media="print">
          {`
      @page { size: A4 portrait; margin: 0.5cm; }
      body { margin: 0; padding: 0; font-size: 10pt; }
      body * { visibility: hidden; }
      #print-section, #print-section * { visibility: visible; }
      #print-section { position: absolute; left: 0; top: 0; width: 100%; }
    `}
        </style>

        <div id="print-section" className="p-2">
          <h2 className="text-xl font-bold mb-2 text-center">
            Restock Summary
          </h2>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-600 p-1 text-left">Item</th>
                {cabins.map((cabin) => (
                  <th
                    key={cabin}
                    className="border border-gray-600 p-1 text-center"
                  >
                    Cabin {cabin}
                  </th>
                ))}
                <th className="border border-gray-600 p-1 text-center">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((key) => (
                <tr key={key}>
                  <td className="border border-gray-600 p-1">
                    {labels[key as keyof typeof labels] || key}
                  </td>
                  {cabins.map((cabin) => (
                    <td
                      key={cabin}
                      className="border border-gray-600 p-1 text-center"
                    >
                      {data.perCabin[cabin][key] || 0}
                    </td>
                  ))}
                  <td className="border border-gray-600 p-1 text-center font-bold">
                    {data.aggregated[key]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Summary;
