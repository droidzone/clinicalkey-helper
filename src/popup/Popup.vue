<template>
  <div class="popup-container">
    <header class="header">
      <h1>ClinicalKey Helper</h1>
    </header>
    <main class="content">
      <div class="card">
        <h2>Features</h2>
        <ul>
          <li v-for="(feature, index) in features" :key="index">
            {{ feature }}
          </li>
        </ul>
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
      features: [
        'Quick access to clinical resources',
        'Simplified search interface',
        'Customizable shortcuts'
      ]
    }
  },
  mounted() {
    // Check if the extension is enabled
    chrome.storage.sync.get(['enabled'], (result) => {
      this.isEnabled = result.enabled || false;
    });
  },
  methods: {
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

ul {
  padding-left: 20px;
}

li {
  margin-bottom: 8px;
  color: #34495e;
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
