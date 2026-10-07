import React from 'react';

export default function RecordDetailsModal({ isOpen, onClose, record }) {
  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-700 font-bold px-2.5 py-1 rounded text-xs">
              #PK-{record.id}
            </span>
            <h2 className="text-xl font-bold text-gray-800">Transaction Record</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <div className="py-4 space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase">Vehicle Number</p>
              <p className="text-base font-extrabold text-gray-900 mt-0.5">{record.vehicle_no}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase">Vehicle Type</p>
              <p className="text-base font-bold text-indigo-700 mt-0.5">{record.vehicle_type}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="border border-gray-100 p-3 rounded-lg">
              <span className="text-xs text-gray-400 font-medium">Owner Name:</span>
              <p className="font-semibold text-gray-800">{record.owner_name || 'Walk-in Driver'}</p>
            </div>
            <div className="border border-gray-100 p-3 rounded-lg">
              <span className="text-xs text-gray-400 font-medium">Assigned Slot:</span>
              <p className="font-bold text-indigo-600">{record.slots?.slot_number || record.slot_id || '-'}</p>
            </div>
          </div>

          <div className="space-y-2 border-t border-gray-100 pt-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Entry Timestamp:</span>
              <span className="font-medium text-gray-800">
                {record.entry_time ? new Date(record.entry_time).toLocaleString() : '--'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Exit Timestamp:</span>
              <span className="font-medium text-gray-800">
                {record.exit_time ? new Date(record.exit_time).toLocaleString() : 'ACTIVE (Parked)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total Duration:</span>
              <span className="font-medium text-gray-800">{record.total_minutes || 0} Minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment Status:</span>
              <span
                className={`font-bold uppercase text-xs px-2 py-0.5 rounded ${
                  record.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {record.payment_status || 'UNPAID'}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-dashed border-gray-200">
              <span className="font-bold text-gray-700 text-base">Settled Amount:</span>
              <span className="text-2xl font-extrabold text-[#4338ca]">₹{record.total_amount || 0}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <button
            onClick={onClose}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl transition text-sm cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
