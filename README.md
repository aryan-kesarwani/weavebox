<div align="center">
  <img src="https://qwq2juf37zc446w7r67ifqznsx5a5k44sl7rjxasxtgqnep6fzta.arweave.net/haGk0Lv-Rc5634--gsMtlfoOq5yS_xTcErzNBpH-LmY" alt="WeaveBox Logo" width="200"/>
  
  **Your bridge from Google Drive to the permanent web.**
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
  [![React](https://img.shields.io/badge/React-v18-blue)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-v4.9-blue)](https://www.typescriptlang.org/)
  [![Arweave](https://img.shields.io/badge/Arweave-Integrated-yellow)](https://www.arweave.org/)
</div>

## 📋 Overview

WeaveBox is a powerful web application that bridges the gap between Google Drive and Arweave's permanent storage. With WeaveBox, you can:

- Browse your Google Drive files with an intuitive interface
- Select important files for permanent storage
- Upload directly to Arweave's blockchain
- Ensure your important documents, images, and files are stored permanently

WeaveBox makes it simple to preserve your valuable digital assets forever on the permaweb.

## ✨ Features

### Google Drive Integration
- **Seamless Authentication**: Connect your Google Drive with just a few clicks
- **Browse Files**: Navigate through folders, view thumbnails, and preview files
- **Search & Filter**: Easily find files by name or filter by type (images, documents, videos, etc.)
- **File Preview**: Preview documents, images, videos, and PDFs without leaving the app

### Arweave Permanent Storage
- **Wallet Connection**: Connect your Arweave wallet directly in the app
- **Selective Upload**: Choose which files to preserve permanently
- **Permanent Storage**: Files uploaded to Arweave remain accessible forever
- **Progress Tracking**: Monitor upload progress for each file

### User Experience
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Mode**: Choose your preferred theme
- **Drag & Drop**: Upload files directly from your computer
- **Bulk Operations**: Select and upload multiple files simultaneously

## 🛠️ Technology Stack

- **Frontend**: 
  - React with TypeScript
  - Redux for state management
  - Framer Motion for animations
  - Tailwind CSS for styling
  
- **Storage & Authentication**:
  - IndexedDB for local file caching
  - Google OAuth for Drive integration
  - Arweave wallet integration
  
- **APIs & Services**:
  - Google Drive API
  - Arweave JS SDK

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A Google Cloud Platform account (for API keys)
- An Arweave wallet

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/weavebox.git
cd weavebox
```

2. Install dependencies:
```bash
# For client
cd client
npm install

# For server (if applicable)
cd ../server
npm install
```

3. Set up environment variables:
Create `.env` files in the client directory with the following variables:
```
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

4. Start the development server:
```bash
# Client
npm run dev

# Server (if applicable)
npm run start
```

5. Open your browser and navigate to `http://localhost:5173`

## 📝 Usage Instructions

### Connecting Google Drive

1. Click on "Connect Google Drive" button on the dashboard
2. Authorize WeaveBox to access your Google Drive
3. Browse your files in the Google Drive section

### Uploading to Arweave

1. Connect your Arweave wallet using the "Connect Wallet" button
2. Browse to a file you want to preserve
3. Click the upload icon or select multiple files and use "Upload to Arweave"
4. Confirm the transaction and wait for the upload to complete

### Managing Your Files

- Use the sidebar to navigate between your Google Drive files and already uploaded Arweave files
- Use the search bar to find specific files
- Filter files by type using the dropdown menu

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🔒 Privacy & Security

WeaveBox takes your privacy seriously:

- **Zero Knowledge Design**: We never store your Google Drive or Arweave credentials
- **Local Processing**: File processing happens locally in your browser
- **Direct Uploads**: Files go directly from your browser to Arweave
- **Open Source**: All code is open for review and audit

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ❓ FAQ

### Is WeaveBox free to use?
WeaveBox is free to use, but uploading to Arweave requires AR tokens to pay for storage.

### How much does it cost to store files on Arweave?
Storage costs vary based on file size and network conditions. WeaveBox displays estimated costs before uploading.

### Can I access my files if WeaveBox shuts down?
Yes! Files stored on Arweave are permanently accessible, even if WeaveBox is no longer available.

### Is there a file size limit?
We recommend files under 100MB for optimal performance, though larger files are supported.

## 📊 Roadmap

- **Q2 2025**: Mobile app release
- **Q3 2025**: Integration with additional cloud storage providers
- **Q4 2025**: Enhanced file organization and tagging system
- **Q1 2026**: Collaborative sharing features

## 🙏 Acknowledgements

- [Arweave](https://www.arweave.org/) for providing permanent storage solutions
- [Google Drive API](https://developers.google.com/drive) for file access capabilities
- All contributors who have helped shape WeaveBox

## 📬 Contact

Have questions or suggestions? Reach out to us:

- **Email**: hello@weavebox.io
- **Twitter**: [@WeaveBoxApp](https://twitter.com/weaveboxapp)
- **Discord**: [Join our community](https://discord.gg/weavebox)

---

<div align="center">
  <p>Built with ❤️ for the permanent web</p>
</div>
