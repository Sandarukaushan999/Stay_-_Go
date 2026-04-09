function RideRequestCard({ request }) {
  return (
    <div className="card">
      <h4 style={{ marginTop: 0 }}>Request #{request?._id?.slice(-6) || 'N/A'}</h4>
      <p className="muted">Status: {request?.status || 'requested'}</p>
      <p style={{ marginBottom: 0 }}>
        {request?.origin?.label || '-'} to {request?.destination?.label || '-'}
      </p>
    </div>
  );
}

export default RideRequestCard;
