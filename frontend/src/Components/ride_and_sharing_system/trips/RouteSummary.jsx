function RouteSummary({ request }) {
  return (
    <div className="card">
      <h3 className="title">Route Summary</h3>
      <p>{request?.origin?.label || '-'} to {request?.destination?.label || '-'}</p>
      <p className="muted">Distance: {request?.distanceMeters || 0} m</p>
    </div>
  );
}

export default RouteSummary;
