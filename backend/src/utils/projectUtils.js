
/**
 * Calculates project completion percentage based on tasks.
 * @param {Array} tasks - The array of tasks for a project.
 * @returns {number} - The completion percentage (0-100).
 */
export const calculateProgress = (tasks) => {
  if (!tasks || tasks.length === 0) return 0;
  const completed = tasks.filter(t => t.status === "Completed").length;
  return Math.round((completed / tasks.length) * 100);
};