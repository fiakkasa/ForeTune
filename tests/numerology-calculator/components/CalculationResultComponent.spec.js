import { CalculationResultComponent } from '../../../src/apps/numerology-calculator/components/CalculationResultComponent.js';

describe('CalculationResultComponent', () => {
    const mountComponent = (props = {}, linksServiceMock = {}) => {
        const container = document.createElement('div');
        document.body.appendChild(container);

        const app = Vue.createApp({
            render() { return Vue.h(CalculationResultComponent, props); }
        });

        app.provide('linksService', linksServiceMock);

        app.mount(container);

        return { app, container };
    };

    it('renders an anchor when linksService.isEligible returns true', async () => {
        const mockUrl = '/other-app/42';
        const linksServiceMock = {
            isEligible: (text) => true,
            getUrl: (text) => mockUrl
        };
        const { app, container } = mountComponent({ text: '42' }, linksServiceMock);
        await Vue.nextTick();

        const el = container.querySelector('div.btn.nc-result');

        expect(el).toBeTruthy();
        expect(el.textContent).toBe('42');

        app.unmount();
        container.remove();
    });

    it('renders a div when linksService.isEligible returns false', async () => {
        const linksServiceMock = {
            isEligible: (text) => false,
            getUrl: (text) => '/should/not/use'
        };
        const { app, container } = mountComponent({ text: 'NoLink' }, linksServiceMock);
        await Vue.nextTick();

        const anchorEl = container.querySelector('div.btn.nc-result');
        expect(anchorEl).toBeNull();

        const divEl = container.querySelector('div.nc-result');
        expect(divEl).toBeTruthy();
        expect(divEl.textContent).toBe('NoLink');

        app.unmount();
        container.remove();
    });
});
