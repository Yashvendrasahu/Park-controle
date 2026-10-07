import React, { useState, useEffect } from 'react';
import { useParking } from '../context/ParkingContext.jsx';

export default function AddSlotModal({ isOpen, onClose, defaultZone, defaultFloor }) {
  const { addSlot } = useParking();
  const [slotNumber, setSlotNumber] = useState('');
  const [zone, setZone] = useState(defaultZone || 'Zone A');
  const [floor, setFloor] = useState(defaultFloor || 'Ground');
  const [slotType, setSlotType] = useState('Standard');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (defaultZone) setZone(defaultZone);
    if (defaultFloor) setFloor(defaultFloor);
  }, [defaultZone, defaultFloor]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!slotNumber.trim()) {
      alert('Please enter a slot number (e.g. A-105)');
      return;
    }

    setIsSaving(true);
    await addSlot({
      slotNumber,
      zone,
      floor,
      slotType,
    });
    setIsSaving(false);
    alert(`Slot ${slotNumber.toUpperCase()} added successfully!`);
    setSlotNumber('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
        <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center text-white">
          <h3 className="text-lg font-bold">Add New Slot</h3>
          <button onClick={onClose} className="text-indigo-200 hover:text-white p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form className="p-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Slot Number
            </label>
            <input
              type="text"
              value={slotNumber}
              onChange={(e) => setSlotNumber(e.target.value)}
              placeholder="e.g. A-105"
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none uppercase font-semibold text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Zone</label>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-sm"
              >
                <option value="Zone A">Zone A</option>
                <option value="Zone B">Zone B</option>
                <option value="Zone C">Zone C</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Floor</label>
              <select
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-sm"
              >
                <option value="Ground">Floor 1 (Ground)</option>
                <option value="Floor 1">Floor 2</option>
                <option value="Basement">Basement</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Slot Type</label>
            <select
              value={slotType}
              onChange={(e) => setSlotType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-sm"
            >
              <option value="Standard">Standard (Car/Bike)</option>
              <option value="EV Charging">EV Charging Station</option>
              <option value="Handicap">Handicap Reserved</option>
            </select>
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
              disabled={isSaving}
              className="flex-1 bg-indigo-600 text-white font-bold py-2.5 rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-100 transition text-sm disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? 'Saving...' : 'Save Slot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
