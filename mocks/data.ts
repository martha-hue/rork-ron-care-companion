import { Carer, Shift, LogEntry, Note, WeeklyReview } from '@/constants/types';

export const CARERS: Carer[] = [
  { id: '1', firstName: 'Gemma', lastName: 'Brooks', name: 'Gemma', role: 'Family', relation: 'Daughter', avatar: undefined },
  { id: '2', firstName: 'Pat', lastName: 'Williams', name: 'Pat', role: 'Care-Team', relation: 'Care-Team', avatar: undefined },
  { id: '3', firstName: 'James', lastName: 'Carter', name: 'James', role: 'Private Carer', relation: 'Private Carer', avatar: undefined },
  { id: '4', firstName: 'Linda', lastName: 'Hayes', name: 'Linda', role: 'Friend', relation: 'Friend', avatar: undefined },
];

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

export const INITIAL_SHIFTS: Shift[] = [];

export const INITIAL_LOGS: LogEntry[] = [];

export const INITIAL_NOTES: Note[] = [];

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
