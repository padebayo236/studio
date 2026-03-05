'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type {
  Worker,
  AttendanceRecord,
  FarmTask,
  ProductivityEntry,
  FarmField,
  UserProfile,
} from '@/lib/types';

export function useWorkers() {
  const firestore = useFirestore();
  const queryRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'workers') : null),
    [firestore]
  );
  return useCollection<Worker>(queryRef);
}

export function useAttendance() {
  const firestore = useFirestore();
  const queryRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'attendance') : null),
    [firestore]
  );
  return useCollection<AttendanceRecord>(queryRef);
}

export function useTasks() {
  const firestore = useFirestore();
  const queryRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'tasks') : null),
    [firestore]
  );
  return useCollection<FarmTask>(queryRef);
}

export function useProductivity() {
  const firestore = useFirestore();
  const queryRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'productivity') : null),
    [firestore]
  );
  return useCollection<ProductivityEntry>(queryRef);
}

export function useFields() {
  const firestore = useFirestore();
  const queryRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'fields') : null),
    [firestore]
  );
  return useCollection<FarmField>(queryRef);
}

export function useUsers() {
    const firestore = useFirestore();
    const queryRef = useMemoFirebase(
      () => (firestore ? collection(firestore, 'users') : null),
      [firestore]
    );
    return useCollection<UserProfile>(queryRef);
  }
