import React, { useState, useEffect } from 'react';
import { useParking } from '../context/ParkingContext.jsx';
import EntryPassModal from './EntryPassModal.jsx';

export default function NewEntryModal({ isOpen, onClose }) {
  const { slots, addVehicle, preselectedSlotId, setPreselectedSlotId } = useParking();
  const [vehicleNo, setVehicleNo] = useState('');
  const [vehicleType, setVehicleType] = useState('Car');
  const [ownerName, setOwnerName] = useState('');
  const [slotId, setSlotId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdPass, setCreatedPass] = useState(null);

  const availableSlots = slots.filter((s) => s.status === 'available');

  useEffect(() => {
    if (preselectedSlotId) {
      setSlotId(String(preselectedSlotId));
    }
  }, [preselectedSlotId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const targetSlot = slotId || (availableSlots[0] ? availableSlots[0].id : '');
    if (!vehicleNo.trim() || !targetSlot) {
      alert('Please fill all required fields and select an available slot.');
      return;
    }

    setSubmitting(true);
    const result = await addVehicle({
      vehicleNo,
      vehicleType,
      ownerName,
      slotId: targetSlot,
    });

    setSubmitting(false);
    if (result.record) {
      setCreatedPass(result.record);
    }
    setVehicleNo('');
    setOwnerName('');
    setSlotId('');
    if (setPreselectedSlotId) setPreselectedSlotId(null);
  };

  if (!isOpen && !createdPass) return null;

  return (
    <>
      {isOpen && !createdPass && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-[500px] rounded-[20px] p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-bold text-gray-800">New Vehicle Entry</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-2 font-semibold text-gray-700 text-sm">Vehicle Number</label>
                <input
                  type="text"
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value)}
                  placeholder="e.g. MH-12-AB-1234"
                  required
                  className="w-full p-3 rounded-[10px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4f46e5] text-[15px] uppercase font-semibold"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-semibold text-gray-700 text-sm">Vehicle Type</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full p-3 rounded-[10px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4f46e5] text-[15px] bg-white cursor-pointer font-medium"
                >
                  <option value="Car">Car</option>
                  <option value="Bike">Bike</option>
                  <option value="Truck">Truck</option>
                  <option value="EV SUV">EV SUV</option>
                  <option value="EV Sedan">EV Sedan</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-semibold text-gray-700 text-sm">Owner Name (Optional)</label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full p-3 rounded-[10px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4f46e5] text-[15px]"
                />
              </div>

              <div className="mb-6">
                <label className="block mb-2 font-semibold text-gray-700 text-sm">Select Slot</label>
                <select
                  value={slotId}
                  onChange={(e) => setSlotId(e.target.value)}
                  className="w-full p-3 rounded-[10px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4f46e5] text-[15px] bg-white cursor-pointer font-semibold text-indigo-700"
                >
                  {availableSlots.length === 0 ? (
                    <option value="">No Available Slots</option>
                  ) : (
                    <>
                      <option value="">-- Choose Available Slot --</option>
                      {availableSlots.map((slot) => (
                        <option key={slot.id} value={slot.id}>
                          {slot.slot_number} ({slot.zone} &bull; {slot.slot_type})
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting || availableSlots.length === 0}
                  className="flex-1 bg-[#4f46e5] hover:bg-[#4338ca] text-white py-3 px-5 rounded-[12px] font-semibold transition cursor-pointer shadow-md shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <i className="fa-regular fa-square-check"></i>
                  <span>{submitting ? 'Assigning...' : 'Save Entry & Issue Pass'}</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-[#ef4444] hover:bg-red-600 text-white py-3 px-5 rounded-[12px] font-semibold transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {createdPass && (
        <EntryPassModal
          isOpen={Boolean(createdPass)}
          onClose={() => {
            setCreatedPass(null);
            onClose();
          }}
          record={createdPass}
        />
      )}
    </>
  );
}
