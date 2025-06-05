import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  PlusCircleIcon,
  ClipboardDocumentListIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import { useBoardStore } from "../../store/boardStore";
import { useThemeStore } from "../../store/themeStore";

const Sidebar = () => {
  const { boards, createBoard } = useBoardStore();
  const { darkMode, toggleDarkMode } = useThemeStore();
  const navigate = useNavigate();
  const [newBoardName, setNewBoardName] = useState("");
  const [showNewBoardInput, setShowNewBoardInput] = useState(false);
  // Dark mode is now handled in MainLayout.jsx

  const handleCreateBoard = () => {
    if (newBoardName.trim()) {
      const newBoard = createBoard(newBoardName);
      setNewBoardName("");
      setShowNewBoardInput(false);
      navigate(`/board/${newBoard.id}`);
    }
  };
  return (
    <aside
      className={`${darkMode ? "bg-gray-800" : "bg-gray-200"} ${
        darkMode ? "text-white" : "text-gray-800"
      } w-64 min-h-screen p-4 flex flex-col h-full`}
    >
      <div className="flex items-center justify-between mb-6">
        <Link to={"/"}>
          <p className="font-medium text-xl flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-6"
            >
              <path d="M5.566 4.657A4.505 4.505 0 0 1 6.75 4.5h10.5c.41 0 .806.055 1.183.157A3 3 0 0 0 15.75 3h-7.5a3 3 0 0 0-2.684 1.657ZM2.25 12a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3v-6ZM5.25 7.5c-.41 0-.806.055-1.184.157A3 3 0 0 1 6.75 6h10.5a3 3 0 0 1 2.683 1.657A4.505 4.505 0 0 0 18.75 7.5H5.25Z" />
            </svg>
            TaskBoard
          </p>
        </Link>
        <button
          onClick={toggleDarkMode}
          className={`p-1 rounded-full ${
            darkMode
              ? "hover:bg-gray-800 text-yellow-400"
              : "hover:bg-gray-700 text-gray-200"
          }`}
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <SunIcon className="h-5 w-5" />
          ) : (
            <MoonIcon className="h-5 w-5" />
          )}
        </button>
      </div>
      <div>
        <h2
          className={`${
            darkMode ? "text-gray-400" : "text-gray-500"
          } text-xs uppercase mb-2`}
        >
          Your Boards
        </h2>
        <ul className="space-y-1">
          {boards.map((board) => (
            <li key={board.id}>
              <Link
                to={`/board/${board.id}`}
                className={`flex items-center ${
                  darkMode
                    ? "text-gray-300 hover:bg-gray-800"
                    : "text-gray-700 hover:bg-gray-100"
                } p-2 rounded text-sm`}
              >
                <ClipboardDocumentListIcon className="h-4 w-4 mr-2" />
                <span>{board.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      {/* Footer with GitHub link */}{" "}
      <div
        className={`mt-auto pt-6 border-t ${
          darkMode ? "border-gray-700" : "border-gray-200"
        } mt-6`}
      >
        <a
          href="https://github.com/HattySohaib/TaskBoard"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center text-sm ${
            darkMode
              ? "text-gray-400 hover:text-white"
              : "text-gray-500 hover:text-gray-800"
          } p-2`}
        >
          <svg
            className="h-5 w-5 mr-2"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              clipRule="evenodd"
            />
          </svg>
          View on GitHub
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
