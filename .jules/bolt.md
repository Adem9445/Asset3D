# Bolt's Journal

## 2024-05-23 - [Frontend Optimization]
**Learning:** `Asset3D` component was duplicated inside `Room3D.jsx` and was not memoized.
**Action:** Consolidate to a single `Asset3D` component and use `React.memo` to prevent re-renders when parent state (like hover) changes.
