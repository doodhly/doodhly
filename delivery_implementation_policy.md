# Delivery Implementation Policy & Specification

**Document Type:** Technical Specification
**Version:** 1.0
**Status:** APPROVED
**Scope:** Delivery App (Client) & Ops Backend (Process)

---

## 1. DailyDelivery State Machine

The life-cycle of a single `DailyDelivery` record. This logic must be enforced on **both Client (App)** and **Server**.

| Current State | Event / Action | Target State | Actors | Guard Conditions | Side Effects |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `PENDING` | `START_ROUTE` | `OUT_FOR_DELIVERY` | Partner | `isAssignedRoute(user, route)` AND `inventoryConfirmed` | Update `route_status = STARTED` |
| `OUT_FOR_DELIVERY` | `VERIFY_VALID_COUPON` | `DELIVERED` | Partner | `isValid(coupon)` AND `isUnique(coupon)` | `consumption_log +1`, `decrement_inventory` |
| `OUT_FOR_DELIVERY` | `MARK_MISSED` | `MISSED` | Partner | `reason != NULL` | `trigger_credit_rollback_job` (Async) |
| `OUT_FOR_DELIVERY` | `REPORT_EXCEPTION` | `EXCEPTION` | Partner | `reason` IN ['DAMAGED', 'WRONG_QTY'] | `alert_ops_dashboard` |
| `OUT_FOR_DELIVERY` | `ADMIN_FORCE_CLOSE` | `MISSED` | System/Admin | `time > CUTOFF` OR `ManualTrigger` | `log_audit("Auto-Close")` |
| `ANY` | `CANCEL` | `CANCELLED` | Admin | `role == ADMIN` | `notify_partner_if_online` |

> [!IMPORTANT]
> **Strict Immutability**: Once a terminal state (`DELIVERED`, `MISSED`, `EXCEPTION`, `CANCELLED`) is reached, it **CANNOT** be changed by the Delivery Partner. Admin intervention is required for data correction.

---

## 2. Offline-First Sync Protocol

### 2.1 Local Schema (SQLite/Realm)

**Table: `DailyDeliveryLocal`**
- `id`: UUID
- `status`: Enum (PENDING, OUT, DELIVERED...)
- `coupon_code_hash`: String (Nullable)
- `sync_status`: Enum (SYNCED, DIRTY)
- `last_updated_at`: Timestamp

**Table: `OfflineActionQueue`** (Append-Only Log)
- `id`: AutoInc
- `action_type`: (DELIVER, MISS, EXCEPTION)
- `payload`: JSON (e.g., `{ "delivery_id": "123", "coupon": "ABC-999" }`)
- `timestamp`: UTC ISO
- `retry_count`: Int

### 2.2 Sync Logic

**Direction: Upstream (Client -> Server)**
1.  **Trigger**: Network detected OR "End Route" flows.
2.  **Process**:
    -   Select all `OfflineActionQueue` items where `processed = false` ordered by `timestamp ASC`.
    -   POST `/api/v1/delivery/batch-sync`
    -   **On Success (200)**: Delete/Archive queue items. Update `DailyDeliveryLocal.sync_status = SYNCED`.
    -   **On Conflict (409)**:
        -   Start **Conflict Resolution Routine**: Server State wins.
        -   If Server says "Already Cancelled", Client marks local record as `CANCELLED` (discarding the driver's action) and notifies driver: *"Delivery failed sync: Order was cancelled by Admin"*.

**Direction: Downstream (Server -> Client)**
1.  **Trigger**: Login AND Pull-to-Refresh.
2.  **Process**:
    -   GET `/api/v1/delivery/routes/active?last_sync={timestamp}`
    -   Upsert logic: Update local records if Server `updated_at` > Local `updated_at`.

---

## 3. Verification & Fraud Logic

### 3.1 Coupon Verification (Pseudocode)

```javascript
/**
 * Verifies a coupon code input by the partner.
 * @param {string} inputCode - The code scanned or typed.
 * @param {Array} localUsedPool - List of codes already scanned on this device today.
 * @returns {Result} { valid: boolean, error: string }
 */
function verifyCoupon(inputCode, localUsedPool) {
    // 1. Format Check
    if (!matchesFormat(inputCode)) {
        return { valid: false, error: "INVALID_FORMAT" };
    }

    // 2. Local Duplicate Check (Prevent "Double Dip" on same route)
    if (localUsedPool.includes(inputCode)) {
        // CRITICAL: Block immediately.
        return { valid: false, error: "COUPON_ALREADY_USED_ON_DEVICE" };
    }
    
    // 3. (Optional) Cryptographic/Checksum Check
    // If we use offline-verifiable codes (e.g. HMAC), check here.
    // Otherwise, we strictly rely on optimistic success + Server Rejection later.

    return { valid: true };
}
```

### 3.2 Global Uniqueness Enforcement (Server Side)

Upon receiving a `DELIVERED` action with `coupon_code`:
1.  **Database Lock**: `SELECT ... FOR UPDATE` on `CouponTable` where `code = ?`.
2.  **Check**: If `status == 'REDEEMED'`, return `409 Conflict` --> **Fraud Alert**.
3.  **Action**:
    -   Reject the Sync.
    -   Flag the Delivery Partner account for "Potential Fraud".
    -   Keep the Delivery Status as `SUSPECT` (or revert to `MISSED` pending investigation).

### 3.3 Lost Coupon Policy
-   **Guard**: App UI **disabled** "Mark Delivered" button if "Coupon" step is skipped.
-   **Override**:
    -   Partner clicks "Customer Lost Coupon".
    -   App prompts: *"Contact Depot Manager for Bypass"*.
    -   **Bypass Flow**:
        -   Admin opens Dashboard -> Finds Delivery -> Clicks "Authorize Bypass".
        -   Server pushes a specific `OneTimeToken` or state change `OUT -> DELIVERED` to the device (via Sync).
        -   **Partner cannot bypass locally.**

---

## 4. Failure Handling & Recovery

| Failure Scenario | System Behavior |
| :--- | :--- |
| **Sync Timeout** | Queue remains in `OfflineActionQueue`. App retries with exponential backoff. UI shows "Unsynced Data". |
| **App Crash** | On restart, read `DailyDeliveryLocal` DB. State is preserved. Queue is persistent. |
| **Data Corruption** | (Checksum fail) -> Force "Full Resync" (Wipe local DB, re-download from Server). |
| **Device Clock Skew** | Client includes `device_timestamp` AND `server_timestamp` (offset). Server validates logical order. |

---

## 5. Admin Visibility Hooks

The Implementation must emit these events to the Ops Dashboard:

-   `EVENT_DELIVERY_COMPLETED`: Real-time progress bar update.
-   `EVENT_DELIVERY_EXCEPTION`: Red flag on Map/List.
-   `EVENT_SYNC_DELAY`: If partner hasn't synced in > 30 mins while "On Route".
-   `ALERT_INVENTORY_MISMATCH`: End of Day total `(Start - Delivered - Returns) != 0`.

---
**Signed off by:** Architecture Team
**Constraint Checklist:**
- [x] No Extra Milk
- [x] Global Single Use Coupon
- [x] Admin Bypass Only (No local override)
