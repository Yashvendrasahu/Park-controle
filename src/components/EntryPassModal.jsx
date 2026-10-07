import React from 'react';

export default function EntryPassModal({ isOpen, onClose, record }) {
  if (!isOpen || !record) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in duration-200">
        {/* Ticket Header */}
        <div className="text-center pb-4 border-b-2 border-dashed border-gray-300">
          <div className="w-10 h-10 bg-[#4338ca] text-white rounded-xl flex items-center justify-center mx-auto mb-2 text-xl font-bold italic shadow-xs">
            P
          </div>
          <h2 className="text-xl font-extrabold text-gray-900">PARKCONTROL</h2>
          <p className="text-xs text-gray-500 font-semibold tracking-wider uppercase">Entry Gate Pass & Ticket</p>
          <div className="mt-2 bg-indigo-50 text-[#4338ca] font-mono text-xs px-3 py-1 rounded-full inline-block font-bold">
            TICKET #{record.id || Math.floor(100000 + Math.random() * 900000)}
          </div>
        </div>

        {/* Ticket Details */}
        <div className="py-4 space-y-3 text-sm">
          <div className="bg-gray-50 p-3.5 rounded-xl text-center">
            <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider block">
              ASSIGNED PARKING SLOT
            </span>
            <span className="text-3xl font-black text-[#4338ca] tracking-tight block mt-0.5">
              {record.slots?.slot_number || record.slot_number || 'A-101'}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500 font-semibold">Vehicle Number:</span>
            <span className="font-extrabold text-gray-900 text-sm">{record.vehicle_no}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500 font-semibold">Vehicle Type:</span>
            <span className="font-bold text-gray-700">{record.vehicle_type}</span>
          </div>

          {record.owner_name && (
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500 font-semibold">Driver / Owner:</span>
              <span className="font-medium text-gray-800">{record.owner_name}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500 font-semibold">Entry Time:</span>
            <span className="font-mono text-gray-800">
              {record.entry_time ? new Date(record.entry_time).toLocaleTimeString() : new Date().toLocaleTimeString()}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500 font-semibold">Gate Location:</span>
            <span className="font-medium text-gray-800">Main Entrance A &bull; Boom Barrier 1</span>
          </div>
        </div>

        {/* Simulated Barcode */}
        <div className="py-3 border-t-2 border-dashed border-gray-300 text-center">
          <div className="h-10 bg-repeating-linear-gradient flex items-center justify-center bg-gray-900 text-white font-mono text-[10px] tracking-widest rounded px-2">
            ||| | | |||| || || | ||| |||| | | |||
          </div>
          <p className="text-[10px] text-gray-400 font-mono mt-1 tracking-widest">
            *PK-{record.id}-{record.vehicle_no}*
          </p>
        </div>

        <p className="text-[10px] text-gray-400 text-center italic mb-4">
          Please keep this pass safe. Present this ticket at exit gate for automated fee settlement.
        </p>

        {/* Action Buttons */}
        <div className="flex gap-2.5">
          <button
            onClick={handlePrint}
            className="flex-1 bg-[#4338ca] hover:bg-indigo-900 text-white font-bold py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 text-sm shadow-md shadow-indigo-100"
          >
            <i className="fa-solid fa-print"></i> Print Ticket
          </button>
          <button
            onClick={onClose}
            className="px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl transition cursor-pointer text-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
