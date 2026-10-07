import React, { useState, useEffect } from 'react';
import { useParking } from '../context/ParkingContext.jsx';
import PrintSlipModal from '../components/PrintSlipModal.jsx';

export default function VehicleExitPage() {
  const { records, exitVehicle, activeRecords } = useParking();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentRecord, setCurrentRecord] = useState(null);
  const [selectedRateType, setSelectedRateType] = useState('car'); // 'bike' or 'car'
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isHold, setIsHold] = useState(false);

  // Live clock
  useEffect(() => {
    const updateTime = () => {
      setCurrentTimeStr(new Date().toLocaleTimeString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate durations and fee
  let entryDate = null;
  let totalMinutes = 0;
  let rateMultiplier = selectedRateType === 'bike' ? 1 : 2;

  if (currentRecord && currentRecord.entry_time) {
    entryDate = new Date(currentRecord.entry_time);
    const diffMs = Math.max(0, new Date().getTime() - entryDate.getTime());
    totalMinutes = Math.max(1, Math.floor(diffMs / 60000));
  }

  const baseMultiplierText = `x ₹${rateMultiplier.toFixed(2)}`;
  const totalAmount = totalMinutes * rateMultiplier;

  // Search logic
  const handleSearch = (targetQuery) => {
    const query = (targetQuery || searchQuery).trim().toLowerCase();
    if (!query) {
      alert('Enter vehicle number');
      return;
    }

    const found = records.find(
      (r) =>
        r.status === 'active' &&
        (r.vehicle_no.toLowerCase() === query ||
          r.vehicle_no.toLowerCase().includes(query) ||
          String(r.id) === query)
    );

    if (found) {
      setCurrentRecord(found);
      if (found.vehicle_type?.toLowerCase().includes('bike')) {
        setSelectedRateType('bike');
      } else {
        setSelectedRateType('car');
      }
    } else {
      alert('Vehicle not found among active parked vehicles.');
    }
  };

  // Confirm Exit
  const handleConfirmExit = async () => {
    if (!currentRecord) {
      alert('Search and select a vehicle first.');
      return;
    }

    setIsProcessing(true);
    await exitVehicle({
      recordId: currentRecord.id,
      slotId: currentRecord.slot_id,
      totalMinutes,
      totalAmount,
    });
    setIsProcessing(false);

    alert(`Vehicle ${currentRecord.vehicle_no} Exit Completed!\nTotal Settled: ₹${totalAmount.toFixed(2)}`);
    setCurrentRecord(null);
    setSearchQuery('');
  };

  return (
    <div className="flex-1 p-5 md:p-8 bg-[#f5f4fb] min-h-screen">
      {/* TOPBAR */}
      <div className="flex flex-wrap justify-between items-center gap-5 mb-7">
        <h1 className="text-[#4338ca] text-3xl md:text-[42px] font-extrabold tracking-tight">
          Parking Central
        </h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#ede9fe] px-4 py-3.5 rounded-2xl w-72 md:w-96">
            <i className="fa-solid fa-magnifying-glass text-indigo-700 mr-3 text-lg"></i>
            <input
              type="text"
              placeholder="Search vehicle or ticket..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full bg-transparent border-none outline-none text-[16px] text-gray-800 placeholder-indigo-400"
            />
          </div>
          <div className="flex items-center gap-4 text-gray-600 ml-2">
            <button className="hover:text-[#4338ca] text-2xl">
              <i className="fa-regular fa-bell"></i>
            </button>
            <button className="hover:text-[#4338ca] text-2xl">
              <i className="fa-solid fa-gear"></i>
            </button>
          </div>
        </div>
      </div>

      {/* PAGE TITLE */}
      <div className="mb-6">
        <h2 className="text-2xl md:text-[28px] font-bold text-gray-900 mb-1.5">
          Vehicle Exit & Fee Settlement
        </h2>
        <p className="text-gray-500 text-[16px]">
          Process vehicle departures and calculate parking fees in real-time.
        </p>
      </div>

      {/* Active Vehicles Quick Chip Bar */}
      {activeRecords.length > 0 && !currentRecord && (
        <div className="bg-white p-4 rounded-2xl border border-gray-200 mb-6 shadow-xs">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">
            Quick Select Active Vehicle:
          </p>
          <div className="flex flex-wrap gap-2">
            {activeRecords.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setSearchQuery(item.vehicle_no);
                  handleSearch(item.vehicle_no);
                }}
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
              >
                <span>{item.vehicle_no}</span>
                <span className="bg-white px-1.5 py-0.5 rounded text-[10px] text-gray-600 font-normal">
                  Slot {item.slots?.slot_number || item.slot_id}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* LOCATE VEHICLE CARD */}
          <div className="bg-white rounded-[24px] p-6 md:p-7 border border-[#e5e7eb] shadow-xs">
            <h2 className="text-xl font-bold text-gray-900">Locate Vehicle</h2>
            <div className="flex flex-col sm:flex-row gap-3.5 mt-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter Vehicle No (e.g. MH-12-AB-1234)"
                className="flex-1 p-4 rounded-[16px] border border-gray-300 text-[16px] focus:outline-none focus:ring-2 focus:ring-[#4338ca] uppercase font-semibold"
              />
              <button
                onClick={() => handleSearch()}
                className="bg-[#4338ca] hover:bg-[#312e81] text-white px-7 py-4 rounded-[16px] font-bold text-[16px] transition cursor-pointer shadow-md shadow-indigo-100"
              >
                Search
              </button>
            </div>
          </div>

          {/* DETAILS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* VEHICLE DETAILS */}
            <div className="bg-white rounded-[20px] p-6 border border-[#e5e7eb] shadow-xs">
              <h4 className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-4">
                VEHICLE DETAILS
              </h4>
              <div className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">
                {currentRecord ? currentRecord.vehicle_no : '--'}
              </div>
              <p className="text-gray-600 font-medium text-base">
                {currentRecord ? `${currentRecord.vehicle_type} ${currentRecord.owner_name ? `• ${currentRecord.owner_name}` : ''}` : '--'}
              </p>
              <hr className="my-5 border-gray-200" />
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium text-sm">Slot ID</span>
                <span className="text-[#4338ca] font-extrabold text-lg">
                  {currentRecord ? (currentRecord.slots?.slot_number || currentRecord.slot_id) : '--'}
                </span>
              </div>
            </div>

            {/* TIME TRACKING */}
            <div className="bg-white rounded-[20px] p-6 border border-[#e5e7eb] shadow-xs">
              <h4 className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-4">
                TIME TRACKING
              </h4>
              <p className="text-gray-600 text-sm mb-2">
                Entry : <strong className="text-gray-900 font-bold">{currentRecord ? new Date(currentRecord.entry_time).toLocaleTimeString() : '--'}</strong>
              </p>
              <p className="text-gray-600 text-sm mb-4">
                Current : <strong className="text-gray-900 font-bold">{currentTimeStr || '--'}</strong>
              </p>
              <div className="inline-block bg-[#6366f1] text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full shadow-xs">
                {totalMinutes} MINUTES
              </div>
            </div>
          </div>

          {/* SNAPSHOT CARD */}
          <div className="rounded-[24px] overflow-hidden relative shadow-md border border-gray-200">
            <img
              src="https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=1200"
              alt="Gate camera snapshot"
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
              <div className="text-white text-xl md:text-2xl font-bold drop-shadow-md flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
                Entry Snapshot: Gate 2 Camera
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (1 Col) */}
        <div className="space-y-6">
          {/* FEE CALCULATION */}
          <div className="bg-white rounded-[24px] p-6 md:p-7 border-2 border-[#5b5ce9] shadow-md">
            <h2 className="text-xl font-bold text-gray-900">Fee Calculation</h2>
            <hr className="my-4 border-gray-200" />

            <div className="space-y-3">
              {/* Bike Rate */}
              <div
                onClick={() => setSelectedRateType('bike')}
                className={`p-4 rounded-[18px] flex justify-between items-center cursor-pointer transition border-2 ${
                  selectedRateType === 'bike' ? 'border-[#5b5ce9] bg-indigo-50/60' : 'border-transparent bg-[#f5f4fb]'
                }`}
              >
                <div>
                  <h3 className="font-bold text-gray-800 text-[16px]">Bike Rate</h3>
                  <p className="text-gray-500 text-xs">₹1 per min</p>
                </div>
                <input
                  type="radio"
                  name="rateSelect"
                  checked={selectedRateType === 'bike'}
                  onChange={() => setSelectedRateType('bike')}
                  className="w-5 h-5 text-indigo-600 cursor-pointer accent-[#5b5ce9]"
                />
              </div>

              {/* Car Rate */}
              <div
                onClick={() => setSelectedRateType('car')}
                className={`p-4 rounded-[18px] flex justify-between items-center cursor-pointer transition border-2 ${
                  selectedRateType === 'car' ? 'border-[#5b5ce9] bg-indigo-50/60' : 'border-transparent bg-[#f5f4fb]'
                }`}
              >
                <div>
                  <h3 className="font-bold text-gray-800 text-[16px]">Car Rate</h3>
                  <p className="text-gray-500 text-xs">₹2 per min</p>
                </div>
                <input
                  type="radio"
                  name="rateSelect"
                  checked={selectedRateType === 'car'}
                  onChange={() => setSelectedRateType('car')}
                  className="w-5 h-5 text-indigo-600 cursor-pointer accent-[#5b5ce9]"
                />
              </div>
            </div>

            <div className="mt-6 space-y-3.5 text-sm">
              <div className="flex justify-between text-gray-700 text-[15px]">
                <span>Total Minutes</span>
                <span className="font-semibold text-gray-900">{totalMinutes} mins</span>
              </div>
              <div className="flex justify-between text-gray-700 text-[15px]">
                <span>Base Multiplier</span>
                <span className="font-semibold text-gray-900">{baseMultiplierText}</span>
              </div>
              <div className="flex justify-between text-gray-700 text-[15px]">
                <span>Tax (SGST/CGST)</span>
                <span className="font-semibold text-gray-900">₹0</span>
              </div>

              <div className="border-t border-gray-200 pt-5 mt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      TOTAL PAYABLE
                    </p>
                    <h1 className="text-4xl font-extrabold text-[#4338ca] mt-0.5">
                      ₹<span>{totalAmount.toFixed(2)}</span>
                    </h1>
                  </div>
                  <div className="bg-[#fee2e2] text-[#dc2626] font-bold text-xs px-4 py-2 rounded-full uppercase tracking-wider">
                    {currentRecord ? 'UNPAID' : 'IDLE'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ACTION CARD */}
          <div className="bg-white rounded-[24px] p-6 border border-[#e5e7eb] shadow-xs space-y-3">
            <button
              onClick={handleConfirmExit}
              disabled={isProcessing || !currentRecord}
              className="w-full bg-[#4338ca] hover:bg-[#312e81] text-white py-4 rounded-[16px] font-bold text-[16px] transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-50"
            >
              <i className="fa-regular fa-circle-check text-xl"></i>
              <span>{isProcessing ? 'Processing Exit...' : 'Confirm Payment & Exit'}</span>
            </button>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (!currentRecord) {
                    alert('Please search and select a vehicle first.');
                    return;
                  }
                  setIsPrintModalOpen(true);
                }}
                className="flex-1 bg-[#ede9fe] hover:bg-indigo-100 text-[#4338ca] font-bold py-3.5 rounded-[16px] transition cursor-pointer text-sm"
              >
                <i className="fa-solid fa-print mr-1.5"></i> Print Slip
              </button>
              <button
                onClick={() => {
                  if (!currentRecord) {
                    alert('Select a vehicle first');
                    return;
                  }
                  setIsHold(!isHold);
                  alert(isHold ? 'Hold released.' : 'Vehicle departure request put on hold.');
                }}
                className={`flex-1 font-bold py-3.5 rounded-[16px] transition cursor-pointer text-sm ${
                  isHold ? 'bg-amber-100 text-amber-800' : 'bg-[#ede9fe] hover:bg-indigo-100 text-[#4338ca]'
                }`}
              >
                <i className="fa-solid fa-hand mr-1.5"></i> {isHold ? 'Holding...' : 'Hold Request'}
              </button>
            </div>
          </div>

          {/* NOTE */}
          <div className="bg-[#ffe4d6] p-5 rounded-[18px] text-[#6b3f2e] text-xs leading-relaxed border border-orange-200">
            <strong className="block font-bold text-[13px] mb-1">
              <i className="fa-solid fa-triangle-exclamation mr-1.5 text-orange-600"></i>
              Vehicle exit logic assumes immediate departure post-payment.
            </strong>
            Tickets are valid for 15 minutes after fee settlement.
          </div>
        </div>
      </div>

      {/* Print Slip Modal */}
      <PrintSlipModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        record={currentRecord}
        totalMinutes={totalMinutes}
        totalAmount={totalAmount.toFixed(2)}
        rate={rateMultiplier}
      />
    </div>
  );
}
