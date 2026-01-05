import { SearchInputComponent } from '../../components/SearchInputComponent.js';
import { AdderTitleComponent } from './components/AdderTitleComponent.js';
import { CalculationResultComponent } from './components/CalculationResultComponent.js';
import { CalculationStepsComponent } from './components/CalculationStepsComponent.js';
import { DigitAdderComponent } from './components/DigitAdderComponent.js';
import { LetterAdderComponent } from './components/LetterAdderComponent.js';
import { IndexPage } from './pages/IndexPage.js';
import { UiService } from './services/UiService.js';
import { DigitCalculatorService } from './services/DigitCalculatorService.js';
import { LetterCalculatorService } from './services/LetterCalculatorService.js';
import { LinksService } from './services/LinksService.js';

const uiConfig = Object.freeze({
    maxSearchInputChars: 1000,
    uiDefaultDelay: 250,
    calculatorEquationSeparator: ' + ',
    calculatorEquationCombinedItemTemplate: '({0}: {1})'
});

const linksConfig = Object.freeze({
    url: '/angel-numbers',
    queryParameterName: 'text'
});

const routes = [
    { path: '/:value', component: IndexPage },
    { path: '/', component: IndexPage }
];

async function appInit(configuration, services) {
    const { appConfig } = configuration;
    const { httpClient, task } = services;
    const { path = 'apps/numerology-calculator', urlFragment = 'numerology-calculator' } = appConfig;
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
                digit_calculation: 'Numeric Calculation',
                letter_calculation: 'Letter Calculation',
                combined_calculation: 'Combined Calculation',
                characters_of_max_characters: '{characters} / {maxCharacters}',
            }
        }
    });

    const uiService = new UiService(uiConfig, task);
    const digitCalculatorService = new DigitCalculatorService(uiService, task);
    const letterCalculatorService = new LetterCalculatorService(uiService, task);
    const linksService = new LinksService(linksConfig);

    const app = Vue.createApp({
        template: `<router-view />`
    });

    app.use(router);
    app.use(i18n);

    app.component('adder-title', AdderTitleComponent);
    app.component('calculation-result', CalculationResultComponent);
    app.component('calculation-steps', CalculationStepsComponent);
    app.component('digit-adder', DigitAdderComponent);
    app.component('letter-adder', LetterAdderComponent);
    app.component('search-input', SearchInputComponent);
    app.component('index-page', IndexPage);

    app.provide('appConfig', appConfig);
    app.provide('uiConfig', uiConfig);

    app.provide('linksService', linksService);
    app.provide('uiService', uiService);
    app.provide('digitCalculatorService', digitCalculatorService);
    app.provide('letterCalculatorService', letterCalculatorService);

    const locale = 'en-US';
    const messages = await httpClient
        .getJson(`${path}/localization/${locale}.json`)
        .catch(error => {
            console.error(error);
            return [];
        });

    i18n.global.setLocaleMessage(locale, messages);
    i18n.global.locale.value = locale;

    return app;
}

export { appInit };
