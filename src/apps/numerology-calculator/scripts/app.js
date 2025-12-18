import { SearchInputComponent } from '../../../../scripts/components/SearchInputComponent.js';
import { task } from '../../../../scripts/utils/task.js';
import { AdderTitleComponent } from './components/AdderTitleComponent.js';
import { CalculationResultComponent } from './components/CalculationResultComponent.js';
import { CalculationStepsComponent } from './components/CalculationStepsComponent.js';
import { DigitAdderComponent } from './components/DigitAdderComponent.js';
import { LetterAdderComponent } from './components/LetterAdderComponent.js';
import { IndexPage } from './pages/IndexPage.js';
import { NumerologyUiService } from './services/NumerologyUiService.js';
import { NumerologyDigitCalculatorService } from './services/NumerologyDigitCalculatorService.js';
import { NumerologyLetterCalculatorService } from './services/NumerologyLetterCalculatorService.js';
import { NumerologyLinksService } from './services/NumerologyLinksService.js';

const uiConfig = {
    maxSearchInputChars: 1000,
    uiDefaultDelay: 250,
    calculatorEquationSeparator: ' + ',
    calculatorEquationCombinedItemTemplate: '({0}: {1})'
};

const linksConfig = {
    url: 'https:/number.academy/numerology/{0}'
};

const routes = [
    { path: '/:value', component: IndexPage },
    { path: '/', component: IndexPage }
];

async function appInit(config = {}, storageService) {
    const {
        id = 'numerology-calculator',
        path = 'apps/numerology-calculator',
        urlFragment = 'numerology-calculator'
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
                digit_calculation: 'Numeric Calculation',
                letter_calculation: 'Letter Calculation',
                combined_calculation: 'Combined Calculation',
                characters_of_max_characters: '{characters} / {maxCharacters}',
            }
        }
    });

    const uiService = new NumerologyUiService(uiConfig, task);
    const digitCalculatorService = new NumerologyDigitCalculatorService(uiService, task);
    const letterCalculatorService = new NumerologyLetterCalculatorService(uiService, task);
    const linksService = new NumerologyLinksService(linksConfig);

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

    app.provide('appConfig', config);
    app.provide('uiConfig', uiConfig);
    app.provide('linksService', linksService);
    app.provide('uiService', uiService);
    app.provide('digitCalculatorService', digitCalculatorService);
    app.provide('letterCalculatorService', letterCalculatorService);

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

    return app;
}

export { appInit };
