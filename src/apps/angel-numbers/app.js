import { SearchInputComponent } from '../../components/SearchInputComponent.js';
import { IndexPage } from './pages/IndexPage.js';
import { BookmarksService } from './services/BookmarksService.js';
import { FilteringService } from './services/FilteringService.js';
import { UiService } from './services/UiService.js';

const uiConfig = Object.freeze({
    maxSearchInputChars: 1000,
    uiDefaultDelay: 500
});

const filteringConfig = Object.freeze({
    dataUrl: 'apps/angel-numbers/assets/data.json',
    maxChars: uiConfig.maxSearchInputChars
});

const bookmarksConfig = Object.freeze({
    storageKey: 'angel-numbers.bookmarks'
});

const routes = [
    { path: '/:value', component: IndexPage },
    { path: '/', component: IndexPage }
];

async function appInit(configuration, services) {
    const { appConfig } = configuration;
    const { storageService, task, httpClient } = services;
    const { path = 'apps/angel-numbers', urlFragment = 'angel-numbers' } = appConfig;
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
                nothing_found: 'No items matched your search token..',
                clear_bookmarks: 'Clear bookmarks',
                view_only_bookmarks: 'View only bookmarks',
                x_bookmarks_will_be_removed: '| {count} bookmark will be removed! | {count} bookmarks will be removed!',
                ok: 'OK',
                cancel: 'Cancel'
            }
        }
    });

    const filteringService = new FilteringService(
        filteringConfig,
        httpClient,
        task
    );
    const bookmarksService = new BookmarksService(
        bookmarksConfig,
        storageService,
        task
    );
    const uiService = new UiService(uiConfig, task);

    const app = Vue.createApp({
        template: `<router-view />`
    });

    app.use(router);
    app.use(i18n);
    app.use(VuejsDialog.PromiseDialog, { animation: 'bounce' });

    app.component('search-input', SearchInputComponent);
    app.component('index-page', IndexPage);

    app.provide('appConfig', appConfig);
    app.provide('uiConfig', uiConfig);

    app.provide('filteringService', filteringService);
    app.provide('bookmarksService', bookmarksService);
    app.provide('uiService', uiService);

    const locale = 'en-US';
    const [messages] = await Promise.all([
        httpClient
            .getJson(`${path}/localization/${locale}.json`)
            .catch(error => {
                console.error(error);
                return {};
            }),
        filteringService.init(),
        bookmarksService.init()
    ]);

    i18n.global.setLocaleMessage(locale, messages);
    i18n.global.locale.value = locale;

    return app;
}

export { appInit }
