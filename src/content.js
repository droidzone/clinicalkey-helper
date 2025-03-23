// Content script for ClinicalKey Helper
let isEnabled = false;

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
  fab.addEventListener('click', toggleHelperPanel);
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
  });
  
  // Add click events for shortcut links
  panel.querySelectorAll('.ck-helper-shortcuts a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const action = link.getAttribute('data-action');
      handleShortcutAction(action);
    });
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
});

// Initialize the helper when the content script loads
initializeHelper();
