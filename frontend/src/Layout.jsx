import Header from "./components/Header/Header";
import { Outlet, useLocation } from "react-router-dom";
import { themePages } from "./config/themePaths";

export default function Layout() {
  const { pathname } = useLocation();
  const isThemedPage = themePages.includes(pathname);

  return (
    <div
      className={
        isThemedPage
          ? "min-h-screen bg-white dark:bg-black transition-colors duration-300"
          : undefined
      }
    >
      <Header />
      <Outlet />
    </div>
  );
}
