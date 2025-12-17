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
const storageConfig = {
    namespace: 'foretune__',
    name: 'ls',
    storage: 'session'
};

export { appsConfig, urlConfig, uiConfig, storageConfig }
