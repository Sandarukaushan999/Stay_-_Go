import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../../app/store/authStore';
import { getMyProfile } from '../api/studentApi';
import { getMyPreference } from '../api/roomPreferenceApi';

const DevIdentityContext = createContext(null);

export function DevIdentityProvider({ children }) {
    const { user } = useAuthStore();
    
    // We get role and id from the main auth user
    const studentId = user?._id || user?.id || '';
    const role = user?.role || 'student';
    
    const [profile, setProfile] = useState(null);
    const [roomPref, setRoomPref] = useState(null);
    const [loading, setLoading] = useState(true); // start true — data not yet fetched

    const refreshProfile = useCallback(async () => {
        if (!studentId) { setProfile(null); setRoomPref(null); setLoading(false); return; }
        setLoading(true);
        try {
            const res = await getMyProfile();
            setProfile(res.data.data);
        } catch { setProfile(null); }
        try {
            const res = await getMyPreference();
            setRoomPref(res.data.data);
        } catch { setRoomPref(null); }
        setLoading(false);
    }, [studentId]);

    useEffect(() => { refreshProfile(); }, [refreshProfile]);

    const switchIdentity = () => {
        // Disabled since we use real auth now
    };

    const isProfileComplete = profile?.profileCompleted === true;
    const isRoomPrefComplete = profile?.roomPreferenceCompleted === true;
    const isLocked = profile?.finalLockCompleted === true;
    const isAdmin = role === 'admin' || role === 'super_admin';

    // Alias the role and ID for backwards compatibility
    return (
        <DevIdentityContext.Provider value={{
            studentId, role, profile, roomPref, loading,
            isProfileComplete, isRoomPrefComplete, isLocked, isAdmin,
            switchIdentity, refreshProfile, setProfile, setRoomPref,
        }}>
            {children}
        </DevIdentityContext.Provider>
    );
}

export const useIdentity = () => useContext(DevIdentityContext);
