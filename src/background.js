// Background script for ClinicalKey Helper

// Initialize extension state when installed
chrome.runtime.onInstalled.addListener(() => {
  // Set default values
  chrome.storage.sync.set({
    enabled: false,
    settings: {
      theme: 'light',
      shortcuts: true,
      searchHistory: []
    }
  });
  
  console.log('ClinicalKey Helper extension installed');
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getState') {
    chrome.storage.sync.get(['enabled', 'settings'], (result) => {
      sendResponse(result);
    });
    return true; // Required for async sendResponse
  }
});
