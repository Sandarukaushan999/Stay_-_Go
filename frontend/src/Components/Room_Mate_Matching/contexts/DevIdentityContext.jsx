import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../../app/store/authStore';
import { getMyProfile } from '../api/studentApi';
import { getMyPreference } from '../api/roomPreferenceApi';

const DevIdentityContext = createContext(null);

export function DevIdentityProvider({ children }) {
    const { user } = useAuthStore();

    const studentId = user?._id || user?.id || '';
    const role = user?.role || 'student';
    const displayName = user?.fullName || user?.email || 'User';

    const [profile, setProfile] = useState(null);
    const [roomPref, setRoomPref] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshProfile = useCallback(async () => {
        if (!studentId) {
            setProfile(null);
            setRoomPref(null);
            setLoading(false);
            return;
        }

        if (role === 'admin' || role === 'super_admin') {
            setProfile(null);
            setRoomPref(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const res = await getMyProfile();
            setProfile(res.data.data);
        } catch {
            setProfile(null);
        }

        try {
            const res = await getMyPreference();
            setRoomPref(res.data.data);
        } catch {
            setRoomPref(null);
        }

        setLoading(false);
    }, [studentId, role]);

    useEffect(() => {
        refreshProfile();
    }, [refreshProfile]);

    const switchIdentity = () => {
        // Disabled intentionally: roommate module now uses the main authenticated account.
    };

    const isProfileComplete = profile?.profileCompleted === true;
    const isRoomPrefComplete = profile?.roomPreferenceCompleted === true;
    const isLocked = profile?.finalLockCompleted === true;
    const isAdmin = role === 'admin' || role === 'super_admin';

    return (
        <DevIdentityContext.Provider value={{
            user,
            displayName,
            studentId,
            role,
            profile,
            roomPref,
            loading,
            isProfileComplete,
            isRoomPrefComplete,
            isLocked,
            isAdmin,
            switchIdentity,
            refreshProfile,
            setProfile,
            setRoomPref,
        }}>
            {children}
        </DevIdentityContext.Provider>
    );
}

export const useIdentity = () => useContext(DevIdentityContext);
