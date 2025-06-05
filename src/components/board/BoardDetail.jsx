import { useState, useMemo } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import Column from "./Column";
import { useBoardStore } from "../../store/boardStore";
import { PlusIcon, PencilIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { filterTasks } from "../../utils/taskUtils";

const BoardDetail = ({ boardId }) => {
  const { getBoardById, updateBoard, moveTask, moveColumn, createColumn } =
    useBoardStore();
  const board = getBoardById(boardId);
  const [newColumnName, setNewColumnName] = useState("");
  const [showNewColumnInput, setShowNewColumnInput] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(board?.name || "");

  // If board not found
  if (!board) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Board not found</p>
      </div>
    );
  }

  const handleDragEnd = (result) => {
    const { source, destination, type } = result;

    // Dropped outside the list
    if (!destination) return;

    // If columns are being reordered
    if (type === "column") {
      if (source.index !== destination.index) {
        moveColumn(boardId, source.index, destination.index);
      }
      return;
    }

    // If task is dropped in a different column or index
    if (
      source.droppableId !== destination.droppableId ||
      source.index !== destination.index
    ) {
      moveTask(
        boardId,
        source.droppableId,
        destination.droppableId,
        source.index,
        destination.index
      );
    }
  };

  const handleAddColumn = () => {
    if (newColumnName.trim()) {
      createColumn(boardId, newColumnName);
      setNewColumnName("");
      setShowNewColumnInput(false);
    }
  };

  const handleUpdateBoardName = () => {
    if (editedName.trim() && editedName !== board.name) {
      updateBoard(boardId, { name: editedName });
    }
    setIsEditing(false);
  };
  const [searchTerm, setSearchTerm] = useState("");

  // Filter and sort state
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showSortPanel, setShowSortPanel] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    priority: [],
    assignee: [],
    dueDate: "",
  });
  const [sortConfig, setSortConfig] = useState({
    field: "",
    direction: "asc", // "asc" or "desc"
  });

  // Get unique assignees and priorities from all tasks
  const { uniqueAssignees, uniquePriorities } = useMemo(() => {
    const assignees = new Set();
    const priorities = new Set();

    board.columns.forEach((column) => {
      column.tasks.forEach((task) => {
        if (task.assignedTo) assignees.add(task.assignedTo);
        priorities.add(task.priority);
      });
    });

    return {
      uniqueAssignees: Array.from(assignees).sort(),
      uniquePriorities: Array.from(priorities).sort(),
    };
  }, [board]);

  // Apply filters and sorting to board columns
  const filteredAndSortedBoard = useMemo(() => {
    if (!board) return null;

    const hasActiveFilters =
      searchTerm ||
      activeFilters.priority.length > 0 ||
      activeFilters.assignee.length > 0 ||
      activeFilters.dueDate;

    const hasActiveSorting = sortConfig.field;

    if (!hasActiveFilters && !hasActiveSorting) {
      return board;
    }

    const newColumns = board.columns.map((column) => {
      let filteredTasks = column.tasks;

      // Apply filters
      if (hasActiveFilters) {
        filteredTasks = filterTasks(
          column.tasks,
          searchTerm,
          activeFilters.priority,
          activeFilters.assignee,
          activeFilters.dueDate
        );
      } // Apply sorting
      if (hasActiveSorting) {
        filteredTasks = [...filteredTasks].sort((a, b) => {
          let aValue = a[sortConfig.field];
          let bValue = b[sortConfig.field];

          // Handle priority sorting with custom order
          if (sortConfig.field === "priority") {
            const priorityOrder = { low: 1, medium: 2, high: 3 };
            aValue = priorityOrder[aValue.toLowerCase()] || 0;
            bValue = priorityOrder[bValue.toLowerCase()] || 0;
          }
          // Handle date sorting
          else if (
            sortConfig.field === "dueDate" ||
            sortConfig.field === "createdAt"
          ) {
            aValue = aValue ? new Date(aValue) : new Date(0);
            bValue = bValue ? new Date(bValue) : new Date(0);
          }
          // Handle string sorting
          else if (typeof aValue === "string" && typeof bValue === "string") {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
          }

          if (aValue < bValue) {
            return sortConfig.direction === "asc" ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === "asc" ? 1 : -1;
          }
          return 0;
        });
      }

      return {
        ...column,
        tasks: filteredTasks,
      };
    });

    return {
      ...board,
      columns: newColumns,
    };
  }, [board, searchTerm, activeFilters, sortConfig]);

  // Handle filter changes
  const handlePriorityFilter = (priority) => {
    setActiveFilters((prev) => ({
      ...prev,
      priority: prev.priority.includes(priority)
        ? prev.priority.filter((p) => p !== priority)
        : [...prev.priority, priority],
    }));
  };

  const handleAssigneeFilter = (assignee) => {
    setActiveFilters((prev) => ({
      ...prev,
      assignee: prev.assignee.includes(assignee)
        ? prev.assignee.filter((a) => a !== assignee)
        : [...prev.assignee, assignee],
    }));
  };

  const handleDueDateFilter = (filter) => {
    setActiveFilters((prev) => ({
      ...prev,
      dueDate: prev.dueDate === filter ? "" : filter,
    }));
  };

  const clearAllFilters = () => {
    setActiveFilters({
      priority: [],
      assignee: [],
      dueDate: "",
    });
    setSearchTerm("");
  };

  const handleSort = (field) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
    setShowSortPanel(false);
  };

  const clearSort = () => {
    setSortConfig({ field: "", direction: "asc" });
  };

  // Count active filters
  const activeFilterCount =
    activeFilters.priority.length +
    activeFilters.assignee.length +
    (activeFilters.dueDate ? 1 : 0) +
    (searchTerm ? 1 : 0);
  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 dark-mode:bg-gray-900">
        {/* Top row: Board name and search */}
        <div className="flex justify-between items-center mb-4">
          {isEditing ? (
            <div className="flex items-center">
              <input
                type="text"
                className="text-xl font-medium border-b-2 border-indigo-500 focus:outline-none mr-2 bg-transparent"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUpdateBoardName()}
                autoFocus
              />{" "}
              <button
                onClick={handleUpdateBoardName}
                className="text-sm bg-gray-600 text-white px-2 py-1 rounded"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="size-6"
              >
                <path d="M15 3.75H9v16.5h6V3.75ZM16.5 20.25h3.375c1.035 0 1.875-.84 1.875-1.875V5.625c0-1.036-.84-1.875-1.875-1.875H16.5v16.5ZM4.125 3.75H7.5v16.5H4.125a1.875 1.875 0 0 1-1.875-1.875V5.625c0-1.036.84-1.875 1.875-1.875Z" />
              </svg>

              <p className="ml-2 text-xl font-medium mr-2">{board.name}</p>
              <button
                onClick={() => {
                  setEditedName(board.name);
                  setIsEditing(true);
                }}
                className="text-gray-500 hover:text-gray-700 dark-mode:hover:text-gray-300"
              >
                <PencilIcon className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Search bar */}
          <div className="relative w-72">
            <input
              type="text"
              placeholder="Search tasks..."
              className="pl-10 w-full border border-gray-300 dark-mode:border-gray-600 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark-mode:bg-gray-700 dark-mode:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Bottom row: Action buttons */}
        <div className="bg-white dark-mode:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark-mode:border-gray-700">
          <div className="flex items-center justify-between space-x-3">
            {/* Add column button */}
            {showNewColumnInput ? (
              <div className="flex items-center">
                <input
                  type="text"
                  className="border rounded px-2 py-1 text-sm mr-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Column name"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddColumn()}
                />{" "}
                <button
                  onClick={handleAddColumn}
                  className="bg-gray-600 text-white px-3 py-1 rounded text-sm"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowNewColumnInput(false)}
                  className="ml-2 text-gray-500 hover:text-gray-700 text-sm dark-mode:hover:text-gray-300"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowNewColumnInput(true)}
                className="flex items-center text-sm bg-gray-600 text-white px-3 py-1 rounded"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Column
              </button>
            )}
            <div className="flex items-center space-x-3">
              {/* Sort button */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowSortPanel(!showSortPanel);
                    setShowFilterPanel(false);
                  }}
                  className={`flex items-center text-sm border border-gray-300 dark-mode:border-gray-600 px-3 py-1 rounded bg-white dark-mode:bg-gray-800 ${
                    sortConfig.field
                      ? "text-gray-700 border-gray-500"
                      : "text-gray-700 dark-mode:text-gray-200"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                    />
                  </svg>
                  Sort
                  {sortConfig.field && (
                    <span className="ml-1 text-xs bg-indigo-600 text-white px-1.5 py-0.5 rounded-full">
                      {sortConfig.field === "dueDate"
                        ? "Due"
                        : sortConfig.field === "createdAt"
                        ? "Created"
                        : sortConfig.field.charAt(0).toUpperCase() +
                          sortConfig.field.slice(1)}
                    </span>
                  )}
                </button>

                {showSortPanel && (
                  <div className="absolute top-full mt-1 bg-white dark-mode:bg-gray-800 border border-gray-200 dark-mode:border-gray-700 rounded shadow-lg z-20 w-48">
                    <div className="p-3">
                      <div className="space-y-2">
                        <button
                          onClick={() => handleSort("title")}
                          className={`w-full text-left px-2 py-1 rounded text-sm ${
                            sortConfig.field === "title"
                              ? "bg-indigo-100 text-indigo-700"
                              : "hover:bg-gray-100 dark-mode:hover:bg-gray-700"
                          }`}
                        >
                          Title{" "}
                          {sortConfig.field === "title" &&
                            (sortConfig.direction === "asc" ? "↑" : "↓")}
                        </button>
                        <button
                          onClick={() => handleSort("priority")}
                          className={`w-full text-left px-2 py-1 rounded text-sm ${
                            sortConfig.field === "priority"
                              ? "bg-indigo-100 text-indigo-700"
                              : "hover:bg-gray-100 dark-mode:hover:bg-gray-700"
                          }`}
                        >
                          Priority{" "}
                          {sortConfig.field === "priority" &&
                            (sortConfig.direction === "asc" ? "↑" : "↓")}
                        </button>
                        <button
                          onClick={() => handleSort("dueDate")}
                          className={`w-full text-left px-2 py-1 rounded text-sm ${
                            sortConfig.field === "dueDate"
                              ? "bg-indigo-100 text-indigo-700"
                              : "hover:bg-gray-100 dark-mode:hover:bg-gray-700"
                          }`}
                        >
                          Due Date{" "}
                          {sortConfig.field === "dueDate" &&
                            (sortConfig.direction === "asc" ? "↑" : "↓")}
                        </button>
                        <button
                          onClick={() => handleSort("createdAt")}
                          className={`w-full text-left px-2 py-1 rounded text-sm ${
                            sortConfig.field === "createdAt"
                              ? "bg-indigo-100 text-indigo-700"
                              : "hover:bg-gray-100 dark-mode:hover:bg-gray-700"
                          }`}
                        >
                          Created Date{" "}
                          {sortConfig.field === "createdAt" &&
                            (sortConfig.direction === "asc" ? "↑" : "↓")}
                        </button>
                        {sortConfig.field && (
                          <div className="border-t pt-2">
                            <button
                              onClick={clearSort}
                              className="w-full text-left px-2 py-1 rounded text-sm text-red-600 hover:bg-gray-100 dark-mode:hover:bg-gray-700"
                            >
                              Clear Sort
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Filter button */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowFilterPanel(!showFilterPanel);
                    setShowSortPanel(false);
                  }}
                  className={`flex items-center text-sm border border-gray-300 dark-mode:border-gray-600 px-3 py-1 rounded bg-white dark-mode:bg-gray-800 ${
                    activeFilterCount > 0
                      ? "text-indigo-600 border-indigo-500"
                      : "text-gray-700 dark-mode:text-gray-200"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                  Filter
                  {activeFilterCount > 0 && (
                    <span className="ml-1 text-xs bg-indigo-600 text-white px-1.5 py-0.5 rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {showFilterPanel && (
                  <div className="absolute top-full right-full mt-1 bg-white dark-mode:bg-gray-800 border border-gray-200 dark-mode:border-gray-700 rounded shadow-lg z-20 w-80">
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium text-gray-900 dark-mode:text-gray-100">
                          Filters
                        </h3>
                        {activeFilterCount > 0 && (
                          <button
                            onClick={clearAllFilters}
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            Clear All
                          </button>
                        )}
                      </div>

                      <div className="space-y-4">
                        {/* Priority Filter */}
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark-mode:text-gray-300 block mb-2">
                            Priority
                          </label>
                          <div className="space-y-1">
                            {uniquePriorities.map((priority) => (
                              <label
                                key={priority}
                                className="flex items-center"
                              >
                                <input
                                  type="checkbox"
                                  checked={activeFilters.priority.includes(
                                    priority
                                  )}
                                  onChange={() =>
                                    handlePriorityFilter(priority)
                                  }
                                  className="rounded border-gray-300 text-indigo-600 mr-2"
                                />
                                <span className="text-sm capitalize">
                                  {priority}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Assignee Filter */}
                        {uniqueAssignees.length > 0 && (
                          <div>
                            <label className="text-sm font-medium text-gray-700 dark-mode:text-gray-300 block mb-2">
                              Assignee
                            </label>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                              {uniqueAssignees.map((assignee) => (
                                <label
                                  key={assignee}
                                  className="flex items-center"
                                >
                                  <input
                                    type="checkbox"
                                    checked={activeFilters.assignee.includes(
                                      assignee
                                    )}
                                    onChange={() =>
                                      handleAssigneeFilter(assignee)
                                    }
                                    className="rounded border-gray-300 text-indigo-600 mr-2"
                                  />
                                  <span className="text-sm">{assignee}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Due Date Filter */}
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark-mode:text-gray-300 block mb-2">
                            Due Date
                          </label>
                          <div className="space-y-1">
                            {[
                              { value: "today", label: "Due Today" },
                              { value: "thisWeek", label: "Due This Week" },
                              { value: "overdue", label: "Overdue" },
                            ].map((option) => (
                              <label
                                key={option.value}
                                className="flex items-center"
                              >
                                <input
                                  type="checkbox"
                                  checked={
                                    activeFilters.dueDate === option.value
                                  }
                                  onChange={() =>
                                    handleDueDateFilter(option.value)
                                  }
                                  className="rounded border-gray-300 text-indigo-600 mr-2"
                                />
                                <span className="text-sm">{option.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Active Filter Tags */}
        {activeFilterCount > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
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

            {activeFilters.priority.map((priority) => (
              <span
                key={priority}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark-mode:bg-yellow-900 dark-mode:text-yellow-200"
              >
                Priority: {priority}
                <button
                  onClick={() => handlePriorityFilter(priority)}
                  className="ml-1 hover:text-yellow-600"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            ))}

            {activeFilters.assignee.map((assignee) => (
              <span
                key={assignee}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark-mode:bg-green-900 dark-mode:text-green-200"
              >
                Assignee: {assignee}
                <button
                  onClick={() => handleAssigneeFilter(assignee)}
                  className="ml-1 hover:text-green-600"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            ))}

            {activeFilters.dueDate && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 dark-mode:bg-red-900 dark-mode:text-red-200">
                {activeFilters.dueDate === "today"
                  ? "Due Today"
                  : activeFilters.dueDate === "thisWeek"
                  ? "Due This Week"
                  : activeFilters.dueDate === "overdue"
                  ? "Overdue"
                  : activeFilters.dueDate}
                <button
                  onClick={() => handleDueDateFilter(activeFilters.dueDate)}
                  className="ml-1 hover:text-red-600"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}

            {sortConfig.field && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark-mode:bg-purple-900 dark-mode:text-purple-200">
                Sort: {sortConfig.field}{" "}
                {sortConfig.direction === "asc" ? "↑" : "↓"}
                <button
                  onClick={clearSort}
                  className="ml-1 hover:text-purple-600"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 p-4 overflow-x-auto mt-4">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable
            droppableId="all-columns"
            direction="horizontal"
            type="column"
          >
            {(provided) => (
              <div
                className="flex min-h-full"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {filteredAndSortedBoard.columns.map((column, index) => (
                  <Column
                    key={column.id}
                    column={column}
                    index={index}
                    boardId={boardId}
                  />
                ))}
                {provided.placeholder}

                {!showNewColumnInput && board.columns.length === 0 && (
                  <div className="bg-gray-100 p-4 rounded-lg text-center w-full">
                    <p className="text-gray-500 mb-4">
                      This board has no columns yet
                    </p>
                    <button
                      onClick={() => setShowNewColumnInput(true)}
                      className="inline-flex items-center text-sm bg-indigo-600 text-white px-3 py-1 rounded"
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add your first column
                    </button>
                  </div>
                )}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
};

export default BoardDetail;
