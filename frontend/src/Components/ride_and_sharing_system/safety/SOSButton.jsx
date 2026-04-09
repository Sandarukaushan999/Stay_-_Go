function SOSButton({ onClick }) {
  return (
    <button className="btn danger" onClick={onClick} type="button">
      SOS Alert
    </button>
  );
}

export default SOSButton;
