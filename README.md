# ClinicalKey Helper Chrome Extension

A Chrome extension built with Vue.js to enhance the ClinicalKey experience for paid subscribers. This is not a tool to download files without a subscription. You need to have an active subscription. If you do, this extension will help you download PDFs of content you have access to.

## Features

- Quick access to clinical resources
- Simplified search interface
- Customizable shortcuts
- Modern UI with intuitive controls

## Development Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

### Development

To build the extension in development mode with hot-reload:

```bash
npm run dev
# or
yarn dev
```

### Production Build

To build the extension for production:

```bash
npm run build
# or
yarn build
```

### Loading the extension in Chrome

1. Build the extension using one of the commands above
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the `dist` folder from this project

## Project Structure

```
clinicalkey-helper/
├── dist/               # Built extension files (generated)
├── icons/              # Extension icons
├── src/
│   ├── popup/          # Popup UI (Vue.js)
│   │   ├── Popup.vue   # Main popup component
│   │   ├── popup.html  # Popup HTML template
│   │   └── popup.js    # Popup entry point
│   ├── background.js   # Background script
│   └── content.js      # Content script
├── .babelrc            # Babel configuration
├── manifest.json       # Extension manifest
├── package.json        # Project dependencies
├── README.md           # Project documentation
└── webpack.config.js   # Webpack configuration
```

## License

MIT
