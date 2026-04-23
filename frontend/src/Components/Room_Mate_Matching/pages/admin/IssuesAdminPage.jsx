import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getAllIssues, updateIssueStatus, addAdminComment } from '../../api/issueApi';
import { ISSUE_STATUSES, ISSUE_CATEGORIES } from '../../constants/enums';

function getReporter(issue) {
    return issue?.reportedBy || issue?.studentId || null;
}

export default function IssuesAdminPage() {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [comment, setComment] = useState('');

    const fetchIssues = async () => {
        try {
            const res = await getAllIssues();
            setIssues(res.data.data?.issues || res.data.data || []);
        } catch {
            toast.error('Failed to load issues');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIssues();
    }, []);

    const openManageModal = (issue) => {
        setSelectedIssue(issue);
        setNewStatus(issue?.status || '');
        setComment('');
    };

    const handleStatusUpdate = async (id) => {
        if (!newStatus) return;
        try {
            await updateIssueStatus(id, newStatus);
            toast.success('Status updated');
            fetchIssues();
            setSelectedIssue(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const handleAddComment = async (id) => {
        if (!comment.trim()) return;
        try {
            await addAdminComment(id, comment.trim());
            toast.success('Comment added');
            setComment('');
            fetchIssues();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add comment');
        }
    };

    return (
        <div className="page">
            <div className="page-header-row">
                <div>
                    <h1 className="page-title">Issue Management</h1>
                    <p className="page-subtitle">Review, comment on, and resolve all student-reported roommate issues.</p>
                </div>
                <span className="badge badge-info">{issues.length} total</span>
            </div>

            {loading && <div className="page-loading">Loading...</div>}

            {!loading && issues.length === 0 ? (
                <div className="empty-state">
                    <p>No issue reports available right now.</p>
                    <p className="text-muted">Student submissions will appear here once they are reported.</p>
                </div>
            ) : (
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Issue</th>
                                <th>Reporter</th>
                                <th>Category</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th>Room</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {issues.map((issue) => {
                                const reporter = getReporter(issue);

                                return (
                                    <tr key={issue._id}>
                                        <td>
                                            <strong>{issue.title}</strong>
                                            <div className="table-subtext">
                                                {issue.description?.slice(0, 60) || 'No description'}
                                                {issue.description?.length > 60 ? '…' : ''}
                                            </div>
                                        </td>
                                        <td>
                                            <strong>{reporter?.fullName || `${reporter?.firstName || ''} ${reporter?.lastName || ''}`.trim() || 'Unknown'}</strong>
                                            <div className="table-subtext">{reporter?.email || '—'}</div>
                                        </td>
                                        <td>{ISSUE_CATEGORIES.find((c) => c.value === issue.category)?.label || issue.category}</td>
                                        <td>
                                            <span className={`badge ${issue.priority === 'EMERGENCY' ? 'badge-danger' : issue.priority === 'HIGH' ? 'badge-warning' : 'badge-info'}`}>
                                                {issue.priority}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${issue.status === 'RESOLVED' ? 'badge-success' : issue.status === 'IN_PROGRESS' ? 'badge-warning' : 'badge-info'}`}>
                                                {ISSUE_STATUSES[issue.status] || issue.status}
                                            </span>
                                        </td>
                                        <td>{issue.roomNumber || issue.roomId?.roomNumber || '—'}</td>
                                        <td>{issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : '—'}</td>
                                        <td>
                                            <button className="btn btn-outline btn-sm" onClick={() => openManageModal(issue)}>Manage</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedIssue && (
                <div className="modal-overlay" onClick={() => setSelectedIssue(null)}>
                    <div className="modal-card modal-large" onClick={(e) => e.stopPropagation()}>
                        <h3>{selectedIssue.title}</h3>
                        <p>{selectedIssue.description}</p>
                        {selectedIssue.additionalNotes && (
                            <p className="text-muted"><em>{selectedIssue.additionalNotes}</em></p>
                        )}
                        {selectedIssue.adminComment && (
                            <div className="issue-admin-comment">
                                <strong>Current comment:</strong> {selectedIssue.adminComment}
                            </div>
                        )}
                        <hr />

                        <div className="form-group">
                            <label>Update Status</label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                                    <option value="">Select status</option>
                                    <option value="SUBMITTED">Submitted</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="RESOLVED">Resolved</option>
                                </select>
                                <button className="btn btn-primary btn-sm" onClick={() => handleStatusUpdate(selectedIssue._id)}>Update</button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Add / Update Admin Comment</label>
                            <textarea
                                rows={4}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Write a comment for this issue..."
                            />
                            <button className="btn btn-outline btn-sm" style={{ marginTop: 8 }} onClick={() => handleAddComment(selectedIssue._id)}>
                                Save Comment
                            </button>
                        </div>

                        <div className="modal-actions">
                            <button className="btn btn-ghost" onClick={() => setSelectedIssue(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
