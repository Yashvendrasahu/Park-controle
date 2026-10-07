import { createClient } from '@supabase/supabase-js';

// Support Vercel / Vite environment variables with automatic fallback
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://qgbgpyhenjblxyurxdny.supabase.co";

export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnYmdweWhlbmpibHh5dXJ4ZG55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMzYxMzMsImV4cCI6MjA5MzgxMjEzM30.YD2PrmIssoRGvVd_NG1ujXIzuEw3ndtc5lMC-Rjrqs0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Initial fallback mock data in case table is initializing or offline
export const INITIAL_SLOTS = [
  { id: 1, slot_number: 'A-101', zone: 'Zone A', floor: 'Ground', slot_type: 'Standard', status: 'occupied' },
  { id: 2, slot_number: 'A-102', zone: 'Zone A', floor: 'Ground', slot_type: 'Standard', status: 'available' },
  { id: 3, slot_number: 'A-103', zone: 'Zone A', floor: 'Ground', slot_type: 'EV Charging', status: 'occupied' },
  { id: 4, slot_number: 'A-104', zone: 'Zone A', floor: 'Ground', slot_type: 'Standard', status: 'available' },
  { id: 5, slot_number: 'A-105', zone: 'Zone A', floor: 'Ground', slot_type: 'Handicap', status: 'maintenance' },
  { id: 6, slot_number: 'A-106', zone: 'Zone A', floor: 'Ground', slot_type: 'Standard', status: 'available' },
  { id: 7, slot_number: 'A-107', zone: 'Zone A', floor: 'Ground', slot_type: 'Standard', status: 'occupied' },
  { id: 8, slot_number: 'A-108', zone: 'Zone A', floor: 'Ground', slot_type: 'EV Charging', status: 'available' },
  { id: 9, slot_number: 'A-109', zone: 'Zone A', floor: 'Ground', slot_type: 'Standard', status: 'available' },
  { id: 10, slot_number: 'A-110', zone: 'Zone A', floor: 'Ground', slot_type: 'Standard', status: 'available' },
  { id: 11, slot_number: 'A-111', zone: 'Zone A', floor: 'Ground', slot_type: 'EV Charging', status: 'occupied' },
  { id: 12, slot_number: 'A-112', zone: 'Zone A', floor: 'Ground', slot_type: 'Standard', status: 'available' },
  
  { id: 13, slot_number: 'B-201', zone: 'Zone B', floor: 'Ground', slot_type: 'Standard', status: 'available' },
  { id: 14, slot_number: 'B-202', zone: 'Zone B', floor: 'Ground', slot_type: 'EV Charging', status: 'occupied' },
  { id: 15, slot_number: 'B-203', zone: 'Zone B', floor: 'Ground', slot_type: 'Standard', status: 'available' },
  { id: 16, slot_number: 'B-204', zone: 'Zone B', floor: 'Ground', slot_type: 'Standard', status: 'available' },
  { id: 17, slot_number: 'B-205', zone: 'Zone B', floor: 'Ground', slot_type: 'Handicap', status: 'available' },
  { id: 18, slot_number: 'B-206', zone: 'Zone B', floor: 'Ground', slot_type: 'Standard', status: 'available' },
  
  { id: 19, slot_number: 'C-301', zone: 'Zone C', floor: 'Ground', slot_type: 'Standard', status: 'occupied' },
  { id: 20, slot_number: 'C-302', zone: 'Zone C', floor: 'Ground', slot_type: 'EV Charging', status: 'available' },
  { id: 21, slot_number: 'C-303', zone: 'Zone C', floor: 'Ground', slot_type: 'Standard', status: 'available' },
  { id: 22, slot_number: 'C-304', zone: 'Zone C', floor: 'Ground', slot_type: 'Standard', status: 'available' },
  
  { id: 23, slot_number: 'A-201', zone: 'Zone A', floor: 'Floor 1', slot_type: 'Standard', status: 'available' },
  { id: 24, slot_number: 'A-202', zone: 'Zone A', floor: 'Floor 1', slot_type: 'EV Charging', status: 'available' },
  { id: 25, slot_number: 'A-203', zone: 'Zone A', floor: 'Floor 1', slot_type: 'Standard', status: 'occupied' },
  { id: 26, slot_number: 'A-204', zone: 'Zone A', floor: 'Floor 1', slot_type: 'Standard', status: 'available' },
  
  { id: 27, slot_number: 'BS-01', zone: 'Zone A', floor: 'Basement', slot_type: 'Standard', status: 'available' },
  { id: 28, slot_number: 'BS-02', zone: 'Zone A', floor: 'Basement', slot_type: 'EV Charging', status: 'available' },
  { id: 29, slot_number: 'BS-03', zone: 'Zone A', floor: 'Basement', slot_type: 'Standard', status: 'occupied' },
  { id: 30, slot_number: 'BS-04', zone: 'Zone A', floor: 'Basement', slot_type: 'Handicap', status: 'available' }
];

export const INITIAL_RECORDS = [
  {
    id: 101,
    vehicle_no: 'MH-12-AB-1234',
    vehicle_type: 'Car (Sedan)',
    owner_name: 'Rajesh Sharma',
    slot_id: 1,
    entry_time: new Date(Date.now() - 75 * 60000).toISOString(),
    exit_time: null,
    total_minutes: 75,
    total_amount: 150,
    status: 'active',
    payment_status: 'unpaid',
    slots: { slot_number: 'A-101' }
  },
  {
    id: 102,
    vehicle_no: 'DL-04-CK-9921',
    vehicle_type: 'EV SUV',
    owner_name: 'Ananya Verma',
    slot_id: 3,
    entry_time: new Date(Date.now() - 45 * 60000).toISOString(),
    exit_time: null,
    total_minutes: 45,
    total_amount: 90,
    status: 'active',
    payment_status: 'unpaid',
    slots: { slot_number: 'A-103' }
  },
  {
    id: 103,
    vehicle_no: 'KA-01-MJ-4412',
    vehicle_type: 'Bike',
    owner_name: 'Vikram Mehta',
    slot_id: 7,
    entry_time: new Date(Date.now() - 110 * 60000).toISOString(),
    exit_time: null,
    total_minutes: 110,
    total_amount: 110,
    status: 'active',
    payment_status: 'unpaid',
    slots: { slot_number: 'A-107' }
  },
  {
    id: 104,
    vehicle_no: 'MH-02-EE-8899',
    vehicle_type: 'EV Sedan',
    owner_name: 'Rohan Gupta',
    slot_id: 11,
    entry_time: new Date(Date.now() - 25 * 60000).toISOString(),
    exit_time: null,
    total_minutes: 25,
    total_amount: 50,
    status: 'active',
    payment_status: 'unpaid',
    slots: { slot_number: 'A-111' }
  },
  {
    id: 105,
    vehicle_no: 'TN-07-ZZ-3301',
    vehicle_type: 'Car (SUV)',
    owner_name: 'Suresh Kumar',
    slot_id: 14,
    entry_time: new Date(Date.now() - 15 * 60000).toISOString(),
    exit_time: null,
    total_minutes: 15,
    total_amount: 30,
    status: 'active',
    payment_status: 'unpaid',
    slots: { slot_number: 'B-202' }
  },
  {
    id: 106,
    vehicle_no: 'GJ-01-AB-7744',
    vehicle_type: 'Car (Sedan)',
    owner_name: 'Pooja Patel',
    slot_id: 19,
    entry_time: new Date(Date.now() - 140 * 60000).toISOString(),
    exit_time: new Date(Date.now() - 20 * 60000).toISOString(),
    total_minutes: 120,
    total_amount: 240,
    status: 'completed',
    payment_status: 'paid',
    slots: { slot_number: 'C-301' }
  },
  {
    id: 107,
    vehicle_no: 'MH-14-GH-6622',
    vehicle_type: 'Bike',
    owner_name: 'Amit Deshmukh',
    slot_id: 2,
    entry_time: new Date(Date.now() - 220 * 60000).toISOString(),
    exit_time: new Date(Date.now() - 100 * 60000).toISOString(),
    total_minutes: 120,
    total_amount: 120,
    status: 'completed',
    payment_status: 'paid',
    slots: { slot_number: 'A-102' }
  }
];
