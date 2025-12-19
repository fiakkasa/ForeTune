import { SearchInputComponent } from '../../components/SearchInputComponent.js';
import { task } from '../../utils/task.js';
import { IndexPage } from './pages/IndexPage.js';
import { FilteringService } from './services/FilteringService.js';
import { UiService } from './services/UiService.js';

const uiConfig = {
    maxSearchInputChars: 1000,
    uiDefaultDelay: 250
};

const routes = [
    { path: '/:value', component: IndexPage },
    { path: '/', component: IndexPage }
];

async function appInit(config = {}, storageService) {
    const {
        id = 'angel-numbers',
        path = 'apps/angel-numbers',
        urlFragment = 'angel-numbers'
    } = config;
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
                enter_your_values: 'Enter your values..',
                characters_of_max_characters: '{characters} / {maxCharacters}',
                items_of_total: '{items} of {total}',
                nothing_found: 'No items matched your search token..'
            }
        }
    });

    const filteringService = new FilteringService(task);
    const uiService = new UiService(uiConfig, task);

    const app = Vue.createApp({
        template: `<router-view />`
    });

    app.use(router);
    app.use(i18n);

    app.component('search-input', SearchInputComponent);
    app.component('index-page', IndexPage);

    app.provide('appConfig', config);
    app.provide('uiConfig', uiConfig);

    app.provide('filteringService', filteringService);
    app.provide('uiService', uiService);

    const locale = 'en-US';
    const localeStorageKey = `${id}__localization[${locale}]`;
    let messages = storageService.get(localeStorageKey) || {};

    if (!Object.values(messages).length) {
        messages = await fetch(`${path}/localization/${locale}.json`)
            .then(response => response.json())
            .catch(error => {
                console.error(error);
                return {};
            });
        storageService.set(localeStorageKey, messages);
    }

    i18n.global.setLocaleMessage(locale, messages);
    i18n.global.locale.value = locale;

    const dataStorageKey = `${id}__data`;
    let data = storageService.get(dataStorageKey) || [];

    if (!data.length) {
        data = await fetch(`${path}/assets/data.json`)
            .then(response => response.json())
            .catch(error => {
                console.error(error);
                return [];
            });
        storageService.set(dataStorageKey, data);
    }
    filteringService.Data = data;

    return app;
}

export { appInit }
