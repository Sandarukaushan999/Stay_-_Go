function SafetyAlertBanner({ message = 'No active safety issues.' }) {
  return (
    <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
      <strong>Safety Alert</strong>
      <p style={{ marginBottom: 0 }}>{message}</p>
    </div>
  );
}

export default SafetyAlertBanner;
