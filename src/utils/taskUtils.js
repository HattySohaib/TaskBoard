/**
 * Filter tasks based on search term, priority, assignee, and due date
 * @param {Object[]} tasks - Array of task objects
 * @param {string} searchTerm - Search term to filter by
 * @param {string[]} priorityFilter - Array of priority values to include
 * @param {string[]} assigneeFilter - Array of assignees to include
 * @param {string} dueDateFilter - Due date filter (today, thisWeek, overdue)
 * @returns {Object[]} - Filtered tasks
 */
export const filterTasks = (
  tasks,
  searchTerm,
  priorityFilter,
  assigneeFilter,
  dueDateFilter
) => {
  return tasks.filter((task) => {
    // Filter by search term
    if (
      searchTerm &&
      !task.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !task.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    // Filter by priority
    if (priorityFilter.length > 0 && !priorityFilter.includes(task.priority)) {
      return false;
    }

    // Filter by assignee
    if (
      assigneeFilter.length > 0 &&
      !assigneeFilter.includes(task.assignedTo)
    ) {
      return false;
    }

    // Filter by due date
    if (dueDateFilter) {
      const now = new Date();
      const dueDate = new Date(task.dueDate);

      if (dueDateFilter === "today") {
        if (dueDate.toDateString() !== now.toDateString()) {
          return false;
        }
      } else if (dueDateFilter === "thisWeek") {
        const endOfWeek = new Date();
        endOfWeek.setDate(now.getDate() + (7 - now.getDay()));

        if (dueDate < now || dueDate > endOfWeek) {
          return false;
        }
      } else if (dueDateFilter === "overdue") {
        now.setHours(0, 0, 0, 0);
        if (dueDate >= now) {
          return false;
        }
      }
    }

    return true;
  });
};

/**
 * Format a date string for display
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date string
 */
export const formatDueDate = (dateString) => {
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

/**
 * Check if a due date is soon (within next 2 days)
 * @param {string} dateString - ISO date string
 * @returns {boolean}
 */
export const isDueSoon = (dateString) => {
  if (!dateString) return false;

  const dueDate = new Date(dateString);
  const now = new Date();
  const diffTime = dueDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays <= 2 && diffDays >= 0;
};

/**
 * Check if a due date is overdue
 * @param {string} dateString - ISO date string
 * @returns {boolean}
 */
export const isOverdue = (dateString) => {
  if (!dateString) return false;

  const dueDate = new Date(dateString);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return dueDate < now;
};
