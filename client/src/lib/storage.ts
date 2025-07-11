// Local storage utilities for PWA offline functionality
export const STORAGE_KEYS = {
  WORKOUTS: "fittracker_workouts",
  EXERCISES: "fittracker_exercises",
  SETTINGS: "fittracker_settings",
  THEME: "fittracker_theme",
} as const;

export class LocalStorageManager {
  static get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  static set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  }

  static remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Failed to remove from localStorage:", error);
    }
  }

  static clear(): void {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error("Failed to clear localStorage:", error);
    }
  }
}

// Sync data between localStorage and server when online
export class DataSyncManager {
  static async syncToServer(): Promise<void> {
    if (!navigator.onLine) return;

    try {
      // Implementation for syncing local data to server
      console.log("Syncing data to server...");
    } catch (error) {
      console.error("Failed to sync data:", error);
    }
  }

  static async syncFromServer(): Promise<void> {
    if (!navigator.onLine) return;

    try {
      // Implementation for syncing server data to local storage
      console.log("Syncing data from server...");
    } catch (error) {
      console.error("Failed to sync from server:", error);
    }
  }
}
