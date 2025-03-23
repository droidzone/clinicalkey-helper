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

// Check if URL matches the ClinicalKey book patterns
function checkUrlMatch(url) {
  // Pattern for content book URLs
  const contentPattern = /^https:\/\/www\.clinicalkey\.com\/#!\/content\/book\/.+/;
  // Pattern for browse book URLs
  const browsePattern = /^https:\/\/www\.clinicalkey\.com\/#!\/browse\/book\/.+/;
  
  if (contentPattern.test(url)) {
    return { isMatch: true, type: 'content' };
  } else if (browsePattern.test(url)) {
    return { isMatch: true, type: 'browse' };
  } else {
    return { isMatch: false, type: null };
  }
}

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getState') {
    chrome.storage.sync.get(['enabled', 'settings'], (result) => {
      sendResponse(result);
    });
    return true; // Required for async sendResponse
  }
  
  if (message.action === 'checkUrl') {
    const result = checkUrlMatch(message.url);
    sendResponse(result);
    return true; // Required for async sendResponse
  }
});
