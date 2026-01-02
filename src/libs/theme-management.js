const _darkModePreferenceQuery = '(prefers-color-scheme: dark)';
const _darkModePreferenceQueryList = window.matchMedia(_darkModePreferenceQuery);
const _themeAttribute = 'data-bs-theme';
const _darkThemeKey = 'dark';
const _lightThemeKey = 'light';
const _supportedThemes = {
    [_darkThemeKey]: 'dark',
    [_lightThemeKey]: 'light'
};

const setTheme = (themeKey) => {
    try {
        const theme = _supportedThemes[themeKey];

        if (
            !theme
            || document.body.getAttribute(_themeAttribute) === theme
        ) {
            return;
        }

        document.body.setAttribute(_themeAttribute, theme);
    } catch (error) {
        console.error(error);
    }
};

const resolveThemePreference = () => {
    try {
        return window.matchMedia(_darkModePreferenceQuery)?.matches === true
            ? _darkThemeKey
            : _lightThemeKey;
    } catch {
        return _darkThemeKey;
    }
};

const autoSetTheme = () => setTheme(resolveThemePreference());

_darkModePreferenceQueryList.addEventListener('change', autoSetTheme);
window.addEventListener('load', autoSetTheme);
