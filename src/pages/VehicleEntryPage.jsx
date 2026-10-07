import React, { useState, useEffect } from 'react';
import { useParking } from '../context/ParkingContext.jsx';
import EntryPassModal from '../components/EntryPassModal.jsx';

export default function VehicleEntryPage() {
  const { slots, records, addVehicle, totalSlots, occupiedSlots, availableSlots, setCurrentPage } = useParking();

  const [vehicleNo, setVehicleNo] = useState('');
  const [vehicleType, setVehicleType] = useState('Car');
  const [ownerName, setOwnerName] = useState('');
  const [slotId, setSlotId] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdPass, setCreatedPass] = useState(null);

  // Live timer
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleDateString() + '   ' + now.toLocaleTimeString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Available slots
  const availableSlotsList = slots.filter((s) => s.status === 'available');
  const evSlotsCount = slots.filter((s) => s.slot_type === 'EV Charging').length;

  const capacityPercent = totalSlots > 0 ? Math.floor((occupiedSlots / totalSlots) * 100) : 0;
  const progressDeg = capacityPercent * 3.6;

  // Recent 5 entries
  const recentEntries = records.slice(0, 5);

  const handleAssignSlot = async () => {
    const selectedSlot = slotId || (availableSlotsList[0] ? availableSlotsList[0].id : '');
    if (!vehicleNo.trim() || !selectedSlot) {
      alert('Please fill required fields (Vehicle Number & Available Slot)');
      return;
    }

    setIsSubmitting(true);
    const res = await addVehicle({
      vehicleNo,
      vehicleType,
      ownerName,
      slotId: selectedSlot,
    });
    setIsSubmitting(false);

    if (res.record) {
      setCreatedPass(res.record);
    }

    setVehicleNo('');
    setOwnerName('');
    setSlotId('');
  };

  return (
    <div className="flex-1 p-5 md:p-8 bg-[#f5f4fb] min-h-screen">
      {/* Topbar */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-[#4338ca] text-3xl md:text-[40px] font-extrabold tracking-tight">
          Parking Central
        </h1>
        <div className="flex items-center gap-5">
          <button className="text-gray-600 hover:text-[#4338ca] text-xl cursor-pointer">
            <i className="fa-regular fa-bell"></i>
          </button>
          <button
            onClick={() => setCurrentPage('slot_mange')}
            className="text-gray-600 hover:text-[#4338ca] text-xl cursor-pointer"
          >
            <i className="fa-solid fa-gear"></i>
          </button>
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200"
            alt="User avatar"
            className="w-11 h-11 rounded-full object-cover border-2 border-indigo-200 shadow-xs"
          />
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="text-gray-500 font-semibold mb-7 text-sm tracking-wide">
        DASHBOARD &nbsp;&gt;&nbsp; <span className="text-[#4f46e5]">VEHICLE ENTRY</span>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form Card */}
        <div className="lg:col-span-2 bg-white rounded-[22px] p-6 md:p-8 border border-[#e5e7eb] shadow-xs">
          <h2 className="text-2xl md:text-[34px] font-bold text-gray-900 leading-tight mb-2">
            New Vehicle Entry
          </h2>
          <p className="text-gray-500 text-[15px] mb-7">
            Register the vehicle, assign an available slot, and issue an official gate entry pass.
          </p>

          <div className="mb-5">
            <label className="block mb-2 text-xs font-bold text-gray-600 uppercase tracking-wider">
              VEHICLE NUMBER
            </label>
            <div className="bg-[#f6f4ff] border border-gray-300 rounded-[16px] px-4 py-3.5 flex items-center gap-3 focus-within:ring-2 focus-within:ring-[#4f46e5] focus-within:border-transparent transition">
              <i className="fa-solid fa-car text-gray-400 text-lg"></i>
              <input
                type="text"
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value)}
                placeholder="e.g. ABC-1234 or MH-12-AB-1234"
                className="w-full bg-transparent border-none outline-none text-gray-800 text-[16px] font-semibold uppercase placeholder-gray-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5 mb-5">
            <div>
              <label className="block mb-2 text-xs font-bold text-gray-600 uppercase tracking-wider">
                VEHICLE TYPE
              </label>
              <div className="bg-[#f6f4ff] border border-gray-300 rounded-[16px] px-4 py-3.5 flex items-center gap-3 focus-within:ring-2 focus-within:ring-[#4f46e5]">
                <i className="fa-solid fa-car-side text-gray-400 text-lg"></i>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-gray-800 text-[15px] font-medium cursor-pointer"
                >
                  <option value="Car">Car</option>
                  <option value="Bike">Bike</option>
                  <option value="Truck">Truck</option>
                  <option value="EV Sedan">EV Sedan</option>
                  <option value="EV SUV">EV SUV</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block mb-2 text-xs font-bold text-gray-600 uppercase tracking-wider">
                OWNER NAME (OPTIONAL)
              </label>
              <div className="bg-[#f6f4ff] border border-gray-300 rounded-[16px] px-4 py-3.5 flex items-center gap-3 focus-within:ring-2 focus-within:ring-[#4f46e5]">
                <i className="fa-regular fa-user text-gray-400 text-lg"></i>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full bg-transparent border-none outline-none text-gray-800 text-[15px] placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-xs font-bold text-gray-600 uppercase tracking-wider">
              AVAILABLE SLOT
            </label>
            <div className="bg-[#f6f4ff] border border-gray-300 rounded-[16px] px-4 py-3.5 flex items-center gap-3 focus-within:ring-2 focus-within:ring-[#4f46e5]">
              <i className="fa-solid fa-square-parking text-gray-400 text-lg"></i>
              <select
                value={slotId}
                onChange={(e) => setSlotId(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-gray-800 text-[15px] font-semibold cursor-pointer"
              >
                {availableSlotsList.length === 0 ? (
                  <option value="">No Slots Available Currently</option>
                ) : (
                  <>
                    <option value="">-- Choose Slot --</option>
                    {availableSlotsList.map((slot) => (
                      <option key={slot.id} value={slot.id}>
                        {slot.slot_number} &bull; {slot.zone} &bull; {slot.slot_type}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-[#f6f4ff] border-2 border-dashed border-[#d6d3f3] rounded-[18px] p-5 flex flex-wrap justify-between items-center gap-4 mb-6">
            <div className="flex items-center gap-3.5">
              <i className="fa-regular fa-clock text-[#4f46e5] text-2xl"></i>
              <div>
                <small className="text-gray-500 font-bold text-xs uppercase tracking-wider block">
                  CURRENT ENTRY TIME
                </small>
                <h3 className="text-gray-800 font-bold text-base mt-0.5">{currentTime}</h3>
              </div>
            </div>
            <div>
              <small className="text-gray-500 font-bold text-xs uppercase tracking-wider block">
                GATE
              </small>
              <h3 className="text-gray-800 font-bold text-base mt-0.5">Main Entrance A</h3>
            </div>
          </div>

          <button
            onClick={handleAssignSlot}
            disabled={isSubmitting || availableSlotsList.length === 0}
            className="w-full bg-[#4338ca] hover:bg-[#312e81] text-white py-4.5 rounded-[18px] text-[18px] font-bold transition duration-200 cursor-pointer flex items-center justify-center gap-2.5 shadow-lg shadow-indigo-100 disabled:opacity-50"
          >
            <i className="fa-regular fa-square-check text-xl"></i>
            <span>{isSubmitting ? 'Assigning & Generating Ticket...' : 'Assign Slot & Issue Pass'}</span>
          </button>
        </div>

        {/* Right Side Capacity & Stats */}
        <div className="flex flex-col gap-5">
          {/* Capacity Donut Card */}
          <div className="bg-white rounded-[22px] p-6 border border-[#e5e7eb] shadow-xs text-center">
            <h3 className="text-gray-700 font-bold text-xs uppercase tracking-widest mb-4">
              CURRENT CAPACITY
            </h3>
            <div
              className="progress-circle w-[170px] h-[170px] rounded-full mx-auto my-3 flex items-center justify-center shadow-inner"
              style={{
                background: `conic-gradient(#4f46e5 0deg, #4f46e5 ${progressDeg}deg, #e9e7ff ${progressDeg}deg)`,
              }}
            >
              <div className="w-[125px] h-[125px] bg-white rounded-full flex items-center justify-center text-[38px] font-extrabold text-[#4f46e5] shadow-xs">
                {capacityPercent}%
              </div>
            </div>
            <h2 className="text-lg font-bold text-gray-800 mt-2">
              <span className="text-[#4f46e5] font-extrabold">{occupiedSlots}</span> / {totalSlots} Slots Occupied
            </h2>
          </div>

          {/* Small Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-[18px] p-4.5 border border-[#e5e7eb] shadow-xs">
              <i className="fa-solid fa-square-parking text-2xl text-[#92400e] mb-2 block"></i>
              <p className="text-gray-500 font-bold text-[11px] uppercase tracking-wider">AVAILABLE SLOTS</p>
              <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-1">{availableSlots}</h3>
            </div>
            <div className="bg-white rounded-[18px] p-4.5 border border-[#e5e7eb] shadow-xs">
              <i className="fa-solid fa-bolt text-2xl text-[#4f46e5] mb-2 block"></i>
              <p className="text-gray-500 font-bold text-[11px] uppercase tracking-wider">EV CHARGING</p>
              <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-1">0{evSlotsCount}</h3>
            </div>
          </div>

          {/* Parking Snapshot Image */}
          <div className="rounded-[22px] overflow-hidden border border-[#e5e7eb] shadow-xs">
            <img
              src="https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=1200"
              alt="Parking facility overview"
              className="w-full h-52 object-cover"
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="mt-8 bg-white rounded-[22px] p-6 border border-[#e5e7eb] shadow-xs overflow-hidden">
        <div className="flex flex-wrap justify-between items-center mb-5 gap-3">
          <h2 className="text-xl font-bold text-gray-900">Recently Entered</h2>
          <button
            onClick={() => setCurrentPage('history')}
            className="text-[#4f46e5] font-bold text-sm hover:underline cursor-pointer"
          >
            VIEW ALL HISTORY
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#f5f4fb] text-gray-600 text-xs font-bold uppercase tracking-wider">
                <th className="p-4 rounded-l-lg">VEHICLE NO</th>
                <th className="p-4">TYPE</th>
                <th className="p-4">OWNER</th>
                <th className="p-4">ENTRY TIME</th>
                <th className="p-4">SLOT</th>
                <th className="p-4 rounded-r-lg">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {recentEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-400">
                    No entries yet.
                  </td>
                </tr>
              ) : (
                recentEntries.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80">
                    <td className="p-4 font-extrabold text-gray-900">{item.vehicle_no}</td>
                    <td className="p-4 text-gray-600">{item.vehicle_type}</td>
                    <td className="p-4 text-gray-600">{item.owner_name || '-'}</td>
                    <td className="p-4 text-gray-500">
                      {item.entry_time ? new Date(item.entry_time).toLocaleTimeString() : '--'}
                    </td>
                    <td className="p-4 font-bold text-[#4f46e5]">
                      {item.slots?.slot_number || item.slot_id || '-'}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setCreatedPass(item)}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                      >
                        <i className="fa-solid fa-ticket"></i> View Pass
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Entry Ticket Modal */}
      <EntryPassModal
        isOpen={Boolean(createdPass)}
        onClose={() => setCreatedPass(null)}
        record={createdPass}
      />
    </div>
  );
}
