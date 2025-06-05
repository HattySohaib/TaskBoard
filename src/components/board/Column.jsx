import { useState } from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { truncate } from "../../utils/helpers";
import Task from "./Task";
import { useBoardStore } from "../../store/boardStore";
import {
  PlusIcon,
  EllipsisHorizontalIcon,
  TrashIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";

const Column = ({ column, index, boardId }) => {
  const { createTask, deleteColumn, updateColumn } = useBoardStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(column.name);

  // New task form state
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    createdBy: "Current User", // This would be the logged-in user
    assignedTo: "",
    priority: "medium",
    dueDate: "",
  });

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (newTask.title.trim()) {
      createTask(boardId, column.id, {
        ...newTask,
        dueDate: newTask.dueDate || undefined,
      });
      setNewTask({
        title: "",
        description: "",
        createdBy: "Current User",
        assignedTo: "",
        priority: "medium",
        dueDate: "",
      });
      setShowNewTaskForm(false);
    }
  };

  const handleDeleteColumn = () => {
    deleteColumn(boardId, column.id);
    setShowMenu(false);
  };

  const handleUpdateColumnName = () => {
    if (editedName.trim() && editedName !== column.name) {
      updateColumn(boardId, column.id, { name: editedName });
    }
    setIsEditing(false);
  };

  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided) => (
        <div
          className="mr-4 w-72 flex-shrink-0"
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          {" "}
          <div className="bg-gray-100 dark-mode:bg-gray-800 rounded-lg shadow pb-2 h-full flex flex-col border border-gray-200 dark-mode:border-gray-700">
            {" "}
            {/* Column header */}
            <div className="p-2 ml-2 text-m font-medium text-gray-700 dark-mode:text-gray-200 flex items-center justify-between rounded-t-lg">
              <div
                className="flex items-center flex-1"
                {...provided.dragHandleProps}
              >
                {isEditing ? (
                  <div className="flex items-center w-full">
                    <input
                      type="text"
                      className="border rounded px-2 py-1 text-sm mr-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleUpdateColumnName()
                      }
                      autoFocus
                    />{" "}
                    <button
                      onClick={handleUpdateColumnName}
                      className="text-xs bg-gray-600 text-white px-2 py-1 rounded"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="truncate">
                      {truncate(column.name, 15)}
                    </span>
                    <div className="ml-2 text-gray-500 text-sm">
                      ({column.tasks.length})
                    </div>
                  </>
                )}
              </div>
              <div className="relative">
                <button
                  className="text-gray-500 dark-mode:text-gray-400 hover:text-gray-700 dark-mode:hover:text-gray-300"
                  onClick={() => setShowMenu(!showMenu)}
                  style={{ background: "transparent", color: "inherit" }}
                >
                  <EllipsisHorizontalIcon className="h-4 w-4 " />
                </button>
                <button
                  className="text-gray-500 hover:text-gray-700 dark-mode:hover:text-gray-300"
                  onClick={() => setShowNewTaskForm(true)}
                  title="Add task"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>{" "}
                {showMenu && (
                  <div className="absolute right-0 mt-1 bg-white dark-mode:bg-gray-800 border border-gray-200 dark-mode:border-gray-700 rounded shadow-lg z-20 w-36">
                    <div className="p-3">
                      <div className="space-y-2">
                        <button
                          className="flex items-center w-full text-left px-2 py-1 rounded text-sm hover:bg-gray-100 dark-mode:hover:bg-gray-700 text-gray-700 dark-mode:text-gray-200"
                          onClick={() => {
                            setIsEditing(true);
                            setShowMenu(false);
                          }}
                        >
                          <PencilIcon className="h-4 w-4 mr-2" />
                          Rename
                        </button>
                        <button
                          className="flex items-center w-full text-left px-2 py-1 rounded text-sm hover:bg-gray-100 dark-mode:hover:bg-gray-700 text-red-600"
                          onClick={handleDeleteColumn}
                        >
                          <TrashIcon className="h-4 w-4 mr-2" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>{" "}
            {/* Tasks container */}
            <Droppable droppableId={column.id} type="task" direction="vertical">
              {(provided, snapshot) => (
                <div
                  className={`p-2 flex-1 min-h-[200px] transition-colors duration-200 ${
                    snapshot.isDraggingOver
                      ? "bg-blue-50 dark-mode:bg-blue-900/30 border-b-4 border-indigo-400 pb-4 mb-2"
                      : "bg-gray-50 dark-mode:bg-gray-800"
                  } dark-mode:text-gray-200`}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {column.tasks.map((task, index) => (
                    <Task
                      key={task.id}
                      task={task}
                      index={index}
                      boardId={boardId}
                      columnId={column.id}
                    />
                  ))}
                  {provided.placeholder} {/* New task form */}
                  {showNewTaskForm && (
                    <div className="bg-white dark-mode:bg-gray-700 p-3 rounded-lg shadow-md mb-2 border border-gray-200 dark-mode:border-gray-600">
                      <form onSubmit={handleCreateTask}>
                        <input
                          className="w-full border border-gray-300 dark-mode:border-gray-600 dark-mode:bg-gray-800 dark-mode:text-white rounded p-2 mb-2 text-sm"
                          placeholder="Task title"
                          value={newTask.title}
                          onChange={(e) =>
                            setNewTask({ ...newTask, title: e.target.value })
                          }
                          autoFocus
                        />

                        <textarea
                          className="w-full border rounded p-2 mb-2 text-sm"
                          placeholder="Description (optional)"
                          rows="2"
                          value={newTask.description}
                          onChange={(e) =>
                            setNewTask({
                              ...newTask,
                              description: e.target.value,
                            })
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
                              value={newTask.assignedTo}
                              onChange={(e) =>
                                setNewTask({
                                  ...newTask,
                                  assignedTo: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              Priority
                            </label>
                            <select
                              className="w-full border rounded p-1.5 text-sm"
                              value={newTask.priority}
                              onChange={(e) =>
                                setNewTask({
                                  ...newTask,
                                  priority: e.target.value,
                                })
                              }
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="block text-xs text-gray-600 mb-1">
                            Due date
                          </label>
                          <input
                            type="date"
                            className="w-full border rounded p-1.5 text-sm"
                            value={newTask.dueDate}
                            onChange={(e) =>
                              setNewTask({
                                ...newTask,
                                dueDate: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            className="text-sm text-gray-600 mr-2"
                            onClick={() => setShowNewTaskForm(false)}
                          >
                            Cancel
                          </button>{" "}
                          <button
                            type="submit"
                            className="bg-gray-600 text-white text-sm px-3 py-1.5 rounded"
                          >
                            Add Task
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </Droppable>{" "}
            {/* Add task button removed as we now have the + icon in the header */}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default Column;
