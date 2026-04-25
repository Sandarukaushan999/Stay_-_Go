import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../app/store/authStore';
import { createApiClient } from '../lib/axios';
import toast from 'react-hot-toast';
import {
  User, Phone, MapPin, Loader2, Shield, ShieldCheck, ShieldAlert, Calendar,
  LogOut, Mail, CheckCircle2, XCircle, Lock, Check,
  Eye, EyeOff, Globe, Palette
} from 'lucide-react';
import GoogleAuthConnect from '../Components/admin_and_user_management/users/GoogleAuthConnect';
import ProfileImageCropper from '../Components/admin_and_user_management/users/ProfileImageCropper';
import { useTheme } from '../app/hooks/useTheme';
import { useTranslation } from '../app/i18n/TranslationContext';

const api = createApiClient({ getToken: () => useAuthStore.getState().token });

/* ── Role helpers ── */
const ROLE_LABELS = {
  student: 'Student',
  rider: 'Rider',
  technician: 'Technician',
  admin: 'Admin',
  super_admin: 'Super Admin',
};

const ROLE_COLORS = {
  student: 'bg-[#E2FF99] text-[#3a4a00]',
  rider:   'bg-blue-100 text-blue-700',
  technician: 'bg-orange-100 text-orange-700',
  admin:   'bg-[#876DFF]/15 text-[#5b4ccc]',
  super_admin: 'bg-[#876DFF]/25 text-[#5b4ccc]',
};

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || 'U';
}

function resolveImageSrc(profileImage, googlePicture) {
  // Prefer uploaded profileImage; fall back to Google picture
  const src = profileImage || googlePicture || null;
  if (!src) return null;
  if (src.startsWith('http')) return src;
  const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api$/, '');
  return `${base}/${src.replace(/^\//, '')}`;
}

/* ── Shared label ── */
function FieldLabel({ children }) {
  return (
    <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-[#101312]/55 mb-1.5">
      {children}
    </label>
  );
}

/* ── Styled input ── */
function StyledInput({ icon: Icon, iconColor = 'text-[#101312]/35', rightElement, ...props }) {
  return (
    <div className="relative group">
      {Icon && (
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Icon className={`h-4 w-4 transition-colors group-focus-within:text-[#BAF91A] ${iconColor}`} />
        </span>
      )}
      <input
        {...props}
        className={[
          'w-full rounded-xl border border-[#101312]/15 bg-white px-3 py-2.5 text-sm text-[#101312]',
          'outline-none transition-all duration-150',
          'focus:border-[#BAF91A] focus:ring-2 focus:ring-[#BAF91A]/30',
          'placeholder:text-[#101312]/30',
          Icon ? 'pl-10' : '',
          rightElement ? 'pr-11' : '',
          props.className || '',
        ].join(' ')}
      />
      {rightElement && (
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
          {rightElement}
        </div>
      )}
    </div>
  );
}

/* ── Styled select ── */
function StyledSelect({ children, ...props }) {
  return (
    <select
      {...props}
      className="w-full rounded-xl border border-[#101312]/15 bg-white px-3 py-2.5 text-sm text-[#101312] outline-none transition-all duration-150 appearance-none focus:border-[#BAF91A] focus:ring-2 focus:ring-[#BAF91A]/30"
    >
      {children}
    </select>
  );
}

/* ── Styled textarea ── */
function StyledTextarea({ icon: Icon, ...props }) {
  return (
    <div className="relative group">
      {Icon && (
        <span className="absolute top-3 left-3.5 pointer-events-none">
          <Icon className="h-4 w-4 text-[#101312]/35" />
        </span>
      )}
      <textarea
        {...props}
        className={[
          'w-full rounded-xl border border-[#101312]/15 bg-white px-3 py-2.5 text-sm text-[#101312] resize-none',
          'outline-none transition-all duration-150',
          'focus:border-[#BAF91A] focus:ring-2 focus:ring-[#BAF91A]/30',
          'placeholder:text-[#101312]/30',
          Icon ? 'pl-10' : '',
        ].join(' ')}
      />
    </div>
  );
}

/* ── White card ── */
function Card({ children, className = '' }) {
  return (
    <div
      className={[
        'rounded-[20px] border border-[#101312]/10 bg-white',
        'shadow-[0_8px_32px_rgba(16,19,18,0.07)]',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}

/* ── Section heading ── */
function SectionHead({ label, title, icon: Icon, iconBg = 'bg-[#BAF91A]', iconColor = 'text-[#101312]' }) {
  return (
    <div className="mb-5 pb-4 border-b border-[#101312]/8">
      {label && (
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#876DFF] mb-0.5">{label}</p>
      )}
      <div className="flex items-center gap-2.5">
        {Icon && (
          <span className={`inline-flex h-8 w-8 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}>
            <Icon className="h-4 w-4" />
          </span>
        )}
        <h3 className="text-base font-bold text-[#101312]">{title}</h3>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   Main page
   ════════════════════════════════════════════════════════════ */
export default function UserProfilePage() {
  const { user, hydrateMe, logout } = useAuthStore();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { t, changeLanguage } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({ language: 'English' });

  // Password Update States
  const [passwordState, setPasswordState] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [newPasswordTouched, setNewPasswordTouched] = useState(false);
  
  // Real-time password validation logic
  const pass = passwordState.newPassword;
  const passwordReqs = [
    { label: 'At least 8 characters long', met: pass.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(pass) },
    { label: 'One lowercase letter', met: /[a-z]/.test(pass) },
    { label: 'One number', met: /\d/.test(pass) },
    { label: 'One special character', met: /[^A-Za-z0-9]/.test(pass) },
  ];
  
  const metCount = passwordReqs.filter(r => r.met).length;
  let strengthLevel = 0; // 0 = empty, 1 = weak, 2 = good, 3 = very strong
  if (pass.length > 0) {
    if (metCount <= 2) strengthLevel = 1;
    else if (metCount <= 4) strengthLevel = 2;
    else if (metCount === 5) strengthLevel = 3;
  }
  const isNewPasswordValid = strengthLevel >= 2;
  const isConfirmValid = pass === passwordState.confirmPassword && passwordState.confirmPassword.length > 0;
  
  const canSubmitPassword = isNewPasswordValid && isConfirmValid && (user?.hasPassword === false || passwordState.currentPassword.length > 0);

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    emergencyContact: '',
    studentId: '',
    gender: '',
    address: '',
  });

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/users/profile/me');
      if (data.success && data.user) {
        setForm({
          fullName: data.user.fullName || '',
          phone: data.user.phone || '',
          emergencyContact: data.user.emergencyContact || '',
          studentId: data.user.studentId || '',
          gender: data.user.gender || '',
          address: data.user.address || '',
        });
        if (data.user.systemSettings) {
          const s = data.user.systemSettings;
          setSettings({ language: s.language || 'English' });
          if (s.theme && s.theme !== theme) toggleTheme(s.theme);
        }
      }
    } catch {
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim()) return toast.error('Full Name is required');
    setSaving(true);
    try {
      const payload = {
        ...form,
        systemSettings: { ...settings, theme }
      };
      const { data } = await api.put('/users/profile/me', payload);
      if (data.success) {
        changeLanguage(settings.language);
        toast.success('Profile updated successfully!');
        await hydrateMe();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };


  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (user?.hasPassword !== false && !passwordState.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (!isNewPasswordValid) {
      newErrors.newPassword = 'New password does not meet all requirements';
    }
    if (!isConfirmValid) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    
    setIsChangingPassword(true);
    try {
      const payload = {
        newPassword: passwordState.newPassword,
        ...(user?.hasPassword !== false && { currentPassword: passwordState.currentPassword })
      };
      const res = await api.put('/users/profile/password', payload);
      toast.success(res.data.message || 'Password updated successfully');
      setPasswordState({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors({});
      await hydrateMe(); // refresh user info to flip hasPassword flag
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
      if (err.response?.data?.message?.toLowerCase().includes('current password')) {
        setPasswordErrors({ currentPassword: err.response.data.message });
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #E2FF99 0%, #f4ffd6 60%, #FFFFFF 100%)' }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-[#BAF91A] flex items-center justify-center shadow-[0_0_24px_rgba(186,249,26,0.4)]">
            <Loader2 className="w-6 h-6 animate-spin text-[#101312]" />
          </div>
          <p className="text-sm font-semibold text-[#101312]/65">Loading profile…</p>
        </div>
      </div>
    );
  }

  const initials = getInitials(user?.fullName);
  // Use uploaded profileImage first, then fall back to Google picture URL
  const imgSrc = resolveImageSrc(user?.profileImage, user?.googlePicture);
  const roleLabel = ROLE_LABELS[user?.role] || user?.role || 'User';
  const roleBadgeCls = ROLE_COLORS[user?.role] || 'bg-[#101312]/8 text-[#101312]';
  const showSecuritySettings = true;

  /* ════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════ */
  return (
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #E2FF99 0%, #f4ffd6 55%, #FFFFFF 100%)',
        fontFamily: '"Poppins", "Manrope", "Trebuchet MS", sans-serif',
      }}
    >
      <div className="mx-auto max-w-5xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">

        {/* ── Page header ── */}
        <div className="mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#876DFF] mb-1">
            Stay &amp; Go · Account
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[#101312] sm:text-4xl">
            Profile Settings
          </h1>
          <p className="mt-1.5 text-sm text-[#101312]/65">
            Manage your personal information and security preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[268px_1fr]">

          {/* ══════════════════════════════
              LEFT — Profile card
              ══════════════════════════════ */}
          <aside className="space-y-4">

            {/* 1. Identity Card */}
            <div className="rounded-[24px] border border-[#d6e9aa] bg-gradient-to-br from-[#E2FF99] via-[#f4ffd6] to-[#FFFFFF] shadow-[0_16px_40px_rgba(16,19,18,0.08)] p-6 pb-7 text-center">
              {/* Avatar / Cropper */}
              <ProfileImageCropper 
                imgSrc={imgSrc} 
                initials={initials} 
                onUploadSuccess={fetchProfile} 
              />

              {/* Name */}
              <h2 className="text-xl font-bold text-[#101312] leading-tight">{user?.fullName}</h2>

              {/* Campus email — always shown */}
              <div className="mt-1.5 flex items-center justify-center gap-1.5 text-sm text-[#101312]/60">
                <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate max-w-[160px]" title={user?.email}>{user?.email}</span>
                {/* If Google is linked to THIS same email, show a small G badge inline */}
                {user?.googleEmail && user.googleEmail === user?.email && (
                  <svg className="h-3 w-3 flex-shrink-0 opacity-70" viewBox="0 0 24 24" aria-label="Google linked" title="Google account linked">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
              </div>

              {/* Google / Gmail address — only show when it's a DIFFERENT address from campus email */}
              {user?.googleEmail && user.googleEmail !== user?.email && (
                <div className="mt-1 flex items-center justify-center gap-1.5 text-sm text-[#876DFF]/80">
                  <svg className="h-3.5 w-3.5 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="truncate max-w-[180px]" title={user.googleEmail}>{user.googleEmail}</span>
                </div>
              )}

              {/* Role badge */}
              <div
                className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${roleBadgeCls}`}
              >
                <Shield className="w-3.5 h-3.5" />
                {roleLabel}
              </div>
            </div>

            {/* 2. Security Status Card */}
            {showSecuritySettings && (
              <div className="rounded-[24px] border border-[#101312]/10 bg-white shadow-[0_16px_40px_rgba(16,19,18,0.04)] p-5">
                <div className="mb-4 pb-3 border-b border-[#101312]/8 flex items-center justify-between">
                  <h3 className="text-[13px] font-bold tracking-wide text-[#101312] uppercase flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#4a7c00]" /> Security Status
                  </h3>
                </div>
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#101312]/50">Email Address</span>
                    {user?.isVerified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4a7c00] bg-[#BAF91A]/30 px-2.5 py-0.5 rounded-full border border-[#BAF91A]/60">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                        <ShieldAlert className="w-3 h-3" /> Unverified
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#101312]/50">Password Setup</span>
                    {user?.hasPassword !== false ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4a7c00] bg-[#BAF91A]/30 px-2.5 py-0.5 rounded-full border border-[#BAF91A]/60">
                        <CheckCircle2 className="w-3 h-3" /> Configured
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                        <XCircle className="w-3 h-3" /> Missing
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 3. Connected Accounts Card (Slim Sidebar Version) */}
            {showSecuritySettings && <GoogleAuthConnect />}

            {/* Sign Out button */}
            <button
              id="profile-sign-out-btn"
              onClick={() => { logout(); navigate('/auth/login'); }}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#101312]/15 bg-white px-4 py-3 text-sm font-semibold text-[#101312]/70 transition-all hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50/60 shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </aside>

          {/* ══════════════════════════════
              RIGHT — Forms
              ══════════════════════════════ */}
          <div className="space-y-6">

            {/* ── Personal Information ── */}
            <Card className="p-6">
              <SectionHead
                label="Stay & Go · Profile"
                title="Personal Information"
                icon={User}
                iconBg="bg-[#BAF91A]"
                iconColor="text-[#101312]"
              />

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Full Name */}
                <div>
                  <FieldLabel>Full Name <span className="text-[#BAF91A] font-bold not-italic">*</span></FieldLabel>
                  <StyledInput
                    icon={User}
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Your full name"
                  />
                </div>

                {/* Phone + Emergency */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <FieldLabel>Phone Number</FieldLabel>
                    <StyledInput
                      icon={Phone}
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+94 77 123 4567"
                    />
                  </div>
                  <div>
                    <FieldLabel>Emergency Contact</FieldLabel>
                    <StyledInput
                      icon={Phone}
                      iconColor="text-rose-400/70"
                      type="text"
                      name="emergencyContact"
                      value={form.emergencyContact}
                      onChange={handleChange}
                      placeholder="Parent / Guardian"
                    />
                  </div>
                </div>

                {/* Gender + Student ID */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <FieldLabel>Gender</FieldLabel>
                    <StyledSelect name="gender" value={form.gender} onChange={handleChange}>
                      <option value="">Prefer not to say</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </StyledSelect>
                  </div>
                  <div>
                    <FieldLabel>Student ID</FieldLabel>
                    <StyledInput
                      icon={Calendar}
                      type="text"
                      name="studentId"
                      value={form.studentId}
                      onChange={handleChange}
                      placeholder="e.g. IT21234567"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <FieldLabel>Home Address</FieldLabel>
                  <StyledTextarea
                    icon={MapPin}
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Full residential address"
                  />
                </div>

                <div className="border-t border-[#101312]/8 pt-5 mt-5">
                  <SectionHead
                    title="Appearance & Settings"
                    icon={Palette}
                    iconBg="bg-orange-100"
                    iconColor="text-orange-700"
                  />
                  
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <FieldLabel>Color Theme</FieldLabel>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => toggleTheme('dark')}
                          className={`flex-1 cursor-pointer rounded-xl border p-3 text-left transition-all duration-200 ${
                            theme === 'dark'
                              ? 'border-[#BAF91A] bg-[#101312] shadow-[0_0_0_2px_rgba(186,249,26,0.25)]'
                              : 'border-[#101312]/12 bg-[#101312]'
                          }`}
                        >
                          <div className="font-semibold text-[#E2FF99] text-xs">Dark Mode</div>
                          {theme === 'dark' && (
                            <div className="mt-1 inline-flex items-center gap-1 text-[9px] font-bold text-[#BAF91A] uppercase tracking-wider">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#BAF91A]" /> Active
                            </div>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleTheme('light')}
                          className={`flex-1 cursor-pointer rounded-xl border p-3 text-left transition-all duration-200 ${
                            theme === 'light'
                              ? 'border-[#BAF91A] bg-white shadow-[0_0_0_2px_rgba(186,249,26,0.25)]'
                              : 'border-[#101312]/12 bg-white'
                          }`}
                        >
                          <div className="font-semibold text-[#101312] text-xs">Light Mode</div>
                          {theme === 'light' && (
                            <div className="mt-1 inline-flex items-center gap-1 text-[9px] font-bold text-[#BAF91A] uppercase tracking-wider">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#BAF91A]" /> Active
                            </div>
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <FieldLabel>System Language</FieldLabel>
                      <StyledSelect 
                        name="language" 
                        value={settings.language} 
                        onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                      >
                        <option value="English">English</option>
                        <option value="Sinhala">Sinhala</option>
                        <option value="Tamil">Tamil</option>
                      </StyledSelect>
                    </div>
                  </div>
                </div>

                {/* Save */}
                <div className="pt-2 flex justify-end">
                  <button
                    id="profile-save-btn"
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#BAF91A] hover:bg-[#a9ea00] text-[#101312] px-7 py-2.5 text-sm font-bold shadow-[0_4px_16px_rgba(186,249,26,0.4)] transition-all hover:shadow-[0_6px_22px_rgba(186,249,26,0.55)] active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </Card>


            {/* ── Password Update ── */}
            {showSecuritySettings && (
              <Card className="p-6">
                <SectionHead
                  label="Stay & Go · Access"
                  title="Password Management"
                  icon={Lock}
                  iconBg="bg-blue-100"
                  iconColor="text-blue-700"
                />

                <p className="text-sm text-[#101312]/60 mb-5">
                  Set a password to gain email login access, or update your existing password.
                </p>

                <form onSubmit={handlePasswordChange} className="space-y-5">
                  {user?.hasPassword !== false && (
                    <div>
                      <FieldLabel>Current Password <span className="text-[#BAF91A] font-bold not-italic">*</span></FieldLabel>
                      <StyledInput
                        icon={Lock}
                        type={showPassword.current ? "text" : "password"}
                        value={passwordState.currentPassword}
                        onChange={(e) => {
                          setPasswordState(prev => ({...prev, currentPassword: e.target.value}));
                          if (passwordErrors.currentPassword) setPasswordErrors(prev => ({...prev, currentPassword: ''}));
                        }}
                        placeholder="Enter current password"
                        className={passwordErrors.currentPassword ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-400/30 text-rose-600' : ''}
                        rightElement={
                          <button type="button" onClick={() => setShowPassword(prev => ({...prev, current: !prev.current}))} className="text-[#101312]/40 hover:text-[#101312]">
                            {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        }
                      />
                      {passwordErrors.currentPassword && (
                        <p className="mt-1.5 text-xs font-semibold text-rose-500 flex items-center gap-1.5">
                          <XCircle className="w-3.5 h-3.5" /> {passwordErrors.currentPassword}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="bg-[#fafdf4] border border-[#101312]/10 rounded-[16px] p-5">
                    <div className="mb-4">
                      <FieldLabel>New Password <span className="text-[#BAF91A] font-bold not-italic">*</span></FieldLabel>
                      <StyledInput
                        icon={Lock}
                        type={showPassword.new ? "text" : "password"}
                        value={passwordState.newPassword}
                        onChange={(e) => {
                          setPasswordState(prev => ({...prev, newPassword: e.target.value}));
                          setNewPasswordTouched(true);
                          if (passwordErrors.newPassword) setPasswordErrors(prev => ({...prev, newPassword: ''}));
                        }}
                        placeholder="Enter new password"
                        className={
                          (newPasswordTouched && !isNewPasswordValid) || passwordErrors.newPassword 
                          ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-400/30 text-rose-600' 
                          : (newPasswordTouched && isNewPasswordValid ? 'border-green-400 focus:border-green-500 focus:ring-green-400/30' : '')
                        }
                        rightElement={
                          <button type="button" onClick={() => setShowPassword(prev => ({...prev, new: !prev.new}))} className="text-[#101312]/40 hover:text-[#101312]">
                            {showPassword.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        }
                      />
                    </div>

                    {newPasswordTouched && (
                      <div className="mb-4 space-y-2">
                        <div className="flex gap-1.5 h-1.5 w-full">
                          {[1, 2, 3].map((bar) => (
                            <div 
                              key={bar} 
                              className={`flex-1 rounded-full transition-all duration-300 ${
                                strengthLevel >= bar 
                                ? (strengthLevel === 1 ? 'bg-rose-500' : strengthLevel === 2 ? 'bg-orange-400' : 'bg-[#BAF91A] shadow-[0_0_8px_rgba(186,249,26,0.6)]')
                                : 'bg-[#101312]/10'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs font-bold uppercase tracking-wider mt-1 text-right" style={{
                          color: strengthLevel === 1 ? '#EF4444' : strengthLevel === 2 ? '#F97316' : strengthLevel === 3 ? '#4a7c00' : 'transparent'
                        }}>
                          {strengthLevel === 1 ? 'Weak' : strengthLevel === 2 ? 'Good' : 'Very Strong'}
                        </p>
                        {strengthLevel < 2 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                            {passwordReqs.map((req, i) => (
                              <div key={i} className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${req.met ? 'text-green-600' : 'text-[#101312]/45'}`}>
                                {req.met ? <Check className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border border-current opacity-40 ml-0.5 mr-0.5 flex-shrink-0" />} 
                                {req.label}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <FieldLabel>Confirm Password <span className="text-[#BAF91A] font-bold not-italic">*</span></FieldLabel>
                      <StyledInput
                        icon={Lock}
                        type={showPassword.confirm ? "text" : "password"}
                        value={passwordState.confirmPassword}
                        onChange={(e) => {
                          setPasswordState(prev => ({...prev, confirmPassword: e.target.value}));
                          if (passwordErrors.confirmPassword) setPasswordErrors(prev => ({...prev, confirmPassword: ''}));
                        }}
                        placeholder="Re-enter new password"
                        className={
                          (passwordState.confirmPassword.length > 0 && !isConfirmValid) || passwordErrors.confirmPassword 
                          ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-400/30 text-rose-600' 
                          : (isConfirmValid ? 'border-green-400 focus:border-green-500 focus:ring-green-400/30' : '')
                        }
                        rightElement={
                          <button type="button" onClick={() => setShowPassword(prev => ({...prev, confirm: !prev.confirm}))} className="text-[#101312]/40 hover:text-[#101312]">
                            {showPassword.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        }
                      />
                      {((passwordState.confirmPassword.length > 0 && !isConfirmValid) || passwordErrors.confirmPassword) && (
                        <p className="mt-1.5 text-xs font-semibold text-rose-500 flex items-center gap-1.5">
                          <XCircle className="w-3.5 h-3.5" /> Passwords do not match
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isChangingPassword || !canSubmitPassword}
                      className="rounded-xl bg-[#876DFF] hover:bg-[#7460e0] text-white px-6 py-2.5 min-w-[140px] text-sm font-semibold shadow-[0_4px_14px_rgba(135,109,255,0.35)] transition-all active:scale-[0.97] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                      {isChangingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                      {isChangingPassword ? 'Saving...' : 'Save Password'}
                    </button>
                  </div>
                </form>
              </Card>
            )}

            {/* Main column no longer renders GoogleAuthConnect here, moved to Sidebar! */}

          </div>{/* end right col */}
        </div>
      </div>
    </div>
  );
}
