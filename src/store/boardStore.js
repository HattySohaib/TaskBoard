import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

// Generate dummy users
const dummyUsers = ["John Doe", "Jane Smith", "Alex Johnson", "Sarah Wilson"];

// Helper to create dummy tasks
const createDummyTasks = (count, columnId) => {
  const tasks = [];
  const priorities = ["low", "medium", "high"];

  for (let i = 0; i < count; i++) {
    const dueDate = new Date();
    // Random days to add (between -3 to +14 days)
    dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 17) - 3);

    tasks.push({
      id: uuidv4(),
      title: `Task ${i + 1}`,
      description: `This is a description for task ${
        i + 1
      }. It might contain some **markdown**.`,
      createdBy: dummyUsers[Math.floor(Math.random() * dummyUsers.length)],
      assignedTo:
        Math.random() > 0.3
          ? dummyUsers[Math.floor(Math.random() * dummyUsers.length)]
          : "",
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      dueDate: dueDate.toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
    });
  }

  return tasks;
};

// Helper to create initial sample data
const createSampleData = () => {
  const boardId = uuidv4();
  const columns = [
    {
      id: uuidv4(),
      name: "To Do",
      tasks: createDummyTasks(3, boardId),
    },
    {
      id: uuidv4(),
      name: "In Progress",
      tasks: createDummyTasks(2, boardId),
    },
    {
      id: uuidv4(),
      name: "Done",
      tasks: createDummyTasks(4, boardId),
    },
  ];

  return [
    {
      id: boardId,
      name: "Sample Project",
      description:
        "This is a sample project board for task management and organization.",
      columns,
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: "Website Redesign",
      description: "Tracking tasks related to the website redesign initiative.",
      columns: [
        {
          id: uuidv4(),
          name: "Backlog",
          tasks: createDummyTasks(2, boardId),
        },
        {
          id: uuidv4(),
          name: "In Progress",
          tasks: createDummyTasks(1, boardId),
        },
        {
          id: uuidv4(),
          name: "Review",
          tasks: createDummyTasks(2, boardId),
        },
        {
          id: uuidv4(),
          name: "Done",
          tasks: createDummyTasks(3, boardId),
        },
      ],
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    },
  ];
};

// Define the initial state
const initialState = {
  boards: [],
};

// Create the store with persistence
export const useBoardStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // Load initial data if store is empty
      initializeStore: () => {
        const { boards } = get();
        if (boards.length === 0) {
          set({ boards: createSampleData() });
        }
      },

      // Board operations
      createBoard: (name, description = "") => {
        const newBoard = {
          id: uuidv4(),
          name,
          description,
          columns: [],
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          boards: [...state.boards, newBoard],
        }));

        return newBoard;
      },

      updateBoard: (boardId, updates) => {
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId ? { ...board, ...updates } : board
          ),
        }));
      },

      deleteBoard: (boardId) => {
        set((state) => ({
          boards: state.boards.filter((board) => board.id !== boardId),
        }));
      },

      getBoardById: (boardId) => {
        return get().boards.find((board) => board.id === boardId);
      },

      // Column operations
      createColumn: (boardId, name) => {
        const newColumn = {
          id: uuidv4(),
          name,
          tasks: [],
        };

        set((state) => ({
          boards: state.boards.map((board) => {
            if (board.id === boardId) {
              return {
                ...board,
                columns: [...board.columns, newColumn],
              };
            }
            return board;
          }),
        }));

        return newColumn;
      },

      updateColumn: (boardId, columnId, updates) => {
        set((state) => ({
          boards: state.boards.map((board) => {
            if (board.id === boardId) {
              return {
                ...board,
                columns: board.columns.map((column) =>
                  column.id === columnId ? { ...column, ...updates } : column
                ),
              };
            }
            return board;
          }),
        }));
      },

      deleteColumn: (boardId, columnId) => {
        set((state) => ({
          boards: state.boards.map((board) => {
            if (board.id === boardId) {
              return {
                ...board,
                columns: board.columns.filter(
                  (column) => column.id !== columnId
                ),
              };
            }
            return board;
          }),
        }));
      },

      moveColumn: (boardId, sourceIndex, destinationIndex) => {
        set((state) => {
          const board = state.boards.find((b) => b.id === boardId);
          if (!board) return state;

          const newColumns = Array.from(board.columns);
          const [removed] = newColumns.splice(sourceIndex, 1);
          newColumns.splice(destinationIndex, 0, removed);

          return {
            boards: state.boards.map((b) =>
              b.id === boardId ? { ...b, columns: newColumns } : b
            ),
          };
        });
      },

      // Task operations
      createTask: (boardId, columnId, task) => {
        const newTask = {
          id: uuidv4(),
          title: task.title,
          description: task.description || "",
          createdBy: task.createdBy || "Current User",
          assignedTo: task.assignedTo || "",
          priority: task.priority || "medium",
          dueDate: task.dueDate || null,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          boards: state.boards.map((board) => {
            if (board.id === boardId) {
              return {
                ...board,
                columns: board.columns.map((column) => {
                  if (column.id === columnId) {
                    return {
                      ...column,
                      tasks: [...column.tasks, newTask],
                    };
                  }
                  return column;
                }),
              };
            }
            return board;
          }),
        }));

        return newTask;
      },

      updateTask: (boardId, columnId, taskId, updates) => {
        set((state) => ({
          boards: state.boards.map((board) => {
            if (board.id === boardId) {
              return {
                ...board,
                columns: board.columns.map((column) => {
                  if (column.id === columnId) {
                    return {
                      ...column,
                      tasks: column.tasks.map((task) =>
                        task.id === taskId ? { ...task, ...updates } : task
                      ),
                    };
                  }
                  return column;
                }),
              };
            }
            return board;
          }),
        }));
      },

      deleteTask: (boardId, columnId, taskId) => {
        set((state) => ({
          boards: state.boards.map((board) => {
            if (board.id === boardId) {
              return {
                ...board,
                columns: board.columns.map((column) => {
                  if (column.id === columnId) {
                    return {
                      ...column,
                      tasks: column.tasks.filter((task) => task.id !== taskId),
                    };
                  }
                  return column;
                }),
              };
            }
            return board;
          }),
        }));
      },

      moveTask: (
        boardId,
        sourceColumnId,
        destinationColumnId,
        sourceIndex,
        destinationIndex
      ) => {
        set((state) => {
          const board = state.boards.find((b) => b.id === boardId);
          if (!board) return state;

          const sourceColumn = board.columns.find(
            (c) => c.id === sourceColumnId
          );
          const destColumn = board.columns.find(
            (c) => c.id === destinationColumnId
          );

          if (!sourceColumn || !destColumn) return state;

          // Create new arrays to avoid modifying the original state
          const sourceTasks = Array.from(sourceColumn.tasks);
          const destTasks =
            sourceColumnId === destinationColumnId
              ? sourceTasks
              : Array.from(destColumn.tasks);

          // Remove the task from the source column
          const [removedTask] = sourceTasks.splice(sourceIndex, 1);

          // Insert the task in the destination column
          if (sourceColumnId === destinationColumnId) {
            sourceTasks.splice(destinationIndex, 0, removedTask);
          } else {
            destTasks.splice(destinationIndex, 0, removedTask);
          }

          return {
            boards: state.boards.map((b) => {
              if (b.id === boardId) {
                return {
                  ...b,
                  columns: b.columns.map((c) => {
                    if (c.id === sourceColumnId) {
                      return { ...c, tasks: sourceTasks };
                    }
                    if (c.id === destinationColumnId) {
                      return { ...c, tasks: destTasks };
                    }
                    return c;
                  }),
                };
              }
              return b;
            }),
          };
        });
      },
    }),
    {
      name: "task-board-storage",
    }
  )
);

// Initialize the store with sample data if empty
if (typeof window !== "undefined") {
  const { initializeStore } = useBoardStore.getState();
  initializeStore();
}
