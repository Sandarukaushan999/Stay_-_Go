import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { createIssue, getMyIssues } from '../api/issueApi';
import { ISSUE_CATEGORIES, ISSUE_PRIORITIES, ISSUE_STATUSES } from '../constants/enums';
import { AlertTriangle, Plus, X, MessageSquare, Clock, CheckCircle2, FileText, Image as ImageIcon, MapPin, Tag } from 'lucide-react';

export default function IssuesPage() {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        title: '', description: '', category: '', priority: 'MEDIUM',
        roomNumber: '', additionalNotes: '',
    });
    const [file, setFile] = useState(null);

    const fetchIssues = async () => {
        try {
            const res = await getMyIssues();
            setIssues(res.data.data || []);
        } catch { toast.error('Failed to load issues'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchIssues(); }, []);

    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) return toast.error('Title is required');
        if (!form.description.trim()) return toast.error('Description is required');
        if (!form.category) return toast.error('Category is required');

        setSubmitting(true);
        try {
            const formData = new FormData();
            Object.keys(form).forEach((key) => { if (form[key]) formData.append(key, form[key]); });
            if (file) formData.append('attachmentImage', file);

            await createIssue(formData);
            toast.success('Issue reported successfully!');
            setForm({ title: '', description: '', category: '', priority: 'MEDIUM', roomNumber: '', additionalNotes: '' });
            setFile(null);
            setShowForm(false);
            fetchIssues();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit issue');
        } finally { setSubmitting(false); }
    };

    const getStatusUI = (status) => {
        if (status === 'RESOLVED') return { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="w-3 h-3" /> };
        if (status === 'IN_PROGRESS') return { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <Clock className="w-3 h-3 animate-pulse" /> };
        return { color: 'bg-slate-100 text-slate-600 border-slate-200', icon: <FileText className="w-3 h-3" /> };
    };

    const getPriorityUI = (priority) => {
        if (priority === 'EMERGENCY') return 'bg-red-50 text-red-700 border-red-200';
        if (priority === 'HIGH') return 'bg-orange-50 text-orange-700 border-orange-200';
        if (priority === 'MEDIUM') return 'bg-blue-50 text-blue-700 border-blue-200';
        return 'bg-slate-50 text-slate-600 border-slate-200';
    };

    const inputClasses = "w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block p-3 transition-colors";

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                        <AlertTriangle className="w-8 h-8 text-amber-500" />
                        Hostel Issues
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">Report maintenance or roommate issues to the administration.</p>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className={`px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm flex items-center gap-2 ${showForm ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}
                >
                    {showForm ? <><X className="w-5 h-5" /> Cancel</> : <><Plus className="w-5 h-5" /> Report Issue</>}
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">New Issue Report</h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 space-y-1.5">
                                <label className="flex items-center text-sm font-semibold text-slate-700">Issue Title *</label>
                                <input className={inputClasses} value={form.title} onChange={set('title')} placeholder="e.g. Broken AC in Room 102" />
                            </div>
                            
                            <div className="md:col-span-2 space-y-1.5">
                                <label className="flex items-center text-sm font-semibold text-slate-700">Detailed Description *</label>
                                <textarea className={inputClasses} value={form.description} onChange={set('description')} rows={4} placeholder="Please provide as much detail as possible..." />
                            </div>

                            <div className="space-y-1.5">
                                <label className="flex items-center text-sm font-semibold text-slate-700">Category *</label>
                                <select className={inputClasses} value={form.category} onChange={set('category')}>
                                    <option value="">Select category</option>
                                    {ISSUE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="flex items-center text-sm font-semibold text-slate-700">Priority Level *</label>
                                <select className={inputClasses} value={form.priority} onChange={set('priority')}>
                                    {ISSUE_PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="flex items-center text-sm font-semibold text-slate-700">Room Number</label>
                                <input className={inputClasses} value={form.roomNumber} onChange={set('roomNumber')} placeholder="e.g. A-101" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="flex items-center text-sm font-semibold text-slate-700">Photo Attachment</label>
                                <div className="relative">
                                    <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="hidden" id="file-upload" />
                                    <label htmlFor="file-upload" className={`cursor-pointer flex items-center justify-center gap-2 w-full border border-dashed rounded-xl p-3 text-sm font-medium transition-colors ${file ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100'}`}>
                                        <ImageIcon className="w-5 h-5" />
                                        {file ? file.name : 'Upload an image...'}
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-sm disabled:opacity-70">
                                {submitting ? 'Submitting Report...' : 'Submit Report'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-xl font-bold text-slate-900">My Reports</h3>
                </div>
                
                {loading ? (
                    <div className="flex h-32 items-center justify-center text-emerald-600 animate-pulse font-medium">Loading reports...</div>
                ) : issues.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-slate-400" />
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 mb-1">No Issues Reported</h4>
                        <p className="text-slate-500 max-w-sm mx-auto">You haven't submitted any maintenance or roommate issues yet.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {issues.map((issue) => {
                            const statusUI = getStatusUI(issue.status);
                            const priorityClass = getPriorityUI(issue.priority);
                            return (
                                <div key={issue._id} className="p-6 md:p-8 hover:bg-slate-50 transition-colors">
                                    <div className="flex flex-col lg:flex-row justify-between gap-6">
                                        <div className="flex-1 space-y-3">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <h4 className="text-lg font-bold text-slate-900">{issue.title}</h4>
                                                <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider ${statusUI.color}`}>
                                                    {statusUI.icon} {ISSUE_STATUSES[issue.status] || issue.status}
                                                </div>
                                                <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider ${priorityClass}`}>
                                                    {issue.priority}
                                                </div>
                                            </div>
                                            
                                            <p className="text-slate-600 whitespace-pre-wrap">{issue.description}</p>
                                            
                                            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 pt-2">
                                                <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md">
                                                    <Tag className="w-3.5 h-3.5" /> {ISSUE_CATEGORIES.find(c => c.value === issue.category)?.label || issue.category}
                                                </span>
                                                {issue.roomNumber && (
                                                    <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md">
                                                        <MapPin className="w-3.5 h-3.5" /> Room {issue.roomNumber}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1.5 text-slate-400">
                                                    <Clock className="w-3.5 h-3.5" /> {new Date(issue.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>

                                        {issue.adminComment && (
                                            <div className="lg:w-1/3 bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                                                <div className="flex items-center gap-2 mb-2 text-emerald-800 font-bold text-sm">
                                                    <MessageSquare className="w-4 h-4" /> Admin Response
                                                </div>
                                                <p className="text-emerald-700 text-sm leading-relaxed">{issue.adminComment}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
