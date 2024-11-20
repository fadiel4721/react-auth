import { useContext } from "react";
import ThemeContext from "../context/ThemeContext";

const ThemeSwitcher = () => {
    const { theme, toggleTheme } = useContext(ThemeContext);

    return (
        <div className="theme-switcher">
            <span>Current theme: {theme.charAt(0).toUpperCase() + theme.slice(1)}</span>
            <button onClick={toggleTheme} className="btn btn-sm btn-outline-light ms-2">
                {theme === "light" ? "Switch to Dark" : "Switch to Light"}
            </button>
        </div>
    );
};

export default ThemeSwitcher;
