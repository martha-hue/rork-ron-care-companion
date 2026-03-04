import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { Shift, LogEntry, Note, ShiftBlock } from '@/constants/types';
import { INITIAL_SHIFTS, INITIAL_LOGS, INITIAL_NOTES } from '@/mocks/data';

const SHIFTS_KEY = 'ron_shifts';
const LOGS_KEY = 'ron_logs';
const NOTES_KEY = 'ron_notes';
const BLOCKS_KEY = 'ron_shift_blocks';

export const [CareProvider, useCare] = createContextHook(() => {
  const [shifts, setShifts] = useState<Shift[]>(INITIAL_SHIFTS);
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [shiftBlocks, setShiftBlocks] = useState<ShiftBlock[]>([]);
  const queryClient = useQueryClient();

  const shiftsQuery = useQuery({
    queryKey: ['shifts'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(SHIFTS_KEY);
      if (stored) return JSON.parse(stored) as Shift[];
      await AsyncStorage.setItem(SHIFTS_KEY, JSON.stringify(INITIAL_SHIFTS));
      return INITIAL_SHIFTS;
    },
  });

  const logsQuery = useQuery({
    queryKey: ['logs'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(LOGS_KEY);
      if (stored) return JSON.parse(stored) as LogEntry[];
      await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(INITIAL_LOGS));
      return INITIAL_LOGS;
    },
  });

  const notesQuery = useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(NOTES_KEY);
      if (stored) return JSON.parse(stored) as Note[];
      await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(INITIAL_NOTES));
      return INITIAL_NOTES;
    },
  });

  const blocksQuery = useQuery({
    queryKey: ['shiftBlocks'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(BLOCKS_KEY);
      return stored ? JSON.parse(stored) as ShiftBlock[] : [];
    },
  });

  useEffect(() => {
    if (shiftsQuery.data) setShifts(shiftsQuery.data);
  }, [shiftsQuery.data]);

  useEffect(() => {
    if (logsQuery.data) setLogs(logsQuery.data);
  }, [logsQuery.data]);

  useEffect(() => {
    if (notesQuery.data) setNotes(notesQuery.data);
  }, [notesQuery.data]);

  useEffect(() => {
    if (blocksQuery.data) setShiftBlocks(blocksQuery.data);
  }, [blocksQuery.data]);

  const addShiftMutation = useMutation({
    mutationFn: async (shift: Shift) => {
      const updated = [...shifts, shift];
      await AsyncStorage.setItem(SHIFTS_KEY, JSON.stringify(updated));
      return updated;
    },
    onSuccess: (updated) => {
      setShifts(updated);
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });

  const addLogMutation = useMutation({
    mutationFn: async (log: LogEntry) => {
      const updated = [log, ...logs];
      await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(updated));
      return updated;
    },
    onSuccess: (updated) => {
      setLogs(updated);
      queryClient.invalidateQueries({ queryKey: ['logs'] });
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: async (note: Note) => {
      const updated = [note, ...notes];
      await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(updated));
      return updated;
    },
    onSuccess: (updated) => {
      setNotes(updated);
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const addBlockMutation = useMutation({
    mutationFn: async (block: ShiftBlock) => {
      const updated = [...shiftBlocks, block];
      await AsyncStorage.setItem(BLOCKS_KEY, JSON.stringify(updated));
      return updated;
    },
    onSuccess: (updated) => {
      setShiftBlocks(updated);
      queryClient.invalidateQueries({ queryKey: ['shiftBlocks'] });
    },
  });

  const updateBlockMutation = useMutation({
    mutationFn: async (block: ShiftBlock) => {
      const updated = shiftBlocks.map((b) => b.id === block.id ? block : b);
      await AsyncStorage.setItem(BLOCKS_KEY, JSON.stringify(updated));
      return updated;
    },
    onSuccess: (updated) => {
      setShiftBlocks(updated);
      queryClient.invalidateQueries({ queryKey: ['shiftBlocks'] });
    },
  });

  const deleteBlockMutation = useMutation({
    mutationFn: async (blockId: string) => {
      const updated = shiftBlocks.filter((b) => b.id !== blockId);
      await AsyncStorage.setItem(BLOCKS_KEY, JSON.stringify(updated));
      return updated;
    },
    onSuccess: (updated) => {
      setShiftBlocks(updated);
      queryClient.invalidateQueries({ queryKey: ['shiftBlocks'] });
    },
  });

  const toggleNoteStatusMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const updated = notes.map((n) =>
        n.id === noteId
          ? { ...n, status: n.status === 'Ongoing' ? 'Resolved' as const : 'Ongoing' as const }
          : n
      );
      await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(updated));
      return updated;
    },
    onSuccess: (updated) => {
      setNotes(updated);
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const { mutate: mutateAddShift } = addShiftMutation;
  const { mutate: mutateAddLog } = addLogMutation;
  const { mutate: mutateAddNote } = addNoteMutation;
  const { mutate: mutateToggleNote } = toggleNoteStatusMutation;
  const { mutate: mutateAddBlock } = addBlockMutation;
  const { mutate: mutateUpdateBlock } = updateBlockMutation;
  const { mutate: mutateDeleteBlock } = deleteBlockMutation;

  const addShift = useCallback((shift: Shift) => mutateAddShift(shift), [mutateAddShift]);
  const addLog = useCallback((log: LogEntry) => mutateAddLog(log), [mutateAddLog]);
  const addNote = useCallback((note: Note) => mutateAddNote(note), [mutateAddNote]);
  const toggleNoteStatus = useCallback((noteId: string) => mutateToggleNote(noteId), [mutateToggleNote]);
  const addShiftBlock = useCallback((block: ShiftBlock) => mutateAddBlock(block), [mutateAddBlock]);
  const updateShiftBlock = useCallback((block: ShiftBlock) => mutateUpdateBlock(block), [mutateUpdateBlock]);
  const deleteShiftBlock = useCallback((blockId: string) => mutateDeleteBlock(blockId), [mutateDeleteBlock]);

  const getBlocksForDate = useCallback((date: string) => {
    return shiftBlocks.filter((b) => date >= b.startDate && date <= b.endDate);
  }, [shiftBlocks]);

  const getCurrentShift = useCallback(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

    return shifts.find((s) => {
      if (s.date !== todayStr) return false;
      return currentTime >= s.startTime && currentTime < s.endTime;
    }) ?? shifts.find((s) => s.date === todayStr) ?? null;
  }, [shifts]);

  const getLatestLog = useCallback(() => {
    return logs.length > 0 ? logs[0] : null;
  }, [logs]);

  const getShiftsForDate = useCallback((date: string) => {
    return shifts.filter((s) => s.date === date);
  }, [shifts]);

  const getLogsForDate = useCallback((date: string) => {
    return logs.filter((l) => l.timestamp.startsWith(date));
  }, [logs]);

  return {
    shifts,
    logs,
    notes,
    shiftBlocks,
    addShift,
    addLog,
    addNote,
    toggleNoteStatus,
    addShiftBlock,
    updateShiftBlock,
    deleteShiftBlock,
    getBlocksForDate,
    getCurrentShift,
    getLatestLog,
    getShiftsForDate,
    getLogsForDate,
    isLoading: shiftsQuery.isLoading || logsQuery.isLoading || notesQuery.isLoading,
  };
});
