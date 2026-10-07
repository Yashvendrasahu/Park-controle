import React, { useState } from 'react';
import { useParking } from '../context/ParkingContext.jsx';

export default function EditRatesModal({ isOpen, onClose }) {
  const { rates, updateRates } = useParking();

  const [standardRate, setStandardRate] = useState(rates?.standard || 40);
  const [bikeRate, setBikeRate] = useState(rates?.bike || 20);
  const [evRate, setEvRate] = useState(rates?.ev || 75);
  const [handicapRate, setHandicapRate] = useState(rates?.handicap || 20);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    updateRates({
      standard: Number(standardRate),
      bike: Number(bikeRate),
      ev: Number(evRate),
      handicap: Number(handicapRate),
    });
    alert('Parking rates updated successfully!');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
        <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-tags text-indigo-200"></i>
            <h3 className="text-lg font-bold">Configure Parking Rates</h3>
          </div>
          <button onClick={onClose} className="text-indigo-200 hover:text-white p-1">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Standard 4-Wheeler Rate (₹/Hour)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400 font-bold">₹</span>
              <input
                type="number"
                min="0"
                step="1"
                value={standardRate}
                onChange={(e) => setStandardRate(e.target.value)}
                className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-sm"
                required
              />
            </div>
            <span className="text-[11px] text-gray-400">Equivalent to ₹{(standardRate / 60).toFixed(2)}/min</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Two-Wheeler (Bike) Rate (₹/Hour)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400 font-bold">₹</span>
              <input
                type="number"
                min="0"
                step="1"
                value={bikeRate}
                onChange={(e) => setBikeRate(e.target.value)}
                className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-sm"
                required
              />
            </div>
            <span className="text-[11px] text-gray-400">Equivalent to ₹{(bikeRate / 60).toFixed(2)}/min</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              EV Premium Charging Rate (₹/Hour)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400 font-bold">₹</span>
              <input
                type="number"
                min="0"
                step="1"
                value={evRate}
                onChange={(e) => setEvRate(e.target.value)}
                className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Handicap Reserved Rate (₹/Hour)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400 font-bold">₹</span>
              <input
                type="number"
                min="0"
                step="1"
                value={handicapRate}
                onChange={(e) => setHandicapRate(e.target.value)}
                className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-sm"
                required
              />
            </div>
          </div>

          <div className="pt-4 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 font-bold py-2.5 rounded-lg hover:bg-gray-200 transition text-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white font-bold py-2.5 rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-100 transition text-sm cursor-pointer"
            >
              Save Rates
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
