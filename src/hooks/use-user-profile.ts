'use client';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';

export function useUserProfile() {
    const { user, isUserLoading: isAuthLoading, userError } = useUser();
    const firestore = useFirestore();

    const userProfileRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'user_profiles', user.uid);
    }, [firestore, user]);

    const { data: userProfile, isLoading: isProfileLoading, error: profileError } = useDoc<UserProfile>(userProfileRef);

    return {
        user, // from auth
        userProfile, // from firestore
        isLoading: isAuthLoading || (!!user && isProfileLoading),
        error: userError || profileError,
    };
}
