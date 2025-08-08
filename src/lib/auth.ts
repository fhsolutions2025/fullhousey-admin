export function saveToken(token: string) {
  localStorage.setItem('fh_token', token)
}
export function clearToken() {
  localStorage.removeItem('fh_token')
}
export function hasToken() {
  return !!localStorage.getItem('fh_token')
}
