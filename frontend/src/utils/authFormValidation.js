/** Simple RFC-5322–style email check (good UX; backend still validates). */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i

/** Campus / slug style: e.g. uoc-main */
export const CAMPUS_ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i

export function normalizeSriLankaMobile(input) {
  const raw = String(input ?? '').trim()
  if (!raw) return null
  const d = raw.replace(/\D/g, '')
  if (d.length === 10 && /^0[1-9]\d{8}$/.test(d)) return d
  if (d.length === 11 && d.startsWith('94')) return `0${d.slice(2)}`
  if (d.length === 9 && /^7\d{8}$/.test(d)) return `0${d}`
  return null
}

/** Person to call in an emergency: 10-digit mobile or 3–5 digit national hotline (e.g. 117, 1990). */
export function normalizeEmergencyContact(input) {
  const raw = String(input ?? '').trim()
  if (!raw) return null
  const mobile = normalizeSriLankaMobile(raw)
  if (mobile) return mobile
  const d = raw.replace(/\D/g, '')
  if (d.length >= 3 && d.length <= 5 && /^\d+$/.test(d)) return d
  return null
}

export function validateLoginFields({ email, password }) {
  /** @type {Record<string, string>} */
  const errors = {}
  const e = String(email ?? '').trim()
  if (!e) errors.email = 'Email is required.'
  else if (!EMAIL_RE.test(e)) errors.email = 'Enter a valid email address.'
  const p = String(password ?? '')
  if (!p) errors.password = 'Password is required.'
  return errors
}

/**
 * @param {object} params
 * @returns {{ errors: Record<string, string>, normalized: { phone?: string, emergencyContact?: string, vehicleNumber?: string } }}
 */
export function validateRegisterFields({
  fullName,
  email,
  password,
  accountType,
  phone,
  studentId,
  campusId,
  emergencyContact,
  hasVehicle,
  vehicleNumber,
  residenceLocation,
  vehicleOriginLocation,
}) {
  /** @type {Record<string, string>} */
  const errors = {}
  const normalized = {}

  const name = String(fullName ?? '').trim()
  if (!name) errors.fullName = 'Full name is required.'
  else if (name.length < 2) errors.fullName = 'Use at least 2 characters.'
  else if (name.length > 120) errors.fullName = 'Name is too long.'

  const em = String(email ?? '').trim()
  if (!em) errors.email = 'Email is required.'
  else if (!EMAIL_RE.test(em)) errors.email = 'Enter a valid email address.'

  const pw = String(password ?? '')
  if (!pw) errors.password = 'Password is required.'
  else if (pw.length < 6) errors.password = 'Password must be at least 6 characters.'

  const isStudent = accountType === 'student'

  if (isStudent) {
    const ph = normalizeSriLankaMobile(phone)
    if (!ph) errors.phone = 'Enter a valid 10-digit mobile (e.g. 0771234567 or +94771234567).'
    else normalized.phone = ph

    const sid = String(studentId ?? '').trim()
    if (sid && (sid.length < 2 || sid.length > 64)) {
      errors.studentId = 'Student ID should be 2–64 characters if provided.'
    }

    const campus = String(campusId ?? '').trim()
    if (!campus) errors.campusId = 'University / campus ID is required.'
    else if (campus.length < 2 || campus.length > 64) errors.campusId = 'Use 2–64 characters.'
    else if (!CAMPUS_ID_RE.test(campus)) errors.campusId = 'Use letters, numbers, and single hyphens only (e.g. uoc-main).'

    const ecRaw = String(emergencyContact ?? '').trim()
    if (ecRaw) {
      const ec = normalizeEmergencyContact(ecRaw)
      if (!ec) {
        errors.emergencyContact =
          'Use a 10-digit mobile (e.g. 0771234567) or a 3–5 digit hotline (e.g. 117). Leave blank if unsure.'
      } else normalized.emergencyContact = ec
    }

    if (hasVehicle) {
      const vn = String(vehicleNumber ?? '').replace(/\D/g, '')
      if (!vn) errors.vehicleNumber = 'Vehicle number is required (digits only).'
      else if (vn.length < 4 || vn.length > 12)
        errors.vehicleNumber = 'Use 4–12 digits only (no letters or symbols).'
      else normalized.vehicleNumber = vn
    }
  } else {
    const phRaw = String(phone ?? '').trim()
    if (phRaw) {
      const ph = normalizeSriLankaMobile(phone)
      if (!ph) errors.phone = 'Enter a valid 10-digit mobile or leave blank.'
      else normalized.phone = ph
    }
  }

  return { errors, normalized }
}
