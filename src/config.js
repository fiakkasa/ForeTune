const appsConfig = {
    main: {
        title: 'main',
        urlFragment: '',
        path: 'apps/navigator',
        id: 'navigator',
        icon: 'fa-regular fa-house',
        activeCssClass: 'btn-success',
        inactiveCssClass: '',
    },
    numerologyCalculator: {
        title: 'numerology_calculator',
        urlFragment: 'numerology-calculator',
        path: 'apps/numerology-calculator',
        id: 'numerology-calculator',
        icon: 'fa-solid fa-calculator',
        activeCssClass: 'btn-danger',
        inactiveCssClass: '',
    },
    angelNumbers: {
        title: 'angel_numbers',
        urlFragment: 'angel-numbers',
        path: 'apps/angel-numbers',
        id: 'angel-numbers',
        icon: 'fa-solid fa-feather-pointed',
        activeCssClass: 'btn-primary',
        inactiveCssClass: '',
    }
};
const urlConfig = {
    baseUrlPrefix: '#/'
};
const uiConfig = {
    loaderTimeout: 375
};
const singleSpaConfig = {
    bootstrapMaxTimeMillis: 3000,
    bootstrapMaxTimeDieOnTimeout: false,
    bootstrapMaxTimeWarningMillis: 10000,
    mountMaxTimeMillis: 3000,
    mountMaxTimeDieOnTimeout: false,
    mountMaxTimeWarningMillis: 10000,
    unmountMaxTimeMillis: 3000,
    unmountMaxTimeDieOnTimeout: false,
    unmountMaxTimeWarningMillis: 10000,
    unloadMaxTimeMillis: 3000,
    unloadMaxTimeDieOnTimeout: false,
    unloadMaxTimeWarningMillis: 10000
};
// note: ensure scope and start_url in manifest.json are aligned
const serviceWorkerConfig = {
    path: './sw.js',
    scope: './',
    type: 'classic' // 'classic' or 'none' to disable
};

export { appsConfig, urlConfig, uiConfig, singleSpaConfig, serviceWorkerConfig }
