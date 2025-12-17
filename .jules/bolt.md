## 2024-05-23 - [Frontend Optimization]
**Learning:** `Asset3D` component was duplicated inside `Room3D.jsx` and was not memoized.
**Action:** Consolidate to a single `Asset3D` component and use `React.memo` to prevent re-renders when parent state (like hover) changes.

## 2025-12-17 - [Backend Optimization]
**Learning:** The `save` building endpoint was performing N+1 INSERT queries for assets (one per asset).
**Action:** Implemented batch INSERT using `VALUES ($1, $2, ...), ($x, $y, ...)` to reduce DB roundtrips to 1 per room.
