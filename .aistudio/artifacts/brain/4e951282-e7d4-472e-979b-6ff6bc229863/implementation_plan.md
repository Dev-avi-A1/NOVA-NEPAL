# Interactive Order Logistics Timeline Component

An interactive B2B logistics timeline and order milestone tracker for NOVA NEPAL, visualizing wholesale order lifecycle stages with Nepal cargo bilty generation, vehicle assignments, and real-time state transitions.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were confirmed during the alignment phase and govern the design:

- **Interactivity Mode**: **Interactive simulation** enabling buyers and sellers to step through milestones directly in the order view, trigger status progressions, and generate authentic Nepal freight Bilty documents (with courier, vehicle number, and hub).
- **Transport Metadata**: Displays **Cargo Courier Name** (e.g., Sundar Yatayat Cargo Express), **Bilty / Consignment Receipt Number** (e.g., `BLT-KTM-PKR-4891`), **Transport Vehicle / Truck Number** (e.g., `Ba 2 Kha 8941`), and **Origin Dispatch Hub** (e.g., Kalanki Logistics Bay, Kathmandu).
- **Visual Design**: **Horizontal responsive stepper** with clear connector lines, active teal indicator badges, timestamp logging, and an expandable transport details drawer adhering strictly to anti-slop rules (unboxed metadata, tabular numerals for dates and bilty codes, zero unnecessary badge spam).

---

## 1. Overview & Core Concept

### What It Does
Provides trade buyers and suppliers with complete transparency over wholesale order fulfillment across Nepal. The timeline tracks the order from initial escrow deposit through warehouse packaging, formal Bilty consignment generation (the standard legal freight receipt in Nepal trade), truck dispatch, transit tracking, and final warehouse delivery.

### Key Milestones Tracked
1. **Payment Escrowed**: ConnectIPS / Bank RTGS escrow deposit verified by the platform.
2. **Order Confirmed & Stock Allocated**: Supplier confirms line items; reserved stock is prepared for freight loading.
3. **Bilty Generated (Freight Consignment)**: Transport bilty receipt issued with courier company, vehicle registration, and destination hub.
4. **Dispatched in Transit**: Cargo departed origin warehouse, currently en route along Nepal highway corridors (e.g. Prithvi Highway / East-West Highway).
5. **Delivered & Escrow Released**: Destination warehouse receiver confirms delivery; escrow payout released to the supplier.

---

## 2. User Experience & Visual Design

### Key User Flows
- **Milestone Navigation**: Clicking any milestone node reveals its detailed timestamp, operator notes, and transport documentation.
- **Interactive Bilty Simulator**: Sellers can click "Generate Freight Bilty" to open an inline form specifying courier, vehicle registration number, and driver contact, instantly advancing the timeline and updating the order across the platform.
- **Dispatch Stepper**: Allows 1-click transit advancement to test fulfillment transitions real-time with automatic inventory fulfillment deductions.

### Visual Architecture & Palette
- **Track Bar**: Clean 2px horizontal connector line transitioning from slate gray (`#E2E8F0`) to active teal (`#0D9488`).
- **Milestone Nodes**: Numbered circle indicators with checkmark states for completed stages, pulsing ring for current active stage, and muted ring for upcoming stages.
- **Consignment Bilty Card**: High-contrast, compact freight receipt card with monospace identifiers (`font-mono tabular-nums`), origin/destination pins, and official cargo stamp aesthetics.

---

## 3. Technical Architecture & Component Structure

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ORDER DETAIL VIEW                               │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ <OrderLogisticsTimeline />                                       │  │
│  │                                                                  │  │
│  │  [① Escrowed] ─── [② Confirmed] ─── [③ Bilty] ─── [④ Dispatched] │  │
│  │                                                                  │  │
│  │  ┌────────────────────────────────────────────────────────────┐  │  │
│  │  │ Active Milestone Panel: "Bilty Generated"                  │  │  │
│  │  │ · Courier: Sundar Yatayat Cargo Express                    │  │  │
│  │  │ · Bilty No: BLT-KTM-PKR-4891 | Truck: Ba 2 Kha 8941        │  │  │
│  │  │ · Origin: Kalanki Bay, Kathmandu -> Pokhara Complex        │  │  │
│  │  │                                                            │  │  │
│  │  │ [Action: Advance to Dispatched] [Edit Consignment Details] │  │  │
│  │  └────────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌─────────────────────────────────┐  ┌─────────────────────────────┐  │
│  │ Parent Order Breakdown          │  │ Split Supplier Sub-Orders   │  │
│  └─────────────────────────────────┘  └─────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Integration
- Connects directly to `MarketStore.updateSellerOrderStatus()` and updates `SellerOrder` records with extended logistics fields (`biltyNumber`, `vehicleNumber`, `originHub`, `dispatchedAt`).
- Fully reactive: updates the Buyer Orders view, Seller Portal fulfillment list, and platform audit logs simultaneously.
