# React + JavaScript Project

A clean, modern React project set up with JavaScript and Vite.

---

## 📁 Project Structure

```text
frontend/
├── public/              # Static assets
│   └── vite.svg
├── src/                 # Application source code
│   ├── components/      # Reusable React components
│   │   └── Header.jsx
│   ├── App.css          # App component styles
│   ├── App.jsx          # Root application component
│   ├── index.css        # Global CSS styles
│   └── main.jsx         # Application entry point
├── .gitignore           # Git ignore patterns
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── README.md            # Project documentation
└── vite.config.js       # Vite build configuration
```

---

## 🚀 Getting Started

### 1. Ensure Node.js is Installed
To run and build this React project, you need [Node.js](https://nodejs.org/) (version 18 or newer) installed on your system.

- If you don't have Node.js yet, download and install the **LTS version** from [nodejs.org](https://nodejs.org/).
- Or install via Windows Terminal (PowerShell):
  ```powershell
  winget install OpenJS.NodeJS.LTS
  ```
  *(Restart your terminal after installation)*

### 2. Install Dependencies
In this folder (`frontend`), open your terminal and run:

```bash
npm install
```

### 3. Start Development Server
Run the local dev server:

```bash
npm run dev
```

Your app will open at `http://localhost:3000`.

---

## 📜 Available Scripts

- `npm run dev` - Starts the development server with Hot Module Replacement (HMR).
- `npm run build` - Builds production-ready files in the `dist` directory.
- `npm run preview` - Locally previews the production build.
