<template>
  <div class="popup-container">
    <header class="header">
      <h1>ClinicalKey Helper</h1>
    </header>
    <main class="content">
      <div class="card">
        <div v-if="urlChecked" class="url-status">
          <div v-if="isUrlMatch && urlType === 'content'" class="match-message">
            <span class="status-icon">✓</span>
            <span>Will insert</span>
          </div>
          <div v-else-if="isUrlMatch && urlType === 'browse'" class="browse-message">
            <span class="status-icon">ℹ</span>
            <span>Book Contents Page</span>
          </div>
          <div v-else class="no-match-message">
            <span class="status-icon">✗</span>
            <span>No match</span>
          </div>
        </div>
        <div v-else class="checking-message">
          <span>Checking URL...</span>
        </div>
      </div>
      <div class="actions">
        <button @click="toggleFeature" class="btn primary">
          {{ isEnabled ? 'Disable' : 'Enable' }} Helper
        </button>
      </div>
    </main>
    <footer class="footer">
      <p>Version 1.0.0</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'Popup',
  data() {
    return {
      isEnabled: false,
      urlChecked: false,
      isUrlMatch: false,
      urlType: null,
      currentUrl: ''
    }
  },
  mounted() {
    // Check if the extension is enabled
    chrome.storage.sync.get(['enabled'], (result) => {
      this.isEnabled = result.enabled || false;
    });
    
    // Get the current tab URL and check if it matches the pattern
    this.checkCurrentUrl();
  },
  methods: {
    checkCurrentUrl() {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs[0] && tabs[0].url) {
          this.currentUrl = tabs[0].url;
          
          // Send message to background script to check URL
          chrome.runtime.sendMessage(
            { action: 'checkUrl', url: this.currentUrl },
            (response) => {
              this.isUrlMatch = response.isMatch;
              this.urlType = response.type;
              this.urlChecked = true;
            }
          );
        } else {
          this.urlChecked = true;
          this.isUrlMatch = false;
          this.urlType = null;
        }
      });
    },
    toggleFeature() {
      this.isEnabled = !this.isEnabled;
      chrome.storage.sync.set({ enabled: this.isEnabled });
      
      // Send message to content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { 
          action: 'toggleHelper',
          enabled: this.isEnabled
        });
      });
    }
  }
}
</script>

<style scoped>
.popup-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f7fa;
}

.header {
  background-color: #2c3e50;
  color: white;
  padding: 12px 16px;
  text-align: center;
}

.header h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.card {
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card h2 {
  margin-top: 0;
  font-size: 16px;
  color: #2c3e50;
}

.url-status {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  text-align: center;
}

.match-message, .no-match-message, .browse-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 18px;
  font-weight: 500;
  padding: 12px;
  border-radius: 8px;
  width: 100%;
}

.match-message {
  color: #27ae60;
  background-color: rgba(39, 174, 96, 0.1);
}

.no-match-message {
  color: #e74c3c;
  background-color: rgba(231, 76, 60, 0.1);
}

.browse-message {
  color: #3498db;
  background-color: rgba(52, 152, 219, 0.1);
}

.status-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.checking-message {
  text-align: center;
  color: #7f8c8d;
  padding: 16px;
}

.actions {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s;
}

.primary {
  background-color: #3498db;
  color: white;
}

.primary:hover {
  background-color: #2980b9;
}

.footer {
  padding: 8px 16px;
  text-align: center;
  font-size: 12px;
  color: #7f8c8d;
  border-top: 1px solid #ecf0f1;
}
</style>
