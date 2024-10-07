# Clinch SDK

## Overview
This project provides a reference implementation for integrating the Clinch SDK to show the web app in an iFrame. It includes a simple HTTP server setup, a reference HTML file (`index.html`), and the SDK JavaScript file (`clinch-sdk.js`). Follow the instructions below to get started.

## Installation and Running the HTTP Server

To serve your project locally, you will use the `http-server` package.

### Step-by-Step Installation

1. **Install Node.js**: Ensure you have Node.js installed on your system. You can download it from [Node.js](https://nodejs.org/).

2. **Install http-server**: Open your terminal and install the `http-server` package globally using npm:
   ```sh
   npm install -g http-server
   ```

3. **Navigate to Your Project Directory**: Change your terminal's current directory to your project's root directory where your `index.html` file is located.

4. **Run the HTTP Server**: Start the server with the following command:
   ```sh
   http-server -p 8005 -c-1 --cors
   ```
   - `-p 8005`: Specifies the port number to use.
   - `-c-1`: Disables caching.
   - `--cors`: Enables Cross-Origin Resource Sharing (CORS).

### Purpose of the JSON File for the Build Server
The `http-server.json` file configures the HTTP server. Here's a sample configuration from your project:
```json
{
  "headers": {
    "/**": {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0"
    }
  }
}
```
This configuration ensures that the server does not cache any content, which is useful during development to always fetch the latest changes.

## Example implementation `index.html`

The `index.html` file serves as a reference implementation for integrating the Clinch SDK and web app. Here's a quick overview of its structure and how you can use it:

### Purpose of `index.html`
This file sets up an iframe that points to the Clinch operator and includes a script to load the Clinch SDK.

### How to Use
Read the latest documentation on https://docs.thndr.io/thndr

### Integration
To integrate this into your project, copy the content of `index.html` into your web application's HTML file where you want to include the Clinch iframe and SDK functionality.

## Using `clinch-sdk.js`

The `clinch-sdk.js` file is the main SDK script that facilitates secure communication between your web application and the iFrame.

### Overview
This SDK handles token authentication requests, redirections, and ensures messages are only processed from the trusted Clinch iFrame.

### Key Functions

1. **loadClinch**
   ```javascript
   import { loadClinch } from './clinch-operator-sdk.js';

   loadClinch(CLINCH_ORIGIN, REDIRECT_URL, getTokenCallback);
   ```
   Initializes the SDK by setting up a message event listener to handle messages from the Clinch iframe.

2. **getTokenCallback**
   ```javascript
   function getToken() {
     return "AUTH_TOKEN";
   }
   ```
   This callback function should return a valid token for authentication.

### Example Usage
1. **Import and Initialize**: Include the SDK in your HTML file as shown in the `index.html` example.
2. **Implement getToken**: Provide the logic to fetch the token (see our API documentation), which will be used by the SDK to authenticate with Clinch.

## FAQ

### What do I see an error popup in my iFrame saying "There was a problem logging in. Please try again later."
This means the AUTH_TOKEN was not valid. You should contact us so we can help you debug your authentication. Please see the authentication docs in our API.