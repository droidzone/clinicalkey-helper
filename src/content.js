// Content script for ClinicalKey Helper
let isEnabled = false;
let bookContentLinks = [];
let journalPdfLinks = [];

// Function to scan the page for book content links
function scanPageForBookLinks() {
  bookContentLinks = [];
  const links = document.querySelectorAll('a');
  
  links.forEach(link => {
    const href = link.href;
    if (href && href.match(/^https:\/\/www\.clinicalkey\.com\/#!\/content\/book\/[\w.-]+/)) {
      // Get the link text or use the URL if no text is available
      const linkText = link.textContent.trim() || href;
      
      // Add to our collection if not already present
      if (!bookContentLinks.some(item => item.url === href)) {
        bookContentLinks.push({
          url: href,
          title: linkText
        });
      }
    }
  });
  
  return bookContentLinks;
}

// Function to scan the page for journal PDF links
function scanPageForJournalLinks() {
  journalPdfLinks = [];
  
  // First try to find direct PDF links
  const directLinks = document.querySelectorAll('a[href*="/service/content/pdf/watermarked/"][href*=".pdf"]');
  directLinks.forEach(link => {
    const href = link.href;
    let linkText = link.textContent.trim();
    
    // If no text, try to extract a meaningful name from the URL
    if (!linkText) {
      const urlParts = href.split('/');
      const pdfName = urlParts[urlParts.length - 1].split('?')[0]; // Remove query params
      linkText = `Article: ${pdfName}`;
    }
    
    // Add to our collection if not already present
    if (!journalPdfLinks.some(item => item.url === href)) {
      journalPdfLinks.push({
        url: href,
        title: linkText
      });
    }
  });
  
  // If no direct PDF links found, look for article links that might have PDF versions
  if (journalPdfLinks.length === 0) {
    // Look for article links in the journal TOC
    const articleLinks = document.querySelectorAll('a[href*="/content/journal/"]');
    articleLinks.forEach(link => {
      const href = link.href;
      const linkText = link.textContent.trim() || 'Article';
      
      // Extract article ID from the URL
      const articleIdMatch = href.match(/\/content\/journal\/(\d+-s\d+\.\d+-[\w\d-]+)/);
      if (articleIdMatch && articleIdMatch[1]) {
        const articleId = articleIdMatch[1];
        const pdfUrl = `https://www.clinicalkey.com/service/content/pdf/watermarked/${articleId}.pdf`;
        
        // Add to our collection if not already present
        if (!journalPdfLinks.some(item => item.url === pdfUrl)) {
          journalPdfLinks.push({
            url: pdfUrl,
            title: linkText
          });
        }
      }
    });
  }
  
  // Also look for any links that might contain PDF URLs
  const allLinks = document.querySelectorAll('a');
  allLinks.forEach(link => {
    const href = link.href;
    if (href && href.includes('/pdf/') && href.includes('.pdf')) {
      const linkText = link.textContent.trim() || 'PDF Article';
      
      // Add to our collection if not already present
      if (!journalPdfLinks.some(item => item.url === href)) {
        journalPdfLinks.push({
          url: href,
          title: linkText
        });
      }
    }
  });
  
  return journalPdfLinks;
}

// Initialize the extension
function initializeHelper() {
  chrome.storage.sync.get(['enabled'], (result) => {
    isEnabled = result.enabled || false;
    if (isEnabled) {
      setupHelperUI();
    }
  });
}

// Set up the helper UI elements
function setupHelperUI() {
  // Create floating action button
  const fab = document.createElement('div');
  fab.id = 'ck-helper-fab';
  fab.innerHTML = `
    <div class="ck-helper-icon">CK</div>
  `;
  fab.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: #3498db;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    z-index: 9999;
    transition: all 0.3s ease;
  `;
  
  document.body.appendChild(fab);
  
  // Add click event to the FAB
  fab.addEventListener('click', toggleHelperPanel, { passive: true });
}

// Toggle the helper panel
function toggleHelperPanel() {
  let panel = document.getElementById('ck-helper-panel');
  
  if (panel) {
    panel.remove();
    return;
  }
  
  // Create panel
  panel = document.createElement('div');
  panel.id = 'ck-helper-panel';
  panel.innerHTML = `
    <div class="ck-helper-header">
      <h3>ClinicalKey Helper</h3>
      <button id="ck-helper-close">×</button>
    </div>
    <div class="ck-helper-content">
      <div class="ck-helper-search">
        <input type="text" placeholder="Quick search...">
        <button>Search</button>
      </div>
      <div class="ck-helper-shortcuts">
        <h4>Quick Links</h4>
        <ul>
          <li><a href="#" data-action="search-drugs">Drug Search</a></li>
          <li><a href="#" data-action="search-diseases">Disease Search</a></li>
          <li><a href="#" data-action="search-procedures">Procedure Search</a></li>
        </ul>
      </div>
    </div>
  `;
  
  panel.style.cssText = `
    position: fixed;
    bottom: 80px;
    right: 20px;
    width: 300px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
    z-index: 9998;
    overflow: hidden;
  `;
  
  document.body.appendChild(panel);
  
  // Add styles for panel elements
  const style = document.createElement('style');
  style.textContent = `
    .ck-helper-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background-color: #2c3e50;
      color: white;
    }
    .ck-helper-header h3 {
      margin: 0;
      font-size: 16px;
    }
    .ck-helper-header button {
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
    }
    .ck-helper-content {
      padding: 16px;
    }
    .ck-helper-search {
      display: flex;
      margin-bottom: 16px;
    }
    .ck-helper-search input {
      flex: 1;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px 0 0 4px;
    }
    .ck-helper-search button {
      padding: 8px 12px;
      background-color: #3498db;
      color: white;
      border: none;
      border-radius: 0 4px 4px 0;
      cursor: pointer;
    }
    .ck-helper-shortcuts h4 {
      margin-top: 0;
      margin-bottom: 8px;
      font-size: 14px;
      color: #2c3e50;
    }
    .ck-helper-shortcuts ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .ck-helper-shortcuts li {
      margin-bottom: 8px;
    }
    .ck-helper-shortcuts a {
      color: #3498db;
      text-decoration: none;
      display: block;
      padding: 6px 8px;
      border-radius: 4px;
      transition: background-color 0.2s;
    }
    .ck-helper-shortcuts a:hover {
      background-color: #f5f7fa;
    }
  `;
  
  document.head.appendChild(style);
  
  // Add close button event
  document.getElementById('ck-helper-close').addEventListener('click', () => {
    panel.remove();
  }, { passive: true });
  
  // Add click events for shortcut links
  panel.querySelectorAll('.ck-helper-shortcuts a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const action = link.getAttribute('data-action');
      handleShortcutAction(action);
    }, { passive: false }); // Cannot be passive since we're calling preventDefault
  });
}

// Handle shortcut actions
function handleShortcutAction(action) {
  switch (action) {
    case 'search-drugs':
      window.open('https://www.clinicalkey.com/#!/browse/drugs', '_blank');
      break;
    case 'search-diseases':
      window.open('https://www.clinicalkey.com/#!/browse/diseases', '_blank');
      break;
    case 'search-procedures':
      window.open('https://www.clinicalkey.com/#!/browse/procedures', '_blank');
      break;
    default:
      console.log('Unknown action:', action);
  }
}

// Remove helper UI
function removeHelperUI() {
  const fab = document.getElementById('ck-helper-fab');
  if (fab) fab.remove();
  
  const panel = document.getElementById('ck-helper-panel');
  if (panel) panel.remove();
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggleHelper') {
    isEnabled = message.enabled;
    
    if (isEnabled) {
      setupHelperUI();
    } else {
      removeHelperUI();
    }
    
    sendResponse({ success: true });
  }
  
  if (message.action === 'scanForBookLinks') {
    const links = scanPageForBookLinks();
    sendResponse({ success: true, links: links });
    return true; // Required for async sendResponse
  }
  
  if (message.action === 'scanForJournalLinks') {
    const links = scanPageForJournalLinks();
    sendResponse({ success: true, links: links });
    return true; // Required for async sendResponse
  }
});

// Initialize the helper when the content script loads
initializeHelper();
