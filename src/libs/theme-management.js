const _darkModePreferenceQuery = '(prefers-color-scheme: dark)';
const _darkModePreferenceQueryList = window.matchMedia(_darkModePreferenceQuery);
const _themeAttribute = 'data-bs-theme';
const _darkTheme = 'dark';
const _lightTheme = 'light';
const _supportedThemes = {
    dark: _darkTheme,
    light: _lightTheme
};

const setTheme = (theme) => {
    try {
        const resolvedTheme = _supportedThemes[theme];

        if (!resolvedTheme) {
            return;
        }

        if (document.body.getAttribute(_themeAttribute) === resolvedTheme) {
            return;
        }

        document.body.setAttribute(_themeAttribute, resolvedTheme);
    } catch {
    }
};

const resolveThemePreference = () => {
    try {
        const prefersDarkMode = window.matchMedia(_darkModePreferenceQuery)?.matches === true;

        return prefersDarkMode ? _darkTheme : _lightTheme;
    } catch {
        return _darkTheme;
    }
};

const autoSetTheme = () => setTheme(resolveThemePreference());

_darkModePreferenceQueryList.addEventListener('change', autoSetTheme);
window.addEventListener('load', autoSetTheme);
