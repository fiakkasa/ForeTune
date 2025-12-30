import { SearchInputComponent } from '../../components/SearchInputComponent.js';
import { task } from '../../utils/task.js';
import { IndexPage } from './pages/IndexPage.js';
import { FilteringService } from './services/FilteringService.js';
import { UiService } from './services/UiService.js';

const uiConfig = {
    maxSearchInputChars: 1000,
    uiDefaultDelay: 250
};

const filteringConfig = {
    maxChars: uiConfig.maxSearchInputChars
};

const routes = [
    { path: '/:value', component: IndexPage },
    { path: '/', component: IndexPage }
];

async function appInit(configuration, services) {
    const { appConfig } = configuration;
    const {
        path = 'apps/angel-numbers',
        urlFragment = 'angel-numbers'
    } = appConfig;
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

    const filteringService = new FilteringService(filteringConfig, task);
    const uiService = new UiService(uiConfig, task);

    const app = Vue.createApp({
        template: `<router-view />`
    });

    app.use(router);
    app.use(i18n);

    app.component('search-input', SearchInputComponent);
    app.component('index-page', IndexPage);

    app.provide('appConfig', appConfig);
    app.provide('uiConfig', uiConfig);

    app.provide('filteringService', filteringService);
    app.provide('uiService', uiService);

    const locale = 'en-US';
    const [messages, data] = await Promise.all([
        fetch(`${path}/localization/${locale}.json`)
            .then(response => response.json())
            .catch(error => {
                console.error(error);
                return {};
            }),
        fetch(`${path}/assets/data.json`)
            .then(response => response.json())
            .catch(error => {
                console.error(error);
                return [];
            })
    ]);

    i18n.global.setLocaleMessage(locale, messages);
    i18n.global.locale.value = locale;
    filteringService.Data = data;

    return app;
}

export { appInit }
