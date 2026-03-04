import { Carer, Shift, LogEntry, Note, WeeklyReview } from '@/constants/types';

export const CARERS: Carer[] = [
  { id: '1', firstName: 'Gemma', lastName: 'Brooks', name: 'Gemma', role: 'Family', relation: 'Daughter', avatar: undefined },
  { id: '2', firstName: 'Pat', lastName: 'Williams', name: 'Pat', role: 'Care-Team', relation: 'Care-Team', avatar: undefined },
  { id: '3', firstName: 'James', lastName: 'Carter', name: 'James', role: 'Private Carer', relation: 'Private Carer', avatar: undefined },
  { id: '4', firstName: 'Linda', lastName: 'Hayes', name: 'Linda', role: 'Friend', relation: 'Friend', avatar: undefined },
];

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

export const INITIAL_SHIFTS: Shift[] = [
  {
    id: 's1',
    carerId: '1',
    carerName: 'Gemma',
    carerRole: 'Family',
    date: today,
    startTime: '07:00',
    endTime: '14:00',
  },
  {
    id: 's2',
    carerId: '2',
    carerName: 'Pat',
    carerRole: 'Care-Team',
    date: today,
    startTime: '14:00',
    endTime: '20:00',
  },
  {
    id: 's3',
    carerId: '3',
    carerName: 'James',
    carerRole: 'Private Carer',
    date: today,
    startTime: '20:00',
    endTime: '07:00',
  },
  {
    id: 's4',
    carerId: '1',
    carerName: 'Gemma',
    carerRole: 'Family',
    date: yesterday,
    startTime: '07:00',
    endTime: '14:00',
  },
  {
    id: 's5',
    carerId: '4',
    carerName: 'Linda',
    carerRole: 'Friend',
    date: yesterday,
    startTime: '14:00',
    endTime: '18:00',
  },
];

export const INITIAL_LOGS: LogEntry[] = [
  {
    id: 'l1',
    timestamp: new Date(new Date().setHours(8, 30, 0, 0)).toISOString(),
    carerOnDuty: 'Gemma',
    loggedBy: 'Gemma',
    loggedByRole: 'Family',
    logType: 'Morning Meds',
    notes: 'All medication taken with breakfast',
    category: 'Medications',
  },
  {
    id: 'l2',
    timestamp: new Date(new Date().setHours(9, 15, 0, 0)).toISOString(),
    carerOnDuty: 'Gemma',
    loggedBy: 'Gemma',
    loggedByRole: 'Family',
    logType: 'Meal',
    notes: 'Porridge and toast, ate well',
    category: 'Meals',
  },
  {
    id: 'l3',
    timestamp: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
    carerOnDuty: 'Gemma',
    loggedBy: 'Gemma',
    loggedByRole: 'Family',
    logType: 'Walk',
    notes: 'Short walk in the garden, 15 minutes',
    category: 'Activity',
  },
  {
    id: 'l4',
    timestamp: new Date(new Date().setHours(11, 30, 0, 0)).toISOString(),
    carerOnDuty: 'Gemma',
    loggedBy: 'Gemma',
    loggedByRole: 'Family',
    logType: 'Good Day',
    notes: 'Chatty and cheerful this morning',
    category: 'Activity',
  },
  {
    id: 'l5',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    carerOnDuty: 'Pat',
    loggedBy: 'Pat',
    loggedByRole: 'Care-Team',
    logType: 'Afternoon Meds',
    notes: 'Took meds with lunch',
    category: 'Medications',
  },
  {
    id: 'l6',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    carerOnDuty: 'Linda',
    loggedBy: 'Linda',
    loggedByRole: 'Friend',
    logType: 'Nap',
    notes: 'Napped for about an hour after lunch',
    category: 'Activity',
  },
];

export const INITIAL_NOTES: Note[] = [
  {
    id: 'n1',
    author: 'Gemma',
    authorRole: 'Family',
    date: today,
    category: 'Flag for Team',
    status: 'Ongoing',
    content: 'Dad seems more confused in the evenings lately. Please note any sundowning patterns.',
  },
  {
    id: 'n2',
    author: 'Pat',
    authorRole: 'Care-Team',
    date: yesterday,
    category: 'Meds Renewal',
    status: 'Ongoing',
    content: 'Blood pressure medication running low — needs renewal by Friday.',
  },
  {
    id: 'n3',
    author: 'James',
    authorRole: 'Private Carer',
    date: yesterday,
    category: 'Pattern Noticed',
    status: 'Resolved',
    content: 'Appetite has improved over the last 3 days. Eating full meals again.',
  },
  {
    id: 'n4',
    author: 'Linda',
    authorRole: 'Friend',
    date: today,
    category: 'General',
    status: 'Ongoing',
    content: 'Brought some new puzzle books — he really enjoyed the crosswords.',
  },
];

export const MOCK_WEEKLY_REVIEW: WeeklyReview = {
  weekStarting: '2026-02-20',
  weekEnding: '2026-02-26',
  snapshot: 'A generally positive week for Ron. Energy levels were good on most days, with some evening confusion noted on two occasions. Appetite has improved noticeably.',
  activityHighlights: [
    'Took 4 garden walks this week — the best in a month',
    'Enjoyed crossword puzzles brought by Linda',
    'Had a lovely video call with grandchildren on Wednesday',
  ],
  incidents: [
    'Mild confusion on Tuesday evening around 7pm, settled after reassurance',
    'Slight unsteadiness on Thursday morning — monitored, no fall',
  ],
  medicationNotes: [
    'All scheduled medications taken on time',
    'Blood pressure medication needs renewal by Friday',
    'No adverse reactions noted',
  ],
  teamObservations: [
    'Gemma: Dad seems brighter when he has morning walks',
    'Pat: Responds well to structured routine',
    'James: Sleeping better this week, less restless at night',
  ],
};

export const PATIENT_NAME = 'Ron';

export const PAST_WEEKLY_REVIEWS: WeeklyReview[] = [
  {
    weekStarting: '2026-02-20',
    weekEnding: '2026-02-26',
    snapshot: 'A generally positive week for Ron. Energy levels were good on most days, with some evening confusion noted on two occasions. Appetite has improved noticeably.',
    activityHighlights: [
      'Took 4 garden walks this week — the best in a month',
      'Enjoyed crossword puzzles brought by Linda',
      'Had a lovely video call with grandchildren on Wednesday',
    ],
    incidents: [
      'Mild confusion on Tuesday evening around 7pm, settled after reassurance',
      'Slight unsteadiness on Thursday morning — monitored, no fall',
    ],
    medicationNotes: [
      'All scheduled medications taken on time',
      'Blood pressure medication needs renewal by Friday',
      'No adverse reactions noted',
    ],
    teamObservations: [
      'Gemma: Dad seems brighter when he has morning walks',
      'Pat: Responds well to structured routine',
      'James: Sleeping better this week, less restless at night',
    ],
  },
  {
    weekStarting: '2026-02-13',
    weekEnding: '2026-02-19',
    snapshot: 'A mixed week. Ron had some very good days with clear spells and strong appetite, but two evenings showed noticeable sundowning. The team handled transitions well.',
    activityHighlights: [
      'Completed a jigsaw puzzle over two days — great focus',
      'Walked to the end of the street and back on Monday',
      'Watched old family videos and was very engaged',
    ],
    incidents: [
      'Sundowning on Wednesday and Friday evenings — became agitated around 6pm',
      'Refused evening medication on Wednesday, took it 30 minutes later with encouragement',
    ],
    medicationNotes: [
      'One missed evening dose on Wednesday, taken late',
      'Morning medications all on schedule',
      'GP reviewing dosage at next appointment',
    ],
    teamObservations: [
      'Gemma: He really lights up when looking at old photos',
      'Pat: Routine is key — any disruption increases confusion',
      'Linda: Brought homemade soup, he loved it',
    ],
  },
  {
    weekStarting: '2026-02-06',
    weekEnding: '2026-02-12',
    snapshot: 'A quieter week overall. Ron was more tired than usual, likely due to a mild cold early in the week. By Thursday he was back to his usual self.',
    activityHighlights: [
      'Rested well Monday to Wednesday',
      'Resumed garden walks on Thursday',
      'Enjoyed listening to music on Friday afternoon',
    ],
    incidents: [],
    medicationNotes: [
      'All medications taken as prescribed',
      'Added vitamin C supplement during cold',
      'Cold cleared by Thursday with no complications',
    ],
    teamObservations: [
      'James: Sleep was deeper this week, possibly due to the cold',
      'Pat: Good fluid intake throughout',
      'Gemma: Dad bounced back quickly, good sign',
    ],
  },
  {
    weekStarting: '2026-01-30',
    weekEnding: '2026-02-05',
    snapshot: 'Strong week for Ron. He was sociable, ate well, and had several clear spells where he was very present and conversational. No incidents reported.',
    activityHighlights: [
      'Three garden walks',
      'Played cards with Linda on Saturday',
      'Helped fold laundry — seemed to enjoy the routine',
    ],
    incidents: [],
    medicationNotes: [
      'All medications taken on time',
      'No side effects observed',
    ],
    teamObservations: [
      'Gemma: Best week in a while — really engaged',
      'Pat: Very cooperative with personal care',
      'James: Slept through the night every night this week',
    ],
  },
];
