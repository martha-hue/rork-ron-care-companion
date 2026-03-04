export type CarerRole = 'Family' | 'Care-Team' | 'Private Carer' | 'Friend';

export type CarerRelation = 'Son' | 'Daughter' | 'Spouse' | 'Sibling' | 'Friend' | 'Care-Team' | 'Private Carer' | 'Other';

export const RELATION_TO_ROLE: Record<CarerRelation, CarerRole> = {
  'Son': 'Family',
  'Daughter': 'Family',
  'Spouse': 'Family',
  'Sibling': 'Family',
  'Friend': 'Friend',
  'Care-Team': 'Care-Team',
  'Private Carer': 'Private Carer',
  'Other': 'Family',
};

export interface Patient {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  notes?: string;
}

export interface Carer {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  role: CarerRole;
  relation?: CarerRelation;
  avatar?: string;
  isTeamStarter?: boolean;
}

export interface Shift {
  id: string;
  carerId: string;
  carerName: string;
  carerRole: CarerRole;
  date: string;
  startTime: string;
  endTime: string;
}

export type LogType =
  | 'Morning Meds'
  | 'Afternoon Meds'
  | 'Night Meds'
  | 'As-Needed Meds'
  | 'Meal'
  | 'Nap'
  | 'Walk'
  | 'BM'
  | 'Good Day'
  | 'Clear Spell'
  | 'Incident'
  | 'Fall'
  | 'Medical Appointment'
  | 'Other';

export type LogCategory = 'Medications' | 'Meals' | 'Medical' | 'Activity';

export interface LogEntry {
  id: string;
  timestamp: string;
  carerOnDuty: string;
  loggedBy: string;
  loggedByRole: CarerRole;
  logType: LogType;
  notes?: string;
  category: LogCategory;
}

export type BlockType = 'Covering Shift' | 'Off / Unavailable';

export interface ShiftBlock {
  id: string;
  carerId: string;
  carerName: string;
  carerRole: CarerRole;
  startDate: string;
  endDate: string;
  blockType: BlockType;
  notes?: string;
  color: string;
}

export type NoteCategory = 'Flag for Team' | 'Meds Renewal' | 'Pattern Noticed' | 'General';
export type NoteStatus = 'Ongoing' | 'Resolved';

export interface Note {
  id: string;
  author: string;
  authorRole: CarerRole;
  date: string;
  category: NoteCategory;
  status: NoteStatus;
  content: string;
  imageUri?: string;
}

export interface WeeklyReview {
  weekStarting: string;
  weekEnding: string;
  snapshot: string;
  activityHighlights: string[];
  incidents: string[];
  medicationNotes: string[];
  teamObservations: string[];
}

export const LOG_TYPE_CATEGORY: Record<LogType, LogCategory> = {
  'Morning Meds': 'Medications',
  'Afternoon Meds': 'Medications',
  'Night Meds': 'Medications',
  'As-Needed Meds': 'Medications',
  'Meal': 'Meals',
  'Nap': 'Activity',
  'Walk': 'Activity',
  'BM': 'Medical',
  'Good Day': 'Activity',
  'Clear Spell': 'Activity',
  'Incident': 'Medical',
  'Fall': 'Medical',
  'Medical Appointment': 'Medical',
  'Other': 'Activity',
};

export const LOG_TYPE_ICONS: Record<LogType, string> = {
  'Morning Meds': 'Pill',
  'Afternoon Meds': 'Pill',
  'Night Meds': 'Moon',
  'As-Needed Meds': 'Plus',
  'Meal': 'UtensilsCrossed',
  'Nap': 'BedDouble',
  'Walk': 'Footprints',
  'BM': 'Activity',
  'Good Day': 'Smile',
  'Clear Spell': 'Sun',
  'Incident': 'AlertTriangle',
  'Fall': 'AlertCircle',
  'Medical Appointment': 'Stethoscope',
  'Other': 'FileText',
};
