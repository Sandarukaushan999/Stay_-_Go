function TripStatusTimeline({ statuses = [] }) {
  return (
    <div className="card">
      <h3 className="title">Trip Timeline</h3>
      <ul style={{ margin: 0, paddingLeft: '1rem' }}>
        {statuses.length === 0 ? <li className="muted">No timeline yet</li> : statuses.map((status, index) => <li key={index}>{status}</li>)}
      </ul>
    </div>
  );
}

export default TripStatusTimeline;
