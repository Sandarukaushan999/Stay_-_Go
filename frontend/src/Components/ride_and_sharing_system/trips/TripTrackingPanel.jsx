function TripTrackingPanel({ trip }) {
  return (
    <div className="card">
      <h3 className="title">Trip Tracking</h3>
      <p>Status: {trip?.status || 'No active trip'}</p>
    </div>
  );
}

export default TripTrackingPanel;
