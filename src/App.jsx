import React from 'react';
import { ParkingProvider, useParking } from './context/ParkingContext.jsx';
import Sidebar from './components/Sidebar.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import VehicleEntryPage from './pages/VehicleEntryPage.jsx';
import VehicleExitPage from './pages/VehicleExitPage.jsx';
import SlotManagementPage from './pages/SlotManagementPage.jsx';
import ParkingHistoryPage from './pages/ParkingHistoryPage.jsx';

function ToastContainer() {
  const { toasts } = useParking();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-sm font-semibold transition-all duration-300 animate-in slide-in-from-bottom-5 ${
            toast.type === 'success'
              ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
              : toast.type === 'error'
              ? 'bg-rose-900 text-rose-100 border-rose-700'
              : 'bg-indigo-900 text-indigo-100 border-indigo-700'
          }`}
        >
          <i
            className={`text-base ${
              toast.type === 'success'
                ? 'fa-solid fa-circle-check text-emerald-400'
                : toast.type === 'error'
                ? 'fa-solid fa-circle-exclamation text-rose-400'
                : 'fa-solid fa-circle-info text-indigo-400'
            }`}
          ></i>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}

function MainLayout() {
  const { currentPage, isAuthenticated } = useParking();

  if (!isAuthenticated || currentPage === 'login') {
    return (
      <>
        <LoginPage />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f5f4fb]">
      <Sidebar />
      <main className="flex-1 md:ml-[270px] lg:ml-[280px] min-h-screen flex flex-col">
        {currentPage === 'dashboard' && <DashboardPage />}
        {currentPage === 'new_entry' && <VehicleEntryPage />}
        {currentPage === 'exit' && <VehicleExitPage />}
        {currentPage === 'slot_mange' && <SlotManagementPage />}
        {currentPage === 'history' && <ParkingHistoryPage />}
      </main>
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <ParkingProvider>
      <MainLayout />
    </ParkingProvider>
  );
}
