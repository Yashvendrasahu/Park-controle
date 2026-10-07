import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, INITIAL_SLOTS, INITIAL_RECORDS } from '../lib/supabase.js';

const ParkingContext = createContext(null);

export const ParkingProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [preselectedSlotId, setPreselectedSlotId] = useState(null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('parkcontrol_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('parkcontrol_auth') === 'true';
  });

  const [rates, setRates] = useState(() => {
    const saved = localStorage.getItem('parkcontrol_rates');
    return saved ? JSON.parse(saved) : { standard: 40, bike: 20, ev: 75, handicap: 20 };
  });

  const [slots, setSlots] = useState(() => {
    const cached = localStorage.getItem('parkcontrol_slots');
    return cached ? JSON.parse(cached) : INITIAL_SLOTS;
  });

  const [records, setRecords] = useState(() => {
    const cached = localStorage.getItem('parkcontrol_records');
    return cached ? JSON.parse(cached) : INITIAL_RECORDS;
  });

  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState(true);
  const [lastSynced, setLastSynced] = useState(new Date());

  // Toast Helper
  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const updateRates = (newRates) => {
    setRates(newRates);
    localStorage.setItem('parkcontrol_rates', JSON.stringify(newRates));
    showToast('Parking tariff rates updated!', 'success');
  };

  // Check Supabase Auth State
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!error && session?.user) {
        const u = {
          email: session.user.email,
          id: session.user.id.slice(0, 5) || '40922',
          name: session.user.email.split('@')[0],
        };
        setUser(u);
        setIsAuthenticated(true);
        localStorage.setItem('parkcontrol_user', JSON.stringify(u));
        localStorage.setItem('parkcontrol_auth', 'true');
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = {
          email: session.user.email,
          id: session.user.id.slice(0, 5) || '40922',
          name: session.user.email.split('@')[0],
        };
        setUser(u);
        setIsAuthenticated(true);
        localStorage.setItem('parkcontrol_user', JSON.stringify(u));
        localStorage.setItem('parkcontrol_auth', 'true');
      } else {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('parkcontrol_auth');
        localStorage.removeItem('parkcontrol_user');
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('parkcontrol_slots', JSON.stringify(slots));
  }, [slots]);

  useEffect(() => {
    localStorage.setItem('parkcontrol_records', JSON.stringify(records));
  }, [records]);

  // Seed Supabase if slots table is empty
  const seedSupabaseIfEmpty = async () => {
    try {
      const { data, error } = await supabase.from('slots').select('id').limit(1);
      if (!error && (!data || data.length === 0)) {
        const slotsToInsert = INITIAL_SLOTS.map((s) => ({
          slot_number: s.slot_number,
          zone: s.zone,
          floor: s.floor,
          slot_type: s.slot_type,
          status: s.status,
        }));
        await supabase.from('slots').insert(slotsToInsert);
      }
    } catch (e) {
      console.warn('Seeding note:', e);
    }
  };

  // Resilient Multi-Tier Supabase Fetcher
  const fetchSupabaseData = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Fetch Slots
      const { data: dbSlots, error: slotErr } = await supabase
        .from('slots')
        .select('*')
        .order('slot_number', { ascending: true });

      let currentSlots = slots;
      if (!slotErr && dbSlots && dbSlots.length > 0) {
        currentSlots = dbSlots;
        setSlots(dbSlots);
        setSupabaseConnected(true);
      } else if (!slotErr && (!dbSlots || dbSlots.length === 0)) {
        await seedSupabaseIfEmpty();
      }

      // 2. Fetch Records with fallback mapping
      const { data: joinedRecords, error: joinErr } = await supabase
        .from('parking_records')
        .select('*, slots(slot_number)')
        .order('id', { ascending: false });

      if (!joinErr && joinedRecords && joinedRecords.length > 0) {
        setRecords(joinedRecords);
        setSupabaseConnected(true);
      } else {
        const { data: flatRecords, error: flatErr } = await supabase
          .from('parking_records')
          .select('*')
          .order('id', { ascending: false });

        if (!flatErr && flatRecords && flatRecords.length > 0) {
          const mappedRecords = flatRecords.map((rec) => {
            const foundSlot = currentSlots.find((s) => s.id === rec.slot_id);
            return {
              ...rec,
              slots: {
                slot_number: foundSlot ? foundSlot.slot_number : `Slot ${rec.slot_id}`,
              },
            };
          });
          setRecords(mappedRecords);
          setSupabaseConnected(true);
        }
      }

      setLastSynced(new Date());
    } catch (err) {
      console.warn('Supabase fetch note:', err);
    } finally {
      setLoading(false);
    }
  }, [slots]);

  // Realtime subscription
  useEffect(() => {
    fetchSupabaseData();

    let channel;
    try {
      channel = supabase
        .channel('parking-realtime-all')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'parking_records' },
          () => {
            fetchSupabaseData();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'slots' },
          () => {
            fetchSupabaseData();
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setSupabaseConnected(true);
          }
        });
    } catch (e) {
      console.warn('Realtime channel warning:', e);
    }

    const interval = setInterval(() => {
      fetchSupabaseData();
    }, 10000);

    return () => {
      clearInterval(interval);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchSupabaseData]);

  // STRICT SUPABASE LOGIN
  const login = async (email, password) => {
    try {
      if (!email || !password) {
        return { success: false, error: 'Please enter both email and password' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data?.user) {
        return { success: false, error: 'User could not be authenticated' };
      }

      const loggedUser = {
        email: data.user.email,
        id: data.user.id.slice(0, 5) || '40922',
        name: data.user.email.split('@')[0],
      };

      setUser(loggedUser);
      setIsAuthenticated(true);
      localStorage.setItem('parkcontrol_user', JSON.stringify(loggedUser));
      localStorage.setItem('parkcontrol_auth', 'true');
      showToast(`Welcome back, ${loggedUser.name}!`, 'success');
      return { success: true, user: loggedUser };
    } catch (err) {
      return { success: false, error: err.message || 'Authentication failed' };
    }
  };

  // LOGOUT
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    localStorage.removeItem('parkcontrol_auth');
    localStorage.removeItem('parkcontrol_user');
    setIsAuthenticated(false);
    setUser(null);
    setCurrentPage('login');
    showToast('Logged out successfully', 'info');
  };

  // Dynamic Add Vehicle Entry
  const addVehicle = async ({ vehicleNo, vehicleType, ownerName, slotId }) => {
    const numericSlotId = Number(slotId);
    const assignedSlot = slots.find((s) => s.id === numericSlotId || s.id === slotId);
    const slotNumber = assignedSlot ? assignedSlot.slot_number : 'A-100';

    const optimisticRecord = {
      id: Date.now(),
      vehicle_no: vehicleNo.toUpperCase().trim(),
      vehicle_type: vehicleType,
      owner_name: ownerName || '',
      slot_id: numericSlotId,
      entry_time: new Date().toISOString(),
      exit_time: null,
      total_minutes: 0,
      total_amount: 0,
      status: 'active',
      payment_status: 'unpaid',
      slots: { slot_number: slotNumber },
    };

    setRecords((prev) => [optimisticRecord, ...prev]);
    setSlots((prev) =>
      prev.map((s) => (s.id === numericSlotId || s.id === slotId ? { ...s, status: 'occupied' } : s))
    );

    showToast(`Vehicle ${optimisticRecord.vehicle_no} assigned to Slot ${slotNumber}!`, 'success');

    // Sync to Supabase DB
    try {
      const { data: insertedRecord, error: insertErr } = await supabase
        .from('parking_records')
        .insert([
          {
            vehicle_no: optimisticRecord.vehicle_no,
            vehicle_type: optimisticRecord.vehicle_type,
            owner_name: optimisticRecord.owner_name,
            slot_id: numericSlotId,
            status: 'active',
            payment_status: 'unpaid',
          },
        ])
        .select('*')
        .single();

      if (!insertErr && insertedRecord) {
        const fullRec = { ...insertedRecord, slots: { slot_number: slotNumber } };
        setRecords((prev) =>
          prev.map((r) => (r.id === optimisticRecord.id ? fullRec : r))
        );
        await supabase.from('slots').update({ status: 'occupied' }).eq('id', numericSlotId);
        return { success: true, record: fullRec };
      }

      await supabase.from('slots').update({ status: 'occupied' }).eq('id', numericSlotId);
    } catch (e) {
      console.warn('Supabase insert note:', e);
    }

    return { success: true, record: optimisticRecord };
  };

  // Dynamic Confirm Vehicle Exit & Fee Settlement
  const exitVehicle = async ({ recordId, slotId, totalMinutes, totalAmount }) => {
    const exitTime = new Date().toISOString();

    setRecords((prev) =>
      prev.map((r) =>
        r.id === recordId || r.id === Number(recordId)
          ? {
              ...r,
              exit_time: exitTime,
              total_minutes: totalMinutes,
              total_amount: totalAmount,
              payment_status: 'paid',
              status: 'completed',
            }
          : r
      )
    );

    if (slotId) {
      setSlots((prev) =>
        prev.map((s) => (s.id === slotId || s.id === Number(slotId) ? { ...s, status: 'available' } : s))
      );
    }

    showToast(`Payment of ₹${totalAmount} settled & vehicle exited!`, 'success');

    // Direct Supabase Update
    try {
      await supabase
        .from('parking_records')
        .update({
          exit_time: exitTime,
          total_minutes: totalMinutes,
          total_amount: totalAmount,
          payment_status: 'paid',
          status: 'completed',
        })
        .eq('id', recordId);

      if (slotId) {
        await supabase.from('slots').update({ status: 'available' }).eq('id', slotId);
      }
    } catch (e) {
      console.warn('Supabase exit note:', e);
    }

    return { success: true };
  };

  // Dynamic Release Slot
  const releaseSlot = async (slotId) => {
    const numericSlotId = Number(slotId);
    const activeRec = records.find((r) => r.slot_id === numericSlotId && r.status === 'active');

    setSlots((prev) =>
      prev.map((s) => (s.id === numericSlotId ? { ...s, status: 'available' } : s))
    );

    if (activeRec) {
      const exitTime = new Date().toISOString();
      const diffMs = Date.now() - new Date(activeRec.entry_time).getTime();
      const mins = Math.max(1, Math.floor(diffMs / 60000));
      const rate = activeRec.vehicle_type?.toLowerCase().includes('bike') ? 1 : 2;
      const amount = mins * rate;

      setRecords((prev) =>
        prev.map((r) =>
          r.id === activeRec.id
            ? {
                ...r,
                exit_time: exitTime,
                total_minutes: mins,
                total_amount: amount,
                payment_status: 'paid',
                status: 'completed',
              }
            : r
        )
      );

      try {
        await supabase
          .from('parking_records')
          .update({
            exit_time: exitTime,
            total_minutes: mins,
            total_amount: amount,
            status: 'completed',
            payment_status: 'paid',
          })
          .eq('id', activeRec.id);
      } catch (e) {}
    }

    try {
      await supabase.from('slots').update({ status: 'available' }).eq('id', numericSlotId);
    } catch (e) {}

    showToast('Slot released successfully!', 'success');
  };

  // Dynamic Toggle Maintenance
  const toggleMaintenance = async (slotId) => {
    const numericSlotId = Number(slotId);
    let newStatus = 'maintenance';
    const targetSlot = slots.find((s) => s.id === numericSlotId);
    if (targetSlot) {
      newStatus = targetSlot.status === 'maintenance' ? 'available' : 'maintenance';
    }

    setSlots((prev) =>
      prev.map((s) => (s.id === numericSlotId ? { ...s, status: newStatus } : s))
    );

    try {
      await supabase.from('slots').update({ status: newStatus }).eq('id', numericSlotId);
    } catch (e) {}

    showToast(`Slot status changed to ${newStatus}`, 'info');
    return newStatus;
  };

  // Dynamic Add New Slot
  const addSlot = async ({ slotNumber, zone, floor, slotType }) => {
    const newSlot = {
      slot_number: slotNumber.toUpperCase().trim(),
      zone: zone || 'Zone A',
      floor: floor || 'Ground',
      slot_type: slotType || 'Standard',
      status: 'available',
    };

    try {
      const { data, error } = await supabase
        .from('slots')
        .insert([newSlot])
        .select()
        .single();

      if (!error && data) {
        setSlots((prev) => [...prev, data]);
      } else {
        setSlots((prev) => [...prev, { ...newSlot, id: Date.now() }]);
      }
    } catch (e) {
      setSlots((prev) => [...prev, { ...newSlot, id: Date.now() }]);
    }

    showToast(`New Slot ${newSlot.slot_number} added!`, 'success');
    return { success: true };
  };

  // Dynamic Reset Zone Slots
  const resetZoneSlots = async (zone) => {
    setSlots((prev) =>
      prev.map((s) => (s.zone === zone ? { ...s, status: 'available' } : s))
    );
    try {
      await supabase.from('slots').update({ status: 'available' }).eq('zone', zone);
    } catch (e) {}
    showToast(`All slots in ${zone} reset to Available`, 'info');
  };

  // Dynamic Export CSV
  const exportCSV = () => {
    if (!records || records.length === 0) {
      alert('No data available to export');
      return;
    }
    let csv = 'ID,Vehicle Number,Vehicle Type,Owner Name,Slot,Entry Time,Exit Time,Minutes,Amount,Payment Status,Status\n';
    records.forEach((item) => {
      csv += `${item.id},"${item.vehicle_no || ''}","${item.vehicle_type || ''}","${item.owner_name || '-'}","${item.slots?.slot_number || item.slot_id || '-'}","${item.entry_time ? new Date(item.entry_time).toLocaleString() : '-'}","${item.exit_time ? new Date(item.exit_time).toLocaleString() : 'ACTIVE'}",${item.total_minutes || 0},${item.total_amount || 0},"${item.payment_status || '-'}","${item.status || '-'}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `parking-history-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Parking history CSV exported!', 'success');
  };

  // Computed Real-Time Stats
  const totalSlots = slots.length;
  const occupiedSlots = slots.filter((s) => s.status === 'occupied').length;
  const availableSlots = slots.filter((s) => s.status === 'available').length;
  const maintenanceSlots = slots.filter((s) => s.status === 'maintenance').length;
  const totalVehicles = records.length;
  const totalEarnings = records.reduce((sum, v) => sum + Number(v.total_amount || 0), 0);
  const completedRecords = records.filter((r) => r.status === 'completed');
  const activeRecords = records.filter((r) => r.status === 'active');
  const occupancyPercentage = totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0;

  return (
    <ParkingContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        preselectedSlotId,
        setPreselectedSlotId,
        user,
        isAuthenticated,
        rates,
        updateRates,
        toasts,
        showToast,
        login,
        logout,
        slots,
        records,
        loading,
        supabaseConnected,
        lastSynced,
        totalSlots,
        occupiedSlots,
        availableSlots,
        maintenanceSlots,
        totalVehicles,
        totalEarnings,
        completedRecords,
        activeRecords,
        occupancyPercentage,
        addVehicle,
        exitVehicle,
        releaseSlot,
        toggleMaintenance,
        addSlot,
        resetZoneSlots,
        exportCSV,
        refreshData: fetchSupabaseData,
      }}
    >
      {children}
    </ParkingContext.Provider>
  );
};

export const useParking = () => {
  const context = useContext(ParkingContext);
  if (!context) {
    throw new Error('useParking must be used within a ParkingProvider');
  }
  return context;
};
