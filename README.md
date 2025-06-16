# Saved Links App

Saved Links App is a desktop application built with Electron that automatically captures, stores, and displays URLs from your clipboard. It features a system tray icon, real-time updates for new links, a searchable list, and a clean, modern design.

## Features

- **Automatic Link Capture:** Monitors the clipboard for URLs starting with http/https and saves them automatically.
- **Real-Time Updates:** The application updates the displayed list in real time when new links are added.
- **Search Functionality:** Quickly filter through saved links using the built-in search box.
- **System Tray Integration:** When the window is closed, the application remains active in the system tray. Double-click or use the context menu to show/hide the window.
- **Customizable UI:** Modern design with styled buttons and a scrollable list for easy navigation.

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/_bkir0/save-links-app.git
   ```

2. **Install dependencies:**
   ```bash
   cd save-links-app
   npm install
   ```

3. **Run the application:**
   ```bash
   npm start
   ```

## Usage

- **Clipboard Monitoring:** As you copy links to your clipboard, the application will detect valid URLs and store them.
- **Search:** Use the search box in the app window to filter through your saved links.
- **System Tray:** Click the tray icon to bring back (or hide) the application window. Use the context menu on the tray icon to exit the app.

## Development

This project is maintained by _bkir0 on X. Feel free to contribute by submitting issues or pull requests.

## License

This project is open-source and available under the MIT License.