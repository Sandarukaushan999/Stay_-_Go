// Hostel rule: roommates must share the same gender (male+male or female+female).
export const normalizeGender = (g) => (typeof g === 'string' ? g.trim().toLowerCase() : '')

export const sameGender = (a, b) => {
  const x = normalizeGender(a)
  return x !== '' && x === normalizeGender(b)
}
