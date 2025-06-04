# Door Widget Project

This project implements a "smart" door widget system.

## Features

*   **Door Button:** A virtual button that users can "press".
*   **User Identification:** Associates door presses with a `userId`.
*   **Real-time Notifications:** Uses Socket.IO to notify clients when a door is pressed.
*   **Geolocation:** Captures the user's location when they press the button (requires browser permission).
*   **Configuration:** Allows users to save their `userId` and a `code` in localStorage.

## Setup and Running the Project

### Prerequisites
- Node.js and npm installed (https://nodejs.org/)

### Backend Server (`door-widget/server`)
1.  **Navigate to the server directory:**
    ```bash
    cd door-widget/server
    ```
2.  **Install dependencies:**
    If you haven't already, install the necessary Node.js packages:
    ```bash
    npm install
    ```
    (Note: `express`, `socket.io`, `cors`, `body-parser` are used. `nodemon` can be used for development for automatic server restarts.)
3.  **Start the server:**
    There might be a `start` script in `package.json` (e.g., `npm start`). If not, you can run:
    ```bash
    node server.js
    ```
    The server will typically run on `http://localhost:3000`.

### Frontend (Client)
1.  Once the backend server is running, open the `door-widget/index.html` file in your web browser.
    *   You might need to serve it via a local web server if you encounter issues with file paths or module loading directly from the filesystem, though for this simple setup, opening `index.html` directly often works.
    *   Ensure your browser allows JavaScript and supports features like Geolocation and Notifications if you want to test full functionality.

## Project Structure

*   `door-widget/index.html`: The main HTML file for the client-side widget.
*   `door-widget/styles/style.css`: CSS styles for the widget.
*   `door-widget/scripts/main.js`: Core client-side JavaScript logic.
*   `door-widget/scripts/utils.js`: Utility functions (if any, currently placeholder).
*   `door-widget/scripts/geolocation.js`: Geolocation specific logic (currently placeholder, main logic in `main.js`).
*   `door-widget/scripts/notifications.js`: Notification specific logic (currently placeholder, main logic in `main.js`).
*   `door-widget/server/server.js`: The Node.js Express backend server.
*   `door-widget/assets/`: Contains static assets like sounds or images.
*   `door-widget/sw.js`: Service worker file (if PWA features were to be implemented).
