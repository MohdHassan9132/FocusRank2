import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  createTodo,
  updateTodo as updateTodoApi,
  deleteTodo as deleteTodoApi,
  getTodosByDate,
} from "../../api/todo.api";

export default function TodoList() {
  const { accessToken } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [view, setView] = useState("today");
  const [showAddForm, setShowAddForm] = useState(false);
  const [completingId, setCompletingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const editInputRef = useRef(null);

  const todayIso = new Date().toISOString().split("T")[0];
  const isToday = selectedDate === todayIso;
  const isPastDate = new Date(selectedDate) < new Date(todayIso);

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
    setSelectedDate(e.target.value);
    setView("all");
  };

  const goToToday = () => {
    setSelectedDate(todayIso);
    setView("today");
  };

  const todayTotal = tasks.length;
  const todayDone = tasks.filter((t) => t.isCompleted).length;
  const progress = todayTotal > 0 ? Math.round((todayDone / todayTotal) * 100) : 0;

  const filteredTasks = tasks.filter((t) => {
    if (view === "today") return !t.isCompleted;
    if (view === "done") return t.isCompleted;
    return true;
  });

  async function addTask() {
    if (!input.trim()) return;

    try {
      const res = await createTodo(
        {
          task: input.trim(),
          date: selectedDate,
        },
        accessToken
      );

      const saved = res.data.data;
      setTasks((p) => [saved, ...p]);
      setInput("");
      setShowAddForm(false);
    } catch (err) {
      console.error("Failed to create todo:", err);
    }
  }

  async function toggleTask(id) {
    if (isPastDate) {
      alert("Cannot modify tasks from past dates");
      return;
    }

    const task = tasks.find((t) => t._id === id);
    if (!task) return;

    setCompletingId(id);
    try {
      await updateTodoApi(id, { isCompleted: !task.isCompleted }, accessToken);
      setTasks((p) =>
        p.map((t) => (t._id === id ? { ...t, isCompleted: !t.isCompleted } : t))
      );
    } catch (err) {
      console.error("Failed to toggle todo:", err);
    }
    setCompletingId(null);
  }

  async function deleteTask(id) {
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
      setTasks((p) => p.filter((t) => t._id !== id));
    } catch (err) {
      console.error("Failed to delete todo:", err);
      alert("Failed to delete task. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  function startEdit(task) {
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
      setTasks((p) =>
        p.map((t) => (t._id === id ? { ...t, task: editText.trim() } : t))
      );
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
    if (isPastDate) {
      alert("Cannot modify tasks from past dates");
      return;
    }

    const completedTasks = tasks.filter((t) => t.isCompleted);
    if (completedTasks.length === 0) return;

    if (window.confirm(`Delete ${completedTasks.length} completed task(s)?`)) {
      Promise.all(completedTasks.map((task) => deleteTodoApi(task._id, accessToken)))
        .then(() => {
          setTasks((p) => p.filter((t) => !t.isCompleted));
        })
        .catch((err) => {
          console.error("Failed to clear completed tasks:", err);
          alert("Failed to clear completed tasks. Please try again.");
        });
    }
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
    return date.toLocaleDateString("en", {
      month: "long",
      day: "numeric",
      year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
  }

  const minDate = todayIso;
  const inputClass =
    "w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 rounded-xl px-3 py-2 outline-none focus:border-blue-500";

  return (
    <div className="bg-white dark:bg-black transition-colors duration-300">
      <div className="w-full max-w-2xl">
        <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-6 md:p-8">
          <div className="mb-8">
            <div className="flex items-start justify-between mb-1 gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Focus
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-1.5">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={handleDateChange}
                      min={minDate}
                      className="bg-transparent text-gray-900 dark:text-white text-sm outline-none cursor-pointer"
                    />
                  </div>
                  {!isToday && (
                    <button
                      onClick={goToToday}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      Today {"->"}
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  {formatHeaderDate(selectedDate)}
                </p>
              </div>

              {!isPastDate ? (
                <button
                  onClick={() => {
                    setShowAddForm((p) => !p);
                    setTimeout(() => inputRef.current?.focus(), 50);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 px-5 py-2.5 text-sm font-bold"
                >
                  <span className="text-base leading-none">+</span> New task
                </button>
              ) : (
                <div className="text-xs text-gray-600 dark:text-gray-400 px-4 py-2 bg-gray-50 dark:bg-zinc-950 rounded-xl border border-gray-200 dark:border-zinc-800">
                  Read-only
                </div>
              )}
            </div>

            {todayTotal > 0 && !loading && !isPastDate && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Progress
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {todayDone}/{todayTotal}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {loading && (
              <div className="mt-6">
                <div className="h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full animate-pulse"
                    style={{ width: "50%" }}
                  />
                </div>
              </div>
            )}
          </div>

          {showAddForm && !isPastDate && (
            <div className="bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 mb-6">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
                placeholder={`Add a task for ${formatHeaderDate(selectedDate)}...`}
                className={`${inputClass} mb-4`}
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-gray-600 dark:text-gray-400 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={addTask}
                  disabled={!input.trim()}
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed px-4 py-1.5"
                >
                  Add task
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
            <div className="flex bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl p-0.5 gap-0.5">
              {[["today", "Active"], ["all", "All"], ["done", "Completed"]].map(
                ([v, l]) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                      view === v
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {l}
                  </button>
                )
              )}
            </div>

            {isPastDate && (
              <span className="text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded border border-amber-200 dark:border-amber-900">
                Past date - Read only
              </span>
            )}
          </div>

          <div className="space-y-2">
            {!loading && filteredTasks.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {view === "done"
                    ? "Nothing completed yet"
                    : view === "today"
                      ? "No active tasks"
                      : `No tasks for ${formatHeaderDate(selectedDate)}`}
                </p>
                {!isPastDate && view !== "done" && (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="mt-4 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Add a task for {formatHeaderDate(selectedDate)} {"->"}
                  </button>
                )}
              </div>
            )}

            {loading && (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 animate-pulse"
                  >
                    <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-3/4" />
                  </div>
                ))}
              </div>
            )}

            {filteredTasks.map((task) => {
              const isDeleting = deletingId === task._id;
              const isEditing = editingId === task._id;

              return (
                <div
                  key={task._id}
                  className={`group rounded-xl border bg-white dark:bg-zinc-900 overflow-hidden transition-all duration-200 ${
                    task.isCompleted
                      ? "border-gray-200 dark:border-zinc-800"
                      : "border-gray-200 dark:border-zinc-800 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start gap-3 p-4">
                    <button
                      onClick={() => toggleTask(task._id)}
                      disabled={isDeleting || isEditing || isPastDate}
                      className={`mt-0.5 w-[20px] h-[20px] rounded-lg border flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
                        task.isCompleted
                          ? "bg-blue-600 border-blue-600"
                          : "border-gray-300 dark:border-zinc-700 hover:border-blue-400 bg-transparent"
                      } ${(isDeleting || isEditing || isPastDate) ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {task.isCompleted && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="flex gap-2">
                          <input
                            ref={editInputRef}
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit(task._id);
                              if (e.key === "Escape") cancelEdit();
                            }}
                            className={`${inputClass} flex-1`}
                            autoFocus
                          />
                          <button
                            onClick={() => saveEdit(task._id)}
                            className="text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 px-3 py-2"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-xs border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <p
                            className={`text-sm leading-snug transition-all duration-200 ${
                              !isPastDate ? "cursor-pointer hover:text-blue-600 dark:hover:text-blue-400" : ""
                            } ${
                              task.isCompleted
                                ? "line-through text-gray-500 dark:text-gray-400"
                                : "text-gray-900 dark:text-white"
                            } ${isDeleting ? "opacity-50" : ""}`}
                            onDoubleClick={() => !isPastDate && !task.isCompleted && startEdit(task)}
                          >
                            {task.task}
                          </p>
                          {!isPastDate && !task.isCompleted && (
                            <span className="text-[10px] text-gray-600 dark:text-gray-400 mt-1 inline-block">
                              Double-click to edit
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    {!isEditing && !isPastDate && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {!task.isCompleted && (
                          <button
                            onClick={() => startEdit(task)}
                            disabled={isDeleting}
                            className="p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all duration-200 text-xs"
                          >
                            Edit
                          </button>
                        )}
                        <button
                          onClick={() => deleteTask(task._id)}
                          disabled={isDeleting}
                          className={`p-1.5 rounded-lg transition-all duration-200 text-xs ${
                            isDeleting
                              ? "opacity-50 cursor-not-allowed"
                              : "text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
                          }`}
                        >
                          {isDeleting ? "..." : "Delete"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {tasks.length > 0 && !loading && !isPastDate && (
            <div className="mt-8 flex items-center justify-between text-[11px] text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-zinc-800 pt-5">
              <span>
                {tasks.filter((t) => !t.isCompleted).length} remaining -{" "}
                {tasks.filter((t) => t.isCompleted).length} completed
              </span>
              {tasks.filter((t) => t.isCompleted).length > 0 && (
                <button
                  onClick={clearCompleted}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                >
                  Clear completed
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
