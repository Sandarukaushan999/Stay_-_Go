function SuspiciousStopIndicator({ active = false }) {
  return (
    <div className="card">
      <h3 className="title">Suspicious Stop</h3>
      <p className="muted">{active ? 'Potential issue detected' : 'No suspicious stop detected'}</p>
    </div>
  );
}

export default SuspiciousStopIndicator;
