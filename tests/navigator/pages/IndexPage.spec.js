import { IndexPage } from '../../../src/apps/navigator/pages/IndexPage.js';

describe('IndexPage', function () {
    const appsConfig = {
        main: {
            title: 'main',
            urlFragment: '',
            path: 'apps/navigator',
            id: 'navigator',
            icon: 'oi oi-home',
            activeCssClass: '',
            inactiveCssClass: '',
        },
        numerologyCalculator: {
            title: 'numerology_calculator',
            urlFragment: 'numerology-calculator',
            path: 'apps/numerology-calculator',
            id: 'numerology-calculator',
            icon: 'oi oi-calculator',
            activeCssClass: 'btn-primary',
            inactiveCssClass: 'btn-secondary',
        }
    };

    const uiConfig = {
        serviceWorkerDoneNotificationDelay: 750
    };

    const serviceWorkerConfig = {
        path: './sw.js',
        scope: './',
        type: 'classic' // or 'module'
    };

    const routes = [
        { path: '/:value', component: IndexPage },
        { path: '/', component: IndexPage }
    ];

    function delay(value) {
        return new Promise((resolve) => setTimeout(() => resolve(true), value || 100));
    }

    function mountPage(initialRouteValue = '/', mockNavigatorService = null) {
        const container = document.createElement('div');
        document.body.appendChild(container);

        const router = VueRouter.createRouter({
            history: VueRouter.createWebHashHistory(),
            routes
        });

        const app = Vue.createApp({
            template: `<router-view />`
        });

        app.use(router);

        app.component('index-page', IndexPage);
        app.provide('config', appsConfig.main);
        app.provide('appsConfig', appsConfig);
        app.provide('uiConfig', uiConfig);
        app.provide('serviceWorkerConfig', serviceWorkerConfig);

        app.provide('navigatorService', mockNavigatorService || navigator);

        app.config.globalProperties.$t = (k) => k;

        app.mount(container);

        initialRouteValue && app.config.globalProperties.$router.push(initialRouteValue);

        return { app, container, router };
    }

    describe('Initial rendering', function () {
        it('renders stand alone on empty route', async function () {
            const { app, container } = mountPage();
            await delay();
            await Vue.nextTick();

            expect(container.querySelector('.nv-app:not(.nv-sidebar)')).toBeTruthy();
            expect(container.querySelectorAll('button.btn')?.length).toBe(2);
            expect(container.querySelector('button.btn-primary').getAttribute('title')).toBe('main');

            app.unmount();
            container.remove();
        });

        it('renders stand alone on non existent route', async function () {
            const { app, container } = mountPage('/some-page');
            await delay();
            await Vue.nextTick();

            expect(container.querySelector('.nv-app:not(.nv-sidebar)')).toBeTruthy();
            expect(container.querySelectorAll('button.btn')?.length).toBe(2);
            expect(container.querySelector('button.btn-primary').getAttribute('title')).toBe('main');

            app.unmount();
            container.remove();
        });

        it('renders existing page', async function () {
            const { app, container } = mountPage('/numerology-calculator');
            await delay();
            await Vue.nextTick();

            expect(container.querySelector('.nv-app:not(.nv-sidebar)')).toBeNull();
            expect(container.querySelectorAll('button.btn')?.length).toBe(2);
            expect(container.querySelector('button.btn-primary').getAttribute('title')).toBe('numerology_calculator');

            app.unmount();
            container.remove();
        });
    });

    describe('Selection change rendering', function () {
        it('renders switch between standalone to sidebar', async function () {
            const { app, container, router } = mountPage();
            await delay();
            await Vue.nextTick();

            expect(container.querySelector('.nv-app:not(.nv-sidebar)')).toBeTruthy();
            expect(container.querySelectorAll('button.btn')?.length).toBe(2);
            expect(container.querySelector('button.btn-primary').getAttribute('title')).toBe('main');
            expect(router.currentRoute.value.fullPath).toBe('/');

            container.querySelector('button.btn-secondary').click();

            await delay();
            await Vue.nextTick();

            expect(container.querySelector('.nv-app:not(.nv-sidebar)')).toBeNull();
            expect(container.querySelectorAll('button.btn')?.length).toBe(2);
            expect(container.querySelector('button.btn-primary').getAttribute('title')).toBe('numerology_calculator');
            expect(router.currentRoute.value.fullPath).toBe('/numerology-calculator');

            app.unmount();
            container.remove();
        });

        it('renders switch between sidebar and standalone', async function () {
            const { app, container, router } = mountPage('/numerology-calculator');
            await delay();
            await Vue.nextTick();

            expect(container.querySelector('.nv-app:not(.nv-sidebar)')).toBeNull();
            expect(container.querySelectorAll('button.btn')?.length).toBe(2);
            expect(container.querySelector('button.btn-primary').getAttribute('title')).toBe('numerology_calculator');
            expect(router.currentRoute.value.fullPath).toBe('/numerology-calculator');

            container.querySelector('button.btn-secondary').click();

            await delay();
            await Vue.nextTick();

            expect(container.querySelector('.nv-app:not(.nv-sidebar)')).toBeTruthy();
            expect(container.querySelectorAll('button.btn')?.length).toBe(2);
            expect(container.querySelector('button.btn-primary').getAttribute('title')).toBe('main');
            expect(router.currentRoute.value.fullPath).toBe('/');

            app.unmount();
            container.remove();
        });

        it('ignore when same page clicked', async function () {
            const { app, container, router } = mountPage('/numerology-calculator');
            await delay();
            await Vue.nextTick();

            expect(container.querySelector('.nv-app:not(.nv-sidebar)')).toBeNull();
            expect(container.querySelectorAll('button.btn')?.length).toBe(2);
            expect(container.querySelector('button.btn-primary').getAttribute('title')).toBe('numerology_calculator');
            expect(router.currentRoute.value.fullPath).toBe('/numerology-calculator');

            container.querySelector('button.btn-primary').click();

            await delay();
            await Vue.nextTick();

            expect(container.querySelector('.nv-app:not(.nv-sidebar)')).toBeNull();
            expect(container.querySelectorAll('button.btn')?.length).toBe(2);
            expect(container.querySelector('button.btn-primary').getAttribute('title')).toBe('numerology_calculator');
            expect(router.currentRoute.value.fullPath).toBe('/numerology-calculator');

            app.unmount();
            container.remove();
        });
    });

    describe('Route change rendering', function () {
        it('renders page change', async function () {
            const { app, container, router } = mountPage();
            await delay();
            await Vue.nextTick();

            expect(container.querySelector('.nv-app:not(.nv-sidebar)')).toBeTruthy();
            expect(container.querySelectorAll('button.btn')?.length).toBe(2);
            expect(container.querySelector('button.btn-primary').getAttribute('title')).toBe('main');
            expect(router.currentRoute.value.fullPath).toBe('/');

            router.push('/numerology-calculator');

            await delay();
            await Vue.nextTick();

            expect(container.querySelector('.nv-app:not(.nv-sidebar)')).toBeNull();
            expect(container.querySelectorAll('button.btn')?.length).toBe(2);
            expect(container.querySelector('button.btn-primary').getAttribute('title')).toBe('numerology_calculator');
            expect(router.currentRoute.value.fullPath).toBe('/numerology-calculator');

            router.push('/');

            await delay();
            await Vue.nextTick();

            expect(container.querySelector('.nv-app:not(.nv-sidebar)')).toBeTruthy();
            expect(container.querySelectorAll('button.btn')?.length).toBe(2);
            expect(container.querySelector('button.btn-primary').getAttribute('title')).toBe('main');
            expect(router.currentRoute.value.fullPath).toBe('/');

            app.unmount();
            container.remove();
        });
    });
});
