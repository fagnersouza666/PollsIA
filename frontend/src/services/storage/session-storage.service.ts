export class SessionStorageService {
  private isClient(): boolean {
    return typeof window !== 'undefined'
  }

  setItem<T>(key: string, value: T): void {
    if (!this.isClient()) return

    try {
      const serializedValue = JSON.stringify(value)
      sessionStorage.setItem(key, serializedValue)
    } catch (error) {
      console.error(`Error saving to sessionStorage: ${error}`)
    }
  }

  getItem<T>(key: string): T | null {
    if (!this.isClient()) return null

    try {
      const item = sessionStorage.getItem(key)
      if (item === null) return null
      return JSON.parse(item) as T
    } catch (error) {
      console.error(`Error reading from sessionStorage: ${error}`)
      return null
    }
  }

  removeItem(key: string): void {
    if (!this.isClient()) return

    try {
      sessionStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing from sessionStorage: ${error}`)
    }
  }

  clear(): void {
    if (!this.isClient()) return

    try {
      sessionStorage.clear()
    } catch (error) {
      console.error(`Error clearing sessionStorage: ${error}`)
    }
  }

  hasItem(key: string): boolean {
    if (!this.isClient()) return false
    return sessionStorage.getItem(key) !== null
  }

  getAllKeys(): string[] {
    if (!this.isClient()) return []

    try {
      return Object.keys(sessionStorage)
    } catch (error) {
      console.error(`Error getting sessionStorage keys: ${error}`)
      return []
    }
  }
}