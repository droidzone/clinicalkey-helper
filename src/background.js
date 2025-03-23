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

// Check if URL matches the ClinicalKey book or journal patterns
function checkUrlMatch(url) {
  // Log the URL for debugging
  console.log('Checking URL match for:', url);
  
  // Direct check for the problematic journal URL
  if (url.indexOf('clinicalkey.com/#!/browse/toc/') !== -1) {
    console.log('Journal TOC URL direct match found!');
    return { isMatch: true, type: 'journal' };
  }
  
  // Pattern for content book URLs
  const contentPattern = /^https:\/\/www\.clinicalkey\.com\/#!\/content\/book\/.+/;
  // Pattern for browse book URLs
  const browsePattern = /^https:\/\/www\.clinicalkey\.com\/#!\/browse\/book\/.+/;
  
  // Test patterns and log the results
  const contentMatch = contentPattern.test(url);
  const browseMatch = browsePattern.test(url);
  
  console.log('Pattern matching results:', {
    contentMatch,
    browseMatch,
    journalDirectMatch: url.indexOf('clinicalkey.com/#!/browse/toc/') !== -1
  });
  
  if (contentMatch) {
    return { isMatch: true, type: 'content' };
  } else if (browseMatch) {
    return { isMatch: true, type: 'browse' };
  } else {
    return { isMatch: false, type: null };
  }
}

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'checkUrl') {
    console.log('Received checkUrl request for:', message.url);
    const result = checkUrlMatch(message.url);
    console.log('Returning result:', result);
    sendResponse(result);
    return true;
  } else if (message.action === 'getState') {
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
