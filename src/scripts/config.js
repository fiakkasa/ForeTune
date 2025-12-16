const appsConfig = {
    main: {
        title: 'main',
        urlFragment: '',
        path: 'apps/navigator',
        id: 'navigator',
        icon: 'oi oi-home',
        activeCssClass: 'btn-success',
        inactiveCssClass: '',
    },
    numerologyCalculator: {
        title: 'numerology_calculator',
        urlFragment: 'numerology-calculator',
        path: 'apps/numerology-calculator',
        id: 'numerology-calculator',
        icon: 'oi oi-calculator',
        activeCssClass: 'btn-danger',
        inactiveCssClass: '',
    },
    angelNumbers: {
        title: 'angel_numbers',
        urlFragment: 'angel-numbers',
        path: 'apps/angel-numbers',
        id: 'angel-numbers',
        icon: 'oi oi-cloud',
        activeCssClass: 'btn-primary',
        inactiveCssClass: '',
    }
};
const urlConfig = {
    prefix: '#/'
};
const loaderConfig = {
    timeout: 375
};
const storageConfig = {
    namespace: 'foretune__',
    name: 'ls',
    storage: 'session'
};

export { appsConfig, urlConfig, loaderConfig, storageConfig }
