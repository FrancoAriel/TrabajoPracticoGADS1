```markdown
# Design System Document: The Executive Architect

## 1. Overview & Creative North Star
**Creative North Star: "The Disciplined Monolith"**

In the world of labor management, chaos is the enemy. This design system moves away from the "busy" aesthetics of traditional enterprise dashboards. Instead of a grid of disconnected widgets, we treat the UI as a singular, cohesive architectural structure. We achieve "Reliable & Efficient" not through more lines, but through **Tonal Certainty**.

The system breaks the "template" look by utilizing **Intentional Asymmetry**: large, editorial-style headlines (`display-sm`) paired with dense, hyper-organized data tables. We prioritize "Breathing Room" over "Data Stuffing," trusting that a clear hierarchy allows a supervisor to scan a room of 500 employees and immediately identify the single "Alert" state.

---

## 2. Colors: Tonal Depth vs. Structural Lines
The palette is rooted in the "Deep Blue" and "Slate Gray" spectrum. The goal is a "Quiet Authority."

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section off the UI. Structural integrity is achieved through:
- **Background Shifts:** Place a `surface-container-low` component against a `surface` background to define its bounds.
- **Tonal Transitions:** Use `surface-container-highest` for sidebars to create a clear "anchor" against the lighter `surface` workspace.

### Surface Hierarchy & Nesting
Treat the dashboard as a series of physical layers. 
- **Base Layer:** `surface` (#f7f9fb)
- **Secondary Workspace:** `surface-container-low` (#f0f4f7)
- **Interactive Cards:** `surface-container-lowest` (#ffffff) — This creates a "lifted" effect without shadows.
- **Active Navigation:** `surface-container-high` (#e1e9ee)

### The "Glass & Gradient" Rule
To prevent the UI from feeling "flat" or "cheap," use **Glassmorphism** for floating overlays (e.g., Profile Popovers or Quick-Action Menus). Use `surface` at 80% opacity with a `24px` backdrop blur. 
*Signature Polish:* Main Action CTAs (like "Run Payroll") should use a subtle linear gradient: `primary` (#455f88) to `primary_dim` (#39537c) at a 135-degree angle.

---

## 3. Typography: The Editorial Data-Set
We use a dual-typeface system to balance "Humanity" with "Precision."

*   **Headlines (Manrope):** Chosen for its geometric modernism. It feels authoritative yet approachable.
    *   `display-lg` to `headline-sm` should be used for high-level labor metrics (e.g., "Total Hours Tracked").
*   **Body & Data (Inter):** A workhorse for legibility. 
    *   `body-md` is the standard for tabular data.
    *   `label-sm` (#0.6875rem) in `on_surface_variant` is used for metadata, ensuring high-density views remain breathable.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are too "noisy" for a high-density labor dashboard.

*   **The Layering Principle:** Depth is achieved by "stacking." Place an `error_container` badge on a `surface-container-lowest` card. The contrast in value defines the edge, not a stroke.
*   **Ambient Shadows:** If a "Modal" or "Floating Action" is required, use a shadow with a `32px` blur and `4%` opacity, tinted with `primary` (#455f88). It should feel like a soft glow, not a dark smudge.
*   **The "Ghost Border" Fallback:** For input fields or search bars where a boundary is critical for accessibility, use `outline_variant` at **15% opacity**. It should be felt, not seen.

---

## 5. Components: Precision Primitives

### Cards & Lists
*   **Forbid Divider Lines:** Use `16px` of vertical whitespace (from the spacing scale) or a subtle shift to `surface-container-low` to separate entries.
*   **Data Rows:** On hover, change the background from `surface` to `surface-container-highest`.

### Status Indicators (The Traffic Light)
*   **Present:** `on_secondary_container` (Deep Slate-Green)
*   **Alert/Absent:** `error` (#9f403d)
*   **Warning:** `tertiary` (#5d5d78) - Use the muted purple-slate tones for non-critical warnings to avoid "Alert Fatigue."

### Buttons
*   **Primary:** Gradient of `primary` to `primary_dim`. Roundedness: `md` (0.375rem).
*   **Secondary:** Ghost style. No background, `on_surface` text, `outline_variant` (20% opacity) border.

### Input Fields
*   Background: `surface_container_low`. 
*   Active State: Bottom-border only (2px) in `primary`. This maintains the "Architectural" feel without boxing in the user.

### High-End Specialized Components
*   **The "Labor Pulse" Timeline:** A horizontal scrollable component using `primary_container` for scheduled shifts and `error_container` for overtime breaches.
*   **Metric Hero:** A `surface_container_highest` block featuring `display-sm` numbers to anchor the top of every dashboard view.

---

## 6. Do’s and Don’ts

### Do:
*   **Use Tonal Shifts:** Use the difference between `surface_container_low` and `surface_container_high` to group related labor groups.
*   **Embrace Large Type:** Use `headline-lg` for critical numbers (e.g., "12 Employees Overtime").
*   **Respect the Roundedness:** Stick strictly to `md` (0.375rem) for cards and `full` for status chips.

### Don’t:
*   **Don't use 1px Borders:** Never use a solid #000 or #CCC line to separate content.
*   **Don't use Pure Black:** Use `on_background` (#2a3439) for text to maintain the "Slate" aesthetic.
*   **Don't Over-Shadow:** If the UI looks like it’s "floating" off the screen, you’ve used too much shadow. Bring it back down to the "Architectural" surface.

---

**Director’s Final Note:** This design system is about the *weight* of the information. Every pixel of `primary` blue should feel earned. When a supervisor sees a `red` alert, it should stand out against the calm, slate-gray environment like a flare in the night. Precision is your greatest tool.```