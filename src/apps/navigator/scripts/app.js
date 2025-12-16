import { IndexPage } from './pages/IndexPage.js';

const routes = [
    { path: '/:value', component: IndexPage },
    { path: '/', component: IndexPage }
];

async function appInit(config = {}, appsConfig = {}) {
    const { path = '', urlFragment = '' } = config;
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
                numerology_calculator: 'Numerology Calculator'
            }
        }
    });

    const app = Vue.createApp({
        template: `<router-view />`
    });

    app.use(router);
    app.use(i18n);

    app.component('index-page', IndexPage);
    app.provide('config', config);
    app.provide('appsConfig', appsConfig);

    const locale = 'en-US';
    const messages = await fetch(`${path}/localization/${locale}.json`)
        .then(response => response.json())
        .catch(error => {
            console.error(error);
            return {};
        });

    i18n.global.setLocaleMessage(locale, messages);
    i18n.global.locale.value = locale;

    return app;
}

export { appInit }
