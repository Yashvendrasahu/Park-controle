import React, { useState } from 'react';
import { useParking } from '../context/ParkingContext.jsx';
import RecordDetailsModal from '../components/RecordDetailsModal.jsx';

export default function ParkingHistoryPage() {
  const { records, exportCSV, totalEarnings, completedRecords, occupancyPercentage } = useParking();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'car', 'bike'
  const [dateRange, setDateRange] = useState('Today'); // 'Today', 'Yesterday', 'Last 7 Days', 'All Time'
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'completed'

  const itemsPerPage = 8;

  // Filter records
  const filteredRecords = records.filter((item) => {
    // Search match
    const search = searchTerm.toLowerCase();
    const veh = (item.vehicle_no || '').toLowerCase();
    const type = (item.vehicle_type || '').toLowerCase();
    const owner = (item.owner_name || '').toLowerCase();
    const slot = (item.slots?.slot_number || String(item.slot_id) || '').toLowerCase();
    const matchesSearch =
      veh.includes(search) || type.includes(search) || owner.includes(search) || slot.includes(search);

    // Tab filter
    let matchesTab = true;
    if (activeTab === 'bike') {
      matchesTab = type.includes('bike');
    } else if (activeTab === 'car') {
      matchesTab = !type.includes('bike');
    }

    // Status filter
    let matchesStatus = true;
    if (statusFilter !== 'all') {
      matchesStatus = item.status === statusFilter;
    }

    // Date range filter
    let matchesDate = true;
    if (dateRange !== 'All Time' && item.entry_time) {
      const entryD = new Date(item.entry_time);
      const now = new Date();
      if (dateRange === 'Today') {
        matchesDate = entryD.toDateString() === now.toDateString();
      } else if (dateRange === 'Last 7 Days') {
        const diffDays = (now - entryD) / (1000 * 60 * 60 * 24);
        matchesDate = diffDays <= 7;
      }
    }

    return matchesSearch && matchesTab && matchesStatus && matchesDate;
  });

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / itemsPerPage));
  const paginatedRecords = filteredRecords.slice(
    (currentPageNum - 1) * itemsPerPage,
    currentPageNum * itemsPerPage
  );

  const getBadgeClass = (typeStr = '') => {
    const t = typeStr.toLowerCase();
    if (t.includes('bike')) return 'bg-[#fed7aa] text-[#92400e]';
    if (t.includes('suv')) return 'bg-[#ddd6fe] text-[#4338ca]';
    if (t.includes('ev')) return 'bg-[#ddd6fe] text-[#4338ca]';
    return 'bg-[#e0e7ff] text-[#4338ca]';
  };

  return (
    <div className="flex-1 p-5 md:p-8 bg-[#f5f4fb] min-h-screen">
      {/* TOPBAR */}
      <div className="flex flex-wrap justify-between items-center gap-5 mb-7">
        <div className="flex items-center bg-[#ede9fe] px-4.5 py-3.5 rounded-2xl w-full max-w-[480px]">
          <i className="fa-solid fa-magnifying-glass text-indigo-700 mr-3 text-lg"></i>
          <input
            type="text"
            placeholder="Search vehicle history, slot, owner..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPageNum(1);
            }}
            className="w-full bg-transparent border-none outline-none text-[16px] text-gray-800 placeholder-indigo-400"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-gray-400 hover:text-gray-600">
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>

        <div className="flex items-center gap-5">
          <button className="text-gray-600 hover:text-[#4338ca] text-2xl cursor-pointer">
            <i className="fa-regular fa-bell"></i>
          </button>
          <button className="text-gray-600 hover:text-[#4338ca] text-2xl cursor-pointer">
            <i className="fa-solid fa-gear"></i>
          </button>
          <div className="w-[1px] h-[30px] bg-gray-300"></div>
          <div className="text-[#4338ca] text-[18px] font-bold">Parking Central</div>
        </div>
      </div>

      {/* HEADER */}
      <div className="flex flex-wrap justify-between items-center gap-5 mb-7">
        <div>
          <h1 className="text-3xl md:text-5xl lg:text-[56px] font-extrabold text-gray-900 leading-tight mb-2">
            Parking History
          </h1>
          <p className="text-gray-600 text-base md:text-[20px]">
            Comprehensive log of all vehicle transactions and slot utilization.
          </p>
        </div>

        <div className="flex flex-wrap gap-3.5">
          <button
            onClick={exportCSV}
            className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 px-6 py-3.5 rounded-[16px] font-bold text-[16px] transition cursor-pointer shadow-xs flex items-center gap-2"
          >
            <i className="fa-solid fa-download text-[#4338ca]"></i>
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowFiltersModal(!showFiltersModal)}
            className="bg-[#4338ca] hover:bg-[#312e81] text-white px-6 py-3.5 rounded-[16px] font-bold text-[16px] transition cursor-pointer shadow-md shadow-indigo-100 flex items-center gap-2"
          >
            <i className="fa-solid fa-filter"></i>
            <span>Advanced Filters</span>
          </button>
        </div>
      </div>

      {/* ADVANCED FILTER POPUP DRAWER IF TOGGLED */}
      {showFiltersModal && (
        <div className="bg-white p-5 rounded-2xl border border-indigo-200 mb-6 shadow-sm animate-in fade-in duration-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6 flex-wrap">
            <div>
              <span className="text-xs font-bold uppercase text-gray-500 block mb-1">Status:</span>
              <div className="flex gap-2">
                {['all', 'active', 'completed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase cursor-pointer transition ${
                      statusFilter === status
                        ? 'bg-[#4338ca] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-bold uppercase text-gray-500 block mb-1">Date Range:</span>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-gray-100 border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="Today">Today</option>
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="All Time">All Time</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => {
              setStatusFilter('all');
              setDateRange('All Time');
              setActiveTab('all');
              setSearchTerm('');
              setShowFiltersModal(false);
            }}
            className="text-xs font-semibold text-red-600 hover:underline cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* TABLE CARD */}
      <div className="bg-white rounded-[24px] overflow-hidden border border-[#ddd] shadow-xs">
        {/* FILTER TABS */}
        <div className="p-5 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                setActiveTab('all');
                setCurrentPageNum(1);
              }}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm cursor-pointer transition ${
                activeTab === 'all'
                  ? 'bg-white text-[#4338ca] border border-gray-300 shadow-xs'
                  : 'bg-[#f3f1ff] text-gray-700 hover:bg-indigo-50'
              }`}
            >
              All Vehicles ({records.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('car');
                setCurrentPageNum(1);
              }}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm cursor-pointer transition ${
                activeTab === 'car'
                  ? 'bg-white text-[#4338ca] border border-gray-300 shadow-xs'
                  : 'bg-[#f3f1ff] text-gray-700 hover:bg-indigo-50'
              }`}
            >
              Four Wheeler ({records.filter((r) => !r.vehicle_type?.toLowerCase().includes('bike')).length})
            </button>
            <button
              onClick={() => {
                setActiveTab('bike');
                setCurrentPageNum(1);
              }}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm cursor-pointer transition ${
                activeTab === 'bike'
                  ? 'bg-white text-[#4338ca] border border-gray-300 shadow-xs'
                  : 'bg-[#f3f1ff] text-gray-700 hover:bg-indigo-50'
              }`}
            >
              Two Wheeler ({records.filter((r) => r.vehicle_type?.toLowerCase().includes('bike')).length})
            </button>
          </div>

          <div className="text-sm text-gray-600 font-medium flex items-center gap-2">
            <span><strong>Date Range:</strong> {dateRange}</span>
            <span className="text-xs text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded-full">
              {filteredRecords.length} Records
            </span>
          </div>
        </div>

        {/* TABLE WRAPPER */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-[950px]">
            <thead>
              <tr className="bg-[#f3f1ff] text-[#555] text-sm font-bold uppercase tracking-wider border-b border-gray-200">
                <th className="p-4 pl-6">ID</th>
                <th className="p-4">VEHICLE NO</th>
                <th className="p-4">TYPE</th>
                <th className="p-4">SLOT</th>
                <th className="p-4">ENTRY TIME</th>
                <th className="p-4">EXIT TIME</th>
                <th className="p-4">TOTAL AMOUNT</th>
                <th className="p-4 pr-6">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400 italic text-base">
                    No transactions found matching criteria.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-4 pl-6 font-semibold text-gray-500">#PK-{item.id}</td>
                    <td className="p-4 font-bold text-gray-900 text-base">{item.vehicle_no}</td>
                    <td className="p-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getBadgeClass(item.vehicle_type)}`}>
                        {item.vehicle_type}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-gray-800">
                      {item.slots?.slot_number || item.slot_id || '--'}
                    </td>
                    <td className="p-4 text-gray-600">
                      {item.entry_time ? new Date(item.entry_time).toLocaleString() : '--'}
                    </td>
                    <td className="p-4">
                      {item.exit_time ? (
                        <span className="text-gray-600">{new Date(item.exit_time).toLocaleString()}</span>
                      ) : (
                        <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">
                          ACTIVE
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-bold text-[#4338ca] text-base">
                      ₹{item.total_amount || 0}
                    </td>
                    <td className="p-4 pr-6">
                      <button
                        onClick={() => setSelectedRecord(item)}
                        title="View Details"
                        className="text-gray-500 hover:text-[#4338ca] p-2 rounded-lg hover:bg-indigo-50 transition cursor-pointer text-xl"
                      >
                        <i className="fa-regular fa-clipboard"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="p-5 border-t border-gray-200 flex flex-wrap justify-between items-center gap-4">
          <div className="text-sm text-gray-600">
            Rows per page: <strong className="text-gray-900">{itemsPerPage}</strong> &bull; Showing{' '}
            {paginatedRecords.length} of {filteredRecords.length} records
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPageNum((p) => Math.max(1, p - 1))}
              disabled={currentPageNum === 1}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition cursor-pointer"
            >
              <i className="fa-solid fa-chevron-left text-xs"></i>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setCurrentPageNum(num)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition cursor-pointer ${
                  currentPageNum === num
                    ? 'bg-[#4338ca] text-white shadow-xs'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {num}
              </button>
            ))}

            <button
              onClick={() => setCurrentPageNum((p) => Math.min(totalPages, p + 1))}
              disabled={currentPageNum === totalPages}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition cursor-pointer"
            >
              <i className="fa-solid fa-chevron-right text-xs"></i>
            </button>
          </div>
        </div>
      </div>

      {/* STATS SECTION */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Today's Revenue */}
        <div className="bg-white rounded-[22px] p-7 border border-[#ddd] shadow-xs flex justify-between items-center">
          <div>
            <p className="text-gray-500 font-medium text-sm">Today's Revenue</p>
            <h2 className="text-4xl lg:text-[44px] font-extrabold text-gray-900 my-1.5">
              ₹{totalEarnings.toFixed(2)}
            </h2>
            <p className="text-[#16a34a] font-semibold text-xs flex items-center gap-1">
              <i className="fa-solid fa-arrow-trend-up"></i> Revenue Generated
            </p>
          </div>
          <div className="w-[75px] h-[75px] rounded-[20px] bg-[#ede9fe] flex justify-center items-center text-3xl text-[#4338ca] shadow-xs">
            <i className="fa-solid fa-money-bill"></i>
          </div>
        </div>

        {/* Total Exits */}
        <div className="bg-white rounded-[22px] p-7 border border-[#ddd] shadow-xs flex justify-between items-center">
          <div>
            <p className="text-gray-500 font-medium text-sm">Total Exits</p>
            <h2 className="text-4xl lg:text-[44px] font-extrabold text-gray-900 my-1.5">
              {completedRecords.length}
            </h2>
            <p className="text-gray-500 text-xs font-medium">Processed Vehicles</p>
          </div>
          <div className="w-[75px] h-[75px] rounded-[20px] bg-[#ede9fe] flex justify-center items-center text-3xl text-[#4338ca] shadow-xs">
            <i className="fa-solid fa-right-from-bracket"></i>
          </div>
        </div>

        {/* Occupancy Rate (Purple Card) */}
        <div className="bg-[#4338ca] text-white rounded-[22px] p-7 shadow-lg shadow-indigo-100 flex flex-col justify-between relative overflow-hidden">
          <div>
            <p className="text-indigo-200 font-medium text-sm">Occupancy Rate</p>
            <h2 className="text-4xl lg:text-[44px] font-extrabold my-1.5">
              {occupancyPercentage}%
            </h2>
          </div>
          <div className="w-full h-2.5 bg-white/30 rounded-full mt-4 overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${occupancyPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Record Details Modal */}
      <RecordDetailsModal
        isOpen={Boolean(selectedRecord)}
        onClose={() => setSelectedRecord(null)}
        record={selectedRecord}
      />
    </div>
  );
}
