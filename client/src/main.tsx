import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Custom styles for mobile optimization
const addMobileStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    /* Custom scrollbar */
    ::-webkit-scrollbar {
      width: 6px;
    }
    ::-webkit-scrollbar-track {
      background: #1e1e1e;
    }
    ::-webkit-scrollbar-thumb {
      background: #093624;
      border-radius: 3px;
    }
    
    /* Hide scrollbar in folder navigation */
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .hide-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    
    /* Rich text editor styles */
    .editor-content {
      min-height: 200px;
    }
    
    /* Dark theme for TipTap editor */
    .ProseMirror {
      color: white;
      outline: none;
    }
    
    .ProseMirror p {
      margin-bottom: 0.75em;
    }
    
    .ProseMirror ul,
    .ProseMirror ol {
      padding-left: 1.5em;
      margin-bottom: 0.75em;
    }
    
    .ProseMirror h1 {
      font-size: 1.5em;
      font-weight: 600;
      margin-bottom: 0.5em;
    }
    
    .ProseMirror h2 {
      font-size: 1.3em;
      font-weight: 600;
      margin-bottom: 0.5em;
    }
    
    .ProseMirror a {
      color: #4dabf7;
      text-decoration: underline;
    }
    
    .ProseMirror img {
      max-width: 100%;
      height: auto;
    }
    
    /* Desktop message */
    @media (min-width: 768px) {
      .desktop-message {
        display: flex;
      }
      .mobile-app {
        display: none;
      }
    }
  `;
  document.head.appendChild(style);
};

// Add meta tags for viewport and theme color
const addMetaTags = () => {
  // Theme color meta tag
  const themeColorMeta = document.createElement('meta');
  themeColorMeta.name = 'theme-color';
  themeColorMeta.content = '#093624';
  document.head.appendChild(themeColorMeta);
  
  // Title
  document.title = 'NoteGreen';
};

// Initialize the app
const initApp = () => {
  addMobileStyles();
  addMetaTags();
  
  createRoot(document.getElementById("root")!).render(<App />);
};

initApp();
