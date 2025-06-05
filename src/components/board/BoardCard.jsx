import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ClockIcon,
  ExclamationCircleIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";

const PriorityBadge = ({ priority }) => {
  const colors = {
    high: "bg-red-100 text-red-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-green-100 text-green-800",
  };

  return (
    <span className={`text-xs px-2.5 py-0.5 rounded-full ${colors[priority]}`}>
      {priority}
    </span>
  );
};

const BoardCard = ({ board }) => {
  const taskCount = useMemo(() => {
    return board.columns.reduce((acc, column) => acc + column.tasks.length, 0);
  }, [board]);

  // Get tasks due soon (in the next 3 days)
  const urgentTasks = useMemo(() => {
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);

    let count = 0;
    board.columns.forEach((column) => {
      column.tasks.forEach((task) => {
        const dueDate = new Date(task.dueDate);
        if (dueDate <= threeDaysFromNow && dueDate >= now) {
          count++;
        }
      });
    });

    return count;
  }, [board]);

  return (
    <Link to={`/board/${board.id}`} className="block">
      <div className="bg-white dark-mode:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 dark-mode:border-gray-700">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-medium text-lg text-gray-900 dark-mode:text-gray-100 truncate">
            {board.name}
          </h3>
          <button className="text-gray-400 hover:text-gray-600 dark-mode:hover:text-gray-300">
            <EllipsisHorizontalIcon className="h-5 w-5" />
          </button>
        </div>{" "}
        <div className="space-y-2">
          <div className="flex text-sm text-gray-500 dark-mode:text-gray-400">
            <span className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-1" />
              {new Date(board.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <div className="flex items-center space-x-2">
              <span className="bg-blue-100 dark-mode:bg-blue-900/40 text-blue-800 dark-mode:text-blue-200 px-2 py-0.5 rounded-full text-xs">
                {taskCount} tasks
              </span>

              {urgentTasks > 0 && (
                <span className="flex items-center text-red-600 text-xs">
                  <ExclamationCircleIcon className="h-3.5 w-3.5 mr-1" />
                  {urgentTasks} due soon
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BoardCard;
