export const APPOINTMENT_RULES = {
  MIN_DURATION_MINUTES: 30,
  MAX_DURATION_MINUTES: 120,
  MIN_ADVANCE_HOURS: 24,
  MAX_ADVANCE_DAYS: 30,
  CANCELLATION_LIMIT_HOURS: 12,
} as const;

export const AVAILABILITY_RULES = {
  MIN_START_HOUR: 7, // 7:00 AM
  MAX_END_HOUR: 19, // 7:00 PM
  MIN_SLOT_DURATION_MINUTES: 30,
  MAX_SLOTS_PER_DAY: 20,
  MAX_ADVANCE_DAYS: 60,
} as const;

export const NOTIFICATION_RULES = {
  APPOINTMENT_REMINDER_HOURS: 24,
  CANCELLATION_NOTIFICATION_IMMEDIATE: true,
  RESCHEDULE_NOTIFICATION_IMMEDIATE: true,
} as const;
