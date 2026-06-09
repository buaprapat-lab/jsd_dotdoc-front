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
} from "lucide-react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
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
  Advanced: "bg-[#344945] text-[#F7F5F1]", // Viridian
  cs: "bg-[#E0DCD1] text-[#344945]", // Stone
  ai: "bg-[#D5E3E8] text-[#344945]", // Sky
  "ux/ui": "bg-[#E4E3BC] text-[#344945]", // Honeydew
  data: "bg-[#344945] text-[#F7F5F1]", // Viridian
  dev: "bg-[#E0DCD1] text-[#344945]", // Stone
  QA: "bg-[#D5E3E8] text-[#344945]", // Sky
  clouds: "bg-[#E4E3BC] text-[#344945]", // Honeydew
};

const getBadgeColor = (text) =>
  badgeColorMap[text] || "bg-[#E0DCD1] text-[#344945]";

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
  const [activeTab, setActiveTab] = useState("database");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

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
    let result = rows;
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
      <div className="flex flex-col w-full h-full p-4 font-mono bg-[#E0DCD1] rounded-[2rem] border-none">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentMonthDate(subMonths(currentMonthDate, 1));
            }}
            className="text-[#344945] hover:opacity-70 transition-opacity"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-[10px] font-bold tracking-widest text-[#344945]">
            {format(currentMonthDate, "MMM yyyy").toUpperCase()}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentMonthDate(addMonths(currentMonthDate, 1));
            }}
            className="text-[#344945] hover:opacity-70 transition-opacity"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 flex-1 mb-2">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <div
              key={i}
              className="text-[10px] text-center text-[#344945]/60 font-bold"
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
                !isSameMonth(d, monthStart)
                  ? "text-[#344945]/30"
                  : "text-[#344945]",
                isSameDay(d, selectedWeekDate)
                  ? "bg-[#344945] text-[#F7F5F1] font-bold"
                  : "hover:bg-[#F7F5F1]",
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

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center bg-[#F7F5F1] relative overflow-hidden text-[#344945]">
      {/* Top Navigation Area */}
      <div className="w-full max-w-[95rem] flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4 px-4 relative z-10">
        {/* Binder Spine Logo */}
        <div className="relative group perspective-1000 -mb-4 ml-8 z-20">
          <motion.div
            whileHover={{ y: -4 }}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-[#E0DCD1] rounded-t-xl relative border-none"
          >
            <div className="w-1.5 h-6 rounded-full bg-[#344945]" />
            <h1 className="text-3xl font-bold tracking-tighter text-[#344945]">
              .doc
            </h1>
            <div className="w-1.5 h-6 rounded-full bg-[#344945]" />
          </motion.div>
        </div>

        <div className="flex bg-[#E0DCD1] p-1.5 rounded-2xl z-20 border-none">
          <button
            onClick={() => {
              setActiveTab("database");
              setIsCalendarOpen(false);
            }}
            className={clsx(
              "px-4 py-2 rounded-xl transition-all duration-300 flex items-center justify-center border-none",
              activeTab === "database"
                ? "bg-[#F7F5F1] text-[#344945]"
                : "text-[#344945]/60 hover:bg-[#F7F5F1]/50 hover:text-[#344945]",
            )}
          >
            <Table2 size={18} />
          </button>
          <button
            onClick={toggleCalendar}
            className={clsx(
              "px-4 py-2 rounded-xl transition-all duration-300 flex items-center justify-center border-none",
              activeTab === "calendar"
                ? "bg-[#F7F5F1] text-[#344945]"
                : "text-[#344945]/60 hover:bg-[#F7F5F1]/50 hover:text-[#344945]",
            )}
          >
            <CalendarIcon size={18} />
          </button>
        </div>
      </div>

      {/* Main Container - Flat & Seamless */}
      <main className="w-full max-w-[95rem] flex-1 min-h-[75vh] relative flex flex-col z-10 bg-[#E0DCD1] rounded-[2.5rem] overflow-hidden border-none shadow-sm">
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
                  <div className="flex flex-wrap justify-center items-start gap-6 md:gap-10 w-full max-w-7xl px-4 py-8 bg-[#F7F5F1] rounded-[2rem] border-none">
                    {/* ALL Folder */}
                    <motion.div
                      whileHover={{ y: -4 }}
                      onClick={() => setActiveFilter("All")}
                      className="flex flex-col items-center gap-2 group cursor-pointer"
                    >
                      <div
                        className={clsx(
                          "relative w-14 h-10 rounded-xl flex items-center justify-center transition-colors border-none",
                          activeFilter === "All"
                            ? "bg-[#344945]"
                            : "bg-[#E0DCD1] group-hover:bg-[#D5E3E8]",
                        )}
                      >
                        <div
                          className={clsx(
                            "absolute -top-1.5 left-0 w-5 h-3 rounded-t-md border-none",
                            activeFilter === "All"
                              ? "bg-[#344945]"
                              : "bg-[#E0DCD1] group-hover:bg-[#D5E3E8]",
                          )}
                        ></div>
                      </div>
                      <span
                        className={clsx(
                          "text-[10px] font-mono font-bold uppercase tracking-widest max-w-[90px] text-center truncate",
                          activeFilter === "All"
                            ? "text-[#344945]"
                            : "text-[#344945]/60",
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
                          className="flex flex-col items-center gap-2 group cursor-pointer"
                        >
                          <div
                            className={clsx(
                              "relative w-14 h-10 rounded-xl flex items-center justify-center transition-colors border-none",
                              isActive
                                ? "bg-[#344945]"
                                : "bg-[#E0DCD1] group-hover:bg-[#D5E3E8]",
                            )}
                          >
                            <div
                              className={clsx(
                                "absolute -top-1.5 left-0 w-5 h-3 rounded-t-md border-none",
                                isActive
                                  ? "bg-[#344945]"
                                  : "bg-[#E0DCD1] group-hover:bg-[#D5E3E8]",
                              )}
                            ></div>
                          </div>
                          <span
                            className={clsx(
                              "text-[10px] font-mono font-bold uppercase tracking-widest max-w-[90px] text-center truncate",
                              isActive ? "text-[#344945]" : "text-[#344945]/60",
                            )}
                          >
                            {cat}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <div className="relative z-10 w-80">
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#344945]/50"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="search.."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-white/40 backdrop-blur-md focus:bg-white rounded-full pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D5E3E8] transition-all w-full text-[#344945] border border-white/60 shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddRow}
                    className="bg-[#344945] hover:opacity-90 text-[#F7F5F1] flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-opacity border-none"
                  >
                    <Plus size={16} /> New Entry
                  </motion.button>
                </div>

                {/* Horizontally Scrollable Table Container */}
                <div className="flex-1 w-full overflow-x-auto pb-48">
                  <table className="w-full min-w-[1400px] text-left text-sm border-separate border-spacing-y-[4px]">
                    <thead>
                      <tr className="text-[#344945] font-semibold text-[10px] uppercase tracking-widest relative z-50">
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
                                setActiveDropdown({ type: "skillList" });
                                setTempList(availableSkills.map(s => ({ original: s, current: s, isNew: false, isDeleted: false })));
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

                          <AnimatePresence>
                            {activeDropdown?.type === "skillList" && (
                              <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="absolute top-10 left-0 w-64 bg-[#F7F5F1] rounded-2xl p-4 z-[999] flex flex-col gap-3 shadow-lg border-none"
                              >
                                <div className="text-xs font-bold text-[#344945] border-b border-[#E0DCD1] pb-2 mb-1">
                                  Manage Stacks
                                </div>
                                <div className="max-h-48 overflow-y-auto pr-1 flex flex-col gap-1 custom-scrollbar">
                                  {tempList
                                    .filter((t) => !t.isDeleted)
                                    .map((item, idx) => (
                                      <div
                                        key={idx}
                                        className="flex justify-between items-center text-xs group/item p-1.5 hover:bg-[#E0DCD1] rounded-lg transition-colors"
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
                                            className="w-full border-b border-[#344945] bg-transparent px-1 outline-none text-[#344945]"
                                          />
                                        ) : (
                                          <>
                                            <span
                                              className="truncate w-full cursor-text text-[#344945] font-medium"
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
                                                className="text-[#344945] hover:opacity-70"
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
                                  type="text"
                                  placeholder="Type new & press Enter..."
                                  className="w-full text-xs p-2.5 rounded-xl mt-1 bg-[#E0DCD1] focus:bg-[#F7F5F1] focus:outline-none focus:ring-2 focus:ring-[#D5E3E8] border-none"
                                  onKeyDown={(e) => {
                                    if (
                                      e.key === "Enter" &&
                                      e.target.value.trim()
                                    ) {
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
                                <div className="flex flex-col gap-1.5 mt-2 border-t border-[#E0DCD1] pt-3">
                                  <button
                                    onClick={() =>
                                      handleSaveManageList("skillList")
                                    }
                                    className="w-full flex items-center justify-center gap-1.5 text-xs font-bold bg-[#344945] text-[#F7F5F1] rounded-xl py-2.5 hover:opacity-90 transition-opacity border-none"
                                  >
                                    <Save size={14} /> Save
                                  </button>
                                  <button
                                    onClick={() => setActiveDropdown(null)}
                                    className="w-full text-center text-[10px] font-semibold text-[#344945]/70 hover:text-[#344945] bg-transparent rounded-xl py-2"
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
                                setTempList(availableLevels.map(s => ({ original: s, current: s, isNew: false, isDeleted: false })));
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
                                className="absolute top-10 left-0 w-64 bg-[#F7F5F1] rounded-2xl p-4 z-[999] flex flex-col gap-3 shadow-lg border-none"
                              >
                                <div className="text-xs font-bold text-[#344945] border-b border-[#E0DCD1] pb-2 mb-1">
                                  Manage Levels
                                </div>
                                <div className="max-h-48 overflow-y-auto pr-1 flex flex-col gap-1 custom-scrollbar">
                                  {tempList
                                    .filter((t) => !t.isDeleted)
                                    .map((item, idx) => (
                                      <div
                                        key={idx}
                                        className="flex justify-between items-center text-xs group/item p-1.5 hover:bg-[#E0DCD1] rounded-lg transition-colors"
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
                                            className="w-full border-b border-[#344945] bg-transparent px-1 outline-none text-[#344945]"
                                          />
                                        ) : (
                                          <>
                                            <span
                                              className="truncate w-full cursor-text text-[#344945] font-medium"
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
                                                className="text-[#344945] hover:opacity-70"
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
                                  type="text"
                                  placeholder="Type new & press Enter..."
                                  className="w-full text-xs p-2.5 rounded-xl mt-1 bg-[#E0DCD1] focus:bg-[#F7F5F1] focus:outline-none focus:ring-2 focus:ring-[#D5E3E8] border-none"
                                  onKeyDown={(e) => {
                                    if (
                                      e.key === "Enter" &&
                                      e.target.value.trim()
                                    ) {
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
                                <div className="flex flex-col gap-1.5 mt-2 border-t border-[#E0DCD1] pt-3">
                                  <button
                                    onClick={() =>
                                      handleSaveManageList("levelList")
                                    }
                                    className="w-full flex items-center justify-center gap-1.5 text-xs font-bold bg-[#344945] text-[#F7F5F1] rounded-xl py-2.5 hover:opacity-90 transition-opacity border-none"
                                  >
                                    <Save size={14} /> Save
                                  </button>
                                  <button
                                    onClick={() => setActiveDropdown(null)}
                                    className="w-full text-center text-[10px] font-semibold text-[#344945]/70 hover:text-[#344945] bg-transparent rounded-xl py-2"
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
                        <th className="px-4 py-3 font-normal w-32 rounded-r-xl">
                          <div className="flex items-center gap-2 whitespace-nowrap opacity-80">
                            <User size={14} /> Shared by
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white rounded-2xl shadow-sm border-none">
                      {filteredRows.map((row) => (
                        <motion.tr
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          key={row.id}
                          className="group hover:bg-white/60 transition-colors duration-200"
                        >
                          {/* Icon Column */}
                          <td className="px-3 py-2 text-center text-[#344945]/50 group-hover:text-[#344945] transition-colors rounded-l-2xl">
                            <div className="flex items-center justify-center">
                              {getStackIcon(row.stack)}
                            </div>
                          </td>
                          {/* Topic */}
                          <td className="px-4 py-2 font-semibold text-[#344945]">
                            <input
                              type="text"
                              value={row.topic}
                              onChange={(e) =>
                                updateRow(row.id, "topic", e.target.value)
                              }
                              onBlur={() => syncRowToDB(row)}
                              onKeyDown={(e) =>
                                e.key === "Enter" && e.target.blur()
                              }
                              className="bg-transparent w-full focus:bg-[#E0DCD1]/30 p-1.5 rounded-lg outline-none transition-colors border-none"
                              placeholder="Empty topic..."
                            />
                          </td>
                          {/* Skill Stack */}
                          <td className="px-4 py-2 relative">
                            <div
                              className="flex gap-1.5 flex-wrap cursor-pointer min-h-[28px] items-center p-1.5 hover:bg-[#E0DCD1]/30 rounded-lg transition-colors border-none"
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
                                <span className="text-[#344945]/50 text-xs font-normal">
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
                                    className="absolute top-full left-4 w-52 bg-[#F7F5F1] shadow-lg rounded-2xl p-4 z-[999] mt-2 border-none"
                                  >
                                    <div className="flex justify-between items-center mb-3 border-b border-[#E0DCD1] pb-2">
                                      <span className="text-xs font-bold text-[#344945]">
                                        Select Stack
                                      </span>
                                      <button
                                        onClick={() => setActiveDropdown(null)}
                                        className="text-[#344945]/70 hover:text-[#344945]"
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                      {availableSkills.map((tag) => (
                                        <label
                                          key={tag}
                                          className="flex items-center gap-3 text-xs py-1.5 cursor-pointer hover:bg-[#E0DCD1] rounded-lg px-2 transition-colors text-[#344945] font-medium"
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
                          <td className="px-4 py-2 text-[#344945] text-xs font-medium">
                            <div className="flex items-center gap-2 group/link bg-white/40 rounded-lg focus-within:bg-[#E0DCD1]/30 transition-colors p-1 pr-2 border-none">
                              <button
                                onClick={() => handleCopy(row.link)}
                                className="text-[#344945]/70 hover:text-[#344945] transition-colors p-1.5 bg-white/50 rounded-md shadow-sm border-none"
                                title="Copy link"
                              >
                                {copiedLink === row.link ? (
                                  <Check size={14} className="text-[#344945]" />
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
                                onBlur={() => syncRowToDB(row)}
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
                              className="flex gap-1.5 flex-wrap cursor-pointer min-h-[28px] items-center p-1.5 hover:bg-[#E0DCD1]/30 rounded-lg transition-colors border-none"
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
                                <span className="text-[#344945]/50 text-xs font-normal">
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
                                    className="absolute top-full left-4 w-52 bg-[#F7F5F1] shadow-lg rounded-2xl p-4 z-[999] mt-2 border-none"
                                  >
                                    <div className="flex justify-between items-center mb-3 border-b border-[#E0DCD1] pb-2">
                                      <span className="text-xs font-bold text-[#344945]">
                                        Select Level
                                      </span>
                                      <button
                                        onClick={() => setActiveDropdown(null)}
                                        className="text-[#344945]/70 hover:text-[#344945]"
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                      {availableLevels.map((tag) => (
                                        <label
                                          key={tag}
                                          className="flex items-center gap-3 text-xs py-1.5 cursor-pointer hover:bg-[#E0DCD1] rounded-lg px-2 transition-colors text-[#344945] font-medium"
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
                          <td className="px-4 py-2 text-[#344945] text-xs font-medium relative">
                            <div
                              className="flex items-center gap-2 p-1.5 hover:bg-[#E0DCD1]/30 rounded-lg cursor-pointer min-h-[28px] max-w-[130px] truncate transition-colors border-none"
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
                                className="text-[#344945]/50 min-w-[14px]"
                              />
                              {row.date ? (
                                <span className="truncate">
                                  {format(parseISO(row.date), "dd MMM yy")}{" "}
                                  {row.note ? `• ${row.note}` : ""}
                                </span>
                              ) : (
                                <span className="text-[#344945]/50 font-normal">
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
                                    className="absolute top-full left-0 w-64 bg-[#F7F5F1] shadow-xl rounded-2xl p-5 z-[999] mt-2 flex flex-col gap-4 border-none"
                                  >
                                    <div className="flex justify-between items-center">
                                      <span className="text-xs font-bold text-[#344945] uppercase tracking-wider">
                                        Event Details
                                      </span>
                                      <button
                                        onClick={() => setActiveDropdown(null)}
                                        className="text-[#344945]/50 hover:text-[#344945] transition-colors"
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
                                      className="bg-[#E0DCD1] focus:bg-[#F7F5F1] p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-[#D5E3E8] w-full text-sm font-mono text-[#344945] transition-all border-none"
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
                                      className="bg-[#E0DCD1] focus:bg-[#F7F5F1] p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#D5E3E8] text-xs w-full placeholder:text-[#344945]/50 resize-none h-20 transition-all border-none"
                                      placeholder="Add short note..."
                                    />
                                    <button
                                      onClick={() =>
                                        saveDetailsDropdown(row.id)
                                      }
                                      className="w-full flex items-center justify-center gap-2 text-xs font-bold bg-[#344945] text-[#F7F5F1] rounded-xl py-3 mt-1 hover:opacity-90 transition-all border-none"
                                    >
                                      <Save size={14} /> Save
                                    </button>
                                  </motion.div>
                                )}
                            </AnimatePresence>
                          </td>
                          {/* Provider */}
                          <td className="px-4 py-2 text-[#344945] text-xs font-medium">
                            <input
                              type="text"
                              value={row.provider}
                              onChange={(e) =>
                                updateRow(row.id, "provider", e.target.value)
                              }
                              onBlur={() => syncRowToDB(row)}
                              onKeyDown={(e) =>
                                e.key === "Enter" && e.target.blur()
                              }
                              className="bg-transparent w-full focus:bg-[#E0DCD1]/30 p-1.5 rounded-lg outline-none transition-colors border-none"
                              placeholder="Provider..."
                            />
                          </td>
                          {/* Shared by */}
                          <td className="px-4 py-2 text-[#344945] text-xs font-medium whitespace-nowrap rounded-r-2xl">
                            <input
                              type="text"
                              value={row.sharedBy}
                              onChange={(e) =>
                                updateRow(row.id, "sharedBy", e.target.value)
                              }
                              onBlur={() => syncRowToDB(row)}
                              onKeyDown={(e) =>
                                e.key === "Enter" && e.target.blur()
                              }
                              className="bg-transparent w-full focus:bg-[#E0DCD1]/30 p-1.5 rounded-lg outline-none transition-colors border-none"
                              placeholder="Name..."
                            />
                          </td>
                        </motion.tr>
                      ))}
                      {filteredRows.length === 0 && (
                        <tr>
                          <td
                            colSpan="8"
                            className="text-center py-12 text-[#344945]/50 font-medium"
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
                            className="text-[#344945] opacity-50 hover:opacity-100 font-semibold text-xs flex items-center gap-2 transition-opacity"
                          >
                            <Plus size={14} /> New Entry
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
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
              className="absolute inset-0 bg-[#344945]/40 backdrop-blur-sm"
              onClick={toggleCalendar}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-3xl bg-transparent flex flex-col animate-in duration-300"
            >
              <div className="grid grid-cols-3 gap-4 w-full mx-auto p-6 rounded-[3rem] bg-[#F7F5F1] shadow-2xl relative">
                {/* Close Button Top Right */}
                <button
                  onClick={toggleCalendar}
                  className="absolute -top-3 -right-3 text-[#344945] shadow-lg transition-colors z-50 bg-[#E0DCD1] hover:bg-white p-2.5 rounded-full"
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
                          : "bg-[#E0DCD1] text-[#344945]",
                      )}
                    >
                      <div className="flex items-end justify-between mb-4">
                        <span
                          className={clsx(
                            "text-3xl font-bold leading-none",
                            isToday ? "text-white" : "text-[#344945]",
                          )}
                        >
                          {format(dateObj, "dd")}
                        </span>
                        <span
                          className={clsx(
                            "text-xs font-bold uppercase tracking-widest",
                            isToday ? "text-white/80" : "text-[#344945]/50",
                          )}
                        >
                          {format(dateObj, "EEE")}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2 flex-1 overflow-y-auto custom-scrollbar pr-1 relative z-10">
                        {dayEvents.map((ev) => (
                          <div
                            key={ev.id}
                            className={clsx(
                              "p-3 rounded-xl text-xs font-medium border-none shadow-sm",
                              isToday
                                ? "bg-white/20 text-white"
                                : "bg-[#F7F5F1] text-[#344945]",
                            )}
                          >
                            <div className="truncate">{ev.topic}</div>
                            {ev.note && (
                              <div
                                className={clsx(
                                  "text-[10px] mt-1 truncate",
                                  isToday
                                    ? "text-white/70"
                                    : "text-[#344945]/50",
                                )}
                              >
                                {ev.note}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Hover + Button */}
                      {!isAddingEvent && (
                        <div className="absolute inset-0 bg-[#344945]/10 backdrop-blur-sm opacity-0 group-hover/cal:opacity-100 transition-opacity flex items-center justify-center z-20">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setAddingEventDate(dateObj);
                            }}
                            className="bg-white text-[#344945] rounded-full p-4 shadow-lg hover:scale-110 transition-transform"
                          >
                            <Plus size={24} />
                          </button>
                        </div>
                      )}

                      {/* Inline Add Event Form */}
                      <AnimatePresence>
                        {isAddingEvent && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute inset-0 bg-[#F7F5F1] z-30 rounded-[2rem] p-4 flex flex-col gap-3 justify-center border border-[#E0DCD1] shadow-xl"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-[#344945]">
                                Add Note
                              </span>
                              <button
                                onClick={() => setAddingEventDate(null)}
                                className="text-[#344945]/50 hover:text-[#344945]"
                              >
                                <X size={14} />
                              </button>
                            </div>
                            <input
                              type="text"
                              placeholder="Topic..."
                              value={newEventTopic}
                              onChange={(e) => setNewEventTopic(e.target.value)}
                              className="w-full text-xs p-2 rounded-lg bg-[#E0DCD1]/50 border-none outline-none focus:ring-1 focus:ring-[#344945] text-[#344945]"
                            />
                            <div className="flex items-center gap-2 bg-[#E0DCD1]/50 rounded-lg px-2">
                              <Clock size={12} className="text-[#344945]/50" />
                              <input
                                type="time"
                                value={newEventTime}
                                onChange={(e) =>
                                  setNewEventTime(e.target.value)
                                }
                                className="w-full text-xs p-2 bg-transparent border-none outline-none text-[#344945]"
                              />
                            </div>
                            <textarea
                              placeholder="Note..."
                              value={newEventNote}
                              onChange={(e) => setNewEventNote(e.target.value)}
                              className="w-full text-xs p-2 rounded-lg bg-[#E0DCD1]/50 border-none outline-none focus:ring-1 focus:ring-[#344945] text-[#344945] resize-none h-16"
                            />
                            <button
                              onClick={handleSaveNewEvent}
                              className="w-full bg-[#344945] text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2 hover:opacity-90"
                            >
                              <Save size={14} /> Save
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}

                {/* Bottom Middle JSD12 Cell (Row 3, Col 2) */}
                <div className="col-start-2 row-start-3 aspect-square rounded-[2rem] bg-[#E0DCD1]/50 flex flex-col items-center justify-center p-4 border-none">
                  <span className="text-[#344945]/60 text-xs font-mono font-bold tracking-widest mb-8">
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
    </div>
  );
}

export default App;
