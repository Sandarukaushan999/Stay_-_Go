import React, { useState } from 'react';
import { ShieldCheck, Loader2, Link2, Link2Off, UserCircle2 } from 'lucide-react';
import { useAuthStore } from '../../../app/store/authStore';
import { createApiClient, getApiBaseURL } from '../../../lib/axios';
import toast from 'react-hot-toast';

export default function GoogleAuthConnect() {
  const { user, hydrateMe } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const api = createApiClient({ getToken: () => useAuthStore.getState().token });

  const isGoogleConnected = Boolean(user?.googleId);

  // Google profile data stored in DB (populated by both ID-token flow & Passport flow)
  const googleName    = user?.googleName    || null;
  const googleEmail   = user?.googleEmail   || null;
  const googlePicture = user?.googlePicture || null;

  /** Initiate Passport OAuth redirect — used when user is already logged in and wants to link */
  const handleConnect = () => {
    const token     = useAuthStore.getState().token;
    const backendUrl = getApiBaseURL().replace(/\/api$/, '');
    // Pass JWT as Authorization header via a tiny redirect trick:
    // We send the token as a header in the initial GET by using a form POST approach.
    // Since OAuth requires a GET redirect, we store the token and backend reads it from state.
    window.location.href = `${backendUrl}/auth/google`;
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect your Google account?')) return;

    setLoading(true);
    try {
      const { data } = await api.delete('/auth/google/disconnect');
      if (data.success) {
        toast.success(data.message || 'Google account disconnected');
        await hydrateMe({ force: true });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to disconnect account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[24px] border p-5 shadow-sm transition-colors duration-300" style={{ background: 'var(--admin-surface-2)', borderColor: 'var(--admin-border)' }}>
      {/* Header */}
      <div className="mb-4 pb-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--admin-border)' }}>
        <h3 className="text-[13px] font-bold tracking-wide uppercase flex items-center gap-2 transition-colors duration-300" style={{ color: 'var(--admin-text)' }}>
          <Link2 className="w-4 h-4 text-[#876DFF]" /> Linked Accounts
        </h3>
        {isGoogleConnected && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
            <ShieldCheck className="w-3 h-3" /> Active
          </span>
        )}
      </div>

      <div className="flex flex-col items-center text-center gap-3">
        {/* Google logo / avatar */}
        <div className="relative">
          {isGoogleConnected && googlePicture ? (
            <img
              src={googlePicture}
              alt={googleName || 'Google account'}
              className="h-12 w-12 rounded-full border-2 border-[#BAF91A] shadow-md object-cover"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full border shadow-sm" style={{ background: 'var(--admin-surface)', borderColor: 'var(--admin-border)' }}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </div>
          )}
          {isGoogleConnected && (
            <div className="absolute -bottom-1 -right-1 bg-[#BAF91A] text-[#101312] p-0.5 rounded-full border-2 border-white shadow-sm">
              <ShieldCheck className="w-3 h-3" />
            </div>
          )}
        </div>

        {/* Google account info */}
        <div>
          <h4 className="font-bold text-sm leading-tight transition-colors duration-300" style={{ color: 'var(--admin-text)' }}>Google</h4>
          {isGoogleConnected && (googleName || googleEmail) ? (
            <>
              {googleName && (
                <p className="text-[11px] font-semibold mt-0.5 truncate max-w-[160px] transition-colors duration-300" style={{ color: 'var(--admin-text-muted)' }}>
                  {googleName}
                </p>
              )}
              {googleEmail && (
                <p className="text-[10px] truncate max-w-[160px] transition-colors duration-300" style={{ color: 'var(--admin-text-muted)', opacity: 0.8 }}>
                  {googleEmail}
                </p>
              )}
              <p className="text-[11px] font-semibold mt-0.5 text-emerald-500">Connected</p>
            </>
          ) : (
            <p className={`text-[11px] font-semibold mt-0.5 transition-colors duration-300`} style={{ color: isGoogleConnected ? '#10B981' : 'var(--admin-text-muted)' }}>
              {isGoogleConnected ? 'Connected' : 'Not Connected'}
            </p>
          )}
        </div>

        {/* Action button */}
        <div className="w-full mt-1">
          {isGoogleConnected ? (
            <button
              type="button"
              onClick={handleDisconnect}
              disabled={loading}
              className="w-full justify-center rounded-xl border border-rose-500/30 hover:bg-rose-500/10 text-rose-500 px-4 py-2 text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2Off className="w-3.5 h-3.5" />}
              Disconnect
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConnect}
              disabled={loading}
              className="w-full justify-center rounded-xl bg-[#BAF91A] hover:bg-[#a9ea00] text-[#101312] px-4 py-2 text-xs font-bold shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Connect Google
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
