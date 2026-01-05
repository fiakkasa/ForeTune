import { IndexPage } from './pages/IndexPage.js';

const uiConfig = Object.freeze({
    serviceWorkerDoneNotificationDelay: 750
});

const routes = [
    { path: '/:value', component: IndexPage },
    { path: '/', component: IndexPage }
];

async function appInit(configuration, services) {
    const { appConfig, appsConfig, serviceWorkerConfig, } = configuration;
    const { navigatorService, httpClient } = services;
    const { path = 'apps/navigator', urlFragment = '' } = appConfig;
    const router = VueRouter.createRouter({
        history: VueRouter.createWebHashHistory(`/${urlFragment}`),
        routes
    });
    const i18n = VueI18n.createI18n({
        legacy: false,
        locale: 'en-US',
        fallbackLocale: 'en',
        messages: {
            en: {
                main: 'Home',
                numerology_calculator: 'Numerology Calculator',
                angel_numbers: 'Angel Numbers',
                preparing_offline_support: 'Preparing offline support..'
            }
        }
    });

    const app = Vue.createApp({
        template: `<router-view />`
    });

    app.use(router);
    app.use(i18n);

    app.component('index-page', IndexPage);

    app.provide('appConfig', appConfig);
    app.provide('appsConfig', appsConfig);
    app.provide('uiConfig', uiConfig);
    app.provide('serviceWorkerConfig', serviceWorkerConfig);

    app.provide('navigatorService', navigatorService);

    const locale = 'en-US';
    const messages = await httpClient
        .getJson(`${path}/localization/${locale}.json`)
        .catch(error => {
            console.error(error);
            return {};
        });

    i18n.global.setLocaleMessage(locale, messages);
    i18n.global.locale.value = locale;

    return app;
}

export { appInit }
