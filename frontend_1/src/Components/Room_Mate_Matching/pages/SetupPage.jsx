import { useNavigate } from 'react-router-dom';
import { useIdentity } from '../contexts/DevIdentityContext';
import { Sparkles, ArrowRight, UserPlus, Home, Users } from 'lucide-react';
import { useEffect } from 'react';

export default function SetupPage() {
    const { isProfileComplete, isRoomPrefComplete, isLocked, loading } = useIdentity();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && isProfileComplete && isRoomPrefComplete) {
            navigate('/roommate/dashboard');
        }
    }, [isProfileComplete, isRoomPrefComplete, loading, navigate]);

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-10 flex items-center justify-center min-h-[80vh] animate-in fade-in zoom-in duration-500">
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Sparkles className="w-32 h-32 text-emerald-600 -mt-4 -mr-4" />
                </div>
                
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border-2 border-white">
                    <Users className="w-10 h-10 text-emerald-600" />
                </div>
                
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mb-4">Welcome to Roommate Matching</h1>
                <p className="text-slate-500 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
                    Find the perfect roommate for your stay. Complete your lifestyle profile and room preferences so we can match you with highly compatible students.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 text-left">
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg inline-block mb-3">
                            <UserPlus className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-900">1. Build Your Profile</h3>
                        <p className="text-sm text-slate-500 mt-2">Share your sleep habits, cleanliness, and social preferences.</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg inline-block mb-3">
                            <Home className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-900">2. Set Preferences</h3>
                        <p className="text-sm text-slate-500 mt-2">Choose your preferred room, capacity, and AC options.</p>
                    </div>
                </div>

                <button 
                    onClick={() => navigate('/roommate/profile')}
                    className="bg-slate-900 hover:bg-emerald-600 text-white px-8 py-3.5 rounded-xl font-bold transition-all duration-300 shadow-sm flex items-center gap-2 group mx-auto"
                >
                    Start Profile Setup
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
}
