import { Overview } from "./Overview";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../../api/user.api";
import Study from "./Recorder";
import StudyManager from "./Timer";
import Rankings from "./Rankings";
import NoteTaking from "./NoteTaking";
import TodoList from "./TodoList";
import Settings from "./settings";
import useTheme from "../../hooks/useTheme";
import blackLogo from "/black logo.png";
import whiteLogo from "/whitelogo.png";

export default function Dashboard() {
  const [activeItem, setActiveItem] = useState("rankings");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getCurrentUser();
        setCurrentUser(response.data.data);
      } catch (error) {
        console.error("Failed to fetch current user", error);
      }
    };

    fetchUser();
  }, []);

  const navItems = [
    { id: "rankings", name: "Rankings", icon: "R" },
    { id: "overview", name: "Analytics", icon: "A" },
    { id: "notetaking", name: "Notes Taking Tool", icon: "N" },
    { id: "study", name: "Study Session Recorder", icon: "S" },
    { id: "studyManager", name: "Deep Work Timer", icon: "D" },
    { id: "todolist", name: "Todo List", icon: "T" },
    { id: "settings", name: "Settings", icon: "S" },
  ];

  // Determine which logo to use based on theme
  const logo = theme === "dark" ? blackLogo : whiteLogo;

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300 relative flex overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-900 dark:via-black dark:to-purple-900/20" />
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/3 -left-1/4 w-[420px] h-[420px] bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/3 -right-1/4 w-[520px] h-[520px] bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <aside
        className={`${
          isCollapsed ? "w-20" : "w-64"
        } transition-all duration-300 ease-in-out bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-r border-gray-200 dark:border-zinc-800 flex flex-col relative z-10`}
      >
        <div className="h-16 px-5 flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 flex-shrink-0">
          {!isCollapsed && (
            <div className="flex items-center gap-2.5">
              <div>
                <img src={logo} alt="Logo" className="h-10 w-auto" />
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-md transition-colors text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${
                isCollapsed ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveItem(item.id)}
              className={`w-full group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                activeItem === item.id
                  ? "bg-blue-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-blue-600 dark:text-white shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
              }`}
            >
              <span className="text-xs font-bold flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                {item.icon}
              </span>
              {!isCollapsed && (
                <div className="flex items-center justify-between flex-1 min-w-0">
                  <span className="font-medium text-sm truncate">
                    {item.name}
                  </span>
                </div>
              )}
            </button>
          ))}
        </nav>

        {!isCollapsed && (
          <div className="p-3 border-t border-gray-200 dark:border-zinc-800 flex-shrink-0">
            <button
              onClick={() => setActiveItem("settings")}
              className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.username || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  currentUser?.username?.[0]?.toUpperCase() ||
                  currentUser?.email?.[0]?.toUpperCase() ||
                  "U"
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {currentUser?.username || "User"}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {currentUser?.email || ""}
                </p>
              </div>
            </button>
          </div>
        )}
      </aside>

      <main className="flex-1 overflow-hidden flex flex-col relative z-10">
        <header className="h-14 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {navItems.find((item) => item.id === activeItem)?.name}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-700 dark:text-yellow-300 hover:scale-105 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all duration-200"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2" />
                  <path d="M12 20v2" />
                  <path d="m4.93 4.93 1.41 1.41" />
                  <path d="m17.66 17.66 1.41 1.41" />
                  <path d="M2 12h2" />
                  <path d="M20 12h2" />
                  <path d="m6.34 17.66-1.41 1.41" />
                  <path d="m19.07 4.93-1.41 1.41" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9" />
                </svg>
              )}
            </button>
            <button className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-zinc-800">
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
            <button className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-zinc-800">
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Welcome back! Here's what's happening with your studies today.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 shadow-sm overflow-hidden">
              <div className="p-6">
                {activeItem === "rankings" && <Rankings />}
                {activeItem === "study" && <Study />}
                {activeItem === "studyManager" && <StudyManager />}
                {activeItem === "overview" && <Overview />}
                {activeItem === "notetaking" && <NoteTaking />}
                {activeItem === "todolist" && <TodoList />}
                {activeItem === "settings" && <Settings />}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}