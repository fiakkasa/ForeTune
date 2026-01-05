import { httpClient } from '../../../src/utils/httpClient.js';

describe('httpClient', () => {
    describe('getJson', () => {
        beforeEach(() => {
            window.__fetch = window.fetch;
            window.fetch = null;
        });

        afterEach(() => {
            window.fetch = window.__fetch;
        });

        it('executes call and returns result', async () => {
            spyOn(window, 'fetch').and.returnValue(
                Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve({ a: 1 })
                })
            );

            const result = await httpClient.getJson('http://test.com');

            expect(result).toEqual({ a: 1 });
            expect(window.fetch).toHaveBeenCalledWith(
                'http://test.com',
                jasmine.any(Object)
            );
        });

        it('executes call and returns error on http exception', async () => {
            spyOn(window, 'fetch').and.returnValue(
                Promise.reject(new Error('Splash!'))
            );

            const result = await httpClient
                .getJson('http://test.com')
                .catch(error => error);

            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe('Splash!');
            expect(window.fetch).toHaveBeenCalledWith(
                'http://test.com',
                jasmine.any(Object)
            );
        });

        it('executes call and returns error on json evaluation', async () => {
            spyOn(window, 'fetch').and.returnValue(
                Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.reject(new Error('Splash!'))
                })
            );

            const result = await httpClient
                .getJson('http://test.com')
                .catch(error => error);

            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe('Splash!');
            expect(window.fetch).toHaveBeenCalledWith(
                'http://test.com',
                jasmine.any(Object)
            );
        });

        it('handles cancellation when AbortSignal is aborted', async () => {
            const abortController = new AbortController();

            spyOn(window, 'fetch').and.callFake((url, options) =>
                new Promise((resolve, reject) => {
                    setTimeout(() =>
                        resolve({
                            ok: true,
                            status: 200,
                            json: () => Promise.resolve({ a: 1 })
                        }),
                        1000
                    );
                    options?.signal?.addEventListener('abort', () => {
                        reject(new Error('Operation aborted'));
                    }, { once: true });
                })
            );

            setTimeout(() => abortController.abort());
            const result = await httpClient
                .getJson('http://test.com', abortController.signal)
                .catch(error => error);

            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe('Operation aborted');
            expect(window.fetch).toHaveBeenCalledWith(
                'http://test.com',
                jasmine.any(Object)
            );
        });
    });
});
