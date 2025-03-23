<template>
  <div class="popup-container">
    <header class="header">
      <h1>ClinicalKey Helper</h1>
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
                <h3>Available Content Links</h3>
                <button @click="downloadAllPdfs" class="btn download-all-btn" v-if="bookLinks.length > 1">
                  Download All PDFs ({{ bookLinks.length }})
                </button>
              </div>
              <ul>
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
              </ul>
              <div class="list-footer" v-if="bookLinks.length > 1">
                <button @click="downloadAllPdfs" class="btn download-all-btn">
                  Download All PDFs ({{ bookLinks.length }})
                </button>
              </div>
            </div>
            <div v-else-if="hasScanned && bookLinks.length === 0" class="no-links-message">
              No content links found on this page.
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
      currentUrl: '',
      currentPageTitle: '',
      bookLinks: [],
      isScanning: false,
      hasScanned: false
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
      
      // Send message to content script to scan for book links or journal PDF links
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const action = this.urlType === 'journal' ? 'scanForJournalLinks' : 'scanForBookLinks';
        
        chrome.tabs.sendMessage(
          tabs[0].id, 
          { action: action },
          (response) => {
            if (response && response.success) {
              this.bookLinks = response.links;
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
    
    downloadAllPdfs() {
      // Loop through all links and download each PDF
      this.bookLinks.forEach((link, index) => {
        const url = link.url;
        // Check if this is already a direct PDF link (journal article)
        const isPdfLink = url.includes('/service/content/pdf/watermarked/') && url.includes('.pdf');
        let pdfUrl = url;
        let filename = `clinicalkey-content-${index + 1}.pdf`;
        
        if (!isPdfLink) {
          // Transform book content URL to direct PDF link
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
      });
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
