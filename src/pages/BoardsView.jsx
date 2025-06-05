import { useState, useMemo, useEffect } from "react";
import { useBoardStore } from "../store/boardStore";
import BoardCard from "../components/board/BoardCard";
import {
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  ArrowsUpDownIcon,
  ClockIcon,
  CheckIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

const BoardsView = () => {
  const { boards, createBoard } = useBoardStore();
  const [showNewBoardInput, setShowNewBoardInput] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardDescription, setNewBoardDescription] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  // Filter and sort state
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showSortPanel, setShowSortPanel] = useState(false); // Added state for sort panel
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc"); // desc = newest first
  const [taskFilter, setTaskFilter] = useState("all"); // all, hasTasks, noTasks, hasDueSoon, hasOverdue
  const [dateFilter, setDateFilter] = useState("all"); // all, today, thisWeek, thisMonth

  const handleCreateBoard = () => {
    if (newBoardName.trim()) {
      createBoard(newBoardName, newBoardDescription);
      setNewBoardName("");
      setNewBoardDescription("");
      setShowNewBoardInput(false);
    }
  };
  const toggleSort = (field) => {
    if (sortBy === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new field and default direction
      setSortBy(field);
      setSortDirection("desc"); // Most recent first by default
    }
    // Hide the sort panel after selection
    setShowSortPanel(false);
  };

  // Compute filtered and sorted boards
  const filteredAndSortedBoards = useMemo(() => {
    // First, filter boards
    let result = [...boards];

    // Apply search filter
    if (searchTerm) {
      result = result.filter((board) =>
        board.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply task filters
    if (taskFilter !== "all") {
      result = result.filter((board) => {
        const now = new Date();
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(now.getDate() + 3);

        let hasTasks = false;
        let hasDueSoon = false;
        let hasOverdue = false;

        for (const column of board.columns) {
          if (column.tasks.length > 0) {
            hasTasks = true;

            for (const task of column.tasks) {
              if (!task.dueDate) continue;

              const dueDate = new Date(task.dueDate);
              if (dueDate <= threeDaysFromNow && dueDate >= now) {
                hasDueSoon = true;
              }
              if (dueDate < now) {
                hasOverdue = true;
              }
            }
          }
        }

        switch (taskFilter) {
          case "hasTasks":
            return hasTasks;
          case "noTasks":
            return !hasTasks;
          case "hasDueSoon":
            return hasDueSoon;
          case "hasOverdue":
            return hasOverdue;
          default:
            return true;
        }
      });
    }

    // Apply date filters
    if (dateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeekStart = new Date(today);
      thisWeekStart.setDate(today.getDate() - today.getDay());
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      result = result.filter((board) => {
        const createdAt = new Date(board.createdAt);

        switch (dateFilter) {
          case "today":
            return createdAt >= today;
          case "thisWeek":
            return createdAt >= thisWeekStart;
          case "thisMonth":
            return createdAt >= thisMonthStart;
          default:
            return true;
        }
      });
    }

    // Then, sort the filtered boards
    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return sortDirection === "asc"
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        case "taskCount": {
          const aCount = a.columns.reduce(
            (sum, col) => sum + col.tasks.length,
            0
          );
          const bCount = b.columns.reduce(
            (sum, col) => sum + col.tasks.length,
            0
          );
          return sortDirection === "asc" ? aCount - bCount : bCount - aCount;
        }
        case "createdAt":
        default:
          return sortDirection === "asc"
            ? new Date(a.createdAt) - new Date(b.createdAt)
            : new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return result;
  }, [boards, searchTerm, sortBy, sortDirection, taskFilter, dateFilter]); // Close menus when clicking outside
  const handleClickOutside = (e) => {
    if (!e.target.closest(".sort-menu") && !e.target.closest(".sort-button")) {
      setShowSortPanel(false);
    }

    if (
      !e.target.closest(".filter-menu") &&
      !e.target.closest(".filter-button")
    ) {
      setShowFilterPanel(false);
    }
  };

  // Add event listener for clicks
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 dark-mode:bg-gray-900">
        {/* Top row: Boards title and search */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-6"
            >
              <path
                fillRule="evenodd"
                d="M1.5 5.625c0-1.036.84-1.875 1.875-1.875h17.25c1.035 0 1.875.84 1.875 1.875v12.75c0 1.035-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 0 1 1.5 18.375V5.625ZM21 9.375A.375.375 0 0 0 20.625 9h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 0 0 .375-.375v-1.5Zm0 3.75a.375.375 0 0 0-.375-.375h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 0 0 .375-.375v-1.5Zm0 3.75a.375.375 0 0 0-.375-.375h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 0 0 .375-.375v-1.5ZM10.875 18.75a.375.375 0 0 0 .375-.375v-1.5a.375.375 0 0 0-.375-.375h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5ZM3.375 15h7.5a.375.375 0 0 0 .375-.375v-1.5a.375.375 0 0 0-.375-.375h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375Zm0-3.75h7.5a.375.375 0 0 0 .375-.375v-1.5A.375.375 0 0 0 10.875 9h-7.5A.375.375 0 0 0 3 9.375v1.5c0 .207.168.375.375.375Z"
                clipRule="evenodd"
              />
            </svg>
            <p className="ml-2 text-xl font-medium text-gray-900 dark-mode:text-gray-100">
              Boards
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-72">
            <input
              type="text"
              placeholder="Search boards..."
              className="pl-10 w-full border border-gray-300 dark-mode:border-gray-600 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark-mode:bg-gray-700 dark-mode:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Bottom row: Action buttons and filters */}
        <div className="bg-white dark-mode:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark-mode:border-gray-700 mb-3">
          <div className="flex items-center justify-between space-x-3">
            <button
              onClick={() => setShowNewBoardInput(true)}
              className="flex items-center text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Create Board
            </button>

            <div className="flex items-center space-x-3">
              {/* Sort dropdown */}
              <div className="relative">
                <button
                  className="flex items-center text-sm border border-gray-300 dark-mode:border-gray-600 px-3 py-1.5 rounded bg-white dark-mode:bg-gray-800 text-gray-700 dark-mode:text-gray-200 hover:bg-gray-50 dark-mode:hover:bg-gray-700 sort-button"
                  onClick={() => {
                    setShowSortPanel(!showSortPanel);
                    setShowFilterPanel(false);
                  }}
                >
                  <ArrowsUpDownIcon className="h-4 w-4 mr-1" />
                  Sort:
                  {sortBy === "name"
                    ? "Name"
                    : sortBy === "taskCount"
                    ? "Tasks"
                    : "Date"}
                  {sortDirection === "asc" ? " ↑" : " ↓"}
                </button>
                {showSortPanel && (
                  <div className="absolute right-0 mt-1 p-2 space-y-2 bg-white dark-mode:bg-gray-800 border border-gray-200 dark-mode:border-gray-700 rounded shadow-lg z-10 w-40 sort-menu">
                    <button
                      className={`w-full text-left px-4 py-2 text-sm ${
                        sortBy === "createdAt"
                          ? "bg-indigo-50 text-indigo-700 dark-mode:bg-indigo-900/20 dark-mode:text-indigo-300"
                          : "hover:bg-gray-100 dark-mode:hover:bg-gray-700"
                      }`}
                      onClick={() => toggleSort("createdAt")}
                    >
                      Date Created
                    </button>
                    <button
                      className={`w-full text-left px-4 py-2 text-sm ${
                        sortBy === "name"
                          ? "bg-indigo-50 text-indigo-700 dark-mode:bg-indigo-900/20 dark-mode:text-indigo-300"
                          : "hover:bg-gray-100 dark-mode:hover:bg-gray-700"
                      }`}
                      onClick={() => toggleSort("name")}
                    >
                      Name
                    </button>
                    <button
                      className={`w-full text-left px-4 py-2 text-sm ${
                        sortBy === "taskCount"
                          ? "bg-indigo-50 text-indigo-700 dark-mode:bg-indigo-900/20 dark-mode:text-indigo-300"
                          : "hover:bg-gray-100 dark-mode:hover:bg-gray-700"
                      }`}
                      onClick={() => toggleSort("taskCount")}
                    >
                      Task Count
                    </button>
                  </div>
                )}
              </div>
              {/* Filter button */}
              <div className="relative">
                {" "}
                <button
                  onClick={() => {
                    setShowFilterPanel(!showFilterPanel);
                    setShowSortPanel(false);
                  }}
                  className={`flex items-center text-sm border filter-button ${
                    taskFilter !== "all" || dateFilter !== "all"
                      ? "border-indigo-500 text-indigo-600 dark-mode:border-indigo-400 dark-mode:text-indigo-300"
                      : "border-gray-300 text-gray-700 dark-mode:border-gray-600 dark-mode:text-gray-200"
                  } px-3 py-1.5 rounded bg-white dark-mode:bg-gray-800 hover:bg-gray-50 dark-mode:hover:bg-gray-700`}
                >
                  <FunnelIcon className="h-4 w-4 mr-1" />
                  Filter
                  {(taskFilter !== "all" || dateFilter !== "all") && (
                    <span className="ml-1 text-xs bg-indigo-600 text-white px-1.5 py-0.5 rounded-full">
                      {taskFilter !== "all" && dateFilter !== "all" ? 2 : 1}
                    </span>
                  )}
                </button>
                {showFilterPanel && (
                  <div className="absolute right-0 mt-1 bg-white dark-mode:bg-gray-800 border border-gray-200 dark-mode:border-gray-700 rounded shadow-lg z-10 w-64">
                    <div className="p-3">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium text-gray-900 dark-mode:text-gray-100">
                          Filters
                        </h3>
                        {(taskFilter !== "all" || dateFilter !== "all") && (
                          <button
                            onClick={() => {
                              setTaskFilter("all");
                              setDateFilter("all");
                            }}
                            className="text-xs text-red-600 hover:text-red-700"
                          >
                            Clear All
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        {/* Task filters */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark-mode:text-gray-300 mb-1">
                            Tasks
                          </label>
                          <select
                            value={taskFilter}
                            onChange={(e) => setTaskFilter(e.target.value)}
                            className="w-full border border-gray-300 dark-mode:border-gray-600 rounded py-1 px-2 text-sm dark-mode:bg-gray-700 dark-mode:text-white"
                          >
                            <option value="all">All Boards</option>
                            <option value="hasTasks">Has Tasks</option>
                            <option value="noTasks">Empty Boards</option>
                            <option value="hasDueSoon">
                              Has Tasks Due Soon
                            </option>
                            <option value="hasOverdue">
                              Has Overdue Tasks
                            </option>
                          </select>
                        </div>

                        {/* Date filters */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark-mode:text-gray-300 mb-1">
                            Created
                          </label>
                          <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="w-full border border-gray-300 dark-mode:border-gray-600 rounded py-1 px-2 text-sm dark-mode:bg-gray-700 dark-mode:text-white"
                          >
                            <option value="all">Any Time</option>
                            <option value="today">Created Today</option>
                            <option value="thisWeek">Created This Week</option>
                            <option value="thisMonth">
                              Created This Month
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Active filter tags */}
        {(taskFilter !== "all" || dateFilter !== "all" || searchTerm) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {searchTerm && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800 dark-mode:bg-indigo-900 dark-mode:text-indigo-200">
                Search: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm("")}
                  className="ml-1 hover:text-indigo-600"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}

            {taskFilter !== "all" && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark-mode:bg-green-900 dark-mode:text-green-200">
                {taskFilter === "hasTasks" && "Has Tasks"}
                {taskFilter === "noTasks" && "Empty Boards"}
                {taskFilter === "hasDueSoon" && "Has Due Soon"}
                {taskFilter === "hasOverdue" && "Has Overdue"}
                <button
                  onClick={() => setTaskFilter("all")}
                  className="ml-1 hover:text-green-600"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}

            {dateFilter !== "all" && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark-mode:bg-blue-900 dark-mode:text-blue-200">
                {dateFilter === "today" && "Created Today"}
                {dateFilter === "thisWeek" && "Created This Week"}
                {dateFilter === "thisMonth" && "Created This Month"}
                <button
                  onClick={() => setDateFilter("all")}
                  className="ml-1 hover:text-blue-600"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>{" "}
      <div className="px-6">
        {showNewBoardInput && (
          <div className="bg-white dark-mode:bg-gray-800 p-6 rounded-lg shadow mb-6 border border-gray-200 dark-mode:border-gray-700">
            <h2 className="text-lg font-medium mb-4 dark-mode:text-gray-100">
              Create New Board
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark-mode:text-gray-300 mb-1">
                  Board Name *
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 dark-mode:border-gray-600 dark-mode:bg-gray-700 dark-mode:text-white rounded-lg px-3 py-2"
                  placeholder="Enter board name"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark-mode:text-gray-300 mb-1">
                  Description (optional)
                </label>
                <textarea
                  className="w-full border border-gray-300 dark-mode:border-gray-600 dark-mode:bg-gray-700 dark-mode:text-white rounded-lg px-3 py-2"
                  placeholder="Enter board description"
                  value={newBoardDescription}
                  onChange={(e) => setNewBoardDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  className="text-gray-600 hover:text-gray-800 dark-mode:text-gray-300 dark-mode:hover:text-gray-100 px-4 py-2 mr-2"
                  onClick={() => setShowNewBoardInput(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                  onClick={handleCreateBoard}
                  disabled={!newBoardName.trim()}
                >
                  Create Board
                </button>
              </div>
            </div>
          </div>
        )}
        {filteredAndSortedBoards.length === 0 ? (
          <div className="bg-white dark-mode:bg-gray-800 rounded-lg shadow p-8 text-center border border-gray-200 dark-mode:border-gray-700">
            <div className="mx-auto w-16 h-16 bg-gray-100 dark-mode:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-8 h-8 text-gray-400"
              >
                <path
                  fillRule="evenodd"
                  d="M2.25 5.25a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3V15a3 3 0 0 1-3 3h-3v.257c0 .597.237 1.17.659 1.591l.621.622a.75.75 0 0 1-.53 1.28h-9a.75.75 0 0 1-.53-1.28l.621-.622a2.25 2.25 0 0 0 .659-1.59V18h-3a3 3 0 0 1-3-3V5.25Zm1.5 0v9.75c0 .83.67 1.5 1.5 1.5h13.5c.83 0 1.5-.67 1.5-1.5V5.25c0-.83-.67-1.5-1.5-1.5H5.25c-.83 0-1.5.67-1.5 1.5Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-700 dark-mode:text-gray-200 mb-2">
              No boards found
            </h3>
            <p className="text-gray-500 dark-mode:text-gray-400 mb-6 max-w-md mx-auto">
              {searchTerm || taskFilter !== "all" || dateFilter !== "all"
                ? "No boards match your filter criteria. Try changing your filters or create a new board."
                : "Create your first board to get started organizing your tasks."}
            </p>
            <button
              onClick={() => {
                setShowNewBoardInput(true);
                setSearchTerm("");
                setTaskFilter("all");
                setDateFilter("all");
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg inline-flex items-center transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-1" />
              Create Board
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
            {filteredAndSortedBoards.map((board) => (
              <BoardCard key={board.id} board={board} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardsView;
