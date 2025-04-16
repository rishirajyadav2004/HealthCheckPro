import React from "react";
import { useTheme } from "../contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";

const SettingsPage = () => {
  const { darkMode, setDarkMode } = useTheme();

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="settings-container">
      <h2 className="settings-title">Settings</h2>
      <div className="theme-toggle-container">
        <span className="theme-label">Theme:</span>
        <button
          onClick={toggleTheme}
          className={`theme-toggle-btn ${darkMode ? 'light' : 'dark'}`}
        >
          {darkMode ? (
            <>
              <Sun size={16} className="theme-icon" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon size={16} className="theme-icon" />
              <span>Dark Mode</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;