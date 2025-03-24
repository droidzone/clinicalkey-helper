<template>
  <div class="popup-container" :class="{ 'dark-mode': isDarkMode }">
    <header class="header">
      <h1>ClinicalKey Helper</h1>
      <button @click="showSettings = true" class="settings-btn" title="Settings">
        <!-- Gear icon SVG -->
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      </button>
    </header>
    <main class="content">
      <div class="card">
        <div v-if="urlChecked" class="url-status">
          <div v-if="isUrlMatch && urlType === 'content'" class="match-message">
            <div class="content-download-container">
              <h3>Current Content</h3>
              <p class="content-title">{{ currentPageTitle || 'Current Page' }}</p>
              <button @click="downloadCurrentContent()" class="btn content-download-btn" title="Download PDF">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>Download PDF</span>
              </button>
            </div>
          </div>
          <div v-else-if="isUrlMatch && urlType === 'browse'" class="browse-message">
            <span class="status-icon">ℹ</span>
            <span>Book Contents Page</span>
            <div v-if="isScanning" class="scanning-indicator">
              <span>Scanning for content links...</span>
            </div>
            
            <div v-if="bookLinks.length > 0" class="link-list">
              <div class="list-header">
                <button @click="downloadAllPdfs" class="btn download-all-btn" v-if="bookLinks.length > 1">
                  Download All({{ bookLinks.length }})
                </button>
                <button @click="downloadRenamerScript" class="btn download-renamer-btn" style="margin-top: 8px; background-color: #34A853;">
                  Download Script
                </button>
              </div>
              <ul>
                <li>
                  <div class="list-footer" v-if="bookLinks.length > 1">
               
                
                <!-- Batch download buttons when there are more than batchSize links -->
                <div class="batch-buttons" v-if="bookLinks.length > batchSize && showBatchButtons" style="margin-top: 8px;">
                  <div class="batch-buttons-header" style="font-weight: bold; margin-bottom: 5px;">Download in batches:</div>
                  <div class="batch-buttons-container" style="display: flex; flex-wrap: wrap; gap: 5px;">
                    <button 
                      v-for="(_, index) in Math.ceil(bookLinks.length / batchSize)" 
                      :key="index"
                      @click="downloadBatch(index * batchSize, Math.min((index + 1) * batchSize, bookLinks.length))"
                      class="btn batch-btn"
                      :style="{
                        backgroundColor: downloadedBatches.includes(index) ? '#34A853' : '#4285F4',
                        padding: '5px 10px', 
                        fontSize: '14px'
                      }"
                    >
                      {{ index * batchSize + 1 }}-{{ Math.min((index + 1) * batchSize, bookLinks.length) }}
                    </button>
                  </div>
                </div>
                
                
              </div>
                </li>
                <li v-for="(link, index) in bookLinks" :key="index" class="link-item">
                  <div class="link-title">{{ link.title }}</div>
                  <button @click="downloadContent(link.url)" class="btn download-btn" title="Download content">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                  </button>
                </li>
                <li>  
                  <button @click="downloadAllPdfs" class="btn download-all-btn">
                  Download All({{ bookLinks.length }})
                </button>
                <button @click="downloadRenamerScript" class="btn download-renamer-btn" style="margin-top: 8px; background-color: #34A853;">
                  Download Renamer Script
                </button>
 </li>

              </ul>
              
              
            </div>
            <div v-else-if="hasScanned && bookLinks.length === 0" class="no-links-message">
              <div v-if="!isRefreshing">
                No content links found on this page.
                <button @click="refreshPageAndScan" class="btn primary" style="margin-top: 10px;">
                  <span class="icon">🔄</span> Refresh Page
                </button>
              </div>
              <div v-else class="refresh-progress-container">
                <div>Refreshing page and scanning for links...</div>
                <div class="progress-bar-container" style="margin: 10px 0;">
                  <div class="progress-bar" :style="{ width: refreshProgress + '%' }"></div>
                </div>
                <div>{{ Math.round(refreshProgress) }}%</div>
              </div>
            </div>
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
  <!-- Settings Panel -->
  <Settings v-if="showSettings" @close="closeSettings" />
</template>

<script>
import Settings from './Settings.vue';
import { useSettingsStore } from '../store/settingsStore';

export default {
  name: 'Popup',
  components: {
    Settings
  },
  data() {
    return {
      isEnabled: false,
      urlChecked: false,
      isUrlMatch: false,
      urlType: null,
      currentUrl: '',
      currentPageTitle: '',
      bookLinks: [],
      isScanning: false,
      hasScanned: false,
      bookTitle: '',
      downloadedBatches: [], // Track which batches have been downloaded
      showSettings: false, // Control settings panel visibility
      isDarkMode: false, // Track dark mode state
      batchSize: 10, // Default batch size, will be updated from settings
      showBatchButtons: true, // Default value for showing batch buttons
      isRefreshing: false, // Track if page is refreshing
      refreshProgress: 0 // Track refresh progress percentage
    }
  },
  mounted() {
    // Load settings from store
    const settingsStore = useSettingsStore();
    settingsStore.loadSettings().then(() => {
      // Apply settings
      this.isDarkMode = settingsStore.darkMode;
      this.batchSize = settingsStore.batchSize;
      this.showBatchButtons = settingsStore.showBatchButtons;
    });
    
    // Check if the extension is enabled
    chrome.storage.sync.get(['enabled'], (result) => {
      this.isEnabled = result.enabled || false;
    });
    
    // Get the current tab URL and check if it matches the pattern
    this.checkCurrentUrl();
  },
  methods: {
    closeSettings() {
      this.showSettings = false;
      
      // Refresh settings from store
      const settingsStore = useSettingsStore();
      
      // Update settings from store
      this.isDarkMode = settingsStore.darkMode;
      this.showBatchButtons = settingsStore.showBatchButtons;
      
      // Update batch size and reset downloaded batches if batch size changed
      if (this.batchSize !== settingsStore.batchSize) {
        this.batchSize = settingsStore.batchSize;
        this.downloadedBatches = []; // Reset downloaded batches when batch size changes
      }
    },
    checkCurrentUrl() {
      console.log(`Checking current URL...`);
      try {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          console.log('Tab query result:', tabs);
          if (tabs && tabs[0] && tabs[0].url) {
            this.currentUrl = tabs[0].url;
            this.currentPageTitle = tabs[0].title || '';
            
            console.log('Current URL:', this.currentUrl);

            // ULTRA SIMPLE CHECKS - direct string comparison for specific URL patterns
            // Journal TOC URL check
            if (this.currentUrl.includes('clinicalkey.com') && 
                this.currentUrl.includes('toc') && 
                this.currentUrl.includes('journalIssue')) {
              
              console.log('JOURNAL URL DETECTED!');
              this.isUrlMatch = true;
              this.urlType = 'journal';
              this.urlChecked = true;
              this.scanForLinks();
              return;
            }
            
            // Book Browse URL check
            if (this.currentUrl.includes('clinicalkey.com') && 
                this.currentUrl.includes('/browse/book/')) {
              
              console.log('BOOK BROWSE URL DETECTED!');
              this.isUrlMatch = true;
              this.urlType = 'browse';
              this.urlChecked = true;
              this.scanForLinks();
              return;
            }
            
            // Book Content URL check
            if (this.currentUrl.includes('clinicalkey.com') && 
                this.currentUrl.includes('/content/book/')) {
              
              console.log('BOOK CONTENT URL DETECTED!');
              this.isUrlMatch = true;
              this.urlType = 'content';
              this.urlChecked = true;
              return;
            }
            
            // Local URL matching logic as fallback
            this.checkUrlMatchLocally(this.currentUrl);
          } else {
            console.log('No active tab or URL found');
            this.urlChecked = true;
            this.isUrlMatch = false;
            this.urlType = null;
          }
        });
      } catch (err) {
        console.error('Error in checkCurrentUrl:', err);
      }
    },
    
    checkUrlMatchLocally(url) {
      console.log('Checking URL locally:', url);
      
      // DEBUG: Log the URL parts separately
      console.log('URL includes check results:', {
        "clinicalkey.com": url.includes('clinicalkey.com'),
        "#!/browse/toc/": url.includes('#!/browse/toc/'), 
        "/browse/toc/": url.includes('/browse/toc/'),
        "journalIssue": url.includes('journalIssue'),
        "indexOf check": url.indexOf('clinicalkey.com/#!/browse/toc/') !== -1,
        "raw URL": url
      });
      
      // Very broad checks for journal TOC URL - try multiple approaches
      if (url.includes('clinicalkey') && url.includes('toc') && url.includes('journal')) {
        console.log('Journal TOC URL match found via broad terms!');
        this.isUrlMatch = true;
        this.urlType = 'journal';
        this.urlChecked = true;
        
        // Automatically scan for journal links
        this.scanForLinks();
        return;
      }
      
      // Direct check for the problematic journal URL
      if (url.indexOf('clinicalkey.com/#!/browse/toc/') !== -1 || 
          (url.includes('/browse/toc/') && url.includes('/journalIssue'))) {
        console.log('Journal TOC URL match found via specific pattern!');
        this.isUrlMatch = true;
        this.urlType = 'journal';
        this.urlChecked = true;
        
        // Automatically scan for journal links
        this.scanForLinks();
        return;
      }
      
      // Pattern for content book URLs
      const contentPattern = /^https:\/\/www\.clinicalkey\.com\/#!\/content\/book\/.+/;
      // Pattern for browse book URLs
      const browsePattern = /^https:\/\/www\.clinicalkey\.com\/#!\/browse\/book\/.+/;
      
      const contentMatch = contentPattern.test(url);
      const browseMatch = browsePattern.test(url);
      
      console.log('Pattern matching results:', {
        contentMatch,
        browseMatch,
        journalDirectMatch: url.indexOf('clinicalkey.com/#!/browse/toc/') !== -1
      });
      
      if (contentMatch) {
        this.isUrlMatch = true;
        this.urlType = 'content';
      } else if (browseMatch) {
        this.isUrlMatch = true;
        this.urlType = 'browse';
        
        // Automatically scan for book links
        this.scanForLinks();
      } else {
        this.isUrlMatch = false;
        this.urlType = null;
      }
      
      this.urlChecked = true;
    },
    scanForLinks() {
      this.isScanning = true;
      this.hasScanned = true;
      this.bookLinks = [];
      
      console.log('Starting link scan for URL type:', this.urlType);
      
      // Send message to content script to scan for book links or journal PDF links
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const action = this.urlType === 'journal' ? 'scanForJournalLinks' : 'scanForBookLinks';
        
        console.log('Sending message to content script:', action);
        
        chrome.tabs.sendMessage(
          tabs[0].id, 
          { action: action },
          (response) => {
            if (response && response.success) {
              this.bookLinks = response.links;
              
              // Save the book title if it's provided in the response
              if (response.bookTitle) {
                this.bookTitle = response.bookTitle;
                console.log('Received book title from content script:', this.bookTitle);
              }
              
              console.log('Received links:', JSON.stringify(this.bookLinks, null, 2));
              
              // Check if links have chapter info
              if (this.bookLinks.length > 0) {
                console.log('First link sample:', this.bookLinks[0]);
                const hasChapterInfo = this.bookLinks.some(link => link.chapterNumber || link.chapterTitle);
                console.log('Links have chapter info?', hasChapterInfo);
              }
            } else {
              console.error('Error in response:', response);
            }
            this.isScanning = false;
          }
        );
      });
    },
    downloadContent(url) {
      // Check if this is already a direct PDF link (journal article)
      const isPdfLink = url.includes('/service/content/pdf/watermarked/') && url.includes('.pdf');
      let pdfUrl = url;
      let filename = 'clinicalkey-content.pdf';
      
      if (!isPdfLink) {
        // Transform the URL to a direct PDF download link for book content
        // From: https://www.clinicalkey.com/#!/content/book/3-s2.0-B9780443105203010017
        // To: https://www.clinicalkey.com/service/content/pdf/watermarked/3-s2.0-B9780443105203010017.pdf
        const contentIdMatch = url.match(/\/content\/book\/(3-s2\.0-[\w\d-]+)/);
        
        if (contentIdMatch && contentIdMatch[1]) {
          const contentId = contentIdMatch[1];
          pdfUrl = `https://www.clinicalkey.com/service/content/pdf/watermarked/${contentId}.pdf`;
          filename = `${contentId}.pdf`;
        }
      } else {
        // For direct PDF links, extract the filename from the URL
        const urlParts = url.split('/');
        filename = urlParts[urlParts.length - 1].split('?')[0]; // Remove query params
      }
      
      // Get the title for the PDF
      const title = this.bookLinks.find(link => link.url === url)?.title || 'Unknown';
      if (title && title !== 'Unknown') {
        // Create a safe filename from the title
        const safeTitle = title.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_').substring(0, 100);
        filename = `${safeTitle}.pdf`;
      }
      
      // Use the downloads API to force download the PDF
      chrome.downloads.download({
        url: pdfUrl,
        filename: filename,
        saveAs: false
      });
      
      // Add to download history
      this.addToHistory(url, pdfUrl, title);
    },
    downloadCurrentContent() {
      // Transform the current URL to a direct PDF download link
      const url = this.currentUrl;
      const contentIdMatch = url.match(/\/content\/book\/(3-s2\.0-[\w\d-]+)/);
      let pdfUrl = url;
      let filename = 'clinicalkey-content.pdf';
      
      if (contentIdMatch && contentIdMatch[1]) {
        const contentId = contentIdMatch[1];
        pdfUrl = `https://www.clinicalkey.com/service/content/pdf/watermarked/${contentId}.pdf`;
        filename = `${contentId}.pdf`;
      }
      
      // Create a safe filename from the page title if available
      if (this.currentPageTitle) {
        const safeTitle = this.currentPageTitle.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_').substring(0, 100);
        filename = `${safeTitle}.pdf`;
      }
      
      // Use the downloads API to force download the PDF
      chrome.downloads.download({
        url: pdfUrl,
        filename: filename,
        saveAs: false
      });
      
      // Add to download history
      this.addToHistory(url, pdfUrl, this.currentPageTitle || 'Current Page');
    },
    
    downloadBatch(startIndex, endIndex) {
      console.log(`Starting batch download of PDFs from ${startIndex+1} to ${endIndex}`);
      
      // Get the subset of links for this batch
      const batchLinks = this.bookLinks.slice(startIndex, endIndex);
      console.log(`Downloading batch of ${batchLinks.length} PDFs`);
      
      // Mark this batch as downloaded
      const batchIndex = Math.floor(startIndex / this.batchSize);
      if (!this.downloadedBatches.includes(batchIndex)) {
        this.downloadedBatches.push(batchIndex);
      }
      
      // Loop through the batch links and download each PDF
      batchLinks.forEach((link, index) => {
        this.downloadSinglePdf(link, startIndex + index);
      });
    },
    
    downloadAllPdfs() {
      console.log('Starting batch download of PDFs');
      console.log('Book links data:', JSON.stringify(this.bookLinks, null, 2));
      
      // Loop through all links and download each PDF
      this.bookLinks.forEach((link, index) => {
        this.downloadSinglePdf(link, index);
      });
    },
    
    refreshPageAndScan() {
      console.log('Refreshing page and scanning for links...');
      
      // Reset state
      this.bookLinks = [];
      this.hasScanned = false;
      this.isScanning = true;
      this.isRefreshing = true; // Set refreshing state for progress indicator
      this.refreshProgress = 0; // Initialize progress at 0%
      
      // Get the refresh wait time from settings (in seconds)
      const settingsStore = useSettingsStore();
      const waitTimeInSeconds = settingsStore.refreshWaitTime;
      
      // Reload the current page
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        const currentTab = tabs[0];
        chrome.tabs.reload(currentTab.id, {}, () => {
          // Update progress over the configured wait time
          const totalWaitTime = waitTimeInSeconds * 1000; // Convert to milliseconds
          const updateInterval = 100; // Update every 100ms
          const progressIncrement = (updateInterval / totalWaitTime) * 100;
          
          const progressTimer = setInterval(() => {
            this.refreshProgress += progressIncrement;
            if (this.refreshProgress >= 100) {
              clearInterval(progressTimer);
              this.refreshProgress = 100;
              this.isRefreshing = false;
              
              // Reset URL check to force a new check
              this.urlChecked = false;
              this.checkCurrentUrl();
            }
          }, updateInterval);
        });
      });
    },
    
    downloadSinglePdf(link, index) {
      console.log(`Processing link ${index}:`, link);
      
      const url = link.url;
      // Check if this is already a direct PDF link (journal article)
      const isPdfLink = url.includes('/service/content/pdf/watermarked/') && url.includes('.pdf');
      let pdfUrl = url;
      let filename = `clinicalkey-content-${index + 1}.pdf`;
      
      if (!isPdfLink) {
        // Transform book content URL to direct PDF link
        const contentIdMatch = url.match(/\/#!\/content\/book\/(3-s2\.0-[\w\d-]+)/) || 
                             url.match(/\/content\/book\/(3-s2\.0-[\w\d-]+)/);
        
        if (contentIdMatch && contentIdMatch[1]) {
          const contentId = contentIdMatch[1];
          pdfUrl = `https://www.clinicalkey.com/service/content/pdf/watermarked/${contentId}.pdf`;
          
          console.log('Extracted content ID:', contentId);
          console.log('Chapter data:', { 
            number: link.chapterNumber, 
            title: link.chapterTitle,
            originalTitle: link.title 
          });
          
          // Create a custom filename using chapter number and title
          if (link.chapterNumber && link.chapterTitle) {
            // Use chapter number and title
            const safeTitle = link.chapterTitle.replace(/[<>:\\/"\|\?\*]/g, '_').replace(/\s+/g, ' ').trim();
            filename = `${link.chapterNumber}. ${safeTitle}.pdf`;
            console.log(`Creating custom filename with number and title: ${filename}`);
          } else if (link.title) {
            // Try to extract chapter number and title from the link text
            const titleMatch = link.title.match(/^(\d+)\.(.*)/); 
            if (titleMatch) {
              const num = titleMatch[1];
              const title = titleMatch[2].trim();
              const safeTitle = title.replace(/[<>:\\/"\|\?\*]/g, '_').replace(/\s+/g, ' ').trim();
              filename = `${num}. ${safeTitle}.pdf`;
              console.log(`Created filename from link text: ${filename}`);
            } else {
              // Just use the title if no chapter number pattern found
              const safeTitle = link.title.replace(/[<>:\\/"\|\?\*]/g, '_').replace(/\s+/g, ' ').trim();
              filename = `${safeTitle}.pdf`;
              console.log(`Created filename from title only: ${filename}`);
            }
          } else {
            // Fallback to content ID
            filename = `${contentId}.pdf`;
            console.log(`Using fallback filename: ${filename}`);
          }
        }
      } else {
        // For direct PDF links, extract the filename from the URL
        const urlParts = url.split('/');
        filename = urlParts[urlParts.length - 1].split('?')[0]; // Remove query params
      }
      
      // Create a safe filename from the title if available
      if (link.title && link.title !== 'Unknown') {
        const safeTitle = link.title.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_').substring(0, 100);
        filename = `${safeTitle}.pdf`;
      }
      
      // Use the downloads API to force download the PDF
      chrome.downloads.download({
        url: pdfUrl,
        filename: filename,
        saveAs: false
      });
      
      // Add to download history
      this.addToHistory(url, pdfUrl, link.title);
    },
    
    // Helper method to add downloads to history
    addToHistory(url, pdfUrl, title) {
      chrome.storage.sync.get(['downloadHistory'], (result) => {
        const history = result.downloadHistory || [];
        
        // Add to history if not already present
        if (!history.some(item => item.url === url)) {
          const newItem = {
            url: url,
            pdfUrl: pdfUrl,
            timestamp: new Date().toISOString(),
            title: title || 'Unknown'
          };
          
          history.unshift(newItem); // Add to beginning of array
          
          // Limit history to 50 items
          if (history.length > 50) {
            history.pop();
          }
          
          chrome.storage.sync.set({ downloadHistory: history });
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
    },
    
    downloadRenamerScript() {
      console.log('BUTTON CLICKED - Downloading renamer script for', this.bookLinks.length, 'files');
      
      // Only continue if we have links to process
      if (this.bookLinks.length === 0) {
        alert('No links found to generate renamer script. Please scan for links first.');
        return;
      }
      
      // Create script header with comments
      let scriptContent = "#!/bin/bash\n\n";
      scriptContent += "# ClinicalKey PDF Renamer Script\n";
      scriptContent += "# Generated: " + new Date().toLocaleString() + "\n";
      scriptContent += "# This script renames downloaded PDF files and organizes them into a folder\n\n";
      
      // Add color variables for better output
      scriptContent += "# Color definitions for output\n";
      scriptContent += "GREEN=\"\\033[0;32m\"\n";
      scriptContent += "RED=\"\\033[0;31m\"\n";
      scriptContent += "YELLOW=\"\\033[0;33m\"\n";
      scriptContent += "NC=\"\\033[0m\" # No Color\n\n";
      
      // Ensure variables are exported so they're properly defined
      scriptContent += "export GREEN RED YELLOW NC\n\n";
      
      // Add counter variables and array for missing files
      scriptContent += "# Counters for summary\n";
      scriptContent += "TOTAL=0\n";
      scriptContent += "SUCCESS=0\n";
      scriptContent += "MISSING=0\n";
      scriptContent += "MISSING_FILES=()\n\n";
      
      // Create folder for the book
      const safeFolderName = this.bookTitle 
        ? this.bookTitle.replace(/[\/<>:\\"|?*]/g, '_').trim() 
        : "ClinicalKey_Downloads";
        
      scriptContent += "# Create folder for the book\n";
      scriptContent += `BOOK_FOLDER="${safeFolderName}"\n`;
      scriptContent += "mkdir -p \"$BOOK_FOLDER\"\n";
      scriptContent += "echo \"Creating folder: $BOOK_FOLDER\"\n\n";
      
      scriptContent += "echo \"Starting PDF renaming process...\"\n\n";
      
      // Process each link to create renaming commands
      this.bookLinks.forEach(link => {
        const url = link.url;
        
        // Extract content ID from URL to match the downloaded filename
        const contentIdMatch = url.match(/\/#!\/content\/book\/(3-s2\.0-[\w\d-]+)/) || 
                             url.match(/\/content\/book\/(3-s2\.0-[\w\d-]+)/);
        
        if (contentIdMatch && contentIdMatch[1]) {
          const contentId = contentIdMatch[1];
          const originalFilename = `${contentId}.pdf`;
          
          // Create new filename based on chapter info
          let newFilename = '';
          if (link.chapterNumber && link.chapterTitle) {
            // Use chapter number and title
            const safeTitle = link.chapterTitle.replace(/[<>:\\/"\|\?\*]/g, '_').replace(/\s+/g, ' ').trim();
            newFilename = `${link.chapterNumber}. ${safeTitle}.pdf`;
          } else if (link.title) {
            // Try to extract chapter number and title from link text
            const titleMatch = link.title.match(/^(\d+)\.(.*)/); 
            if (titleMatch) {
              const num = titleMatch[1];
              const title = titleMatch[2].trim();
              const safeTitle = title.replace(/[<>:\\/"\|\?\*]/g, '_').replace(/\s+/g, ' ').trim();
              newFilename = `${num}. ${safeTitle}.pdf`;
            } else {
              // Just use the title if no chapter number
              const safeTitle = link.title.replace(/[<>:\\/"\|\?\*]/g, '_').replace(/\s+/g, ' ').trim();
              newFilename = `${safeTitle}.pdf`;
            }
          } else {
            // If no usable title info, just skip this entry
            return;
          }
          
          // Only sanitize quotes for bash script - spaces are handled by quoting
          const sanitizedOriginal = originalFilename.replace(/"/g, '\\"');
          const sanitizedNew = newFilename.replace(/"/g, '\\"');
          
          // Add file check and mv command to script
          scriptContent += `# Check for ${originalFilename}\n`;
          scriptContent += `TOTAL=$((TOTAL+1))\n`;
          scriptContent += `if [ -f "${sanitizedOriginal}" ]; then\n`;
          scriptContent += `  mv "${sanitizedOriginal}" "$BOOK_FOLDER/${sanitizedNew}"\n`;
          scriptContent += `  echo -e "\${GREEN}✓\${NC} Renamed: ${originalFilename} → ${newFilename}"\n`;
          scriptContent += `  SUCCESS=$((SUCCESS+1))\n`;
          scriptContent += `else\n`;
          scriptContent += `  echo -e "\${RED}✗\${NC} Warning: File ${originalFilename} not found"\n`;
          scriptContent += `  MISSING=$((MISSING+1))\n`;
          scriptContent += `  MISSING_FILES+=("${originalFilename}")\n`;
          scriptContent += `fi\n`;
        }
      });
      
      // Add summary section
      scriptContent += "\n# Print summary\n";
      scriptContent += "echo \"\"\n";
      scriptContent += "echo -e \"\$YELLOW===== Summary =====\$NC\"\n";
      scriptContent += "echo -e \"Total files to process: \$TOTAL\"\n";
      scriptContent += "echo -e \"Successfully renamed: \$GREEN\$SUCCESS\$NC\"\n";
      scriptContent += "echo -e \"Missing files: \$RED\$MISSING\$NC\"\n";
      
      // Add list of missing files to summary
      scriptContent += "if [ \$MISSING -gt 0 ]; then\n";
      scriptContent += "  echo \"\"\n";
      scriptContent += "  echo -e \"\$RED=== Failed Files ===\$NC\"\n";
      scriptContent += "  for file in \"\${MISSING_FILES[@]}\"; do\n";
      scriptContent += "    echo -e \"  \$RED✗\$NC \$file\"\n";
      scriptContent += "  done\n";
      scriptContent += "fi\n";
      
      scriptContent += "echo -e \"\$YELLOW===================\$NC\"\n";
      
      // Add final comments
      scriptContent += "\n# End of renamer script\n";
      
      // Create Blob from script content
      const blob = new Blob([scriptContent], { type: 'text/plain' });
      
      // Create a URL for the Blob
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = 'clinicalkey_rename.sh';
      
      // Append to body, click it to download, then remove
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log('Download initiated for script file');
      }, 100);
    },
    

  }
}
</script>

<style scoped>
.popup-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f7fa;
  transition: background-color 0.3s ease;
}

/* Dark mode styles */
.dark-mode {
  background-color: #1a1a1a;
  color: #f5f7fa;
}

.dark-mode .card {
  background-color: #2d2d2d;
  color: #f5f7fa;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.dark-mode .header {
  background-color: #1a1a1a;
  border-bottom: 1px solid #444;
}

.progress-bar-container {
  width: 100%;
  height: 10px;
  background-color: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;
}

.dark-mode .progress-bar-container {
  background-color: #444;
}

.progress-bar {
  height: 100%;
  background-color: #4285F4;
  transition: width 0.1s ease-in-out;
}

.refresh-progress-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 15px;
  text-align: center;
}

.header {
  background-color: #2c3e50;
  color: white;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.settings-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.settings-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
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
  width: 100%;
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

.scanning-indicator {
  margin-top: 12px;
  color: #7f8c8d;
  font-style: italic;
  display: flex;
  justify-content: center;
  align-items: center;
}

.link-list {
  margin-top: 16px;
  width: 100%;
  max-height: 350px;
  overflow-y: auto;
  border-top: 1px solid #ecf0f1;
  padding-top: 12px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.list-header h3 {
  margin: 0;
  font-size: 16px;
  color: #2c3e50;
}

.list-footer {
  display: flex;
  justify-content: center;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #ecf0f1;
}

.download-all-btn {
  background-color: #2980b9;
  color: white;
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.download-all-btn:hover {
  background-color: #3498db;
}

.content-download-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  width: 100%;
}

.content-download-container h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #2c3e50;
}

.content-title {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #34495e;
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.content-download-btn {
  background-color: #27ae60;
  color: white;
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 160px;
  transition: background-color 0.2s;
}

.content-download-btn:hover {
  background-color: #2ecc71;
}

.link-list h3 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 16px;
  color: #2c3e50;
  text-align: left;
}

.link-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.link-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #ecf0f1;
}

.link-title {
  flex: 1;
  text-align: left;
  font-size: 14px;
  color: #34495e;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-right: 12px;
  max-width: 280px;
}

.download-btn {
  background-color: #27ae60;
  color: white;
  padding: 8px;
  min-width: 40px;
  min-height: 40px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.download-btn:hover {
  background-color: #2ecc71;
}

.no-links-message {
  margin-top: 16px;
  color: #7f8c8d;
  font-style: italic;
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
