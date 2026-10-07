import React from 'react';
import { ParkingProvider, useParking } from './context/ParkingContext.jsx';
import Sidebar from './components/Sidebar.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import VehicleEntryPage from './pages/VehicleEntryPage.jsx';
import VehicleExitPage from './pages/VehicleExitPage.jsx';
import SlotManagementPage from './pages/SlotManagementPage.jsx';
import ParkingHistoryPage from './pages/ParkingHistoryPage.jsx';

function MainLayout() {
  const { currentPage, isAuthenticated } = useParking();

  if (!isAuthenticated || currentPage === 'login') {
    return <LoginPage />;
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
