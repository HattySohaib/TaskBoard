import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useThemeStore } from "../../store/themeStore";
import { useEffect } from "react";

const MainLayout = () => {
  const { darkMode } = useThemeStore();

  useEffect(() => {
    // Apply theme class to document
    if (darkMode) {
      document.documentElement.classList.add("dark-mode");
      document.documentElement.classList.remove("light-mode");
    } else {
      document.documentElement.classList.add("light-mode");
      document.documentElement.classList.remove("dark-mode");
    }

    return () => {
      // Cleanup
      document.documentElement.classList.remove("dark-mode", "light-mode");
    };
  }, [darkMode]);
  return (
    <div className={`flex h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
