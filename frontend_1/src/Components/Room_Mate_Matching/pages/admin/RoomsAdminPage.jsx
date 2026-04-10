import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { listRooms, createRoom, updateRoom, updateRoomStatus, assignStudent } from '../../api/roomApi';
import { AC_TYPE, ROOM_POSITION, CAPACITY_OPTIONS, BLOCK_OPTIONS, FLOOR_OPTIONS, AVAILABILITY_STATUSES } from '../../constants/enums';

export default function RoomsAdminPage() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ roomNumber: '', block: '', floor: '', acType: '', roomPosition: '', capacity: '' });
    const [submitting, setSubmitting] = useState(false);
    const [statusModal, setStatusModal] = useState(null);
    const [assignModal, setAssignModal] = useState(null);
    const [assignStudentId, setAssignStudentId] = useState('');
    const [newStatus, setNewStatus] = useState('');

    const fetchRooms = async () => {
        try {
            const res = await listRooms();
            setRooms(res.data.data || []);
        } catch { toast.error('Failed to load rooms'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchRooms(); }, []);

    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.roomNumber || !form.block || !form.acType || !form.capacity) return toast.error('Fill all required fields');
        setSubmitting(true);
        try {
            await createRoom({ ...form, capacity: Number(form.capacity) });
            toast.success('Room created!');
            setForm({ roomNumber: '', block: '', floor: '', acType: '', roomPosition: '', capacity: '' });
            setShowForm(false);
            fetchRooms();
        } catch (error) { toast.error(error.response?.data?.message || 'Failed to create room'); }
        finally { setSubmitting(false); }
    };

    const handleStatusUpdate = async () => {
        if (!newStatus || !statusModal) return;
        try {
            await updateRoomStatus(statusModal, newStatus);
            toast.success('Room status updated');
            setStatusModal(null);
            fetchRooms();
        } catch (error) { toast.error(error.response?.data?.message || 'Failed to update status'); }
    };

    const handleAssign = async () => {
        if (!assignStudentId.trim() || !assignModal) return;
        try {
            await assignStudent(assignModal, assignStudentId.trim());
            toast.success('Student assigned to room');
            setAssignModal(null);
            setAssignStudentId('');
            fetchRooms();
        } catch (error) { toast.error(error.response?.data?.message || 'Failed to assign student'); }
    };

    return (
        <div className="page">
            <div className="page-header-row">
                <div>
                    <h1 className="page-title">Room Management</h1>
                    <p className="page-subtitle">Manage hostel rooms, status, and student assignments.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '+ Create Room'}
                </button>
            </div>

            {showForm && (
                <form className="form-card" onSubmit={handleCreate}>
                    <div className="form-grid">
                        <div className="form-group"><label>Room Number *</label>
                            <input value={form.roomNumber} onChange={set('roomNumber')} placeholder="e.g. A-101" /></div>
                        <div className="form-group"><label>Block *</label>
                            <select value={form.block} onChange={set('block')}><option value="">Select</option>
                                {BLOCK_OPTIONS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}</select></div>
                        <div className="form-group"><label>Floor</label>
                            <select value={form.floor} onChange={set('floor')}><option value="">Select</option>
                                {FLOOR_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}</select></div>
                        <div className="form-group"><label>AC Type *</label>
                            <select value={form.acType} onChange={set('acType')}><option value="">Select</option>
                                {AC_TYPE.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}</select></div>
                        <div className="form-group"><label>Position</label>
                            <select value={form.roomPosition} onChange={set('roomPosition')}><option value="">Select</option>
                                {ROOM_POSITION.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}</select></div>
                        <div className="form-group"><label>Capacity *</label>
                            <select value={form.capacity} onChange={set('capacity')}><option value="">Select</option>
                                {CAPACITY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Creating...' : 'Create Room'}</button>
                    </div>
                </form>
            )}

            {loading && <div className="page-loading">Loading...</div>}

            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Room</th><th>Block</th><th>Floor</th><th>AC</th><th>Position</th>
                            <th>Capacity</th><th>Occupancy</th><th>Status</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rooms.map((room) => (
                            <tr key={room._id}>
                                <td><strong>{room.roomNumber}</strong></td>
                                <td>{room.block}</td>
                                <td>{room.floor}</td>
                                <td>{room.acType}</td>
                                <td>{room.roomPosition}</td>
                                <td>{room.capacity}</td>
                                <td>{room.occupancyCount}/{room.capacity}</td>
                                <td><span className={`badge ${room.availabilityStatus === 'AVAILABLE' ? 'badge-success' : room.availabilityStatus === 'FULL' ? 'badge-danger' : 'badge-warning'}`}>{room.availabilityStatus}</span></td>
                                <td>
                                    <button className="btn btn-outline btn-sm" onClick={() => { setStatusModal(room._id); setNewStatus(room.availabilityStatus); }}>Status</button>
                                    <button className="btn btn-outline btn-sm" onClick={() => setAssignModal(room._id)} style={{ marginLeft: 4 }}>Assign</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {statusModal && (
                <div className="modal-overlay" onClick={() => setStatusModal(null)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <h3>Update Room Status</h3>
                        <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                            {AVAILABILITY_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                        <div className="modal-actions">
                            <button className="btn btn-primary" onClick={handleStatusUpdate}>Update</button>
                            <button className="btn btn-outline" onClick={() => setStatusModal(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {assignModal && (
                <div className="modal-overlay" onClick={() => setAssignModal(null)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <h3>Assign Student to Room</h3>
                        <input value={assignStudentId} onChange={(e) => setAssignStudentId(e.target.value)} placeholder="Student ID" />
                        <div className="modal-actions">
                            <button className="btn btn-primary" onClick={handleAssign}>Assign</button>
                            <button className="btn btn-outline" onClick={() => setAssignModal(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
