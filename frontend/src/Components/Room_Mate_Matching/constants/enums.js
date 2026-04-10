// Enum values matching backend constants/enums.js

export const SLEEP_SCHEDULE = [
    { value: 'EARLY_BIRD', label: 'Early Bird' },
    { value: 'NIGHT_OWL', label: 'Night Owl' },
];

export const SOCIAL_HABITS = [
    { value: 'QUIET', label: 'Quiet' },
    { value: 'MODERATE', label: 'Moderate' },
    { value: 'SOCIAL', label: 'Social' },
];

export const STUDY_HABITS = [
    { value: 'SILENT', label: 'Silent' },
    { value: 'SOME_NOISE', label: 'Some Noise' },
    { value: 'ANY', label: 'Any' },
];

export const AC_TYPE = [
    { value: 'AC', label: 'AC' },
    { value: 'NON_AC', label: 'Non-AC' },
];

export const ROOM_POSITION = [
    { value: 'BALCONY', label: 'Balcony' },
    { value: 'MIDDLE', label: 'Middle' },
];

export const CAPACITY_OPTIONS = [
    { value: 1, label: '1 Person' },
    { value: 2, label: '2 Person' },
    { value: 3, label: '3 Person' },
    { value: 4, label: '4 Person' },
];

export const BLOCK_OPTIONS = [
    { value: 'A', label: 'Block A' },
    { value: 'B', label: 'Block B' },
    { value: 'C', label: 'Block C' },
    { value: 'D', label: 'Block D' },
];

export const FLOOR_OPTIONS = [
    { value: '1', label: 'Floor 1' },
    { value: '2', label: 'Floor 2' },
    { value: '3', label: 'Floor 3' },
    { value: '4', label: 'Floor 4' },
];

export const GENDER_OPTIONS = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
];

export const ISSUE_CATEGORIES = [
    { value: 'FACILITIES', label: 'Facilities' },
    { value: 'SAFETY', label: 'Safety' },
    { value: 'ROOM_CONDITION', label: 'Room Condition' },
    { value: 'CLEANING', label: 'Cleaning' },
    { value: 'ELECTRICITY', label: 'Electricity' },
    { value: 'WATER', label: 'Water' },
    { value: 'OTHER', label: 'Other' },
];

export const ISSUE_PRIORITIES = [
    { value: 'EMERGENCY', label: 'Emergency' },
    { value: 'HIGH', label: 'High' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'LOW', label: 'Low' },
];

export const ISSUE_STATUSES = {
    SUBMITTED: 'Submitted',
    IN_PROGRESS: 'In Progress',
    RESOLVED: 'Resolved',
};

export const AVAILABILITY_STATUSES = [
    { value: 'AVAILABLE', label: 'Available' },
    { value: 'PARTIALLY_FILLED', label: 'Partially Filled' },
    { value: 'FULL', label: 'Full' },
    { value: 'MAINTENANCE', label: 'Maintenance' },
];

export const NOTIFICATION_LABELS = {
    MATCH_REQUEST_RECEIVED: 'Match Request Received',
    MATCH_REQUEST_ACCEPTED: 'Match Request Accepted',
    MATCH_REQUEST_REJECTED: 'Match Request Rejected',
    ROOMMATE_PAIR_LOCKED: 'Roommate Pair Locked',
    ROOM_CHANGED: 'Room Changed',
    ISSUE_STATUS_UPDATED: 'Issue Status Updated',
};
