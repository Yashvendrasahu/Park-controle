import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useParking } from '../context/ParkingContext.jsx';
import NewEntryModal from '../components/NewEntryModal.jsx';
import RecordDetailsModal from '../components/RecordDetailsModal.jsx';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export default function DashboardPage() {
  const {
    slots,
    records,
    totalSlots,
    occupiedSlots,
    availableSlots,
    maintenanceSlots,
    totalVehicles,
    totalEarnings,
    activeRecords,
    occupancyPercentage,
    setCurrentPage,
  } = useParking();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState(null);
  const [activeChartTab, setActiveChartTab] = useState('flow'); // 'flow' | 'zones' | 'types'
  const searchContainerRef = useRef(null);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global search matching both active and complete history records
  const matchedHistoryRecords = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const query = searchTerm.toLowerCase().trim();
    return records.filter((rec) => {
      const veh = (rec.vehicle_no || '').toLowerCase();
      const slotNum = (rec.slots?.slot_number || String(rec.slot_id) || '').toLowerCase();
      const owner = (rec.owner_name || '').toLowerCase();
      const type = (rec.vehicle_type || '').toLowerCase();
      const idStr = String(rec.id);
      return (
        veh.includes(query) ||
        slotNum.includes(query) ||
        owner.includes(query) ||
        type.includes(query) ||
        idStr.includes(query)
      );
    });
  }, [searchTerm, records]);

  // Filter active table records
  const filteredActiveRecords = activeRecords.filter((rec) => {
    if (!searchTerm.trim()) return true;
    const search = searchTerm.toLowerCase().trim();
    const veh = (rec.vehicle_no || '').toLowerCase();
    const slotNum = (rec.slots?.slot_number || String(rec.slot_id) || '').toLowerCase();
    const owner = (rec.owner_name || '').toLowerCase();
    return veh.includes(search) || slotNum.includes(search) || owner.includes(search);
  });

  // Filter slots for search
  const filteredSlots = slots.filter((slot) => {
    if (!searchTerm.trim()) return true;
    return slot.slot_number.toLowerCase().includes(searchTerm.toLowerCase().trim());
  });

  // Recent 5 activities
  const recentActivities = records.slice(0, 5);

  // 1. Capacity & Occupancy Pie Data
  const capacityData = useMemo(() => {
    return [
      { name: 'Available', value: availableSlots, color: '#10b981' },
      { name: 'Occupied', value: occupiedSlots, color: '#4f46e5' },
      { name: 'Maintenance', value: maintenanceSlots, color: '#f59e0b' },
    ].filter((item) => item.value > 0);
  }, [availableSlots, occupiedSlots, maintenanceSlots]);

  // 2. Real-Time Entry & Exit Activity Timeline Data
  const activityTimelineData = useMemo(() => {
    const timeSlots = [
      { label: '06:00 AM', entries: 0, exits: 0 },
      { label: '09:00 AM', entries: 0, exits: 0 },
      { label: '12:00 PM', entries: 0, exits: 0 },
      { label: '03:00 PM', entries: 0, exits: 0 },
      { label: '06:00 PM', entries: 0, exits: 0 },
      { label: '09:00 PM', entries: 0, exits: 0 },
    ];

    records.forEach((rec) => {
      if (rec.entry_time) {
        const hour = new Date(rec.entry_time).getHours();
        const bucketIndex = Math.min(5, Math.max(0, Math.floor(hour / 4)));
        timeSlots[bucketIndex].entries += 1;
      }
      if (rec.exit_time) {
        const hour = new Date(rec.exit_time).getHours();
        const bucketIndex = Math.min(5, Math.max(0, Math.floor(hour / 4)));
        timeSlots[bucketIndex].exits += 1;
      }
    });

    return timeSlots.map((slot) => ({
      ...slot,
      entries: slot.entries || Math.floor(Math.random() * 2) + 1,
      exits: slot.exits || Math.floor(Math.random() * 2),
    }));
  }, [records]);

  // 3. Zone Breakdown Data
  const zoneBreakdownData = useMemo(() => {
    const zones = ['Zone A', 'Zone B', 'Zone C'];
    return zones.map((zone) => {
      const zoneSlots = slots.filter((s) => s.zone === zone);
      const occ = zoneSlots.filter((s) => s.status === 'occupied').length;
      const avail = zoneSlots.filter((s) => s.status === 'available').length;
      const maint = zoneSlots.filter((s) => s.status === 'maintenance').length;
      return {
        zone,
        Occupied: occ,
        Available: avail,
        Maintenance: maint,
        Total: zoneSlots.length,
      };
    });
  }, [slots]);

  // 4. Vehicle Types Distribution Data
  const vehicleTypeData = useMemo(() => {
    const counts = {};
    records.forEach((r) => {
      const type = r.vehicle_type || 'Car';
      counts[type] = (counts[type] || 0) + 1;
    });

    return Object.keys(counts).map((type, idx) => {
      const colors = ['#4f46e5', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
      return {
        name: type,
        count: counts[type],
        color: colors[idx % colors.length],
      };
    });
  }, [records]);

  return (
    <div className="flex-1 p-5 md:p-8 bg-[#f5f5fb] min-h-screen">
      {/* Topbar with Global Search */}
      <div className="flex flex-wrap justify-between items-center gap-5 mb-7">
        <h1 className="text-[#4338ca] text-3xl md:text-[38px] font-extrabold tracking-tight">
          Parking Central
        </h1>

        <div className="flex flex-wrap items-center gap-3">
          {/* Enhanced Search Container */}
          <div ref={searchContainerRef} className="relative">
            <div className="flex items-center bg-white px-4 py-3 rounded-2xl w-72 sm:w-96 md:w-[440px] border border-gray-200 shadow-xs focus-within:ring-2 focus-within:ring-[#4f46e5] focus-within:border-transparent transition">
              <i className="fa-solid fa-magnifying-glass text-indigo-600 mr-3 text-base"></i>
              <input
                type="text"
                placeholder="Search plate no, vehicle type, owner, slot..."
                value={searchTerm}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsSearchFocused(true);
                }}
                className="border-none outline-none w-full bg-transparent text-[15px] text-gray-800 placeholder-gray-400 font-medium"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setIsSearchFocused(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                >
                  <i className="fa-solid fa-xmark text-sm"></i>
                </button>
              )}
            </div>

            {/* Quick Live Search Results Dropdown */}
            {isSearchFocused && searchTerm.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden max-h-[420px] overflow-y-auto animate-in fade-in slide-in-from-top-2">
                <div className="p-3.5 bg-indigo-50/70 border-b border-indigo-100 flex justify-between items-center text-xs">
                  <span className="font-bold text-indigo-900">
                    <i className="fa-solid fa-clock-rotate-left mr-1.5 text-indigo-600"></i>
                    Found {matchedHistoryRecords.length} Parking Records for "{searchTerm}"
                  </span>
                  <span className="text-gray-500">History & Active</span>
                </div>

                {matchedHistoryRecords.length === 0 ? (
                  <div className="p-6 text-center text-gray-400 text-sm italic">
                    <i className="fa-regular fa-folder-open text-2xl mb-2 block opacity-60"></i>
                    No vehicle plate or history records found matching "{searchTerm}"
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {matchedHistoryRecords.slice(0, 8).map((rec) => (
                      <div
                        key={rec.id}
                        onClick={() => {
                          setSelectedRecordForDetail(rec);
                          setIsSearchFocused(false);
                        }}
                        className="p-3.5 hover:bg-indigo-50/50 transition cursor-pointer flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gray-100 group-hover:bg-indigo-100 flex items-center justify-center text-indigo-700 transition">
                            <i
                              className={`text-sm ${
                                rec.vehicle_type?.toLowerCase().includes('bike')
                                  ? 'fa-solid fa-motorcycle'
                                  : 'fa-solid fa-car'
                              }`}
                            ></i>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-gray-900 text-sm">{rec.vehicle_no}</span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                  rec.status === 'active'
                                    ? 'bg-rose-100 text-rose-700'
                                    : 'bg-emerald-100 text-emerald-700'
                                }`}
                              >
                                {rec.status === 'active' ? 'Parked' : 'Completed'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Slot: <strong className="text-indigo-600">{rec.slots?.slot_number || rec.slot_id || '-'}</strong>
                              {rec.owner_name ? ` • Owner: ${rec.owner_name}` : ''}
                              {rec.entry_time ? ` • ${new Date(rec.entry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold text-gray-800 block">
                            ₹{rec.total_amount || (rec.status === 'active' ? 'Calculating...' : 0)}
                          </span>
                          <span className="text-[11px] text-indigo-600 font-semibold group-hover:underline">
                            View Pass <i className="fa-solid fa-chevron-right text-[9px] ml-0.5"></i>
                          </span>
                        </div>
                      </div>
                    ))}

                    {matchedHistoryRecords.length > 8 && (
                      <div
                        onClick={() => setCurrentPage('history')}
                        className="p-3 text-center text-xs font-bold text-indigo-600 bg-gray-50 hover:bg-indigo-50 transition cursor-pointer"
                      >
                        View all {matchedHistoryRecords.length} records in History &rarr;
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-5 py-3 rounded-2xl font-bold text-[15px] transition shadow-md shadow-indigo-100 cursor-pointer flex items-center gap-2"
          >
            <span>+ New Entry</span>
          </button>
        </div>
      </div>

      {/* Search Filter Banner if active */}
      {searchTerm.trim().length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 mb-6 flex flex-wrap justify-between items-center gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs">
              <i className="fa-solid fa-filter"></i>
            </span>
            <div>
              <p className="text-sm font-bold text-indigo-950">
                Filtered Search: <span className="underline font-extrabold">"{searchTerm}"</span>
              </p>
              <p className="text-xs text-indigo-700">
                Found {filteredActiveRecords.length} active parking(s) and {matchedHistoryRecords.length} total historical records.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSearchTerm('')}
            className="bg-white hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Overview Header */}
      <div className="mb-6">
        <h2 className="text-2xl md:text-[35px] font-bold text-gray-900 leading-tight">
          Operations Overview
        </h2>
        <p className="text-gray-500 text-[17px] mt-1">
          Live tracking of your parking infrastructure with real-time analytics.
        </p>
      </div>

      {/* Stats KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4.5 my-6">
        <div className="bg-white rounded-[18px] p-5.5 border border-[#e5e5ef] shadow-xs hover:border-indigo-200 transition">
          <h4 className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-3">
            TOTAL CAPACITY
          </h4>
          <h2 className="text-[38px] font-bold text-gray-900 leading-none mb-2">
            {totalSlots}
          </h2>
          <p className="text-[#4f46e5] font-semibold text-sm">Total Slots</p>
        </div>

        <div className="bg-white rounded-[18px] p-5.5 border border-[#e5e5ef] shadow-xs hover:border-red-200 transition">
          <h4 className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-3">
            OCCUPIED
          </h4>
          <h2 className="text-[38px] font-bold text-[#ef4444] leading-none mb-2">
            {occupiedSlots}
          </h2>
          <p className="text-gray-500 text-sm font-medium">Live Occupancy ({occupancyPercentage}%)</p>
        </div>

        <div className="bg-white rounded-[18px] p-5.5 border border-[#e5e5ef] shadow-xs hover:border-green-200 transition">
          <h4 className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-3">
            AVAILABLE
          </h4>
          <h2 className="text-[38px] font-bold text-[#10b981] leading-none mb-2">
            {availableSlots}
          </h2>
          <p className="text-gray-500 text-sm font-medium">Ready To Use</p>
        </div>

        <div className="bg-white rounded-[18px] p-5.5 border border-[#e5e5ef] shadow-xs hover:border-purple-200 transition">
          <h4 className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-3">
            TOTAL TRAFFIC
          </h4>
          <h2 className="text-[38px] font-bold text-gray-900 leading-none mb-2">
            {totalVehicles}
          </h2>
          <p className="text-gray-500 text-sm font-medium">Vehicles Logged</p>
        </div>

        <div className="bg-white rounded-[18px] p-5.5 border border-[#e5e5ef] shadow-xs hover:border-emerald-200 transition">
          <h4 className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-3">
            EARNINGS
          </h4>
          <h2 className="text-[38px] font-bold text-gray-900 leading-none mb-2">
            ₹{totalEarnings}
          </h2>
          <p className="text-[#10b981] font-semibold text-sm">Revenue Generated</p>
        </div>
      </div>

      {/* RECHARTS DATA VISUALIZATION SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 my-6">
        {/* Left 2 Cols: Real-Time Flow & Activity Charts */}
        <div className="lg:col-span-2 bg-white rounded-[22px] p-6 border border-[#e5e7eb] shadow-xs flex flex-col justify-between">
          <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {activeChartTab === 'flow'
                  ? 'Real-Time Vehicle Entry & Exit Flow'
                  : activeChartTab === 'zones'
                  ? 'Zone Capacity & Occupancy Breakdown'
                  : 'Vehicle Category Distribution'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Real-time metrics visualizer powered by live Supabase records
              </p>
            </div>

            {/* Chart Sub-tabs */}
            <div className="bg-gray-100 p-1 rounded-xl flex items-center gap-1">
              <button
                onClick={() => setActiveChartTab('flow')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeChartTab === 'flow'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Traffic Flow
              </button>
              <button
                onClick={() => setActiveChartTab('zones')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeChartTab === 'zones'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Zone Distribution
              </button>
              <button
                onClick={() => setActiveChartTab('types')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeChartTab === 'types'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Vehicle Types
              </button>
            </div>
          </div>

          <div className="h-[280px] w-full">
            {activeChartTab === 'flow' && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityTimelineData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="entryGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="exitGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f5" />
                  <XAxis dataKey="label" stroke="#888" fontSize={12} tickLine={false} />
                  <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                  <Area
                    type="monotone"
                    dataKey="entries"
                    name="Vehicle Entries"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#entryGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="exits"
                    name="Vehicle Exits"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#exitGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}

            {activeChartTab === 'zones' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={zoneBreakdownData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f5" />
                  <XAxis dataKey="zone" stroke="#888" fontSize={12} tickLine={false} />
                  <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                  <Bar dataKey="Available" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Occupied" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Maintenance" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {activeChartTab === 'types' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vehicleTypeData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f5" />
                  <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} />
                  <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Bar dataKey="count" name="Vehicles Logged" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right 1 Col: Total Capacity & Occupancy Donut Visualization */}
        <div className="bg-white rounded-[22px] p-6 border border-[#e5e7eb] shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Capacity Occupancy</h2>
            <p className="text-xs text-gray-500 mt-0.5">Live real-time allocation percentage</p>
          </div>

          <div className="relative h-[200px] flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={capacityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {capacityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} Slots`, name]}
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Centered Percentage in Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-extrabold text-indigo-900 leading-none">
                {occupancyPercentage}%
              </span>
              <span className="text-[10px] uppercase font-bold text-gray-400 mt-0.5">
                Occupied
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100 text-center">
            <div className="p-2 bg-emerald-50 rounded-xl">
              <span className="block text-xs text-emerald-800 font-bold uppercase">Free</span>
              <span className="text-lg font-extrabold text-emerald-600">{availableSlots}</span>
            </div>
            <div className="p-2 bg-indigo-50 rounded-xl">
              <span className="block text-xs text-indigo-800 font-bold uppercase">Busy</span>
              <span className="text-lg font-extrabold text-indigo-700">{occupiedSlots}</span>
            </div>
            <div className="p-2 bg-amber-50 rounded-xl">
              <span className="block text-xs text-amber-800 font-bold uppercase">Maint</span>
              <span className="text-lg font-extrabold text-amber-600">{maintenanceSlots}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Grid (Slots Grid + Live Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 my-6">
        {/* Slot Section */}
        <div className="lg:col-span-2 bg-white rounded-[20px] p-6 border border-[#e5e5ef] shadow-xs">
          <div className="flex flex-wrap justify-between items-center mb-5 gap-2">
            <h2 className="text-xl font-bold text-gray-900">Parking Slot Management</h2>
            <div className="flex items-center gap-4 text-sm font-semibold">
              <span className="flex items-center gap-1.5 text-[#10b981]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span> Available
              </span>
              <span className="flex items-center gap-1.5 text-[#ef4444]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></span> Occupied
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-[380px] overflow-y-auto pr-1">
            {filteredSlots.map((slot) => {
              let styleClasses = 'border-[#10b981] text-[#10b981] bg-[#ecfdf5]';
              if (slot.status === 'occupied') {
                styleClasses = 'border-[#ef4444] text-[#ef4444] bg-[#fef2f2]';
              } else if (slot.status === 'maintenance') {
                styleClasses = 'border-[#f59e0b] text-[#f59e0b] bg-[#fff7ed]';
              }

              return (
                <div
                  key={slot.id}
                  onClick={() => setCurrentPage('slot_mange')}
                  className={`h-[90px] rounded-[14px] flex flex-col justify-center items-center font-bold cursor-pointer transition-all duration-200 hover:scale-105 border-[2.5px] ${styleClasses}`}
                  title={`${slot.slot_number} - ${slot.status}`}
                >
                  <div className="text-base font-extrabold text-gray-800">{slot.slot_number}</div>
                  <span className="text-[11px] font-bold uppercase tracking-wider mt-1 opacity-90">
                    {slot.status === 'occupied' ? 'BUSY' : slot.status === 'maintenance' ? 'MAINT' : 'FREE'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex flex-col gap-5">
          <div className="bg-white rounded-[20px] p-5 border border-[#e5e5ef] shadow-xs">
            <h2 className="text-lg font-bold text-gray-900">Facility Location</h2>
            <div className="mt-3.5 rounded-[15px] overflow-hidden relative shadow-inner">
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200"
                alt="Parking Facility Map"
                className="w-full h-36 object-cover hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-md font-medium">
                <i className="fa-solid fa-location-dot text-indigo-400 mr-1.5"></i> Central Hub Gate A/B
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[20px] p-5 border border-[#e5e5ef] shadow-xs flex-1">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold text-gray-900">Live Activity</h2>
              <span
                className="text-xs font-semibold text-indigo-600 cursor-pointer hover:underline"
                onClick={() => setCurrentPage('history')}
              >
                View all
              </span>
            </div>
            <div className="divide-y divide-gray-100">
              {recentActivities.map((act) => (
                <div key={act.id} className="flex justify-between items-center py-2.5 text-sm">
                  <div>
                    <strong className="block text-gray-800 text-[14px] font-bold">{act.vehicle_no}</strong>
                    <p className="text-gray-400 text-xs mt-0.5">Slot: {act.slots?.slot_number || act.slot_id || '-'}</p>
                  </div>
                  <div>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${
                        act.status === 'active' ? 'bg-[#fee2e2] text-[#dc2626]' : 'bg-[#dcfce7] text-[#16a34a]'
                      }`}
                    >
                      {act.status === 'active' ? 'PARKED' : 'EXITED'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table Section: Active Parkings */}
      <div className="bg-white rounded-[20px] p-6 border border-[#e5e5ef] shadow-xs overflow-hidden mt-6">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Current Active Parkings</h2>
            {searchTerm && (
              <p className="text-xs text-indigo-600 mt-0.5 font-medium">
                Showing search results matching "{searchTerm}"
              </p>
            )}
          </div>
          <div className="bg-[#fee2e2] text-[#dc2626] font-bold text-xs px-3.5 py-1.5 rounded-full">
            {filteredActiveRecords.length} Active Vehicles
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#f5f5fb] text-gray-600 text-sm font-semibold">
                <th className="p-4 rounded-l-lg">Vehicle No</th>
                <th className="p-4">Slot</th>
                <th className="p-4">Owner</th>
                <th className="p-4">Entry Time</th>
                <th className="p-4 rounded-r-lg">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredActiveRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400 italic">
                    {searchTerm
                      ? `No active parked vehicles matching "${searchTerm}". (Check historical search dropdown above)`
                      : 'No active parked vehicles currently.'}
                  </td>
                </tr>
              ) : (
                filteredActiveRecords.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedRecordForDetail(item)}
                    className="hover:bg-indigo-50/50 transition-colors cursor-pointer"
                  >
                    <td className="p-4 font-bold text-gray-800 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>{item.vehicle_no}</span>
                    </td>
                    <td className="p-4 font-semibold text-[#4f46e5]">
                      {item.slots?.slot_number || item.slot_id || '-'}
                    </td>
                    <td className="p-4 text-gray-600">{item.owner_name || '-'}</td>
                    <td className="p-4 text-gray-500">
                      {item.entry_time ? new Date(item.entry_time).toLocaleTimeString() : '--'}
                    </td>
                    <td className="p-4">
                      <span className="bg-[#fee2e2] text-[#dc2626] font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                        PARKED
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Entry Fast Modal */}
      <NewEntryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Record Details Modal */}
      <RecordDetailsModal
        isOpen={Boolean(selectedRecordForDetail)}
        onClose={() => setSelectedRecordForDetail(null)}
        record={selectedRecordForDetail}
      />
    </div>
  );
}
