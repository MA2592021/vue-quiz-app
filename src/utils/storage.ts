export function saveToStorage(key: string, value: string) {
  const encodedValue = btoa(value)
  const encodedKey = btoa(key)
  localStorage.setItem(encodedKey, encodedValue)
}

export function getFromStorage(key: string) {
  const encodedKey = btoa(key)
  const encodedValue = localStorage.getItem(encodedKey)
  return encodedValue ? atob(encodedValue) : null
}

export function removeFromStorage(key: string) {
  const encodedKey = btoa(key)
  localStorage.removeItem(encodedKey)
}
