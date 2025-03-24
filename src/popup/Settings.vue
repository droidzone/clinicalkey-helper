<template>
  <div class="settings-container">
    <div class="settings-header">
      <h2>Settings</h2>
      <button class="close-btn" @click="$emit('close')">×</button>
    </div>
    
    <div class="settings-content">
      <div class="settings-section">
        <h3>Download Settings</h3>
        
        <div class="setting-item">
          <label class="toggle-label">
            <span>Auto-download PDFs</span>
            <div class="toggle-switch">
              <input type="checkbox" v-model="settings.autoDownload">
              <span class="toggle-slider"></span>
            </div>
          </label>
        </div>
        

        
        <div class="setting-item">
          <label class="toggle-label">
            <span>Show Batch Buttons</span>
            <div class="toggle-switch">
              <input type="checkbox" v-model="settings.showBatchButtons">
              <span class="toggle-slider"></span>
            </div>
          </label>
        </div>
        
        <div class="setting-item" v-if="settings.showBatchButtons">
          <label>Batch Size</label>
          <input type="number" v-model.number="settings.batchSize" min="1" max="50" class="number-input">
        </div>
      </div>
      
      <div class="settings-section">
        <h3>Appearance</h3>
        
        <div class="setting-item">
          <label class="toggle-label">
            <span>Dark Mode</span>
            <div class="toggle-switch">
              <input type="checkbox" v-model="settings.darkMode">
              <span class="toggle-slider"></span>
            </div>
          </label>
        </div>
      </div>
      
      <div class="settings-section">
        <h3>Advanced</h3>
        
        <div class="setting-item">
          <label>Page Refresh Wait Time (seconds)</label>
          <input type="number" v-model.number="settings.refreshWaitTime" min="1" max="10" class="number-input">
        </div>
      </div>
      
      <div class="settings-section">
        <h3>History</h3>
        
        <div class="setting-item">
          <label class="toggle-label">
            <span>Keep Download History</span>
            <div class="toggle-switch">
              <input type="checkbox" v-model="settings.keepHistory">
              <span class="toggle-slider"></span>
            </div>
          </label>
        </div>
        
        <div class="setting-item" v-if="settings.keepHistory">
          <label>Max History Items</label>
          <input type="number" v-model.number="settings.maxHistoryItems" min="10" max="1000" class="number-input">
        </div>
      </div>
    </div>
    
    <div class="settings-footer">
      <button class="save-btn" @click="saveSettings">Save Settings</button>
    </div>
  </div>
</template>

<script>
import { useSettingsStore } from '../store/settingsStore';

export default {
  name: 'Settings',
  emits: ['close'],
  data() {
    return {
      settings: {
        autoDownload: false,
        showBatchButtons: true,
        batchSize: 10,
        darkMode: false,
        keepHistory: true,
        maxHistoryItems: 100,
        refreshWaitTime: 4,
      }
    }
  },
  created() {
    // Get settings from store
    const settingsStore = useSettingsStore();
    this.settings = {
      autoDownload: settingsStore.autoDownload,
      showBatchButtons: settingsStore.showBatchButtons,
      batchSize: settingsStore.batchSize,
      darkMode: settingsStore.darkMode,
      keepHistory: settingsStore.keepHistory,
      maxHistoryItems: settingsStore.maxHistoryItems,
      refreshWaitTime: settingsStore.refreshWaitTime,
    };
  },
  methods: {
    saveSettings() {
      const settingsStore = useSettingsStore();
      
      // Update each setting
      Object.keys(this.settings).forEach(key => {
        settingsStore.updateSetting(key, this.settings[key]);
      });
      
      // Close settings panel
      this.$emit('close');
    }
  }
}
</script>

<style scoped>
.settings-container {
  position: fixed;
  top: 0;
  right: 0;
  width: 350px;
  height: 100%;
  background-color: white;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #ecf0f1;
  background-color: #2c3e50;
  color: white;
}

.settings-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  margin: 0;
  line-height: 1;
}

.settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.settings-section {
  margin-bottom: 24px;
}

.settings-section h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 16px;
  color: #2c3e50;
  border-bottom: 1px solid #ecf0f1;
  padding-bottom: 8px;
}

.setting-item {
  margin-bottom: 16px;
}

.setting-item label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #2c3e50;
}

.toggle-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 20px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #2196F3;
}

input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

.text-input, .number-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.number-input {
  width: 80px;
}

.settings-footer {
  padding: 16px;
  border-top: 1px solid #ecf0f1;
  text-align: right;
}

.save-btn {
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.save-btn:hover {
  background-color: #0b7dda;
}
</style>
