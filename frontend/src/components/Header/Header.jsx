import { Link, NavLink } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import blackLogo from "/black logo.png";
import whiteLogo from "/whitelogo.png";
import useTheme from "../../hooks/useTheme";

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  // Determine which logo to use based on theme
  const logo = theme === "dark" ? blackLogo : whiteLogo;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-black shadow">
      <nav className="px-4 lg:px-6 py-3">
        <div className="flex items-center justify-between mx-auto max-w-screen-xl">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img src={logo} className="h-12 w-auto" alt="Logo" />
            </Link>
          </div>

          <div className="hidden lg:flex items-center">
            <ul className="flex items-center space-x-8">
              <li>
                <NavLink
                  to="/#home"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Home
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/#features"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Features
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/#faqs"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  FAQs
                </NavLink>
              </li>
            </ul>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-700 dark:text-yellow-300 hover:scale-105 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all duration-200"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}