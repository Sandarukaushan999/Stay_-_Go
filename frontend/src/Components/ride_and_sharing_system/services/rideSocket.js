export function subscribeTrip(socket, tripId, onLocation, onStatus) {
  if (!socket || !tripId) return () => {};

  socket.emit('join:trip', tripId);

  if (onLocation) socket.on('trip:location', onLocation);
  if (onStatus) socket.on('trip:status', onStatus);

  return () => {
    socket.emit('leave:trip', tripId);
    if (onLocation) socket.off('trip:location', onLocation);
    if (onStatus) socket.off('trip:status', onStatus);
  };
}
