export const PASSWORD_RULES = [
  { id: 'length', label: 'Minimum 8 characters', test: (p) => p.length >= 8 },
  { id: 'uppercase', label: 'At least one uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { id: 'lowercase', label: 'At least one lowercase letter', test: (p) => /[a-z]/.test(p) },
  { id: 'number', label: 'At least one number', test: (p) => /[0-9]/.test(p) },
  {
    id: 'special',
    label: 'At least one special character (!@#$%^&* etc.)',
    test: (p) => /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;'/`~]/.test(p),
  },
]

export function validatePassword(password) {
  return PASSWORD_RULES.every((rule) => rule.test(password))
}

export async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}
