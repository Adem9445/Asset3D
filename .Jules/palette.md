## 2024-05-23 - Dynamic ARIA Labels for Toggle Buttons
**Learning:** Icon-only toggle buttons (like password visibility) need dynamic `aria-label`s to communicate state changes to screen reader users. A static label like "Toggle password" is insufficient; users need to know if the action will *show* or *hide* the content.
**Action:** Use conditional logic for `aria-label` (e.g., `aria-label={isVisible ? "Hide" : "Show"}`) on all state-toggling icon buttons.
