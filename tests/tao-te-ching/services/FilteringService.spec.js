import { task } from '../../../src/utils/task.js';
import { FilteringService } from '../../../src/apps/tao-te-ching/services/FilteringService.js';

describe('FilteringService', () => {
    const areas = { chapter: true, title: true, text: true, originalText: true };
    const config = Object.freeze({
        maxChars: 1000
    });
    const httpClientFactory = (result) => ({
        getJson: jasmine.createSpy().and.returnValue(
            result instanceof Error
                ? Promise.reject(result)
                : Promise.resolve(result)
        )
    });
    let service;

    describe('init', () => {
        it('set empty Data when no data received', async () => {
            const httpClient = httpClientFactory([]);
            service = new FilteringService(config, httpClient, task);

            await service.init();

            expect(service.Data.length).toBe(0);
            expect(httpClient.getJson).toHaveBeenCalledWith(
                config.dataUrl,
                null
            );
        });

        it('set empty Data on error', async () => {
            const httpClient = httpClientFactory(new Error('Splash!'));
            service = new FilteringService(config, httpClient, task);

            await service.init();

            expect(service.Data.length).toBe(0);
            expect(httpClient.getJson).toHaveBeenCalledWith(
                config.dataUrl,
                null
            );
        });

        it('handles cancellation via AbortSignal', async () => {
            const httpClient = {
                getJson: jasmine.createSpy().and.callFake((url, cancellationSignal = null) =>
                    new Promise((resolve, reject) => {
                        setTimeout(() =>
                            resolve(
                                [
                                    {
                                        chapter: '1',
                                        title: 'One',
                                        originalText: '一',
                                        text: 'One'
                                    }
                                ]
                            ),
                            1000
                        );
                        cancellationSignal?.addEventListener('abort', () => {
                            reject(new Error('Operation aborted'));
                        }, { once: true });
                    })
                )
            }
            service = new FilteringService(
                config,
                httpClient,
                task
            );
            const abortController = new AbortController();

            setTimeout(() => abortController.abort());
            await service.init(abortController.signal);

            expect(service.Data.length).toBe(0);
            expect(httpClient.getJson).toHaveBeenCalledWith(
                config.dataUrl,
                abortController.signal
            );
        });

        it('set received Data on success', async () => {
            const httpClient = httpClientFactory([
                {
                    chapter: '1',
                    title: 'One',
                    originalText: '一',
                    text: 'One'
                },
                {
                    chapter: '2',
                    title: 'Two',
                    originalText: '二',
                    text: 'Two'
                }
            ]);
            service = new FilteringService(config, httpClient, task);

            await service.init();

            expect(service.Data.length).toBe(2);
            expect(service.Data[0]).toEqual({
                key: '_1',
                ordinal: 0,
                chapter: '1',
                title: 'One',
                processedTitle: 'one',
                originalText: '一',
                processedOriginalText: '一',
                text: 'One',
                processedText: 'one'
            });
            expect(service.Data[1]).toEqual({
                key: '_2',
                ordinal: 1,
                chapter: '2',
                title: 'Two',
                processedTitle: 'two',
                originalText: '二',
                processedOriginalText: '二',
                text: 'Two',
                processedText: 'two'
            });
            expect(httpClient.getJson).toHaveBeenCalledWith(
                config.dataUrl,
                null
            );
        });
    });

    describe('search', () => {
        const data = [
            {
                chapter: '1',
                title: 'One',
                originalText: '一',
                text: 'One'
            },
            {
                chapter: '2',
                title: 'Two',
                originalText: '二',
                text: 'Two'
            },
            {
                chapter: '8',
                title: 'Eight',
                originalText: '八',
                text: 'Eight'
            },
            {
                chapter: '10',
                title: 'Ten',
                originalText: '十',
                text: 'Ten'
            },
            {
                chapter: '12',
                title: 'Twelve',
                originalText: '十二',
                text: 'Twelve'
            },
            {
                chapter: '21',
                title: 'Twenty One',
                originalText: '二十一',
                text: 'Twenty One'
            },
            {
                chapter: '23',
                title: 'Twenty Three',
                originalText: '二十三',
                text: 'Twenty Three'
            },
            {
                chapter: '44',
                title: 'Forty Four',
                originalText: '四十四',
                text: 'Forty Four'
            },
            {
                chapter: '56',
                title: 'Title',
                originalText: '五十六',
                text: 'Fifty Six'
            }
        ];
        const httpClient = httpClientFactory(data);

        beforeEach(async () => {
            service = new FilteringService(config, httpClient, task);

            await service.init();
        });

        it('returns empty when no data', async () => {
            service = new FilteringService(
                config,
                httpClientFactory([]),
                task
            );
            await service.init();

            const result = await service.search('test', areas);

            expect(result.length).toBe(0);
        });

        it('returns empty on falsy token', async () => {
            const result = await service.search(null, areas);

            expect(result.length).toBe(0);
        });

        it('returns empty on no areas specified', async () => {
            const result = await service.search(null, {});

            expect(result.length).toBe(0);
        });

        it('returns empty when token does not contain numbers or letters', async () => {
            const result = await service.search('% ^ &', areas);

            expect(result.length).toBe(0);
        });

        it('returns empty results for numeric token longer than 2 characters', async () => {
            const result = await service.search('123', areas);

            expect(result.length).toBe(0);
        });

        it('returns results for numeric token match a token of 1 character', async () => {
            const result = await service.search('2', areas);

            expect(result.length).toBe(4);
            expect(result[0].chapter).toBe('2');
            expect(result[1].chapter).toBe('12');
            expect(result[2].chapter).toBe('21');
            expect(result[3].chapter).toBe('23');
        });

        it('returns results for numeric token match a token of 2 characters', async () => {
            const result = await service.search('12', areas);

            expect(result.length).toBe(2);
            expect(result[0].chapter).toBe('12');
            expect(result[1].chapter).toBe('21');
        });

        it('returns results for title match', async () => {
            const result = await service.search('Title', { title: true });

            expect(result.length).toBe(1);
            expect(result[0].title).toBe('Title');
        });

        it('returns results for word match in Chinese', async () => {
            const result = await service.search('四', { originalText: true });

            expect(result.length).toBe(1);
            expect(result[0].originalText).toBe('四十四');
        });

        it('returns results for word match in English', async () => {
            const result = await service.search('Forty', { text: true });

            expect(result.length).toBe(1);
            expect(result[0].text).toBe('Forty Four');
        });

        it('returns results for chapter and title match', async () => {
            const result = await service.search('8 Title', { chapter: true, title: true });

            expect(result.length).toBe(2);
            expect(result[0].chapter).toBe('8');
            expect(result[1].title).toBe('Title');
        });

        it('returns results for chapter and word match in Chinese', async () => {
            const result = await service.search('44 五', { chapter: true, originalText: true });

            expect(result.length).toBe(2);
            expect(result[0].chapter).toBe('44');
            expect(result[1].originalText).toBe('五十六');
        });

        it('returns results for chapter and word match in English', async () => {
            const result = await service.search('44 Fifty', { chapter: true, text: true });

            expect(result.length).toBe(2);
            expect(result[0].chapter).toBe('44');
            expect(result[1].text).toBe('Fifty Six');
        });

        it('handles cancellation via AbortSignal', async () => {
            const abortController = new AbortController();

            setTimeout(() => abortController.abort());
            const result = await service
                .search('One', areas, abortController.signal)
                .catch(error => error);

            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe('Operation aborted');
        });
    });
});