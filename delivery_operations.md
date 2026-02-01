# Delivery Operations Design Document
**Role:** Delivery Manager
**Project:** Doodhly (Maa Durga Dairy and Foods)
**Scope:** Delivery Operations (Sakti, Employee Partners)

---

## 1. End-to-End Delivery Workflow

### Phase 1: Morning Start (Warehouse/Hub)
1.  **Authentication & Sync**:
    - Partner logs into the delivery app.
    - App forces a **Full Sync** to download the day's `DailyDelivery` records for their assigned route.
    - *Constraint Check*: App verifies device time and prevents login if date/time is tampered manually.
2.  **Inventory Handover**:
    - Partner receives physical crate.
    - App displays **Total Load Required** (e.g., "50 Liters Standard, 20 Liters Premium").
    - Partner confirms physical count matches App Total.
    - **Action**: Partner swipes "Start Route".
    - **Status Transition**: All assigned `PENDING` records -> `OUT_FOR_DELIVERY` (Batch update).

### Phase 2: Route View (On Road)
-   **List View**: Sorted by Sequence Number (static route ordering).
-   **Card Information**:
    -   Customer Name (First Name + Last Initial).
    -   Address/Landmark.
    -   **Product & Quantity** (e.g., "Standard Milk - 2 Packets").
    -   *Hidden*: Wallet balance, phone number (unless "Call" feature is triggered, masked via bridge if possible).
-   **Visual Indicators**:
    -   Pending (Default).
    -   Completed (Green tick).
    -   Failed/Missed (Red cross).
    -   Synced/Unsynced icon for offline status.

### Phase 3: Per-Stop Execution (At Doorstep)
1.  **Arrival**: Partner taps "Arrived" (optional, logs timestamp).
2.  **Interaction**:
    -   Partner rings bell.
    -   Customer hands over **Physical Coupon**.
3.  **Verification**:
    -   Partner taps "Verify Coupon".
    -   **Input**: Manual entry of numeric code from coupon.
    -   **Logic**:
        -   App checks if coupon code belongs to the correct pool (cached locally).
        -   **Fraud Check**: Duplicate check against local store of used coupons.
4.  **Completion**:
    -   If Valid: Partner hands over milk. App marks `DELIVERED`.
    -   If No Coupon/Customer Unavailable: Partner marks `MISSED` or `EXCEPTION`.
    -   **Strict Rule**: No Coupon = No Milk (unless Admin intervenes remotely).
5.  **Record Lock**: Once a status is final (`DELIVERED`/`MISSED`), the record is **locked locally** and cannot be edited by the partner.

### Phase 4: End-of-Day Close (Depot Return)
1.  **Return Verification**:
    -   Partner returns empty crates and undelivered milk packets.
    -   Partner enters **Returns Quantity** in verification screen.
2.  **Coupon Handover**:
    -   Partner hands over physical coupons collected.
    -   Ops Admin counts physical coupons vs App's "Delivered via Coupon" count.
3.  **Final Sync**:
    -   App pushes all offline records.
    -   Admin "Closes Route" on Dashboard.
    -   **Trigger**: Inventory Reconciliation (Start Load - Delivered - Returns = 0).

---

## 2. DailyDelivery Lifecycle

### States & Transitions
| From State | To State | Triggered By | Condition |
| :--- | :--- | :--- | :--- |
| **PENDING** | **OUT_FOR\_DELIVERY** | Partner / System | "Start Route" action. |
| **OUT_FOR\_DELIVERY** | **DELIVERED** | Partner | Valid Coupon entered. |
| **OUT_FOR\_DELIVERY** | **MISSED** | Partner | Customer unavailable / No coupon. |
| **OUT_FOR\_DELIVERY** | **EXCEPTION** | Partner | Damaged goods / Wrong packet count. |
| **ANY** | **CANCELLED** | Admin | Emergency manual intervention before delivery. |

### Permissions
-   **Partner**: Can trigger `OUT -> DELIVERED`, `OUT -> MISSED`, `OUT -> EXCEPTION`.
-   **Admin**: Can force any state transition via **Admin Dashboard Only** (Audit logged).
-   **System**: Triggers `PENDING -> OUT` (Bulk) or `OUT -> MISSED` (Auto-close).

### Auto-Close Policy
-   Deliveries remaining `OUT_FOR_DELIVERY` are marked `MISSED` automatically **ONLY** after:
    1.  Partner route is force-closed by Admin.
    2.  OR Configurable cutoff time is reached (e.g., 11:00 AM).

---

## 3. Coupon Handling Design

### Assignment & Data
-   Coupons are **pre-generated** batches assigned to Customers physically.
-   **Strict Policy**: A coupon code can be used **only once globally**. Once redeemed, it is **permanently invalid**.
-   **Verification Flow**:
    1.  Partner executes `verifyCoupon(code)`.
    2.  Local DB checks: verification algorithm (checksum/format) + `isUsed` flag.
    3.  If Valid: Mark `DailyDelivery` as `DELIVERED`. Store `coupon_code` in delivery record.
    4.  If Invalid: Error "Invalid Code".

### Fraud Prevention
-   **Double Dip**: Local database on device stores list of *all* coupons scanned today to prevent reusing the same coupon for two neighbors.
-   **Reconciliation**: Physical coupon count at depot MUST match digital count. Discrepancy = Partner Liability.

---

## 4. Offline Behavior (Offline-First)

### Architecture
-   **Local Database**: SQLite/Realm on device. Stores Customer subset, DailyDeliveries for the day, and hashed Validation Rules.
-   **Action Queue**: All state changes (`DELIVERED`, `MISSED`) are written to an immutable `ActionLog` table locally first.
-   **Sync Manager**: Background worker attempts detailed HTTP sync every 5 minutes or on "Pull to Refresh".

### Offline Capabilities
-   **Allowed**:
    -   Viewing Route & Customer details.
    -   Verifying coupons (Logic is local).
    -   Marking status (Delivered/Missed).
-   **Blocked**:
    -   Profile updates.
    -   Real-time admin messaging.
    -   **Bypass Codes**: Partners cannot enter bypass codes locally.

### Conflict Resolution
-   **Strategy**: "Server Trust, Client Append".
    -   Server rejects conflicting updates based on timestamp and hierarchy (Admin > Partner).

---

## 5. Failure Scenarios & Handling

| Scenario | Handling Strategy |
| :--- | :--- |
| **Customer Unavailable** | Partner marks `MISSED`. Rules engine auto-triggers "Credit Rollback" (refund for that day) during nightly batch. |
| **No Coupon / Lost** | **Rule**: "No Coupon = No Milk". Partner marks `MISSED`. <br> **Exception**: Admin authorizes override via **Admin Dashboard** (requires Reason + Manager PIN + Audit Log). Partner *cannot* self-authorize. |
| **Device Crash / Battery Dead** | Partner uses physical paper manifest (backup printout). Data manually entered by Admin at depot later. |
| **Damaged Product** | Partner marks `EXCEPTION`. Reason: "Damaged". Inventory reconciliation expects return of damaged packet. |
| **Network Unreachable at End of Day** | Partner cannot "Close Route". Must return to Depot (Wi-Fi zone) to sync and close. |

---

## 6. Admin & Ops Visibility

### Real-Time Dashboard
-   **Map View**: Last known location of Partners.
-   **Progress Bar**: Route completion %.
-   **Anomalies**: Stop times > 10 mins, Distance deviations.

### Post-Sync Visibility
-   Exact timestamps of delivery.
-   Coupon codes collected.
-   Discrepancy Reports.

### Alerts
-   **High Priority**: Partner marks >3 `EXCEPTIONS` in a row.
-   **Ops**: "Route Not Started" by 06:00 AM.
-   **Inventory**: "returned_milk > expected_returns".

---

## 7. Risks & Decisions

### Operational Risks
-   **Paper Backup**: Reliance on paper backup if devices fail is high overhead.
-   **Offline Fraud**: Hard to catch real-time coupon reuse if multiple devices are offline (mitigated by global uniqueness check heavily on server sync).

### CTO Decisions (LOCKED)
-   **Extra Milk**: **NOT ALLOWED**. Requests for extra milk must be handled as a new subscription change; drivers cannot dispense extra milk on the spot.
-   **Lost Coupon**: Strict "No Coupon = No Milk" policy. Admin override is the only exception, fully audited.
-   **Admin Override**: "Bypass" allowed **ONLY** via Admin Dashboard with Manager PIN re-auth.

### Assumptions
-   Partners use company-provided or verified Android/iOS devices.
-   Warehouses have stable internet for Morning Sync and Evening Close.
-   Coupons are distributed to customers *before* the subscription starts.
