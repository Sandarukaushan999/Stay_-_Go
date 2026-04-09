function FareEstimateCard({ fare = 0 }) {
  return (
    <div className="card">
      <h3 className="title">Estimated Fare</h3>
      <p style={{ fontSize: '1.4rem', margin: 0 }}>LKR {fare}</p>
    </div>
  );
}

export default FareEstimateCard;
