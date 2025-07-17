// Frequency constants for scheduled payments (in seconds)
export const FREQUENCIES = {
  DAILY: 86400,        // 24 hours
  WEEKLY: 604800,      // 7 days
  MONTHLY: 2592000,    // 30 days
  YEARLY: 31536000     // 365 days
};

// Frequency labels for display
export const FREQUENCY_LABELS = {
  [FREQUENCIES.DAILY]: 'Daily',
  [FREQUENCIES.WEEKLY]: 'Weekly',
  [FREQUENCIES.MONTHLY]: 'Monthly',
  [FREQUENCIES.YEARLY]: 'Yearly'
};

// Frequency options for dropdown
export const FREQUENCY_OPTIONS = [
  { value: FREQUENCIES.DAILY, label: 'Daily' },
  { value: FREQUENCIES.WEEKLY, label: 'Weekly' },
  { value: FREQUENCIES.MONTHLY, label: 'Monthly' },
  { value: FREQUENCIES.YEARLY, label: 'Yearly' }
];

// Helper function to get frequency label
export const getFrequencyLabel = (frequency) => {
  return FREQUENCY_LABELS[frequency] || 'Custom';
};

// Helper function to format next payment time
export const formatNextPaymentTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

// Helper function to check if payment is overdue
export const isPaymentOverdue = (nextPaymentTime) => {
  return new Date() > new Date(nextPaymentTime);
}; 