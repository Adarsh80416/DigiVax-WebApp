/**
 * Vaccine Scheduler Utility
 * Calculates due dates for vaccines based on child's date of birth and recommended age
 */

/**
 * Parse recommended age string and convert to days
 * Supports formats like:
 * - "At birth" -> 0 days
 * - "6 weeks" -> 42 days
 * - "2 months" -> 60 days
 * - "1 year" -> 365 days
 * - "18 months" -> 540 days
 */
export const parseRecommendedAge = (recommendedAge) => {
  if (!recommendedAge) return null;
  
  const ageStr = recommendedAge.toLowerCase().trim();
  
  // At birth
  if (ageStr === "at birth" || ageStr === "birth") {
    return 0;
  }
  
  // Extract number and unit
  const match = ageStr.match(/(\d+)\s*(week|weeks|month|months|year|years|day|days)/);
  if (!match) return null;
  
  const number = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  
  // Convert to days
  let days = 0;
  if (unit === "day" || unit === "days") {
    days = number;
  } else if (unit === "week" || unit === "weeks") {
    days = number * 7;
  } else if (unit === "month" || unit === "months") {
    days = number * 30; // Approximate: 30 days per month
  } else if (unit === "year" || unit === "years") {
    days = number * 365;
  }
  
  return days;
};

/**
 * Calculate due date for a vaccine
 * @param {Date} dateOfBirth - Child's date of birth
 * @param {String} recommendedAge - Recommended age string (e.g., "6 weeks", "2 months")
 * @returns {Date} Due date for the vaccine
 */
export const calculateDueDate = (dateOfBirth, recommendedAge) => {
  if (!dateOfBirth || !recommendedAge) return null;
  
  const days = parseRecommendedAge(recommendedAge);
  if (days === null) return null;
  
  const dueDate = new Date(dateOfBirth);
  dueDate.setDate(dueDate.getDate() + days);
  
  return dueDate;
};

/**
 * Determine vaccine status for a child
 * @param {Date} dateOfBirth - Child's date of birth
 * @param {String} recommendedAge - Recommended age string
 * @param {Array} vaccinationHistory - Child's vaccination history
 * @param {String} vaccineId - Vaccine ID to check
 * @returns {Object} Status object with status and dueDate
 */
export const getVaccineStatus = (dateOfBirth, recommendedAge, vaccinationHistory, vaccineId) => {
  if (!dateOfBirth || !recommendedAge) {
    return { status: "unknown", dueDate: null };
  }
  
  // Check if vaccine is already completed
  const completedVaccine = vaccinationHistory.find(
    v => v.vaccineId && v.vaccineId.toString() === vaccineId.toString() && v.status === "completed"
  );
  
  if (completedVaccine) {
    return { status: "completed", dueDate: null };
  }
  
  // Calculate due date
  const dueDate = calculateDueDate(dateOfBirth, recommendedAge);
  if (!dueDate) {
    return { status: "unknown", dueDate: null };
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDateOnly = new Date(dueDate);
  dueDateOnly.setHours(0, 0, 0, 0);
  
  // Compare dates
  if (dueDateOnly < today) {
    return { status: "missed", dueDate: dueDate.toISOString().split('T')[0] };
  } else {
    return { status: "upcoming", dueDate: dueDate.toISOString().split('T')[0] };
  }
};

export default {
  parseRecommendedAge,
  calculateDueDate,
  getVaccineStatus
};

