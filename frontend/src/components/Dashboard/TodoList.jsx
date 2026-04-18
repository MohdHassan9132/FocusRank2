import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { createTodo, updateTodo as updateTodoApi, getTodayTodos, deleteTodo as deleteTodoApi, getTodosByDate } from "../../api/todo.api";

export default function TodoList() {
  const { accessToken } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [view, setView] = useState("today"); // today | all | done
  const [showAddForm, setShowAddForm] = useState(false);
  const [completingId, setCompletingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const editInputRef = useRef(null);

  const isToday = selectedDate === new Date().toISOString().split("T")[0];
  const isPastDate = new Date(selectedDate) < new Date(new Date().toISOString().split("T")[0]);
  const isFutureDate = new Date(selectedDate) > new Date(new Date().toISOString().split("T")[0]);

  /* ──── Fetch todos when date changes ──── */
  useEffect(() => {
    fetchTodosByDate();
  }, [selectedDate]);

  const fetchTodosByDate = async () => {
    setLoading(true);
    try {
      const res = await getTodosByDate(selectedDate, accessToken);
      setTasks(res.data.data);
    } catch (err) {
      console.error("Failed to fetch todos:", err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    setView("all");
  };

  const goToToday = () => {
    setSelectedDate(new Date().toISOString().split("T")[0]);
    setView("today");
  };

  const todayTotal = tasks.length;
  const todayDone = tasks.filter(t => t.isCompleted).length;
  const progress = todayTotal > 0 ? Math.round((todayDone / todayTotal) * 100) : 0;

  const filteredTasks = tasks.filter(t => {
    if (view === "today") return !t.isCompleted;
    if (view === "done") return t.isCompleted;
    return true; // "all" view
  });

  async function addTask() {
    if (!input.trim()) return;

    try {
      const res = await createTodo(
        { 
          task: input.trim(),
          date: selectedDate // Send the selected date to backend
        },
        accessToken
      );

      const saved = res.data.data;
      setTasks(p => [saved, ...p]);
      setInput("");
      setShowAddForm(false);
    } catch (err) {
      console.error("Failed to create todo:", err);
    }
  }

  async function toggleTask(id) {
    // Prevent toggling tasks from past dates
    if (isPastDate) {
      alert("Cannot modify tasks from past dates");
      return;
    }
    
    const task = tasks.find(t => t._id === id);
    if (!task) return;
    
    setCompletingId(id);
    try {
      await updateTodoApi(id, { isCompleted: !task.isCompleted }, accessToken);
      setTasks(p => p.map(t => t._id === id ? { ...t, isCompleted: !t.isCompleted } : t));
    } catch (err) {
      console.error("Failed to toggle todo:", err);
    }
    setCompletingId(null);
  }

  async function deleteTask(id) {
    // Prevent deleting tasks from past dates
    if (isPastDate) {
      alert("Cannot delete tasks from past dates");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteTodoApi(id, accessToken);
      setTasks(p => p.filter(t => t._id !== id));
    } catch (err) {
      console.error("Failed to delete todo:", err);
      alert("Failed to delete task. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  function startEdit(task) {
    // Prevent editing tasks from past dates
    if (isPastDate) {
      alert("Cannot edit tasks from past dates");
      return;
    }
    
    setEditingId(task._id);
    setEditText(task.task);
    setTimeout(() => editInputRef.current?.focus(), 50);
  }

  async function saveEdit(id) {
    if (!editText.trim()) {
      setEditingId(null);
      return;
    }

    try {
      await updateTodoApi(id, { task: editText.trim() }, accessToken);
      setTasks(p => p.map(t => t._id === id ? { ...t, task: editText.trim() } : t));
      setEditingId(null);
      setEditText("");
    } catch (err) {
      console.error("Failed to update todo:", err);
      alert("Failed to update task. Please try again.");
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setEditText("");
  }

  function clearCompleted() {
    // Prevent clearing completed tasks from past dates
    if (isPastDate) {
      alert("Cannot modify tasks from past dates");
      return;
    }
    
    const completedTasks = tasks.filter(t => t.isCompleted);
    if (completedTasks.length === 0) return;
    
    if (window.confirm(`Delete ${completedTasks.length} completed task(s)?`)) {
      Promise.all(completedTasks.map(task => deleteTodoApi(task._id, accessToken)))
        .then(() => {
          setTasks(p => p.filter(t => !t.isCompleted));
        })
        .catch(err => {
          console.error("Failed to clear completed tasks:", err);
          alert("Failed to clear completed tasks. Please try again.");
        });
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return date.toLocaleDateString("en", { month: "short", day: "numeric" });
  }

  function formatHeaderDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return date.toLocaleDateString("en", { month: "long", day: "numeric", year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined });
  }

  // Get min date for date picker (today)
  const minDate = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-white font-sans flex items-start justify-center py-10 px-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { font-family: 'DM Sans', system-ui, sans-serif; }
        .mono { font-family: 'DM Mono', monospace; }
        .task-enter { animation: taskIn 0.25s cubic-bezier(0.16,1,0.3,1) forwards; }
        @keyframes taskIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        .completing { animation: completeOut 0.4s ease forwards; }
        @keyframes completeOut { to{opacity:0;transform:translateX(12px) scale(0.97)} }
        .deleting { animation: deleteOut 0.3s ease forwards; }
        @keyframes deleteOut { to{opacity:0;transform:translateX(-20px) scale(0.95)} }
        .progress-bar { transition: width 0.6s cubic-bezier(0.16,1,0.3,1); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a2e; border-radius: 4px; }
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(0.5);
          cursor: pointer;
        }
        input[type="date"]::-webkit-calendar-picker-indicator:hover {
          filter: invert(0.7);
        }
      `}</style>

      <div className="w-full max-w-2xl">
        {/* ── HEADER WITH DATE PICKER ── */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">Focus</h1>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5">
                  <span className="text-xs text-zinc-500 mono">📅</span>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    min={minDate}
                    className="bg-transparent text-white text-sm mono outline-none cursor-pointer"
                  />
                </div>
                {!isToday && (
                  <button
                    onClick={goToToday}
                    className="text-xs text-violet-400 hover:text-violet-300 transition-colors mono"
                  >
                    Today →
                  </button>
                )}
              </div>
              <p className="text-xs text-zinc-500 mono mt-2">
                {formatHeaderDate(selectedDate)}
              </p>
            </div>
            
            {/* Only show "New task" button for today and future dates */}
            {!isPastDate && (
              <button 
                onClick={() => { setShowAddForm(p => !p); setTimeout(() => inputRef.current?.focus(), 50); }}
                className="flex items-center gap-2 bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-zinc-100 transition-colors"
              >
                <span className="text-base leading-none">+</span> New task
              </button>
            )}
            
            {isPastDate && (
              <div className="text-xs text-zinc-600 mono px-4 py-2 bg-zinc-900 rounded-lg border border-zinc-800">
                📜 Read-only
              </div>
            )}
          </div>

          {/* Progress bar - only show for today/future */}
          {todayTotal > 0 && !loading && !isPastDate && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-zinc-500 mono">Progress</span>
                <span className="text-xs text-zinc-400 mono">{todayDone}/{todayTotal}</span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="progress-bar h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full"
                     style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {loading && (
            <div className="mt-4">
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full animate-pulse"
                     style={{ width: "50%" }} />
              </div>
            </div>
          )}
        </div>

        {/* ── ADD TASK FORM (only for today/future) ── */}
        {showAddForm && !isPastDate && (
          <div className="bg-zinc-900 border border-zinc-700/60 rounded-xl p-4 mb-5 task-enter">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addTask()}
              placeholder={`Add a task for ${formatHeaderDate(selectedDate)}...`}
              className="w-full bg-transparent text-white placeholder-zinc-600 text-sm outline-none mb-4 font-medium"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddForm(false)}
                className="text-xs text-zinc-500 hover:text-zinc-300 px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={addTask}
                disabled={!input.trim()}
                className="text-xs bg-white text-black font-medium px-4 py-1.5 rounded-lg hover:bg-zinc-100 transition-colors disabled:opacity-30"
              >
                Add task
              </button>
            </div>
          </div>
        )}

        {/* ── VIEWS ── */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 gap-0.5">
            {[["today", "Active"], ["all", "All"], ["done", "Completed"]].map(([v, l]) => (
              <button 
                key={v} 
                onClick={() => setView(v)}
                className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  view === v ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {l}
                {v === "today" && todayTotal > 0 && (
                  <span className={`ml-1.5 mono text-[10px] ${view === v ? "text-zinc-300" : "text-zinc-600"}`}>
                    {todayTotal - todayDone}
                  </span>
                )}
              </button>
            ))}
          </div>
          
          {isPastDate && (
            <span className="text-[10px] text-amber-500/70 mono bg-amber-500/10 px-2 py-1 rounded">
              ⚠️ Past date - Read only
            </span>
          )}
        </div>

        {/* ── TASK LIST ── */}
        <div className="space-y-2">
          {!loading && filteredTasks.length === 0 && (
            <div className="text-center py-16">
              <div className="text-3xl mb-3">{view === "done" ? "🎉" : "✦"}</div>
              <p className="text-zinc-600 text-sm">
                {view === "done" 
                  ? "Nothing completed yet" 
                  : view === "today" 
                    ? "No active tasks" 
                    : `No tasks for ${formatHeaderDate(selectedDate)}`}
              </p>
              {!isPastDate && view !== "done" && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-4 text-xs text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Add a task for {formatHeaderDate(selectedDate)} →
                </button>
              )}
            </div>
          )}

          {loading && (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 animate-pulse">
                  <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          )}

          {filteredTasks.map((task, i) => {
            const isCompleting = completingId === task._id;
            const isDeleting = deletingId === task._id;
            const isEditing = editingId === task._id;
            const dateInfo = task.date ? formatDate(task.date) : null;

            return (
              <div key={task._id}
                className={`group task-enter bg-zinc-900 border rounded-xl overflow-hidden transition-all duration-200 ${
                  isPastDate ? "opacity-75 border-zinc-800/50" : "hover:border-zinc-700/70"
                } ${isCompleting ? "completing" : isDeleting ? "deleting" : ""} ${
                  task.isCompleted ? "border-zinc-800/50" : "border-zinc-800"
                }`}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="flex items-start gap-3 p-3.5">
                  {/* Checkbox - disabled for past dates */}
                  <button 
                    onClick={() => toggleTask(task._id)}
                    disabled={isDeleting || isEditing || isPastDate}
                    className={`mt-0.5 w-[18px] h-[18px] rounded-md border flex-shrink-0 flex items-center justify-center transition-all ${
                      task.isCompleted ? "bg-violet-500 border-violet-500" : "border-zinc-600 hover:border-zinc-400 bg-transparent"
                    } ${(isDeleting || isEditing || isPastDate) ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {task.isCompleted && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <input
                          ref={editInputRef}
                          value={editText}
                          onChange={e => setEditText(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === "Enter") saveEdit(task._id);
                            if (e.key === "Escape") cancelEdit();
                          }}
                          className="flex-1 bg-zinc-800 text-white text-sm rounded-lg px-2 py-1 border border-zinc-700 focus:border-violet-500 outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => saveEdit(task._id)}
                          className="text-xs bg-violet-500 text-white px-2 py-1 rounded hover:bg-violet-600 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-xs bg-zinc-700 text-zinc-300 px-2 py-1 rounded hover:bg-zinc-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <p 
                          className={`text-sm leading-snug transition-all ${
                            !isPastDate ? "cursor-pointer hover:text-violet-400" : ""
                          } ${
                            task.isCompleted ? "line-through text-zinc-600" : "text-zinc-100"
                          } ${isDeleting ? "opacity-50" : ""}`}
                          onDoubleClick={() => !isPastDate && !task.isCompleted && startEdit(task)}
                        >
                          {task.task}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {dateInfo && (
                            <span className="mono text-[10px] text-zinc-500">
                              📅 {dateInfo}
                            </span>
                          )}
                          {!isPastDate && !task.isCompleted && (
                            <span className="mono text-[10px] text-zinc-600">
                              Double-click to edit
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Action buttons - hidden for past dates */}
                  {!isEditing && !isPastDate && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!task.isCompleted && (
                        <button 
                          onClick={() => startEdit(task)}
                          disabled={isDeleting}
                          className="p-1.5 rounded-lg text-zinc-600 hover:text-blue-400 hover:bg-blue-400/10 transition-all text-xs"
                        >
                          ✎
                        </button>
                      )}
                      <button 
                        onClick={() => deleteTask(task._id)}
                        disabled={isDeleting}
                        className={`p-1.5 rounded-lg transition-all text-xs ${
                          isDeleting 
                            ? "opacity-50 cursor-not-allowed" 
                            : "text-zinc-600 hover:text-red-400 hover:bg-red-400/10"
                        }`}
                      >
                        {isDeleting ? "..." : "✕"}
                      </button>
                    </div>
                  )}
                  
                  {/* Past date indicator */}
                  {isPastDate && (
                    <div className="text-zinc-700 text-xs">
                      🔒
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── STATS FOOTER ── */}
        {tasks.length > 0 && !loading && !isPastDate && (
          <div className="mt-8 flex items-center justify-between text-[11px] mono text-zinc-600 border-t border-zinc-800/60 pt-4">
            <span>{tasks.filter(t => !t.isCompleted).length} remaining · {tasks.filter(t => t.isCompleted).length} completed</span>
            {tasks.filter(t => t.isCompleted).length > 0 && (
              <button 
                onClick={clearCompleted}
                className="hover:text-zinc-400 transition-colors"
              >
                Clear completed
              </button>
            )}
          </div>
        )}
        
        {tasks.length > 0 && !loading && isPastDate && (
          <div className="mt-8 text-center text-[11px] mono text-zinc-600 border-t border-zinc-800/60 pt-4">
            <span>📜 Past tasks are read-only</span>
          </div>
        )}
      </div>
    </div>
  );
}