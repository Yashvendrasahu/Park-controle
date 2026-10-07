import React, { useState } from 'react';
import { useParking } from '../context/ParkingContext.jsx';
import AddSlotModal from '../components/AddSlotModal.jsx';
import EditRatesModal from '../components/EditRatesModal.jsx';
import NewEntryModal from '../components/NewEntryModal.jsx';

export default function SlotManagementPage() {
  const {
    slots,
    records,
    releaseSlot,
    toggleMaintenance,
    resetZoneSlots,
    rates,
    setPreselectedSlotId,
  } = useParking();

  const [activeZone, setActiveZone] = useState('Zone A');
  const [selectedFloor, setSelectedFloor] = useState('Ground');
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRatesModalOpen, setIsRatesModalOpen] = useState(false);
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false);

  // Filter slots for current zone and floor
  const zoneFloorSlots = slots.filter((slot) => {
    const matchesZone = (slot.zone || 'Zone A') === activeZone;
    const matchesFloor = (slot.floor || 'Ground') === selectedFloor;
    const matchesSearch = searchFilter
      ? slot.slot_number.toLowerCase().includes(searchFilter.toLowerCase())
      : true;
    return matchesZone && matchesFloor && matchesSearch;
  });

  // Stats for the active zone + floor
  const totalInView = zoneFloorSlots.length;
  const occupiedInView = zoneFloorSlots.filter((s) => s.status === 'occupied').length;
  const maintInView = zoneFloorSlots.filter((s) => s.status === 'maintenance').length;
  const availInView = totalInView - occupiedInView - maintInView;

  // Selected slot data
  const selectedSlot = slots.find((s) => s.id === selectedSlotId);
  const activeRecordForSlot = selectedSlot
    ? records.find((r) => r.slot_id === selectedSlot.id && r.status === 'active')
    : null;

  // Handle release slot
  const handleRelease = async () => {
    if (!selectedSlot || selectedSlot.status !== 'occupied') return;
    const record = activeRecordForSlot;
    const vehicleText = record ? `(${record.vehicle_no})` : '';

    if (
      window.confirm(
        `Are you sure you want to release ${selectedSlot.slot_number}?\nThis will mark the vehicle ${vehicleText} parking as completed.`
      )
    ) {
      await releaseSlot(selectedSlot.id);
    }
  };

  // Handle toggle maintenance
  const handleToggleMaintenance = async () => {
    if (!selectedSlot) return;
    await toggleMaintenance(selectedSlot.id);
  };

  // Handle reset zone
  const handleResetZone = () => {
    if (window.confirm(`Reset all slots in ${activeZone} to Available?`)) {
      resetZoneSlots(activeZone);
    }
  };

  // Quick park in selected slot
  const handleQuickParkHere = () => {
    if (!selectedSlot) return;
    if (setPreselectedSlotId) {
      setPreselectedSlotId(selectedSlot.id);
    }
    setIsQuickEntryOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f8fafc]">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 p-4 px-6 flex justify-between items-center shrink-0">
        <h1 className="text-xl font-bold text-indigo-900">Slot Management</h1>
        <div className="flex items-center space-x-4">
          <div className="relative hidden md:block">
            <svg
              className="w-4 h-4 text-gray-400 absolute left-3 top-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Find slot ID..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="bg-gray-100 pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
            />
          </div>
          <button
            onClick={() => setIsRatesModalOpen(true)}
            title="Configure Rates"
            className="text-gray-500 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            <i className="fa-solid fa-sliders text-lg"></i>
          </button>
          <img
            src="https://ui-avatars.com/api/?name=Admin+User&background=1e1b4b&color=fff"
            alt="Admin"
            className="w-8 h-8 rounded-full border border-gray-200"
          />
        </div>
      </header>

      {/* BODY SPLIT (MAIN CONTENT + RIGHT DETAILS BAR) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* MAIN MAP AREA */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* ZONE & FLOOR CONTROLS */}
          <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
            <div className="flex items-center space-x-2">
              <div className="bg-white border border-gray-200 rounded-lg inline-flex shadow-xs p-1">
                {['Zone A', 'Zone B', 'Zone C'].map((zone) => (
                  <button
                    key={zone}
                    onClick={() => setActiveZone(zone)}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-md transition cursor-pointer ${
                      activeZone === zone
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {zone}
                  </button>
                ))}
              </div>

              <select
                value={selectedFloor}
                onChange={(e) => setSelectedFloor(e.target.value)}
                className="bg-gray-100 border-none text-gray-700 text-sm font-semibold rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="Ground">Floor 1 (Ground)</option>
                <option value="Floor 1">Floor 2</option>
                <option value="Basement">Basement</option>
              </select>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleResetZone}
                className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 flex items-center shadow-xs cursor-pointer"
              >
                <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset Zone
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 shadow-sm shadow-indigo-200 flex items-center cursor-pointer"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add New Slot
              </button>
            </div>
          </div>

          {/* STATS TILES (4 Cols) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col items-center justify-center">
              <p className="text-xs text-gray-400 font-bold tracking-wider mb-1">TOTAL SLOTS</p>
              <h2 className="text-3xl font-bold text-gray-800">{totalInView}</h2>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col items-center justify-center">
              <p className="text-xs text-green-500 font-bold tracking-wider mb-1">AVAILABLE</p>
              <h2 className="text-3xl font-bold text-green-600">{availInView}</h2>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col items-center justify-center">
              <p className="text-xs text-indigo-500 font-bold tracking-wider mb-1">OCCUPIED</p>
              <h2 className="text-3xl font-bold text-indigo-700">{occupiedInView}</h2>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col items-center justify-center">
              <p className="text-xs text-red-400 font-bold tracking-wider mb-1">MAINTENANCE</p>
              <h2 className="text-3xl font-bold text-red-500">{maintInView}</h2>
            </div>
          </div>

          {/* INTERACTIVE FLOOR MAP */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">
                Interactive Floor Map ({activeZone.split(' ')[1]}-{selectedFloor === 'Ground' ? '1' : selectedFloor === 'Floor 1' ? '2' : 'B'})
              </h3>
              <div className="flex space-x-4 text-xs font-medium">
                <span className="flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 mr-1.5"></span>Available
                </span>
                <span className="flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 mr-1.5"></span>Occupied
                </span>
                <span className="flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400 mr-1.5"></span>Maintenance
                </span>
              </div>
            </div>

            {zoneFloorSlots.length === 0 ? (
              <div className="text-center text-gray-400 py-16">
                No slots found for {activeZone} in this floor. Click "+ Add New Slot" to create one.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {zoneFloorSlots.map((slot) => {
                  let colorClass = 'border-green-400 text-green-500 bg-green-50';
                  let textStatus = 'FREE';

                  if (slot.status === 'occupied') {
                    colorClass = 'border-indigo-600 text-indigo-700 bg-white shadow-xs';
                    textStatus = 'BUSY';
                  } else if (slot.status === 'maintenance') {
                    colorClass = 'border-red-300 text-red-500 bg-red-50';
                    textStatus = 'MAINT';
                  }

                  const isSelected = selectedSlotId === slot.id;

                  return (
                    <div
                      key={slot.id}
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`slot-card flex flex-col items-center justify-center p-3 rounded-xl border-2 ${colorClass} ${
                        isSelected ? 'slot-selected ring-4 ring-indigo-200' : ''
                      } h-28 relative`}
                    >
                      <span className="font-bold text-sm mb-1 text-gray-800">{slot.slot_number}</span>

                      {slot.slot_type === 'EV Charging' ? (
                        <svg className="w-5 h-5 mb-1 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 mb-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      )}

                      <span className="text-xs font-bold uppercase tracking-widest">{textStatus}</span>

                      {slot.slot_type !== 'Standard' && (
                        <span
                          className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${
                            slot.slot_type === 'EV Charging' ? 'bg-indigo-400' : 'bg-blue-400'
                          }`}
                          title={slot.slot_type}
                        ></span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT DETAILS SIDEBAR */}
        <div className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col shrink-0 overflow-y-auto">
          {/* SLOT DETAILS */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-sm text-gray-500 font-semibold mb-1">Slot Details</p>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedSlot ? `Slot ${selectedSlot.slot_number}` : 'Select Slot'}
                </h2>
              </div>
              <span
                className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wider ${
                  !selectedSlot
                    ? 'bg-gray-100 text-gray-500'
                    : selectedSlot.status === 'occupied'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : selectedSlot.status === 'maintenance'
                    ? 'bg-red-500 text-white shadow-xs'
                    : 'bg-green-500 text-white shadow-xs'
                }`}
              >
                {!selectedSlot
                  ? '--'
                  : selectedSlot.status === 'occupied'
                  ? 'OCCUPIED'
                  : selectedSlot.status === 'maintenance'
                  ? 'MAINTENANCE'
                  : 'AVAILABLE'}
              </span>
            </div>

            {/* INFO BOX */}
            <div className="space-y-4 text-sm">
              {!selectedSlot ? (
                <p className="text-gray-400 italic text-center py-4">
                  Click a slot on the map to view details and manage operations.
                </p>
              ) : selectedSlot.status === 'occupied' && activeRecordForSlot ? (
                <>
                  <div className="flex justify-between pb-2 border-b border-gray-100">
                    <span className="text-gray-500">Vehicle No</span>
                    <span className="font-bold text-gray-800">{activeRecordForSlot.vehicle_no}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-gray-100">
                    <span className="text-gray-500">Entry Time</span>
                    <span className="font-bold text-gray-800">
                      {new Date(activeRecordForSlot.entry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-gray-100">
                    <span className="text-gray-500">Duration</span>
                    <span className="font-bold text-indigo-600">
                      {Math.floor((Date.now() - new Date(activeRecordForSlot.entry_time).getTime()) / 3600000)}h{' '}
                      {Math.floor(((Date.now() - new Date(activeRecordForSlot.entry_time).getTime()) % 3600000) / 60000)}m
                    </span>
                  </div>
                  <div className="flex justify-between pb-2">
                    <span className="text-gray-500">Type</span>
                    <span className="font-bold text-gray-800">{selectedSlot.slot_type}</span>
                  </div>
                </>
              ) : selectedSlot.status === 'maintenance' ? (
                <div className="text-red-500 italic text-center py-3 text-sm bg-red-50 rounded-lg p-3 border border-red-100">
                  This slot is currently closed for maintenance or repairs.
                </div>
              ) : (
                <>
                  <div className="flex justify-between pb-2 border-b border-gray-100">
                    <span className="text-gray-500">Status</span>
                    <span className="font-bold text-green-600">Ready for Parking</span>
                  </div>
                  <div className="flex justify-between pb-2">
                    <span className="text-gray-500">Slot Type</span>
                    <span className="font-bold text-gray-800">{selectedSlot.slot_type}</span>
                  </div>
                </>
              )}
            </div>

            {/* ACTION BUTTONS */}
            {selectedSlot && (
              <div className="mt-7 space-y-2.5">
                {selectedSlot.status === 'available' && (
                  <button
                    onClick={handleQuickParkHere}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg shadow-md shadow-emerald-100 transition flex items-center justify-center cursor-pointer text-sm"
                  >
                    <i className="fa-solid fa-car-side mr-2"></i>
                    Park Vehicle in This Slot
                  </button>
                )}

                {selectedSlot.status === 'occupied' && (
                  <button
                    onClick={handleRelease}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg shadow-md shadow-indigo-100 transition flex items-center justify-center cursor-pointer text-sm"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Release Slot
                  </button>
                )}

                {selectedSlot.status !== 'occupied' && (
                  <button
                    onClick={handleToggleMaintenance}
                    className="w-full bg-white border border-gray-200 text-gray-700 font-bold py-2.5 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition flex items-center justify-center cursor-pointer text-sm"
                  >
                    <svg className="w-4 h-4 mr-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {selectedSlot.status === 'maintenance' ? 'Remove Maintenance' : 'Mark for Maintenance'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* RATES SECTION */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800">Rates</h3>
              <button
                onClick={() => setIsRatesModalOpen(true)}
                className="text-xs text-indigo-600 font-semibold cursor-pointer hover:underline flex items-center gap-1"
              >
                <i className="fa-solid fa-pen-to-square text-[10px]"></i> Edit
              </button>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between items-center">
                <span className="flex items-center text-gray-600">
                  <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  Standard
                </span>
                <span className="font-bold text-gray-800">₹{(rates?.standard || 40).toFixed(2)}/hr</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="flex items-center text-gray-600">
                  <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  EV Premium
                </span>
                <span className="font-bold text-indigo-600">₹{(rates?.ev || 75).toFixed(2)}/hr</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="flex items-center text-gray-600">
                  <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Handicap
                </span>
                <span className="font-bold text-indigo-600">₹{(rates?.handicap || 20).toFixed(2)}/hr</span>
              </li>
            </ul>
          </div>

          {/* ZONE EFFICIENCY CARD */}
          <div className="p-6 mt-auto">
            <div className="bg-indigo-700 rounded-xl p-4 text-white relative overflow-hidden h-32 shadow-lg shadow-indigo-200">
              <p className="text-[10px] font-bold tracking-wider uppercase opacity-80 mb-1">
                Zone Efficiency
              </p>
              <h3 className="text-3xl font-bold">94.2%</h3>
              <svg
                className="absolute bottom-0 left-0 w-full h-16 opacity-50"
                preserveAspectRatio="none"
                viewBox="0 0 100 30"
                fill="none"
                stroke="white"
                strokeWidth="2"
              >
                <path
                  d="M0 30 V20 L15 25 L35 10 L55 20 L75 5 L100 15 V30 Z"
                  fill="rgba(255,255,255,0.1)"
                  stroke="none"
                ></path>
                <path d="M0 20 L15 25 L35 10 L55 20 L75 5 L100 15"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Add New Slot Modal */}
      <AddSlotModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultZone={activeZone}
        defaultFloor={selectedFloor}
      />

      {/* Configure Rates Modal */}
      <EditRatesModal
        isOpen={isRatesModalOpen}
        onClose={() => setIsRatesModalOpen(false)}
      />

      {/* Quick Entry Modal */}
      <NewEntryModal
        isOpen={isQuickEntryOpen}
        onClose={() => setIsQuickEntryOpen(false)}
      />
    </div>
  );
}
