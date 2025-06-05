import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ClockIcon,
  ExclamationCircleIcon,
  EllipsisHorizontalIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

const PriorityBadge = ({ priority }) => {
  const colors = {
    high: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
    medium:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200",
    low: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200",
  };

  return (
    <span className={`text-xs px-2.5 py-0.5 rounded-full ${colors[priority]}`}>
      {priority}
    </span>
  );
};

const BoardCard = ({ board, onDeleteBoard }) => {
  // Calculate task statistics
  const stats = useMemo(() => {
    let total = 0;
    let completed = 0;
    let urgent = 0;
    let overdue = 0;

    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);

    board.columns.forEach((column) => {
      total += column.tasks.length;

      // Assuming the last column is typically "Done" or "Completed"
      if (
        column.name.toLowerCase().includes("done") ||
        column.name.toLowerCase().includes("complete")
      ) {
        completed += column.tasks.length;
      }

      column.tasks.forEach((task) => {
        if (!task.dueDate) return;

        const dueDate = new Date(task.dueDate);
        // Check for urgent tasks (due in next 3 days)
        if (dueDate <= threeDaysFromNow && dueDate >= now) {
          urgent++;
        }
        // Check for overdue tasks
        if (dueDate < now) {
          overdue++;
        }
      });
    });

    return { total, completed, urgent, overdue };
  }, [board]);

  // Calculate completion percentage
  const completionPercentage = useMemo(() => {
    return stats.total > 0
      ? Math.round((stats.completed / stats.total) * 100)
      : 0;
  }, [stats]);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (onDeleteBoard) {
      onDeleteBoard(board.id);
    }
    setShowDeleteConfirm(false);
  };

  return (
    <div className="block group">
      <div className="bg-white dark-mode:bg-gray-800 p-5 rounded-lg shadow hover:shadow-md transition-all duration-300 transform group-hover:translate-y-[-2px] border border-gray-200 dark-mode:border-gray-700 h-full flex flex-col relative overflow-hidden">
        {/* Color accent at top of card */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        <div className="flex justify-between items-start mb-4">
          <Link to={`/board/${board.id}`} className="block">
            <h3 className="font-semibold text-xl text-gray-900 dark-mode:text-gray-100 truncate">
              {board.name}
            </h3>
          </Link>
        </div>
        <Link to={`/board/${board.id}`} className="block">
          <div className="text-sm text-gray-500 dark-mode:text-gray-400 mb-4 flex items-start">
            <DocumentTextIcon className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
            <p className="line-clamp-2">
              {board.description ||
                `This board contains ${stats.total} tasks across ${board.columns.length} columns.`}
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-gray-700 dark-mode:text-gray-300">
                Progress
              </span>
              <span className="text-gray-600 dark-mode:text-gray-400">
                {completionPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark-mode:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="mt-auto">
            {/* Date row */}
            <div className="flex items-center mb-3 text-xs text-gray-500 dark-mode:text-gray-400">
              <ClockIcon className="h-4 w-4 mr-1" />
              <span>
                Created {new Date(board.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center bg-blue-100 dark-mode:bg-blue-900/40 text-blue-800 dark-mode:text-blue-200 px-2 py-1 rounded-full text-xs">
                <DocumentTextIcon className="h-3.5 w-3.5 mr-1" />
                {stats.total} tasks
              </span>

              <span className="inline-flex items-center bg-green-100 dark-mode:bg-green-900/40 text-green-800 dark-mode:text-green-200 px-2 py-1 rounded-full text-xs">
                <CheckCircleIcon className="h-3.5 w-3.5 mr-1" />
                {stats.completed} done
              </span>

              {stats.urgent > 0 && (
                <span className="inline-flex items-center bg-yellow-100 dark-mode:bg-yellow-900/40 text-yellow-800 dark-mode:text-yellow-200 px-2 py-1 rounded-full text-xs">
                  <ExclamationCircleIcon className="h-3.5 w-3.5 mr-1" />
                  {stats.urgent} due soon
                </span>
              )}

              {stats.overdue > 0 && (
                <span className="inline-flex items-center bg-red-100 dark-mode:bg-red-900/40 text-red-800 dark-mode:text-red-200 px-2 py-1 rounded-full text-xs">
                  <ExclamationCircleIcon className="h-3.5 w-3.5 mr-1" />
                  {stats.overdue} overdue
                </span>
              )}
            </div>
          </div>
        </Link>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark-mode:bg-gray-800 rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark-mode:text-gray-100 mb-2">
              Delete Board
            </h3>
            <p className="text-gray-600 dark-mode:text-gray-400 mb-4">
              Are you sure you want to delete "{board.name}"? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark-mode:text-gray-300 bg-gray-100 dark-mode:bg-gray-700 rounded-md hover:bg-gray-200 dark-mode:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardCard;
