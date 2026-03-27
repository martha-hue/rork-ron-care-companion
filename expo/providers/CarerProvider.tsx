import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { Carer, Patient } from '@/constants/types';

const STORAGE_KEY = 'ron_current_carer';
const CARERS_KEY = 'ron_carers';
const ONBOARDED_KEY = 'ron_onboarded';
const TEAM_STARTER_KEY = 'ron_is_team_starter';
const PATIENT_KEY = 'ron_patient';
const AUTH_METHOD_KEY = 'ron_auth_method';

export const [CarerProvider, useCarer] = createContextHook(() => {
  const [currentCarer, setCurrentCarer] = useState<Carer | null>(null);
  const [carers, setCarers] = useState<Carer[]>([]);
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);
  const [isTeamStarter, setIsTeamStarter] = useState<boolean>(false);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [authMethod, setAuthMethod] = useState<'apple' | 'email' | null>(null);
  const queryClient = useQueryClient();

  const onboardedQuery = useQuery({
    queryKey: ['onboarded'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(ONBOARDED_KEY);
      return stored === 'true';
    },
  });

  const teamStarterQuery = useQuery({
    queryKey: ['teamStarter'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(TEAM_STARTER_KEY);
      return stored === 'true';
    },
  });

  const patientQuery = useQuery({
    queryKey: ['patient'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(PATIENT_KEY);
      return stored ? JSON.parse(stored) as Patient : null;
    },
  });

  const carerQuery = useQuery({
    queryKey: ['currentCarer'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) as Carer : null;
    },
  });

  const carersQuery = useQuery({
    queryKey: ['carers'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(CARERS_KEY);
      return stored ? JSON.parse(stored) as Carer[] : [];
    },
  });

  const authMethodQuery = useQuery({
    queryKey: ['authMethod'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(AUTH_METHOD_KEY);
      return stored as 'apple' | 'email' | null;
    },
  });

  useEffect(() => {
    if (onboardedQuery.data !== undefined) {
      setIsOnboarded(onboardedQuery.data);
    }
  }, [onboardedQuery.data]);

  useEffect(() => {
    if (teamStarterQuery.data !== undefined) {
      setIsTeamStarter(teamStarterQuery.data);
    }
  }, [teamStarterQuery.data]);

  useEffect(() => {
    if (patientQuery.data !== undefined) {
      setPatient(patientQuery.data);
    }
  }, [patientQuery.data]);

  useEffect(() => {
    if (carerQuery.data !== undefined) {
      setCurrentCarer(carerQuery.data);
    }
  }, [carerQuery.data]);

  useEffect(() => {
    if (carersQuery.data) {
      setCarers(carersQuery.data);
    }
  }, [carersQuery.data]);

  useEffect(() => {
    if (authMethodQuery.data !== undefined) {
      setAuthMethod(authMethodQuery.data);
    }
  }, [authMethodQuery.data]);

  const { mutate: setAuthMethodMutate } = useMutation({
    mutationFn: async (method: 'apple' | 'email') => {
      await AsyncStorage.setItem(AUTH_METHOD_KEY, method);
      return method;
    },
    onSuccess: (method) => {
      setAuthMethod(method);
    },
  });

  const { mutate: setTeamStarterMutate } = useMutation({
    mutationFn: async (value: boolean) => {
      await AsyncStorage.setItem(TEAM_STARTER_KEY, value ? 'true' : 'false');
      return value;
    },
    onSuccess: (value) => {
      setIsTeamStarter(value);
    },
  });

  const { mutate: savePatientMutate } = useMutation({
    mutationFn: async (p: Patient) => {
      await AsyncStorage.setItem(PATIENT_KEY, JSON.stringify(p));
      return p;
    },
    onSuccess: (p) => {
      setPatient(p);
      queryClient.invalidateQueries({ queryKey: ['patient'] });
    },
  });

  const { mutate: loginMutate } = useMutation({
    mutationFn: async (carer: Carer) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(carer));
      const existing = await AsyncStorage.getItem(CARERS_KEY);
      const carersList = existing ? JSON.parse(existing) as Carer[] : [];
      const alreadyExists = carersList.find((c: Carer) => c.id === carer.id);
      if (!alreadyExists) {
        const updated = [...carersList, carer];
        await AsyncStorage.setItem(CARERS_KEY, JSON.stringify(updated));
      }
      return carer;
    },
    onSuccess: (carer) => {
      setCurrentCarer(carer);
      queryClient.invalidateQueries({ queryKey: ['currentCarer'] });
      queryClient.invalidateQueries({ queryKey: ['carers'] });
    },
  });

  const { mutate: completeOnboardingMutate } = useMutation({
    mutationFn: async () => {
      await AsyncStorage.setItem(ONBOARDED_KEY, 'true');
    },
    onSuccess: () => {
      setIsOnboarded(true);
      queryClient.invalidateQueries({ queryKey: ['onboarded'] });
    },
  });

  const { mutate: updateAvatarMutate } = useMutation({
    mutationFn: async (avatarUri: string) => {
      if (!currentCarer) return null;
      const updated = { ...currentCarer, avatar: avatarUri };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      const existing = await AsyncStorage.getItem(CARERS_KEY);
      const carersList = existing ? JSON.parse(existing) as Carer[] : [];
      const updatedList = carersList.map((c: Carer) => c.id === updated.id ? updated : c);
      await AsyncStorage.setItem(CARERS_KEY, JSON.stringify(updatedList));
      return updated;
    },
    onSuccess: (updated) => {
      if (updated) {
        setCurrentCarer(updated);
        queryClient.invalidateQueries({ queryKey: ['currentCarer'] });
        queryClient.invalidateQueries({ queryKey: ['carers'] });
      }
    },
  });

  const { mutate: logoutMutate } = useMutation({
    mutationFn: async () => {
      await AsyncStorage.removeItem(STORAGE_KEY);
    },
    onSuccess: () => {
      setCurrentCarer(null);
      queryClient.invalidateQueries({ queryKey: ['currentCarer'] });
    },
  });

  const login = useCallback((carer: Carer) => loginMutate(carer), [loginMutate]);
  const logout = useCallback(() => logoutMutate(), [logoutMutate]);
  const completeOnboarding = useCallback(() => completeOnboardingMutate(), [completeOnboardingMutate]);
  const savePatient = useCallback((p: Patient) => savePatientMutate(p), [savePatientMutate]);
  const markTeamStarter = useCallback((v: boolean) => setTeamStarterMutate(v), [setTeamStarterMutate]);
  const saveAuthMethod = useCallback((m: 'apple' | 'email') => setAuthMethodMutate(m), [setAuthMethodMutate]);
  const updateAvatar = useCallback((uri: string) => updateAvatarMutate(uri), [updateAvatarMutate]);

  return {
    currentCarer,
    carers,
    isOnboarded,
    isTeamStarter,
    patient,
    authMethod,
    login,
    logout,
    completeOnboarding,
    savePatient,
    markTeamStarter,
    saveAuthMethod,
    updateAvatar,
    isLoading: onboardedQuery.isLoading || carerQuery.isLoading,
  };
});
