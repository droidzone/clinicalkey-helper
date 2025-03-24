import { defineStore } from 'pinia';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    // Default settings
    autoDownload: false,
    showBatchButtons: true,
    batchSize: 10,
    // Theme settings
    darkMode: false,
    // History settings
    keepHistory: true,
    maxHistoryItems: 100,
    // Refresh settings
    refreshWaitTime: 4, // Default refresh wait time in seconds
  }),
  
  getters: {
    // Getters for computed values
    getBatchSize: (state) => state.batchSize,
  },
  
  actions: {
    // Actions to update settings
    updateSetting(key, value) {
      if (this[key] !== undefined) {
        this[key] = value;
        this.saveSettings();
      }
    },
    
    // Save settings to chrome.storage.sync
    saveSettings() {
      chrome.storage.sync.set({
        settings: JSON.stringify({
          autoDownload: this.autoDownload,
          showBatchButtons: this.showBatchButtons,
          batchSize: this.batchSize,
          darkMode: this.darkMode,
          keepHistory: this.keepHistory,
          maxHistoryItems: this.maxHistoryItems,
        })
      });
    },
    
    // Load settings from chrome.storage.sync
    loadSettings() {
      return new Promise((resolve) => {
        chrome.storage.sync.get(['settings'], (result) => {
          if (result.settings) {
            try {
              const savedSettings = JSON.parse(result.settings);
              // Update state with saved settings
              Object.keys(savedSettings).forEach(key => {
                if (this[key] !== undefined) {
                  this[key] = savedSettings[key];
                }
              });
            } catch (e) {
              console.error('Error parsing settings:', e);
            }
          }
          resolve();
        });
      });
    }
  }
});
