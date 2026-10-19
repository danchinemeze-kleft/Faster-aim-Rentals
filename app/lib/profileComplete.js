export function isProfileComplete(profile) {
  const phone = (profile?.phone || '').replace(/\s|-/g, '')
  const validNgPhone = /^(\+234|234|0)[789][01]\d{8}$/.test(phone)
  return Boolean(profile?.full_name?.trim()) && validNgPhone
}