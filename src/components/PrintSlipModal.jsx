import React from 'react';

export default function PrintSlipModal({ isOpen, onClose, record, totalMinutes, totalAmount, rate }) {
  if (!isOpen || !record) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-gray-200">
        <div className="text-center pb-4 border-b border-dashed border-gray-300">
          <div className="w-10 h-10 bg-[#4338ca] text-white rounded-lg flex items-center justify-center mx-auto mb-2 text-xl font-bold italic">
            P
          </div>
          <h2 className="text-xl font-bold text-gray-800">ParkControl Central</h2>
          <p className="text-xs text-gray-500">Official Parking Receipt & Gate Pass</p>
          <p className="text-[11px] text-gray-400 mt-1">Receipt ID: #RCT-{record.id}</p>
        </div>

        <div className="py-4 space-y-2.5 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Vehicle Number:</span>
            <span className="font-bold text-gray-900">{record.vehicle_no}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Vehicle Type:</span>
            <span className="font-semibold text-gray-800">{record.vehicle_type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Slot Assigned:</span>
            <span className="font-bold text-[#4338ca]">{record.slots?.slot_number || record.slot_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Entry Time:</span>
            <span className="text-gray-800">{new Date(record.entry_time).toLocaleTimeString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Exit Time:</span>
            <span className="text-gray-800">{new Date().toLocaleTimeString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Total Duration:</span>
            <span className="font-semibold text-gray-800">{totalMinutes} Minutes</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Rate Applied:</span>
            <span className="text-gray-800">₹{rate} / min</span>
          </div>
          <div className="border-t border-dashed border-gray-300 pt-3 mt-3 flex justify-between items-center">
            <span className="font-bold text-gray-800 text-base">Total Paid:</span>
            <span className="text-2xl font-extrabold text-[#4338ca]">₹{totalAmount}</span>
          </div>
        </div>

        <div className="bg-emerald-50 text-emerald-700 text-xs p-2.5 rounded-lg text-center font-semibold mb-4 border border-emerald-200">
          <i className="fa-solid fa-circle-check mr-1.5"></i> PAID &bull; Valid for 15 minutes at exit boom barrier
        </div>

        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 bg-[#4338ca] hover:bg-indigo-800 text-white font-bold py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-print"></i> Print Slip
          </button>
          <button
            onClick={onClose}
            className="px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
