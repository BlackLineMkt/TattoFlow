export function cleanPhone(phone) {
  return phone.replace(/\D/g, '')
}

export function formatPhone(phone) {
  const digits = cleanPhone(phone)
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return digits
}

export function buildWhatsAppUrl(phone) {
  return `https://wa.me/55${cleanPhone(phone)}`
}

export function getDaysSince(dateStr) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000)
}

export function isLate(updatedAt) {
  return getDaysSince(updatedAt) > 3
}
