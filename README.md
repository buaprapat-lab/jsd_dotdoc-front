Role: Senior UX Engineer & Full-Stack Developer
Task: Generate a full-stack web application named "The Hub" (Notion-inspired tech learning repository and event calendar) with a dynamic database UI and a clean, high-fidelity responsive layout.
Tech Stack: React (Vite), Tailwind CSS, Node.js (Express), MongoDB Atlas (Mongoose).

---

## 1. DESIGN SYSTEM & PSYCHOLOGY (Nothing Tech & Tamagotchi Aesthetic)

- Theme Palette: Grayscale & High Contrast. Pure White (#FFFFFF), Off-White (#F6F6F6), Muted Gray (#E5E5E5), Dark Charcoal (#1A1A1A), Pure Black (#000000). Accent: Tamagotchi Red (#FF0022) used sparingly for active states or notifications.
- Typography: Clean Sans-Serif for body text, Monospace (e.g., 'Courier New' or Tailwind's `font-mono`) for headers, status tags, and button text to give a retro pixel/gadget gimmick vibe.
- UI Borders: Strict 1px or 2px solid borders (`border-black` or `border-neutral-200`) instead of heavy box-shadows. Sharp corners (radius 0px to 4px maximum) mimicking retro hardware interfaces.
- UX Psychology:
  - Low Cognitive Load: Minimal visual noise, clear table headers, and intuitive icons.
  - Spatial Mapping: Layout should resemble a tactile physical device or an organized physical ledger.
  - Instant Micro-interactions: Buttons and rows change background color slightly on hover (#F0F0F0) to ensure high visibility of click affordance.

---

## 2. BACKEND ARCHITECTURE & MONGODB SCHEMA (Node.js + Mongoose)

Create an Express server connected to MongoDB Atlas. Define two main dynamic schemas:

### A. Dynamic Table Schema (Notion-Like)

To handle dynamic columns and rows created by users from the UI:

- `ColumnSchema`: { id: String, label: String, type: { type: String, enum: ['text', 'date', 'url', 'number', 'checkbox', 'select'] }, options: [String] }
- `RowSchema`: { id: String, cells: Map, of: Schema.Types.Mixed } (Where key is columnId and value matches the type)
- Create initial default columns: "Topic" (text), "Skill Stack" (select/tags), "Link" (url), "Level" (select), "Provider" (text), "Shared by" (text).

### B. Calendar Event Schema

- `EventSchema`: { title: String, date: Date, startTime: String, endTime: String, description: String, category: String }

---

## 3. FRONTEND ARCHITECTURE & COMPONENT TREE (React + Tailwind CSS)

Generate a clean, scalable folder structure:
/src
/components
/ui (Reusable modular pixel/nothing components: Button, Input, Select, Modal, Badge)
/Table (DashboardTable, TableHeader, TableRow, AddColumnModal, FilterBar)
/Calendar (CalendarWidget, WeeklyView, MonthlyView, YearlyView, AddEventModal)
/context (TableContext, CalendarContext for shared state)
/services (api.js for Axios/Fetch requests)
App.jsx
main.jsx

---

## 4. CORE FUNCTIONALITIES TO IMPLEMENT

### Feature 1: Dynamic Notion-Inspired Table

- Column Management: A "+" button at the end of the table header that opens an 'Add Column' overlay. Users can type the column name and select a data type via a retro dropdown list (Text, Date, URL, Number, Checkbox, Select/Tag).
- Row Management: An "Add Row" or "+ New page" button at the bottom of the table. Clicking it inserts a blank editable row synchronized instantly with MongoDB via optimistic UI updates.
- In-line Editing: Clicking on a cell allows immediate value editing according to its type (e.g., rendering a checkbox for 'checkbox' type, a clear tag selector for 'select').
- Tag Filtering: A minimal filter bar at the top right of the table where users can filter rows based on existing 'Skill Stack' or 'Level' tags.

### Feature 2: 3-View Retro Calendar Component

Provide a view switcher button group: [Weekly | Monthly | Yearly] written in a crisp monospace font.

1. Weekly View (7-Column Layout): Shows a clean row of 7 cards for the current week. Each card lists timed events sorted chronologically.
2. Monthly View: A classic grid of dates. Days containing events display a small 'Tamagotchi Red Dot' accent.
3. Yearly View: A compact multi-grid layout of 12 months for high-level event visualization.

- Event Creation: Clicking any date across all views pops up an intuitive, minimalist modal. Fields include: Event Title, Date (auto-filled), Start/End Time, and Description. Events must auto-sort by time upon saving.

---

## 5. STEP-BY-STEP GENERATION DIRECTIVE

1. Build the backend server setup, connect Mongoose to MongoDB Atlas using an environment variable, and implement RESTful API routes (`/api/columns`, `/api/rows`, `/api/events`).
2. Scaffold the frontend structure, implementing a global layout wrapper with a clean sidebar/top-nav using the strict monochrome pixel palette.
3. Build the fully operational dynamic Table component with cell inputs and MongoDB sync logic.
4. Build the Calendar widget with Weekly, Monthly, and Yearly view toggles and the event-creation lifecycle.
5. Provide the exact Tailwind configurations (`tailwind.config.js`) including custom font mappings for the monospace layout.
