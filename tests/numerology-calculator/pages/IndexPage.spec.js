import { SearchInputComponent } from '../../../src/components/SearchInputComponent.js';
import { task } from '../../../src/utils/task.js';
import { IndexPage } from '../../../src/apps/numerology-calculator/pages/IndexPage.js';
import { UiService } from '../../../src/apps/numerology-calculator/services/UiService.js';
import { DigitCalculatorService } from '../../../src/apps/numerology-calculator/services/DigitCalculatorService.js';
import { LetterCalculatorService } from '../../../src/apps/numerology-calculator/services/LetterCalculatorService.js';
import { LinksService } from '../../../src/apps/numerology-calculator/services/LinksService.js';
import { AdderTitleComponent } from '../../../src/apps/numerology-calculator/components/AdderTitleComponent.js';
import { CalculationResultComponent } from '../../../src/apps/numerology-calculator/components/CalculationResultComponent.js';
import { CalculationStepsComponent } from '../../../src/apps/numerology-calculator/components/CalculationStepsComponent.js';
import { DigitAdderComponent } from '../../../src/apps/numerology-calculator/components/DigitAdderComponent.js';
import { LetterAdderComponent } from '../../../src/apps/numerology-calculator/components/LetterAdderComponent.js';

describe('IndexPage', () => {
    const uiConfig = {
        maxSearchInputChars: 1000,
        uiDefaultDelay: 100,
        calculatorEquationSeparator: ' + ',
        calculatorEquationCombinedItemTemplate: '({0}: {1})'
    };

    const linksConfig = {
        url: 'https://number.academy/numerology/{0}'
    };

    const routes = [
        { path: '/:value', component: IndexPage },
        { path: '/', component: IndexPage }
    ];

    const delay = (value) =>
        new Promise((resolve) => setTimeout(() => resolve(true), value || 100));

    const mountPage = (initialRouteValue = '/') => {
        const container = document.createElement('div');
        document.body.appendChild(container);

        const router = VueRouter.createRouter({
            history: VueRouter.createWebHashHistory(),
            routes
        });
        const uiService = new UiService(uiConfig, task);
        const digitCalculatorService = new DigitCalculatorService(uiService, task);
        const letterCalculatorService = new LetterCalculatorService(uiService, task);
        const linksService = new LinksService(linksConfig, task);

        const app = Vue.createApp({
            template: `<router-view />`
        });

        app.use(router);

        app.component('adder-title', AdderTitleComponent);
        app.component('calculation-result', CalculationResultComponent);
        app.component('calculation-steps', CalculationStepsComponent);
        app.component('digit-adder', DigitAdderComponent);
        app.component('letter-adder', LetterAdderComponent);
        app.component('search-input', SearchInputComponent);
        app.component('index-page', IndexPage);

        app.provide('uiConfig', uiConfig);
        app.provide('linksService', linksService);
        app.provide('uiService', uiService);
        app.provide('digitCalculatorService', digitCalculatorService);
        app.provide('letterCalculatorService', letterCalculatorService);

        app.config.globalProperties.$t = (k) => k;

        app.mount(container);

        initialRouteValue && app.config.globalProperties.$router.push(initialRouteValue);

        return { app, container, router };
    };

    describe('Initial rendering', () => {
        it('renders empty', async () => {
            const { app, container } = mountPage();
            await delay();
            await Vue.nextTick();
            const searchInputEl = container.querySelector('input');

            expect(searchInputEl).toBeTruthy();
            expect(searchInputEl.getAttribute('value')).toBe('');

            await delay();
            await Vue.nextTick();

            expect(container.querySelector('.letter-adder')).toBeNull();
            expect(container.querySelector('.digit-adder')).toBeNull();

            app.unmount();
            container.remove();
        });

        it('transforms %20 and . as spaces', async () => {
            const { app, container } = mountPage('/?text=%20%20Hello.World%20%20');
            await delay();
            await Vue.nextTick();
            const searchInputEl = container.querySelector('input');

            expect(searchInputEl).toBeTruthy();
            expect(searchInputEl.getAttribute('value')).toBe('  Hello World  ');

            await delay();
            await Vue.nextTick();

            expect(container.querySelector('.letter-adder')).toBeTruthy();
            expect(container.querySelector('.digit-adder')).toBeNull();

            app.unmount();
            container.remove();
        });

        it('renders numbers only', async () => {
            const { app, container } = mountPage('/?text=123');
            await delay();
            await Vue.nextTick();
            const searchInputEl = container.querySelector('input');

            expect(searchInputEl).toBeTruthy();
            expect(searchInputEl.getAttribute('value')).toBe('123');

            await delay();
            await Vue.nextTick();

            expect(container.querySelector('.letter-adder')).toBeNull();
            expect(container.querySelector('.digit-adder')).toBeTruthy();

            app.unmount();
            container.remove();
        });

        it('renders letters only', async () => {
            const { app, container } = mountPage('/?text=abc');
            await delay();
            await Vue.nextTick();
            const searchInputEl = container.querySelector('input');

            expect(searchInputEl).toBeTruthy();
            expect(searchInputEl.getAttribute('value')).toBe('abc');

            await delay();
            await Vue.nextTick();

            expect(container.querySelector('.letter-adder')).toBeTruthy();
            expect(container.querySelector('.digit-adder')).toBeNull();

            app.unmount();
            container.remove();
        });

        it('renders numbers and letters', async () => {
            const { app, container } = mountPage('/?text=abc123');
            await delay();
            await Vue.nextTick();
            const searchInputEl = container.querySelector('input');

            expect(searchInputEl).toBeTruthy();
            expect(searchInputEl.getAttribute('value')).toBe('abc123');

            await delay();
            await Vue.nextTick();

            expect(container.querySelector('.letter-adder')).toBeTruthy();
            expect(container.querySelectorAll('.digit-adder')?.length).toBe(1);

            await delay();
            await Vue.nextTick();

            expect(container.querySelectorAll('.digit-adder')?.length).toBe(2);

            app.unmount();
            container.remove();
        });
    });

    describe('Input change rendering', () => {
        it('renders continuous input', async () => {
            const { app, container, router } = mountPage();
            await delay();
            await Vue.nextTick();
            const searchInputEl = container.querySelector('input');

            expect(searchInputEl).toBeTruthy();
            expect(searchInputEl.getAttribute('value')).toBe('');

            await delay();
            await Vue.nextTick();

            expect(container.querySelector('.letter-adder')).toBeNull();
            expect(container.querySelector('.digit-adder')).toBeNull();

            let navigatedRoutes = [];
            const text = '12ab';
            for (const ch of text) {
                searchInputEl.dispatchEvent(new KeyboardEvent('keydown', { key: ch, bubbles: true }));
                searchInputEl.value = searchInputEl.value + ch;
                searchInputEl.dispatchEvent(new InputEvent('input', { data: ch, bubbles: true, inputType: 'insertText' }));
                searchInputEl.dispatchEvent(new KeyboardEvent('keyup', { key: ch, bubbles: true }));

                await delay();
                await Vue.nextTick();

                navigatedRoutes.push(router.currentRoute.value.fullPath);
            }

            await delay();
            await Vue.nextTick();

            expect(searchInputEl.getAttribute('value')).toBe(text);
            expect(container.querySelector('.letter-adder')).toBeTruthy();
            expect(container.querySelectorAll('.digit-adder')?.length).toBe(1);

            await delay();
            await Vue.nextTick();

            expect(container.querySelectorAll('.digit-adder')?.length).toBe(2);

            expect(navigatedRoutes.length).toBe(text.length);

            let composed = '';
            for (let i = 0; i < text.length; i++) {
                composed += text[i];
                expect(navigatedRoutes[i]).toBe('/?text=' + composed);
            }

            expect(navigatedRoutes.at(-1)).toBe('/?text=' + text);

            app.unmount();
            container.remove();
        });
    });

    describe('Route change rendering', () => {
        it('renders route parameter', async () => {
            const { app, container, router } = mountPage();
            await delay();
            await Vue.nextTick();
            const searchInputEl = container.querySelector('input');

            expect(searchInputEl).toBeTruthy();
            expect(searchInputEl.getAttribute('value')).toBe('');

            await delay();
            await Vue.nextTick();

            expect(container.querySelector('.letter-adder')).toBeNull();
            expect(container.querySelector('.digit-adder')).toBeNull();

            let routeValue = '';
            let navigatedRoutes = [];
            const text = '12ab';
            for (const ch of text) {
                routeValue += ch;
                router.push({ query: { text: routeValue } });

                await delay();
                await Vue.nextTick();

                navigatedRoutes.push(router.currentRoute.value.fullPath);
            }

            await delay();
            await Vue.nextTick();

            expect(searchInputEl.getAttribute('value')).toBe(text);
            expect(container.querySelector('.letter-adder')).toBeTruthy();
            expect(container.querySelectorAll('.digit-adder')?.length).toBe(1);

            await delay();
            await Vue.nextTick();

            expect(container.querySelectorAll('.digit-adder')?.length).toBe(2);

            expect(navigatedRoutes.length).toBe(text.length);

            let composed = '';
            for (let i = 0; i < text.length; i++) {
                composed += text[i];
                expect(navigatedRoutes[i]).toBe('/?text=' + composed);
            }

            expect(navigatedRoutes.at(-1)).toBe('/?text=' + text);

            app.unmount();
            container.remove();
        });
    });
});
