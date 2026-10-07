import React from 'react';
import { useParking } from '../context/ParkingContext.jsx';

export default function Sidebar() {
  const { currentPage, setCurrentPage, user, logout, lastSynced, refreshData, loading } = useParking();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-solid fa-table-columns' },
    { id: 'new_entry', label: 'Vehicle Entry', icon: 'fa-solid fa-right-to-bracket' },
    { id: 'exit', label: 'Vehicle Exit', icon: 'fa-solid fa-right-from-bracket' },
    { id: 'slot_mange', label: 'Slot Management', icon: 'fa-solid fa-square-parking' },
    { id: 'history', label: 'History', icon: 'fa-solid fa-clock-rotate-left' },
  ];

  return (
    <aside className="w-full md:w-[270px] lg:w-[280px] bg-white border-r border-gray-200 md:fixed top-0 left-0 md:h-screen p-5 md:p-6 flex flex-col justify-between z-40 shrink-0">
      <div>
        {/* Logo */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-[50px] h-[50px] bg-[#4338ca] text-white rounded-[14px] flex justify-center items-center text-2xl font-bold italic shadow-md shadow-indigo-100">
            P
          </div>
          <div>
            <h2 className="text-[#4338ca] font-extrabold text-[22px] leading-tight">ParkControl</h2>
            <p className="text-gray-400 text-xs tracking-wider uppercase font-medium mt-0.5">System Operator</p>
          </div>
        </div>

        {/* Live Supabase Connection Badge + Manual Sync Trigger */}
        <div className="mb-6 px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
              Supabase Live
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-emerald-600 font-medium">
              {lastSynced ? lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}
            </span>
            <button
              onClick={() => refreshData()}
              title="Refresh from Supabase"
              className="text-emerald-700 hover:text-emerald-900 p-1 rounded-md transition cursor-pointer"
            >
              <i className={`fa-solid fa-arrows-rotate text-[11px] ${loading ? 'animate-spin' : ''}`}></i>
            </button>
          </div>
        </div>

        {/* Menu Navigation */}
        <nav className="flex flex-col gap-2.5">
          {menuItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`flex items-center gap-3.5 w-full text-left px-4 py-3.5 rounded-2xl text-[16px] font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#5b5ce9] text-white shadow-md shadow-indigo-200 font-semibold'
                    : 'text-gray-600 hover:bg-[#f5f4fb] hover:text-[#4338ca]'
                }`}
              >
                <i className={`${item.icon} text-[18px] w-6 text-center ${isActive ? 'text-white' : 'text-gray-500'}`}></i>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Admin Profile Box */}
      <div className="mt-8 pt-4 border-t border-gray-100">
        <div className="bg-[#f5f4fb] p-3.5 rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#4f46e5] text-white flex items-center justify-center text-lg font-bold shadow-inner">
              <i className="fa-solid fa-user"></i>
            </div>
            <div>
              <strong className="block text-[15px] text-gray-800 leading-tight font-bold">{user?.name || 'Admin'}</strong>
              <p className="text-gray-500 text-xs mt-0.5">ID : #{user?.id || '40922'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="text-gray-400 hover:text-red-500 p-2 rounded-lg transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-arrow-right-from-bracket text-sm"></i>
          </button>
        </div>
      </div>
    </aside>
  );
}
