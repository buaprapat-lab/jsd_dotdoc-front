import { useState, useMemo, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Table2,
  Plus,
  X,
  Search,
  Cloud,
  List,
  Link as LinkIcon,
  Image as ImageIcon,
  CalendarDays,
  Info,
  User,
  Copy,
  Check,
  Code,
  Database,
  PenTool,
  BrainCircuit,
  TerminalSquare,
  LayoutGrid,
  Pencil,
  Save,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sun,
  Moon,
  Trash,
  Minus,
} from "lucide-react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmModal from "./components/ConfirmModal";
import { useToast } from "./context/ToastContext";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  parseISO,
} from "date-fns";

const API_URL = "https://jsd-dotdoc-back.onrender.com/api/rows";

// Color Palette Map (Flat & Soft)
const badgeColorMap = {
  Beginner: "bg-[#E4E3BC] text-[#344945]", // Honeydew
  Intermediate: "bg-[#D5E3E8] text-[#344945]", // Sky
  Advanced: "bg-main text-surface", // Viridian
  cs: "bg-panel text-main", // Stone
  ai: "bg-[#D5E3E8] text-[#344945]", // Sky
  "ux/ui": "bg-[#E4E3BC] text-[#344945]", // Honeydew
  data: "bg-main text-surface", // Viridian
  dev: "bg-panel text-main", // Stone
  QA: "bg-[#D5E3E8] text-main", // Sky
  clouds: "bg-[#E4E3BC] text-main", // Honeydew
};

const getBadgeColor = (text) => badgeColorMap[text] || "bg-panel text-main";

const getStackIcon = (stacks) => {
  if (!stacks || stacks.length === 0) return <LayoutGrid size={16} />;
  const mainStack = stacks[0];
  if (mainStack.includes("cs")) return <TerminalSquare size={16} />;
  if (mainStack.includes("ai")) return <BrainCircuit size={16} />;
  if (mainStack.includes("data")) return <Database size={16} />;
  if (mainStack.includes("ux/ui")) return <PenTool size={16} />;
  if (mainStack.includes("dev")) return <Code size={16} />;
  if (mainStack.includes("clouds")) return <Cloud size={16} />;
  return <LayoutGrid size={16} />;
};

function App() {
  // Global Providers Contexts
  const { addToast } = useToast();

  // Custom Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    onConfirm: () => {},
  });

  const closeConfirmModal = () =>
    setConfirmModal({ ...confirmModal, isOpen: false });

  const [activeTab, setActiveTab] = useState("database");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  useEffect(() => {
    // eslint-disable-next-line
    setCurrentPage(1);
  }, [activeFilter, searchQuery]);

  const [availableSkills, setAvailableSkills] = useState([
    "ai",
    "dev",
    "data",
    "QA",
    "cs",
    "ux/ui",
    "clouds",
  ]);
  const [availableLevels, setAvailableLevels] = useState([
    "Beginner",
    "Intermediate",
    "Advanced",
  ]);

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [copiedLink, setCopiedLink] = useState(null);

  // Calendar states
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [selectedWeekDate, setSelectedWeekDate] = useState(new Date());

  const today = new Date();

  // Add Event from Calendar State
  const [addingEventDate, setAddingEventDate] = useState(null);
  const [newEventTime, setNewEventTime] = useState("");
  const [newEventNote, setNewEventNote] = useState("");
  const [newEventTopic, setNewEventTopic] = useState("");
  const [hoveredEventId, setHoveredEventId] = useState(null);

  const [rows, setRows] = useState([]);

  // FETCH DATA
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setRows(data))
      .catch((err) => console.error("Error fetching rows:", err));
  }, []);

  const [tempList, setTempList] = useState([]);
  const [editingItemIndex, setEditingItemIndex] = useState(null);

  // Calendar Event Editing & View states
  const [editingEventId, setEditingEventId] = useState(null);
  const [editingEventTopic, setEditingEventTopic] = useState("");
  const [editingEventTime, setEditingEventTime] = useState("");
  const [editingEventNote, setEditingEventNote] = useState("");
  const [selectedEventForModal, setSelectedEventForModal] = useState(null);

  // DB Sync helper
  const syncRowToDB = async (row) => {
    try {
      await fetch(`${API_URL}/${row.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(row),
      });
    } catch (err) {
      console.error("Error updating row:", err);
    }
  };

  const handleAddRow = async () => {
    const newRowData = {
      topic: "",
      stack: [],
      link: "",
      level: [],
      date: "",
      note: "",
      provider: "",
      sharedBy: "",
    };
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRowData),
      });
      const savedRow = await res.json();
      setRows([...rows, savedRow]);
      setActiveFilter("All");
      setCurrentPage(Math.ceil((rows.length + 1) / itemsPerPage));
    } catch (err) {
      console.error("Error creating row:", err);
    }
  };

  const handleSaveNewEvent = async () => {
    if (!addingEventDate) return;
    const finalNote = newEventTime
      ? `${newEventTime} - ${newEventNote}`
      : newEventNote;
    const newRowData = {
      topic: newEventTopic || "New Event",
      stack: [],
      link: "",
      level: [],
      date: format(addingEventDate, "yyyy-MM-dd"),
      note: finalNote,
      provider: "",
      sharedBy: "",
      isEvent: true,
    };
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRowData),
      });
      const savedRow = await res.json();
      setRows([...rows, savedRow]);
    } catch (err) {
      console.error("Error creating event:", err);
    }
    setAddingEventDate(null);
    setNewEventTime("");
    setNewEventNote("");
    setNewEventTopic("");
  };

  const handleEditEventSave = async () => {
    if (!editingEventId) return;
    const finalNote = editingEventTime
      ? `${editingEventTime} - ${editingEventNote}`
      : editingEventNote;
    
    const rowToEdit = rows.find((r) => r.id === editingEventId);
    if (!rowToEdit) return;

    const updatedRow = {
      ...rowToEdit,
      topic: editingEventTopic || "Updated Event",
      note: finalNote,
    };
    
    try {
      await fetch(`${API_URL}/${editingEventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedRow),
      });
      setRows(rows.map((r) => (r.id === editingEventId ? updatedRow : r)));
    } catch (err) {
      console.error("Error updating event:", err);
    }
    setEditingEventId(null);
    setEditingEventTopic("");
    setEditingEventTime("");
    setEditingEventNote("");
  };

  // Handles row deletion via DELETE API
  const handleDeleteRow = (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Are you sure you want to delete this row?",
      onConfirm: async () => {
        closeConfirmModal();
        try {
          const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
          if (!res.ok) throw new Error("Failed to delete row");
          setRows(rows.filter((r) => r.id !== id));
          addToast("Row deleted successfully", "success");
        } catch (err) {
          console.error("Error deleting row:", err);
          addToast(
            "Error deleting row. Please check your connection.",
            "error",
          );
        }
      },
    });
  };

  // Handles folder deletion and cascades to clean up tags
  const handleDeleteFolder = (e, skillName) => {
    e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      title: `Are you sure you want to delete the folder "${skillName}" and remove this tag from all entries?`,
      onConfirm: () => {
        closeConfirmModal();
        try {
          setAvailableSkills(availableSkills.filter((s) => s !== skillName));

          const needsDbSync = [];
          const newRows = rows.map((r) => {
            if (r.stack.includes(skillName)) {
              const updated = {
                ...r,
                stack: r.stack.filter((s) => s !== skillName),
              };
              needsDbSync.push(updated);
              return updated;
            }
            return r;
          });
          setRows(newRows);
          if (activeFilter === skillName) setActiveFilter("All");
          needsDbSync.forEach(async (r) => await syncRowToDB(r));
          addToast(`Folder "${skillName}" deleted successfully`, "success");
        } catch (err) {
          console.error("Error deleting folder:", err);
          addToast("Error deleting folder.", "error");
        }
      },
    });
  };

  const updateRow = (id, field, value) => {
    setRows(rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const toggleTag = async (rowId, field, tag) => {
    let updatedRow = null;
    const newRows = rows.map((r) => {
      if (r.id === rowId) {
        const currentTags = r[field];
        const newTags = currentTags.includes(tag)
          ? currentTags.filter((t) => t !== tag)
          : [...currentTags, tag];
        updatedRow = { ...r, [field]: newTags };
        return updatedRow;
      }
      return r;
    });
    setRows(newRows);
    if (updatedRow) await syncRowToDB(updatedRow);
  };

  const saveDetailsDropdown = async (rowId) => {
    const row = rows.find((r) => r.id === rowId);
    if (row) await syncRowToDB(row);
    setActiveDropdown(null);
  };

  const handleCopy = (link) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(link);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const toggleCalendar = () => {
    setIsCalendarOpen(!isCalendarOpen);
    if (!isCalendarOpen) setActiveTab("calendar");
    else setActiveTab("database");
  };

  const handleSaveManageList = async (type) => {
    const finalTags = [];
    const renameMap = {};
    const deletedTags = new Set();

    tempList.forEach((item) => {
      if (item.isDeleted) {
        if (!item.isNew) deletedTags.add(item.original);
      } else {
        const trimmed = item.current.trim();
        if (trimmed) {
          finalTags.push(trimmed);
          if (!item.isNew && item.original !== trimmed) {
            renameMap[item.original] = trimmed;
          }
        }
      }
    });

    const inputId =
      type === "skillList" ? "manage-skill-input" : "manage-level-input";
    const inputEl = document.getElementById(inputId);
    if (inputEl && inputEl.value.trim()) {
      const trimmed = inputEl.value.trim();
      if (!finalTags.includes(trimmed)) {
        finalTags.push(trimmed);
      }
      inputEl.value = "";
    }

    let newRows;
    let needsDbSync = [];

    if (type === "skillList") {
      setAvailableSkills(finalTags);
      newRows = rows.map((r) => {
        let newStack = r.stack.filter((s) => !deletedTags.has(s));
        newStack = newStack.map((s) => renameMap[s] || s);
        const uniqueStack = [...new Set(newStack)];
        if (JSON.stringify(r.stack) !== JSON.stringify(uniqueStack)) {
          const updated = { ...r, stack: uniqueStack };
          needsDbSync.push(updated);
          return updated;
        }
        return r;
      });
      if (deletedTags.has(activeFilter)) setActiveFilter("All");
    } else {
      setAvailableLevels(finalTags);
      newRows = rows.map((r) => {
        let newLevel = r.level.filter((l) => !deletedTags.has(l));
        newLevel = newLevel.map((l) => renameMap[l] || l);
        const uniqueLevel = [...new Set(newLevel)];
        if (JSON.stringify(r.level) !== JSON.stringify(uniqueLevel)) {
          const updated = { ...r, level: uniqueLevel };
          needsDbSync.push(updated);
          return updated;
        }
        return r;
      });
    }

    setRows(newRows);
    setActiveDropdown(null);

    // Sync all affected rows to DB
    for (const r of needsDbSync) {
      await syncRowToDB(r);
    }
  };

  const filteredRows = useMemo(() => {
    let result = rows.filter((r) => !r.isEvent);
    if (activeFilter !== "All") {
      result = result.filter((r) => r.stack.includes(activeFilter));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          (r.topic && r.topic.toLowerCase().includes(q)) ||
          (r.provider && r.provider.toLowerCase().includes(q)),
      );
    }
    return result;
  }, [rows, searchQuery, activeFilter]);

  // Calendar calculations
  const weekStart = startOfWeek(selectedWeekDate, { weekStartsOn: 1 }); // Monday
  const weekDays = [...Array(7)].map((_, i) => addDays(weekStart, i));

  const renderMiniCalendar = () => {
    const monthStart = startOfMonth(currentMonthDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = [];
    let day = startDate;
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return (
      <div className="flex flex-col w-full h-full p-4 font-mono bg-panel rounded-[2rem] border-none">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentMonthDate(subMonths(currentMonthDate, 1));
            }}
            className="text-main hover:opacity-70 transition-opacity"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-[10px] font-bold tracking-widest text-main">
            {format(currentMonthDate, "MMM yyyy").toUpperCase()}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentMonthDate(addMonths(currentMonthDate, 1));
            }}
            className="text-main hover:opacity-70 transition-opacity"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 flex-1 mb-2">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <div
              key={i}
              className="text-[10px] text-center text-main/60 font-bold"
            >
              {d}
            </div>
          ))}
          {days.map((d) => (
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              key={d.toISOString()}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedWeekDate(d);
              }}
              className={clsx(
                "text-[10px] flex items-center justify-center rounded-xl cursor-pointer transition-colors aspect-square border-none",
                !isSameMonth(d, monthStart) ? "text-main/30" : "text-main",
                isSameDay(d, selectedWeekDate)
                  ? "bg-main text-surface font-bold"
                  : "hover:bg-surface",
                isSameDay(d, today) && !isSameDay(d, selectedWeekDate)
                  ? "bg-[#7CB9E8]/20 text-[#7CB9E8] font-bold"
                  : "", // Highlight today
              )}
            >
              {format(d, "d")}
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const renderSkillListDropdown = (sourceName) => (
    <AnimatePresence>
      {activeDropdown?.type === "skillList" &&
        activeDropdown.source === sourceName && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute top-10 left-0 w-64 bg-surface rounded-2xl p-4 z-[999] flex flex-col gap-3 shadow-lg border-none"
          >
            <div className="text-xs font-bold text-main border-b border-border pb-2 mb-1">
              Manage Stacks
            </div>
            <div className="max-h-48 overflow-y-auto pr-1 flex flex-col gap-1 custom-scrollbar">
              {tempList
                .filter((t) => !t.isDeleted)
                .map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center text-xs group/item p-1.5 hover:bg-panel rounded-lg transition-colors"
                  >
                    {editingItemIndex === idx ? (
                      <input
                        type="text"
                        value={item.current}
                        autoFocus
                        onChange={(e) =>
                          setTempList(
                            tempList.map((t, i) =>
                              i === idx
                                ? {
                                    ...t,
                                    current: e.target.value,
                                  }
                                : t,
                            ),
                          )
                        }
                        onBlur={() => setEditingItemIndex(null)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && setEditingItemIndex(null)
                        }
                        className="w-full border-b border-main bg-transparent px-1 outline-none text-main"
                      />
                    ) : (
                      <>
                        <span
                          className="truncate w-full cursor-text text-main font-medium"
                          onClick={() => setEditingItemIndex(idx)}
                        >
                          {item.current}
                        </span>
                        <div className="flex items-center gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingItemIndex(idx)}
                            className="text-main hover:opacity-70"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() =>
                              setTempList(
                                tempList.map((t, i) =>
                                  i === idx
                                    ? {
                                        ...t,
                                        isDeleted: true,
                                      }
                                    : t,
                                ),
                              )
                            }
                            className="text-red-500 hover:text-red-600"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
            </div>
            <input
              id="manage-skill-input"
              type="text"
              placeholder="Type new & press Enter..."
              className="w-full text-xs p-2.5 rounded-xl mt-1 bg-panel focus:bg-surface focus:outline-none focus:ring-2 focus:ring-hover border-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target.value.trim()) {
                  const activeItemsCount = tempList.filter(
                    (t) => !t.isDeleted,
                  ).length;
                  if (activeItemsCount >= 12) {
                    alert("Maximum of 12 skills allowed.");
                    return;
                  }
                  setTempList([
                    ...tempList,
                    {
                      original: e.target.value.trim(),
                      current: e.target.value.trim(),
                      isNew: true,
                      isDeleted: false,
                    },
                  ]);
                  e.target.value = "";
                }
              }}
            />
            <div className="flex flex-col gap-1.5 mt-2 border-t border-border pt-3">
              <button
                onClick={() => handleSaveManageList("skillList")}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-bold bg-main text-surface rounded-xl py-2.5 hover:opacity-90 transition-opacity border-none"
              >
                <Save size={14} /> Save
              </button>
              <button
                onClick={() => setActiveDropdown(null)}
                className="w-full text-center text-[10px] font-semibold text-main/70 hover:text-main bg-transparent rounded-xl py-2"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
    </AnimatePresence>
  );

  const paginationUI = filteredRows.length > itemsPerPage && (
    <div className="flex justify-center items-center gap-3 py-4 w-full">
      <button
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="p-2.5 rounded-xl bg-panel text-main hover:bg-surface disabled:opacity-30 disabled:hover:bg-panel transition-all border-none shadow-sm font-bold"
      >
        <ChevronLeft size={20} />
      </button>

      {Array.from({
        length: Math.ceil(filteredRows.length / itemsPerPage),
      }).map((_, idx) => (
        <button
          key={idx}
          onClick={() => setCurrentPage(idx + 1)}
          className={clsx(
            "w-10 h-10 rounded-xl text-sm font-bold transition-all border-none flex items-center justify-center shadow-sm",
            currentPage === idx + 1
              ? "bg-main text-white"
              : "bg-panel text-main/70 hover:bg-surface hover:text-main"
          )}
        >
          {idx + 1}
        </button>
      ))}

      <button
        onClick={() =>
          setCurrentPage((prev) =>
            Math.min(
              prev + 1,
              Math.ceil(filteredRows.length / itemsPerPage),
            )
          )
        }
        disabled={currentPage === Math.ceil(filteredRows.length / itemsPerPage)}
        className="p-2.5 rounded-xl bg-panel text-main hover:bg-surface disabled:opacity-30 disabled:hover:bg-panel transition-all border-none shadow-sm font-bold"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center bg-base relative overflow-hidden text-main transition-colors duration-300">
      {/* Top Navigation Area */}
      <div className="w-full max-w-[95rem] flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4 px-4 relative z-10">
        {/* Binder Spine Logo */}
        <div className="relative group perspective-1000 -mb-4 ml-8 z-20">
          <motion.div
            whileHover={{ y: -4 }}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-panel rounded-t-xl relative border-none"
          >
            <div className="w-[2px] h-8 rounded-full bg-main/40" />
            <svg
              width="90"
              height="36"
              viewBox="0 0 60 24"
              style={{ shapeRendering: "crispEdges" }}
              className="text-main mx-2"
            >
              <style>{`
                @keyframes pixelPulse {
                  0% { fill: #7CB9E8; }
                  50% { fill: #A5D6A7; }
                  100% { fill: #7CB9E8; }
                }
                .pixel-dot { animation: pixelPulse 1.5s infinite steps(2); }
              `}</style>
              <rect x="0" y="18" width="6" height="6" className="pixel-dot" />
              {/* d */}
              <rect x="16" y="0" width="4" height="24" fill="currentColor" />
              <rect x="8" y="10" width="8" height="4" fill="currentColor" />
              <rect x="8" y="20" width="8" height="4" fill="currentColor" />
              <rect x="4" y="14" width="4" height="6" fill="currentColor" />
              {/* o */}
              <rect x="26" y="10" width="8" height="4" fill="currentColor" />
              <rect x="26" y="20" width="8" height="4" fill="currentColor" />
              <rect x="22" y="14" width="4" height="6" fill="currentColor" />
              <rect x="34" y="14" width="4" height="6" fill="currentColor" />
              {/* c */}
              <rect x="44" y="10" width="8" height="4" fill="currentColor" />
              <rect x="44" y="20" width="8" height="4" fill="currentColor" />
              <rect x="40" y="14" width="4" height="6" fill="currentColor" />
            </svg>
            <div className="w-[2px] h-8 rounded-full bg-main/40" />
          </motion.div>
        </div>

        <div className="flex bg-panel p-1.5 rounded-2xl z-20 border-none items-center gap-1">
          <button
            onClick={() => {
              setActiveTab("database");
              setIsCalendarOpen(false);
            }}
            className={clsx(
              "px-4 py-2 rounded-xl transition-all duration-300 flex items-center justify-center border-none",
              activeTab === "database"
                ? "bg-surface text-main"
                : "text-main/60 hover:bg-surface/50 hover:text-main",
            )}
          >
            <Table2 size={18} />
          </button>
          <button
            onClick={toggleCalendar}
            className={clsx(
              "px-4 py-2 rounded-xl transition-all duration-300 flex items-center justify-center border-none",
              activeTab === "calendar"
                ? "bg-surface text-main"
                : "text-main/60 hover:bg-surface/50 hover:text-main",
            )}
          >
            <CalendarIcon size={18} />
          </button>
          <div className="w-px h-6 bg-main/20 mx-1"></div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="px-4 py-2 rounded-xl transition-all duration-300 flex items-center justify-center border-none text-main/60 hover:bg-surface/50 hover:text-main"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>

      {/* Main Container - Flat & Seamless */}
      <main className="w-full max-w-[95rem] flex-1 min-h-[75vh] relative flex flex-col z-10 bg-panel rounded-[2.5rem] overflow-hidden border-none shadow-sm">
        {/* Content layer */}
        <div className="relative z-10 flex-1 flex flex-col">
          {/* Database Content */}
          <AnimatePresence mode="wait">
            {!isCalendarOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col p-6 md:p-10 pt-12"
              >
                {/* Dynamic Category Folders Area */}
                <div className="mb-14 mt-4 w-full flex justify-center">
                  <div className="flex flex-wrap justify-center items-start gap-4 sm:gap-6 md:gap-10 w-full max-w-[860px] px-4 py-8 bg-surface rounded-[2rem] border-none mx-auto">
                    {/* ALL Folder */}
                    <motion.div
                      whileHover={{ y: -4 }}
                      onClick={() => setActiveFilter("All")}
                      className="flex flex-col items-center gap-2 group"
                      style={{
                        cursor: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20' style='shape-rendering:crispEdges'%3E%3Cpath fill='white' d='M1 1v15l4-4 3 7 3-1-3-7 5 0z'/%3E%3Cpath fill='%23344945' d='M3 3v10l3-3 3 6 1-1-3-6 3 0z'/%3E%3C/svg%3E") 1 1, pointer`,
                      }}
                    >
                      <div className="relative w-14 h-10 rounded-xl flex items-center justify-center transition-colors border-none bg-main">
                        <div className="absolute -top-1.5 left-0 w-5 h-3 rounded-t-md border-none bg-main"></div>
                      </div>
                      <span
                        className={clsx(
                          "text-[10px] font-mono font-bold uppercase tracking-widest max-w-[90px] text-center truncate",
                          activeFilter === "All" ? "text-main" : "text-main/60",
                        )}
                      >
                        ALL
                      </span>
                    </motion.div>

                    {/* Skill Folders */}
                    {availableSkills.map((cat) => {
                      const isActive = activeFilter === cat;
                      return (
                        <motion.div
                          whileHover={{ y: -4 }}
                          key={cat}
                          onClick={() => setActiveFilter(cat)}
                          className="flex flex-col items-center gap-2 group"
                          style={{
                            cursor: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20' style='shape-rendering:crispEdges'%3E%3Cpath fill='white' d='M1 1v15l4-4 3 7 3-1-3-7 5 0z'/%3E%3Cpath fill='%23344945' d='M3 3v10l3-3 3 6 1-1-3-6 3 0z'/%3E%3C/svg%3E") 1 1, pointer`,
                          }}
                        >
                          <div
                            className={clsx(
                              "relative w-14 h-10 rounded-xl flex items-center justify-center transition-colors border-none",
                              isActive
                                ? "bg-[#7CB9E8]"
                                : "bg-panel group-hover:bg-[#7CB9E8]",
                            )}
                          >
                            {/* Delete Folder Button (Visible on Hover) */}
                            <button
                              onClick={(e) => handleDeleteFolder(e, cat)}
                              className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-sm z-10"
                              title="Delete Folder"
                            >
                              <Minus size={10} />
                            </button>
                            <div
                              className={clsx(
                                "absolute -top-1.5 left-0 w-5 h-3 rounded-t-md border-none transition-colors",
                                isActive
                                  ? "bg-[#7CB9E8]"
                                  : "bg-panel group-hover:bg-[#7CB9E8]",
                              )}
                            ></div>
                          </div>
                          <span
                            className={clsx(
                              "text-[10px] font-mono font-bold uppercase tracking-widest max-w-[90px] text-center truncate",
                              isActive ? "text-main" : "text-main/60",
                            )}
                          >
                            {cat}
                          </span>
                        </motion.div>
                      );
                    })}

                    {/* Add New Folder Button */}
                    <div className="relative flex items-start">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (activeDropdown?.type === "skillList") {
                            setActiveDropdown(null);
                          } else {
                            setActiveDropdown({
                              type: "skillList",
                              source: "folder",
                            });
                            setTempList(
                              availableSkills.map((s) => ({
                                original: s,
                                current: s,
                                isNew: false,
                                isDeleted: false,
                              })),
                            );
                            setEditingItemIndex(null);
                          }
                        }}
                        className="flex flex-col items-center justify-center cursor-pointer h-10 w-10 mt-2"
                      >
                        <div className="w-10 h-10 rounded-full bg-panel hover:bg-[#7CB9E8] hover:text-white flex items-center justify-center text-main transition-colors shadow-sm border-none">
                          <Plus size={20} />
                        </div>
                      </motion.div>
                      {renderSkillListDropdown("folder")}
                    </div>
                  </div>
                </div>

                {/* Characters & Search Bar Area */}
                <div className="flex flex-col items-end w-full mb-6 relative">
                  {/* Floating Characters Container */}
                  <div className="flex justify-end px-4 z-10 pointer-events-none h-32 md:h-40">
                    <div className="flex items-end h-full">
                      {/* kkan */}
                      <div className="relative group flex items-end pb-0 -mr-6 pointer-events-auto">
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-surface px-4 py-2 rounded-2xl rounded-br-sm shadow-sm text-sm font-medium text-main border border-border opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                          อุ๊ย.. แชร์จอเลยครับ
                        </div>
                        <img
                          src="/kkan.png"
                          alt="kkan"
                          className="h-32 md:h-40 object-contain drop-shadow-sm"
                        />
                      </div>
                      {/* kneeti */}
                      <div className="relative group flex items-end pb-0 pointer-events-auto">
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-surface px-4 py-2 rounded-2xl rounded-br-sm shadow-sm text-sm font-medium text-main border border-border opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                          Happy Coding ครับ!
                        </div>
                        <img
                          src="/kneeti.png"
                          alt="kneeti"
                          className="h-32 md:h-40 object-contain drop-shadow-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Search Bar Underneath Characters */}
                  <div className="w-full flex justify-end">
                    <div className="relative z-10 w-full max-w-sm">
                      <Search
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-main/50"
                        size={16}
                      />
                      <input
                        type="text"
                        placeholder="search.."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-surface/60 backdrop-blur-md focus:bg-surface rounded-full pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-hover transition-all w-full text-main border border-border shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                {paginationUI}

                {/* Horizontally Scrollable Table Container */}
                <div className="flex-1 w-full overflow-x-auto pb-48">
                  <table className="w-full min-w-[1400px] text-left text-sm border-separate border-spacing-y-[4px]">
                    <thead>
                      <tr className="text-main font-semibold text-[10px] uppercase tracking-widest relative z-50">
                        <th className="px-3 py-3 font-normal w-12 text-center rounded-l-xl">
                          <span className="opacity-60">Icon</span>
                        </th>
                        <th className="px-4 py-3 font-normal w-1/4 min-w-[300px]">
                          <div className="flex items-center gap-2 opacity-80">
                            <Cloud size={14} /> Topic
                          </div>
                        </th>

                        {/* Skill Stack Header */}
                        <th className="px-4 py-3 font-normal relative group">
                          <div
                            className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity opacity-80"
                            onClick={() => {
                              if (activeDropdown?.type === "skillList") {
                                setActiveDropdown(null);
                              } else {
                                setActiveDropdown({
                                  type: "skillList",
                                  source: "table",
                                });
                                setTempList(
                                  availableSkills.map((s) => ({
                                    original: s,
                                    current: s,
                                    isNew: false,
                                    isDeleted: false,
                                  })),
                                );
                                setEditingItemIndex(null);
                              }
                            }}
                          >
                            <List size={14} /> Skill Stack{" "}
                            <Plus
                              size={12}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                          </div>

                          {renderSkillListDropdown("table")}
                        </th>

                        <th className="px-4 py-3 font-normal">
                          <div className="flex items-center gap-2 opacity-80">
                            <LinkIcon size={14} /> Link
                          </div>
                        </th>

                        {/* Level Header */}
                        <th className="px-4 py-3 font-normal relative group">
                          <div
                            className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity opacity-80"
                            onClick={() => {
                              if (activeDropdown?.type === "levelList") {
                                setActiveDropdown(null);
                              } else {
                                setActiveDropdown({ type: "levelList" });
                                setTempList(
                                  availableLevels.map((s) => ({
                                    original: s,
                                    current: s,
                                    isNew: false,
                                    isDeleted: false,
                                  })),
                                );
                                setEditingItemIndex(null);
                              }
                            }}
                          >
                            <ImageIcon size={14} /> Level{" "}
                            <Plus
                              size={12}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                          </div>

                          <AnimatePresence>
                            {activeDropdown?.type === "levelList" && (
                              <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="absolute top-10 left-0 w-64 bg-surface rounded-2xl p-4 z-[999] flex flex-col gap-3 shadow-lg border-none"
                              >
                                <div className="text-xs font-bold text-main border-b border-border pb-2 mb-1">
                                  Manage Levels
                                </div>
                                <div className="max-h-48 overflow-y-auto pr-1 flex flex-col gap-1 custom-scrollbar">
                                  {tempList
                                    .filter((t) => !t.isDeleted)
                                    .map((item, idx) => (
                                      <div
                                        key={idx}
                                        className="flex justify-between items-center text-xs group/item p-1.5 hover:bg-panel rounded-lg transition-colors"
                                      >
                                        {editingItemIndex === idx ? (
                                          <input
                                            type="text"
                                            value={item.current}
                                            autoFocus
                                            onChange={(e) =>
                                              setTempList(
                                                tempList.map((t, i) =>
                                                  i === idx
                                                    ? {
                                                        ...t,
                                                        current: e.target.value,
                                                      }
                                                    : t,
                                                ),
                                              )
                                            }
                                            onBlur={() =>
                                              setEditingItemIndex(null)
                                            }
                                            onKeyDown={(e) =>
                                              e.key === "Enter" &&
                                              setEditingItemIndex(null)
                                            }
                                            className="w-full border-b border-main bg-transparent px-1 outline-none text-main"
                                          />
                                        ) : (
                                          <>
                                            <span
                                              className="truncate w-full cursor-text text-main font-medium"
                                              onClick={() =>
                                                setEditingItemIndex(idx)
                                              }
                                            >
                                              {item.current}
                                            </span>
                                            <div className="flex items-center gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                              <button
                                                onClick={() =>
                                                  setEditingItemIndex(idx)
                                                }
                                                className="text-main hover:opacity-70"
                                              >
                                                <Pencil size={12} />
                                              </button>
                                              <button
                                                onClick={() =>
                                                  setTempList(
                                                    tempList.map((t, i) =>
                                                      i === idx
                                                        ? {
                                                            ...t,
                                                            isDeleted: true,
                                                          }
                                                        : t,
                                                    ),
                                                  )
                                                }
                                                className="text-red-500 hover:text-red-600"
                                              >
                                                <X size={12} />
                                              </button>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    ))}
                                </div>
                                <input
                                  id="manage-level-input"
                                  type="text"
                                  placeholder="Type new & press Enter..."
                                  className="w-full text-xs p-2.5 rounded-xl mt-1 bg-panel focus:bg-surface focus:outline-none focus:ring-2 focus:ring-hover border-none"
                                  onKeyDown={(e) => {
                                    if (
                                      e.key === "Enter" &&
                                      e.target.value.trim()
                                    ) {
                                      const activeItemsCount = tempList.filter(
                                        (t) => !t.isDeleted,
                                      ).length;
                                      if (activeItemsCount >= 10) {
                                        alert("Maximum of 10 levels allowed.");
                                        return;
                                      }
                                      setTempList([
                                        ...tempList,
                                        {
                                          original: e.target.value.trim(),
                                          current: e.target.value.trim(),
                                          isNew: true,
                                          isDeleted: false,
                                        },
                                      ]);
                                      e.target.value = "";
                                    }
                                  }}
                                />
                                <div className="flex flex-col gap-1.5 mt-2 border-t border-border pt-3">
                                  <button
                                    onClick={() =>
                                      handleSaveManageList("levelList")
                                    }
                                    className="w-full flex items-center justify-center gap-1.5 text-xs font-bold bg-main text-surface rounded-xl py-2.5 hover:opacity-90 transition-opacity border-none"
                                  >
                                    <Save size={14} /> Save
                                  </button>
                                  <button
                                    onClick={() => setActiveDropdown(null)}
                                    className="w-full text-center text-[10px] font-semibold text-main/70 hover:text-main bg-transparent rounded-xl py-2"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </th>

                        <th className="px-4 py-3 font-normal">
                          <div className="flex items-center gap-2 opacity-80">
                            <CalendarDays size={14} /> Date
                          </div>
                        </th>
                        <th className="px-4 py-3 font-normal">
                          <div className="flex items-center gap-2 opacity-80">
                            <Info size={14} /> Provider
                          </div>
                        </th>
                        <th className="px-4 py-3 font-normal w-48">
                          <div className="flex items-center gap-2 whitespace-nowrap opacity-80">
                            <User size={14} /> Shared by
                          </div>
                        </th>
                        <th className="px-2 py-3 font-normal w-12 rounded-r-xl"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-surface rounded-2xl shadow-sm border-none">
                      {filteredRows
                        .slice(
                          (currentPage - 1) * itemsPerPage,
                          currentPage * itemsPerPage,
                        )
                        .map((row) => (
                          <motion.tr
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            key={row.id}
                            className="group hover:bg-surface/60 transition-colors duration-200"
                          >
                            {/* Icon Column */}
                            <td className="px-3 py-2 text-center text-main/50 group-hover:text-main transition-colors rounded-l-2xl">
                              <div className="flex items-center justify-center">
                                {getStackIcon(row.stack)}
                              </div>
                            </td>
                            {/* Topic */}
                            <td className="px-4 py-2 font-semibold text-main">
                              <input
                                type="text"
                                value={row.topic}
                                onChange={(e) =>
                                  updateRow(row.id, "topic", e.target.value)
                                }
                                onBlur={(e) => syncRowToDB({ ...row, topic: e.target.value })}
                                onKeyDown={(e) =>
                                  e.key === "Enter" && e.target.blur()
                                }
                                className="bg-transparent w-full focus:bg-panel/30 p-1.5 rounded-lg outline-none transition-colors border-none"
                                placeholder="Empty topic..."
                              />
                            </td>
                            {/* Skill Stack */}
                            <td className="px-4 py-2 relative">
                              <div
                                className="flex gap-1.5 flex-wrap cursor-pointer min-h-[28px] items-center p-1.5 hover:bg-panel/30 rounded-lg transition-colors border-none"
                                onClick={() =>
                                  setActiveDropdown(
                                    activeDropdown?.type === "skill" &&
                                      activeDropdown?.rowId === row.id
                                      ? null
                                      : { type: "skill", rowId: row.id },
                                  )
                                }
                              >
                                {row.stack.length === 0 && (
                                  <span className="text-main/50 text-xs font-normal">
                                    Select...
                                  </span>
                                )}
                                {row.stack.map((s) => (
                                  <span
                                    key={s}
                                    className={clsx(
                                      "px-2.5 py-1 rounded-md text-[10px] font-bold border-none whitespace-nowrap",
                                      getBadgeColor(s),
                                    )}
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                              <AnimatePresence>
                                {activeDropdown?.type === "skill" &&
                                  activeDropdown?.rowId === row.id && (
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.95 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.95 }}
                                      className="absolute top-full left-4 w-52 bg-surface shadow-lg rounded-2xl p-4 z-[999] mt-2 border-none"
                                    >
                                      <div className="flex justify-between items-center mb-3 border-b border-border pb-2">
                                        <span className="text-xs font-bold text-main">
                                          Select Stack
                                        </span>
                                        <button
                                          onClick={() =>
                                            setActiveDropdown(null)
                                          }
                                          className="text-main/70 hover:text-main"
                                        >
                                          <X size={14} />
                                        </button>
                                      </div>
                                      <div className="flex flex-col gap-1">
                                        {availableSkills.map((tag) => (
                                          <label
                                            key={tag}
                                            className="flex items-center gap-3 text-xs py-1.5 cursor-pointer hover:bg-panel rounded-lg px-2 transition-colors text-main font-medium"
                                          >
                                            <input
                                              type="checkbox"
                                              className="accent-[#344945] w-3.5 h-3.5 rounded-sm"
                                              checked={row.stack.includes(tag)}
                                              onChange={() =>
                                                toggleTag(row.id, "stack", tag)
                                              }
                                            />{" "}
                                            {tag}
                                          </label>
                                        ))}
                                      </div>
                                    </motion.div>
                                  )}
                              </AnimatePresence>
                            </td>
                            {/* Link */}
                            <td className="px-4 py-2 text-main text-xs font-medium">
                              <div className="flex items-center gap-2 group/link bg-surface/40 rounded-lg focus-within:bg-panel/30 transition-colors p-1 pr-2 border-none">
                                <button
                                  onClick={() => handleCopy(row.link)}
                                  className="text-main/70 hover:text-main transition-colors p-1.5 bg-surface/50 rounded-md shadow-sm border-none"
                                  title="Copy link"
                                >
                                  {copiedLink === row.link ? (
                                    <Check size={14} className="text-main" />
                                  ) : (
                                    <Copy size={14} />
                                  )}
                                </button>
                                <input
                                  type="text"
                                  value={row.link}
                                  onChange={(e) =>
                                    updateRow(row.id, "link", e.target.value)
                                  }
                                  onBlur={(e) => syncRowToDB({ ...row, link: e.target.value })}
                                  onKeyDown={(e) =>
                                    e.key === "Enter" && e.target.blur()
                                  }
                                  className="bg-transparent w-full outline-none truncate"
                                  placeholder="https://..."
                                />
                              </div>
                            </td>
                            {/* Level */}
                            <td className="px-4 py-2 relative">
                              <div
                                className="flex gap-1.5 flex-wrap cursor-pointer min-h-[28px] items-center p-1.5 hover:bg-panel/30 rounded-lg transition-colors border-none"
                                onClick={() =>
                                  setActiveDropdown(
                                    activeDropdown?.type === "level" &&
                                      activeDropdown?.rowId === row.id
                                      ? null
                                      : { type: "level", rowId: row.id },
                                  )
                                }
                              >
                                {row.level.length === 0 && (
                                  <span className="text-main/50 text-xs font-normal">
                                    Select...
                                  </span>
                                )}
                                {row.level.map((l) => (
                                  <span
                                    key={l}
                                    className={clsx(
                                      "px-2.5 py-1 rounded-md text-[10px] font-bold border-none whitespace-nowrap",
                                      getBadgeColor(l),
                                    )}
                                  >
                                    {l}
                                  </span>
                                ))}
                              </div>
                              <AnimatePresence>
                                {activeDropdown?.type === "level" &&
                                  activeDropdown?.rowId === row.id && (
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.95 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.95 }}
                                      className="absolute top-full left-4 w-52 bg-surface shadow-lg rounded-2xl p-4 z-[999] mt-2 border-none"
                                    >
                                      <div className="flex justify-between items-center mb-3 border-b border-border pb-2">
                                        <span className="text-xs font-bold text-main">
                                          Select Level
                                        </span>
                                        <button
                                          onClick={() =>
                                            setActiveDropdown(null)
                                          }
                                          className="text-main/70 hover:text-main"
                                        >
                                          <X size={14} />
                                        </button>
                                      </div>
                                      <div className="flex flex-col gap-1">
                                        {availableLevels.map((tag) => (
                                          <label
                                            key={tag}
                                            className="flex items-center gap-3 text-xs py-1.5 cursor-pointer hover:bg-panel rounded-lg px-2 transition-colors text-main font-medium"
                                          >
                                            <input
                                              type="checkbox"
                                              className="accent-[#344945] w-3.5 h-3.5 rounded-sm"
                                              checked={row.level.includes(tag)}
                                              onChange={() =>
                                                toggleTag(row.id, "level", tag)
                                              }
                                            />{" "}
                                            {tag}
                                          </label>
                                        ))}
                                      </div>
                                    </motion.div>
                                  )}
                              </AnimatePresence>
                            </td>
                            {/* Date & Note */}
                            <td className="px-4 py-2 text-main text-xs font-medium relative">
                              <div
                                className="flex items-center gap-2 p-1.5 hover:bg-panel/30 rounded-lg cursor-pointer min-h-[28px] max-w-[130px] truncate transition-colors border-none"
                                onClick={() =>
                                  setActiveDropdown(
                                    activeDropdown?.type === "date" &&
                                      activeDropdown?.rowId === row.id
                                      ? null
                                      : { type: "date", rowId: row.id },
                                  )
                                }
                              >
                                <CalendarDays
                                  size={14}
                                  className="text-main/50 min-w-[14px]"
                                />
                                {row.date ? (
                                  <span className="truncate">
                                    {format(parseISO(row.date), "dd MMM yy")}{" "}
                                    {row.note ? `• ${row.note}` : ""}
                                  </span>
                                ) : (
                                  <span className="text-main/50 font-normal">
                                    Set Date
                                  </span>
                                )}
                              </div>

                              <AnimatePresence>
                                {activeDropdown?.type === "date" &&
                                  activeDropdown?.rowId === row.id && (
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.95 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.95 }}
                                      className="absolute top-full left-0 w-64 bg-surface shadow-xl rounded-2xl p-5 z-[999] mt-2 flex flex-col gap-4 border-none"
                                    >
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-main uppercase tracking-wider">
                                          Event Details
                                        </span>
                                        <button
                                          onClick={() =>
                                            setActiveDropdown(null)
                                          }
                                          className="text-main/50 hover:text-main transition-colors"
                                        >
                                          <X size={16} />
                                        </button>
                                      </div>
                                      <input
                                        type="date"
                                        value={row.date}
                                        onChange={(e) =>
                                          updateRow(
                                            row.id,
                                            "date",
                                            e.target.value,
                                          )
                                        }
                                        className="bg-panel focus:bg-surface p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-hover w-full text-sm font-mono text-main transition-all border-none"
                                      />
                                      <textarea
                                        value={row.note}
                                        onChange={(e) =>
                                          updateRow(
                                            row.id,
                                            "note",
                                            e.target.value,
                                          )
                                        }
                                        className="bg-panel focus:bg-surface p-3 rounded-xl outline-none focus:ring-2 focus:ring-hover text-xs w-full placeholder:text-main/50 resize-none h-20 transition-all border-none"
                                        placeholder="Add short note..."
                                      />
                                      <button
                                        onClick={() =>
                                          saveDetailsDropdown(row.id)
                                        }
                                        className="w-full flex items-center justify-center gap-2 text-xs font-bold bg-main text-surface rounded-xl py-3 mt-1 hover:opacity-90 transition-all border-none"
                                      >
                                        <Save size={14} /> Save
                                      </button>
                                    </motion.div>
                                  )}
                              </AnimatePresence>
                            </td>
                            {/* Provider */}
                            <td className="px-4 py-2 text-main text-xs font-medium">
                              <input
                                type="text"
                                value={row.provider}
                                onChange={(e) =>
                                  updateRow(row.id, "provider", e.target.value)
                                }
                                onBlur={(e) => syncRowToDB({ ...row, provider: e.target.value })}
                                onKeyDown={(e) =>
                                  e.key === "Enter" && e.target.blur()
                                }
                                className="bg-transparent w-full focus:bg-panel/30 p-1.5 rounded-lg outline-none transition-colors border-none"
                                placeholder="Provider..."
                              />
                            </td>
                            {/* Shared by */}
                            <td className="px-4 py-2 text-main text-xs font-medium whitespace-nowrap">
                              <input
                                type="text"
                                value={row.sharedBy || ""}
                                onChange={(e) =>
                                  updateRow(row.id, "sharedBy", e.target.value)
                                }
                                onBlur={(e) => syncRowToDB({ ...row, sharedBy: e.target.value })}
                                onKeyDown={(e) =>
                                  e.key === "Enter" && e.target.blur()
                                }
                                className="bg-transparent w-full focus:bg-panel/30 p-1.5 rounded-lg outline-none transition-colors border-none"
                                placeholder="Name..."
                              />
                            </td>
                            {/* Delete Action */}
                            <td
                              className="px-2 py-2 text-center text-main/30 group-hover:text-main/70 transition-colors cursor-pointer rounded-r-2xl"
                              onClick={() => handleDeleteRow(row.id)}
                            >
                              <Trash
                                size={16}
                                className="opacity-0 group-hover:opacity-100 transition-opacity mx-auto hover:scale-110"
                              />
                            </td>
                          </motion.tr>
                        ))}
                      {filteredRows.length === 0 && (
                        <tr>
                          <td
                            colSpan="8"
                            className="text-center py-12 text-main/50 font-medium"
                          >
                            No entries found.
                          </td>
                        </tr>
                      )}
                      {/* + New Entry Button Row at the end of table */}
                      <tr>
                        <td className="px-3 py-4"></td>
                        <td className="px-4 py-4" colSpan="7">
                          <button
                            onClick={handleAddRow}
                            className="text-main opacity-50 hover:opacity-100 font-semibold text-xs flex items-center gap-2 transition-opacity"
                          >
                            <Plus size={14} /> New Entry
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {paginationUI}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Calendar Modal Popup (Seamless Flat Design) */}
      <AnimatePresence>
        {isCalendarOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-main/40 backdrop-blur-sm"
              onClick={toggleCalendar}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-3xl bg-transparent flex flex-col animate-in duration-300"
            >
              <div className="grid grid-cols-3 gap-4 w-full mx-auto p-6 rounded-[3rem] bg-surface shadow-2xl relative">
                {/* Close Button Top Right */}
                <button
                  onClick={toggleCalendar}
                  className="absolute -top-3 -right-3 text-main shadow-lg transition-colors z-50 bg-panel hover:bg-white p-2.5 rounded-full"
                >
                  <X size={20} />
                </button>

                {/* Render the 7 Days */}
                {weekDays.map((dateObj, index) => {
                  let gridPos = "";
                  if (index === 6) gridPos = "col-start-1 row-start-3"; // Sunday

                  const dateString = format(dateObj, "yyyy-MM-dd");
                  const dayEvents = rows.filter((r) => r.date === dateString);

                  // Highlight today
                  const isToday = isSameDay(dateObj, today);
                  const isAddingEvent =
                    addingEventDate && isSameDay(dateObj, addingEventDate);

                  return (
                    <motion.div
                      key={dateObj.toISOString()}
                      whileHover={{ scale: 1.02 }}
                      className={clsx(
                        "relative rounded-[2rem] p-5 flex flex-col shadow-sm aspect-square overflow-hidden border-none transition-colors group/cal",
                        gridPos,
                        isToday
                          ? "bg-[#7CB9E8] text-white"
                          : "bg-panel text-main",
                      )}
                    >
                      <div className="flex items-end justify-between mb-4">
                        <span
                          className={clsx(
                            "text-3xl font-bold leading-none",
                            isToday ? "text-white" : "text-main",
                          )}
                        >
                          {format(dateObj, "dd")}
                        </span>
                        <span
                          className={clsx(
                            "text-xs font-bold uppercase tracking-widest",
                            isToday ? "text-white/80" : "text-main/50",
                          )}
                        >
                          {format(dateObj, "EEE")}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2 flex-1 overflow-y-auto custom-scrollbar pr-1 relative z-10">
                        {dayEvents.map((ev) => (
                          <div
                            key={ev.id}
                            onMouseEnter={() => setHoveredEventId(ev.id)}
                            onMouseLeave={() => setHoveredEventId(null)}
                            className={clsx(
                              "relative group/event p-3 rounded-xl text-xs font-medium border-none shadow-sm transition-all",
                              isToday
                                ? "bg-white/20 text-white"
                                : "bg-surface text-main",
                              hoveredEventId && hoveredEventId !== ev.id
                                ? "opacity-50"
                                : "opacity-100",
                            )}
                          >
                            {editingEventId === ev.id ? (
                              <div
                                className="relative z-30 p-2 flex flex-col gap-2 bg-surface rounded-xl border border-border shadow-md"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex justify-between items-center px-1">
                                  <span className="text-[10px] font-bold text-main">Edit</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingEventId(null);
                                    }}
                                    className="text-main/50 hover:text-main"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                                <input
                                  type="text"
                                  placeholder="Event Name"
                                  value={editingEventTopic}
                                  onChange={(e) => setEditingEventTopic(e.target.value)}
                                  className="bg-panel focus:bg-surface text-xs p-1.5 rounded-lg outline-none w-full border-none font-bold text-main"
                                />
                                <div className="flex gap-1.5">
                                  <input
                                    type="time"
                                    value={editingEventTime}
                                    onChange={(e) => setEditingEventTime(e.target.value)}
                                    className="bg-panel focus:bg-surface text-[10px] p-1.5 rounded-lg outline-none w-1/3 border-none text-main"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Note..."
                                    value={editingEventNote}
                                    onChange={(e) => setEditingEventNote(e.target.value)}
                                    className="bg-panel focus:bg-surface text-[10px] p-1.5 rounded-lg outline-none flex-1 border-none text-main"
                                    onKeyDown={(e) => e.key === "Enter" && handleEditEventSave()}
                                  />
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditEventSave();
                                  }}
                                  className="w-full text-[10px] font-bold bg-[#7CB9E8] text-white rounded-lg py-1.5 hover:opacity-90 border-none"
                                >
                                  Save
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingEventId(ev.id);
                                    setEditingEventTopic(ev.topic);
                                    const noteParts = (ev.note || "").split(" - ");
                                    if (noteParts.length > 1 && noteParts[0].match(/^\d{2}:\d{2}$/)) {
                                      setEditingEventTime(noteParts[0]);
                                      setEditingEventNote(noteParts.slice(1).join(" - "));
                                    } else {
                                      setEditingEventTime("");
                                      setEditingEventNote(ev.note || "");
                                    }
                                  }}
                                  className="absolute top-1.5 right-6 w-4 h-4 bg-[#7CB9E8] text-white rounded-full flex items-center justify-center opacity-0 group-hover/event:opacity-100 transition-opacity hover:scale-110 shadow-sm z-40"
                                  title="Edit Event"
                                >
                                  <Pencil size={10} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteRow(ev.id);
                                  }}
                                  className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/event:opacity-100 transition-opacity hover:scale-110 shadow-sm z-40"
                                  title="Delete Event"
                                >
                                  <Minus size={10} />
                                </button>
                                <div
                                  className="truncate cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedEventForModal(ev);
                                  }}
                                >
                                  {ev.topic}
                                </div>
                                {ev.note && (
                                  <div
                                    className={clsx(
                                      "text-[10px] mt-1 truncate cursor-pointer",
                                      isToday ? "text-white/70" : "text-main/50",
                                    )}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedEventForModal(ev);
                                    }}
                                  >
                                    {ev.note}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Hover + Button Overlay */}
                      {!isAddingEvent && (
                        <div
                          className={clsx(
                            "absolute inset-0 bg-main/10 backdrop-blur-sm transition-opacity flex items-center justify-center z-20 pointer-events-none",
                            hoveredEventId
                              ? "opacity-0"
                              : "opacity-0 group-hover/cal:opacity-100",
                          )}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setAddingEventDate(dateObj);
                            }}
                            className="bg-white text-main rounded-full p-4 shadow-lg hover:scale-110 hover:bg-main hover:text-white transition-all pointer-events-auto"
                          >
                            <Plus size={24} />
                          </button>
                        </div>
                      )}

                      {/* Inline Add Event Form */}
                      <AnimatePresence>
                        {isAddingEvent && (
                          <>
                            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998] md:hidden" onClick={(e) => { e.stopPropagation(); setAddingEventDate(null); }} />
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className="fixed md:absolute inset-x-4 top-1/2 -translate-y-1/2 md:inset-0 md:top-auto md:translate-y-0 bg-surface z-[9999] md:z-30 rounded-3xl md:rounded-[2rem] p-6 md:p-4 flex flex-col gap-3 justify-center border border-border shadow-2xl md:shadow-xl max-w-sm mx-auto w-auto"
                            >
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-main">
                                Add Note
                              </span>
                              <button
                                onClick={() => setAddingEventDate(null)}
                                className="text-main/50 hover:text-main"
                              >
                                <X size={14} />
                              </button>
                            </div>
                            <input
                              type="text"
                              placeholder="Topic..."
                              value={newEventTopic}
                              onChange={(e) => setNewEventTopic(e.target.value)}
                              className="w-full text-xs p-2 rounded-lg bg-panel/50 border-none outline-none focus:ring-1 focus:ring-[#344945] text-main"
                            />
                            <div className="flex items-center gap-2 bg-panel/50 rounded-lg px-2">
                              <Clock size={12} className="text-main/50" />
                              <input
                                type="time"
                                value={newEventTime}
                                onChange={(e) =>
                                  setNewEventTime(e.target.value)
                                }
                                className="w-full text-xs p-2 bg-transparent border-none outline-none text-main"
                              />
                            </div>
                            <textarea
                              placeholder="Note..."
                              value={newEventNote}
                              onChange={(e) => setNewEventNote(e.target.value)}
                              className="w-full text-xs p-2 rounded-lg bg-panel/50 border-none outline-none focus:ring-1 focus:ring-[#344945] text-main resize-none h-16"
                            />
                            <button
                              onClick={handleSaveNewEvent}
                              className="w-full bg-main text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2 hover:opacity-90"
                            >
                              <Save size={14} /> Save
                            </button>
                          </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}

                {/* Bottom Middle JSD12 Cell (Row 3, Col 2) */}
                <div className="col-start-2 row-start-3 aspect-square rounded-[2rem] bg-panel/50 flex flex-col items-center justify-center p-4 border-none">
                  <span className="text-main/60 text-xs font-mono font-bold tracking-widest mb-8">
                    JSD12
                  </span>
                  <div className="pixel-tama"></div>
                </div>

                {/* Mini Calendar Cell (Row 3, Col 3) */}
                <div className="col-start-3 row-start-3 aspect-square flex overflow-hidden border-none shadow-sm rounded-[2rem]">
                  {renderMiniCalendar()}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedEventForModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setSelectedEventForModal(null)}>
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface rounded-3xl p-6 md:p-8 shadow-2xl w-full max-w-md border-none relative flex flex-col gap-4"
            >
              <button
                onClick={() => setSelectedEventForModal(null)}
                className="absolute top-4 right-4 text-main/50 hover:text-main bg-panel p-2 rounded-full hover:scale-105 transition-all"
              >
                <X size={18} />
              </button>
              
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-main/60 uppercase tracking-widest">
                  {selectedEventForModal.isEvent ? "Calendar Event" : "Topic Event"}
                </span>
                <h3 className="text-xl md:text-2xl font-bold text-main leading-tight">
                  {selectedEventForModal.topic}
                </h3>
              </div>

              {(selectedEventForModal.date || selectedEventForModal.note) && (
                <div className="flex flex-col gap-3 mt-2 bg-panel/30 p-4 rounded-2xl">
                  {selectedEventForModal.date && (
                    <div className="flex items-center gap-3 text-main">
                      <div className="w-8 h-8 rounded-xl bg-panel flex items-center justify-center text-[#7CB9E8]">
                        <CalendarDays size={16} />
                      </div>
                      <span className="text-sm font-bold">
                        {format(parseISO(selectedEventForModal.date), "EEEE, d MMM yyyy")}
                      </span>
                    </div>
                  )}
                  {selectedEventForModal.note && (
                    <div className="flex items-start gap-3 text-main">
                      <div className="w-8 h-8 rounded-xl bg-panel flex items-center justify-center text-[#A5D6A7] shrink-0">
                        <Clock size={16} />
                      </div>
                      <span className="text-sm font-medium whitespace-pre-wrap leading-relaxed mt-1">
                        {selectedEventForModal.note}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirmModal}
      />
    </div>
  );
}

export default App;
