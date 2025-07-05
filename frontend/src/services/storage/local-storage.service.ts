export class LocalStorageService {
  private isClient(): boolean {
    return typeof window !== 'undefined'
  }

  setItem<T>(key: string, value: T): void {
    if (!this.isClient()) return

    try {
      const serializedValue = JSON.stringify(value)
      localStorage.setItem(key, serializedValue)
    } catch (error) {
      console.error(`Error saving to localStorage: ${error}`)
    }
  }

  getItem<T>(key: string): T | null {
    if (!this.isClient()) return null

    try {
      const item = localStorage.getItem(key)
      if (item === null) return null
      return JSON.parse(item) as T
    } catch (error) {
      console.error(`Error reading from localStorage: ${error}`)
      return null
    }
  }

  removeItem(key: string): void {
    if (!this.isClient()) return

    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing from localStorage: ${error}`)
    }
  }

  clear(): void {
    if (!this.isClient()) return

    try {
      localStorage.clear()
    } catch (error) {
      console.error(`Error clearing localStorage: ${error}`)
    }
  }

  hasItem(key: string): boolean {
    if (!this.isClient()) return false
    return localStorage.getItem(key) !== null
  }

  getAllKeys(): string[] {
    if (!this.isClient()) return []

    try {
      return Object.keys(localStorage)
    } catch (error) {
      console.error(`Error getting localStorage keys: ${error}`)
      return []
    }
  }
}