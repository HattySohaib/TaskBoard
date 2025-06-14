import { useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import { marked } from "marked";
import { useBoardStore } from "../../store/boardStore";
import {
  EllipsisHorizontalIcon,
  TrashIcon,
  PencilIcon,
  UserCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const Task = ({ task, index, boardId, columnId }) => {
  const { updateTask, deleteTask } = useBoardStore();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({ ...task });
  const priorityColors = {
    low: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
    medium:
      "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
    high: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
  };

  const handleUpdateTask = (e) => {
    e.preventDefault();
    if (editedTask.title.trim()) {
      updateTask(boardId, columnId, task.id, { ...editedTask });
      setIsEditing(false);
    }
  };

  const handleDeleteTask = () => {
    deleteTask(boardId, columnId, task.id);
    setShowMenu(false);
  };

  // Format due date for display
  const formatDueDate = (dateString) => {
    if (!dateString) return null;

    const date = new Date(dateString);
    const now = new Date();

    // Check if due date is today
    if (date.toDateString() === now.toDateString()) {
      return "Today";
    }

    // Check if due date is tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    }

    // Otherwise, return formatted date
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const isDueSoon = () => {
    if (!task.dueDate) return false;

    const dueDate = new Date(task.dueDate);
    const now = new Date();
    const diffTime = dueDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays <= 2 && diffDays >= 0;
  };

  const isOverdue = () => {
    if (!task.dueDate) return false;

    const dueDate = new Date(task.dueDate);
    const now = new Date();

    return dueDate < now;
  };
  const renderTaskContent = () => (
    <div className="p-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900 dark-mode:text-gray-100 mr-2">
          {task.title}
        </h3>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="text-gray-400 hover:text-gray-600 dark-mode:hover:text-gray-300 rounded-full hover:bg-gray-100 dark-mode:hover:bg-gray-700"
            aria-label="Task menu"
            style={{ background: "transparent", color: "inherit" }}
          >
            <EllipsisHorizontalIcon className="h-4 w-4" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-6 bg-white dark-mode:bg-gray-800 border border-gray-200 dark-mode:border-gray-700 rounded shadow-lg z-20 w-36">
              <div className="p-2 space-y-2">
                <button
                  className="flex items-center w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark-mode:hover:bg-gray-700 text-gray-700 dark-mode:text-gray-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditedTask({ ...task });
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                >
                  <PencilIcon className="h-3.5 w-3.5 mr-2" />
                  Edit
                </button>
                <button
                  className="flex items-center w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark-mode:hover:bg-gray-700 text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTask();
                  }}
                >
                  <TrashIcon className="h-3.5 w-3.5 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description with improved markdown styling */}
      {task.description && (
        <div
          className="text-sm text-gray-600 dark-mode:text-gray-300 mb-3 line-clamp-3 task-description prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: marked.parse(task.description) }}
        />
      )}

      {/* Badges row with improved spacing */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-medium inline-flex items-center ${
            priorityColors[task.priority]
          }`}
        >
          {task.priority === "high" && "⚠️ "}
          {task.priority}
        </span>

        {task.dueDate && (
          <span
            className={`
            text-xs px-2.5 py-1 rounded-full font-medium inline-flex items-center
            ${
              isOverdue()
                ? "bg-red-100 text-red-800 dark-mode:bg-red-900 dark-mode:text-red-200"
                : isDueSoon()
                ? "bg-orange-100 text-orange-800 dark-mode:bg-orange-900 dark-mode:text-orange-200"
                : "bg-gray-100 text-gray-800 dark-mode:bg-gray-700 dark-mode:text-gray-200"
            }
          `}
          >
            <ClockIcon className="h-3 w-3 mr-1 flex-shrink-0" />
            {formatDueDate(task.dueDate)}
          </span>
        )}
      </div>

      {/* Footer with created by and assigned to */}
      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-400 dark-mode:border-gray-600">
        <div className="text-xs text-gray-500 dark-mode:text-gray-400 truncate max-w-[60%]">
          {task.createdBy && <span>by {task.createdBy}</span>}
        </div>

        {task.assignedTo && (
          <div className="flex items-center text-xs px-2 py-0.5 rounded-full">
            <UserCircleIcon className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
            <span className="truncate max-w-[100px]">{task.assignedTo}</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderEditForm = () => (
    <div className="p-3" onClick={(e) => e.stopPropagation()}>
      <form onSubmit={handleUpdateTask}>
        <input
          className="w-full border rounded p-2 mb-2 text-sm"
          placeholder="Task title"
          value={editedTask.title}
          onChange={(e) =>
            setEditedTask({ ...editedTask, title: e.target.value })
          }
          autoFocus
        />

        <textarea
          className="w-full border rounded p-2 mb-2 text-sm"
          placeholder="Description (markdown supported)"
          rows="3"
          value={editedTask.description}
          onChange={(e) =>
            setEditedTask({ ...editedTask, description: e.target.value })
          }
        />

        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Assigned to
            </label>
            <input
              className="w-full border rounded p-1.5 text-sm"
              placeholder="Username"
              value={editedTask.assignedTo}
              onChange={(e) =>
                setEditedTask({ ...editedTask, assignedTo: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Priority</label>
            <select
              className="w-full border rounded p-1.5 text-sm"
              value={editedTask.priority}
              onChange={(e) =>
                setEditedTask({ ...editedTask, priority: e.target.value })
              }
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div className="mb-3">
          <label className="block text-xs text-gray-600 mb-1">Due date</label>
          <input
            type="date"
            className="w-full border rounded p-1.5 text-sm"
            value={editedTask.dueDate || ""}
            onChange={(e) =>
              setEditedTask({ ...editedTask, dueDate: e.target.value })
            }
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            className="text-sm text-gray-600 mr-2"
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-indigo-600 text-white text-sm px-3 py-1.5 rounded"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          className={`bg-white dark-mode:bg-gray-800 rounded-lg shadow mb-3 draggable-task ${
            snapshot.isDragging
              ? "shadow-md ring-2 ring-indigo-500 rotate-1 scale-[1.02] z-10"
              : "hover:shadow-md"
          } dark-mode:text-white border border-gray-200 dark-mode:border-gray-700 relative overflow-hidden`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            transition: snapshot.isDragging
              ? "all 0.05s ease"
              : "all 0.2s ease",
          }}
        >
          {/* Priority indicator bar */}
          <div
            className={`absolute top-0 left-0 right-0 h-1 priority-indicator-${task.priority}`}
          ></div>

          {isEditing ? renderEditForm() : renderTaskContent()}
        </div>
      )}
    </Draggable>
  );
};

export default Task;
