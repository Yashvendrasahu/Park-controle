# ParkControl - Enterprise Parking Management System

![ParkControl Banner](https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=1200)

**ParkControl** is a modern, pixel-perfect, full-featured **Enterprise Parking Management & Slot Allocation System** built with **React (JavaScript)**, **Tailwind CSS**, **Recharts**, and **Supabase (Real-time PostgreSQL & Authentication)**.

---

## 🚀 Key Features

### 1. 📊 Real-Time Operations Dashboard & Recharts Analytics
- **Live Metrics**: Total parking capacity, live occupancy count & percentage, available slots, daily traffic volume, and revenue.
- **Recharts Visualizations**:
  - **Capacity Occupancy Donut Chart** (`PieChart`) with centered percentage and instant Free/Busy/Maintenance indicators.
  - **Traffic Flow Timeline** (`AreaChart`) tracking hourly vehicle check-in vs check-out trends.
  - **Zone Breakdown & Vehicle Types Distribution** (`BarChart`) for Zone A, B, C and vehicle classifications.
- **Global Search Bar**: Instant live search dropdown to look up active or completed vehicle records by plate number, owner, or slot ID.

### 2. 🚗 Vehicle Entry & Gate Ticket Pass Generator
- Fast vehicle check-in for **Cars**, **Bikes**, **EV Sedans**, **EV SUVs**, and **Trucks**.
- Dynamic allocation of available parking slots with live gate clock & gate assignment.
- **Official Gate Entry Pass & Ticket**: Automatically generates printable thermal-style gate tickets with simulated barcodes and QR passes.
- Real-time capacity gauge with animated conic-gradient progress circle.

### 3. 💳 Vehicle Exit & Automated Fee Settlement
- Instant vehicle lookup via plate number or quick-select chip bar.
- Live minute-by-minute duration tracking.
- Rate multipliers for 2-Wheelers (₹1/min), 4-Wheelers (₹2/min), and EV Charging stations.
- Automated tax and total payable calculation with immediate departure settlement.
- **Printable Payment Slip**: Official receipt modal with print styling and confetti celebration.

### 4. 🅿️ Interactive Floor Map & Slot Management
- Multi-Zone (**Zone A**, **Zone B**, **Zone C**) and Multi-Floor (**Ground**, **Floor 1**, **Basement**) management.
- Visual slot grid with status badges (**FREE**, **BUSY**, **MAINT**) and EV charging indicators.
- **Slot Details Sidebar**: View parked vehicle details, duration, release occupied slots, or toggle maintenance mode.
- **One-Click Quick Allocation**: Select any available slot on the map and click *"Park Vehicle in This Slot"*.
- **Tariff & Rate Configurator**: Customize hourly rates for Standard, Bike, EV Premium, and Handicap slots.
- **Add New Slot**: Dynamically create custom parking slots in Supabase.

### 5. 📜 Parking History & CSV Export
- Searchable transaction logs of all vehicles.
- Categorization tabs: *All Vehicles*, *Four Wheeler*, *Two Wheeler*.
- Advanced status filters (*Active* vs *Completed*) and date range selectors (*Today*, *Last 7 Days*, *All Time*).
- Transaction details modal with timestamp breakdown.
- **One-Click CSV Export**: Download complete parking records as `.csv` spreadsheets.

### 6. 🔐 Supabase Authentication & Live PostgreSQL Sync
- Secure Administrator Login with Supabase Auth.
- Real-time synchronization across all tabs and operators using `supabase.channel`.
- Floating live toast notifications for system events.

---

## 🛠️ Tech Stack

- **Frontend**: React 19 (JavaScript), Vite 8
- **Styling**: Tailwind CSS 4, FontAwesome 6, Inter Font
- **Charts & Data Visualization**: Recharts
- **Database & Real-time**: Supabase (PostgreSQL & Realtime Client)
- **Effects & Utilities**: Canvas Confetti

---

## 📁 Project Structure

```text
├── index.html                  # HTML entry point with FontAwesome & Inter font
├── metadata.json               # Application metadata & capabilities
├── package.json                # Project dependencies & scripts
├── vercel.json                 # Vercel SPA routing rewrite config
├── .env.example                # Environment variables template
├── src/
│   ├── App.jsx                 # Main layout & route switcher with ToastContainer
│   ├── main.jsx                # React DOM entry point
│   ├── index.css               # Global Tailwind CSS & custom scrollbar styles
│   ├── context/
│   │   └── ParkingContext.jsx  # Global state, live Supabase CRUD, tariffs & toasts
│   ├── lib/
│   │   └── supabase.js         # Supabase client config & fallback seed dataset
│   ├── components/
│   │   ├── Sidebar.jsx         # Navigation sidebar with Supabase Live status
│   │   ├── NewEntryModal.jsx   # Fast vehicle check-in modal
│   │   ├── EntryPassModal.jsx  # Thermal barcode gate entry pass modal
│   │   ├── PrintSlipModal.jsx  # Payment receipt pass modal
│   │   ├── EditRatesModal.jsx  # Parking tariff & rate settings modal
│   │   ├── AddSlotModal.jsx    # Custom slot creation modal
│   │   └── RecordDetailsModal.jsx # Full transaction detail modal
│   └── pages/
│       ├── LoginPage.jsx       # Supabase Administrator Login page
│       ├── DashboardPage.jsx   # Main operations overview & Recharts analytics
│       ├── VehicleEntryPage.jsx # Vehicle check-in & capacity gauges
│       ├── VehicleExitPage.jsx # Exit fee calculation & departure settlement
│       ├── SlotManagementPage.jsx # Interactive floor map & slot operations
│       └── ParkingHistoryPage.jsx # Transaction logs, filters & CSV export
```

---

## ⚙️ Local Development Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd parkcontrol
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
Create a `.env` file in the root directory (refer to `.env.example`):
```env
VITE_SUPABASE_URL="https://qgbgpyhenjblxyurxdny.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnYmdweWhlbmpibHh5dXJ4ZG55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMzYxMzMsImV4cCI6MjA5MzgxMjEzM30.YD2PrmIssoRGvVd_NG1ujXIzuEw3ndtc5lMC-Rjrqs0"
```

### 4. Run development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Supabase Database Schema

### `slots` Table
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `bigint` (PK) | Slot unique ID |
| `slot_number` | `text` | E.g. `A-101`, `B-202`, `BS-01` |
| `zone` | `text` | `Zone A`, `Zone B`, `Zone C` |
| `floor` | `text` | `Ground`, `Floor 1`, `Basement` |
| `slot_type` | `text` | `Standard`, `EV Charging`, `Handicap` |
| `status` | `text` | `available`, `occupied`, `maintenance` |

### `parking_records` Table
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `bigint` (PK) | Transaction unique ID |
| `vehicle_no` | `text` | Vehicle registration plate |
| `vehicle_type` | `text` | `Car`, `Bike`, `EV SUV`, `EV Sedan`, `Truck` |
| `owner_name` | `text` | Driver / Owner name |
| `slot_id` | `bigint` | FK reference to `slots.id` |
| `entry_time` | `timestamptz`| Check-in timestamp |
| `exit_time` | `timestamptz`| Departure timestamp (nullable) |
| `total_minutes`| `integer` | Total duration parked |
| `total_amount` | `numeric` | Settled parking fee in ₹ |
| `status` | `text` | `active`, `completed` |
| `payment_status`| `text` | `unpaid`, `paid` |

---

## 🌐 Deploying to Vercel

1. Push your repository to **GitHub**.
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Set the build settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click **Deploy**.

---

## 📄 License
This project is open-source and available under the Apache-2.0 License.
