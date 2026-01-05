import { task } from '../../../src/utils/task.js';
import { FilteringService } from '../../../src/apps/angel-numbers/services/FilteringService.js';

describe('FilteringService', () => {
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
                            resolve([{ number: '1', text: 'One' }]),
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
                    number: '0',
                    text: 'Zero',
                },
                {
                    number: '1',
                    text: ' OnE ',
                }
            ]);
            service = new FilteringService(config, httpClient, task);

            await service.init();

            expect(service.Data.length).toBe(2);
            expect(service.Data[0]).toEqual({
                key: '_0',
                ordinal: 0,
                number: '0',
                text: 'Zero',
                processedText: 'zero'
            });
            expect(service.Data[1]).toEqual({
                key: '_1',
                ordinal: 1,
                number: '1',
                text: ' OnE ',
                processedText: 'one'
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
                number: '00',
                text: 'Zero Zero',
            },
            {
                number: '0',
                text: 'Zero',
            },
            {
                number: '1',
                text: 'One',
            },
            {
                number: '2',
                text: 'Two',
            },
            {
                number: '10',
                text: 'Ten',
            },
            {
                number: '11',
                text: 'Eleven',
            },
            {
                number: '12',
                text: 'Twelve',
            },
            {
                number: '13',
                text: 'Thirteen',
            },
            {
                number: '100',
                text: 'One Hundred',
            },
            {
                number: '101',
                text: 'One Hundred One',
            },
            {
                number: '102',
                text: 'One Hundred Two',
            },
            {
                number: '111',
                text: 'One Hundred Eleven',
            },
            {
                number: '112',
                text: 'One Hundred Twelve',
            },
            {
                number: '123',
                text: 'One Hundred Twenty Three',
            },
            {
                number: '231',
                text: 'Two Hundred Thirty One',
            },
            {
                number: '321',
                text: 'Three Hundred Twenty One',
            },
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

            const result = await service.search('test');

            expect(result.length).toBe(0);
        });

        it('returns empty on falsy token', async () => {
            const result = await service.search();

            expect(result.length).toBe(0);
        });

        it('returns empty when token does not contain numbers or letters', async () => {
            const result = await service.search('% ^ &');

            expect(result.length).toBe(0);
        });

        it('returns empty results for numeric token longer than 3 characters', async () => {
            const result = await service.search('1234');

            expect(result.length).toBe(0);
        });

        it('returns results for numeric token 00 and numbers containing 0', async () => {
            const result = await service.search('00');

            expect(result.length).toBe(6);
            expect(result[0].number).toBe('00');
            expect(result[1].number).toBe('0');
            expect(result[2].number).toBe('10');
            expect(result[5].number).toBe('102');
        });

        it('returns results for numeric token 0 and numbers containing 0', async () => {
            const result = await service.search('0');

            expect(result.length).toBe(6);
            expect(result[0].number).toBe('0');
            expect(result[1].number).toBe('00');
            expect(result[2].number).toBe('10');
            expect(result[5].number).toBe('102');
        });

        it('returns results for exact numeric token match and numbers partially matching the distinct token of 1 character', async () => {
            const result = await service.search('111');

            expect(result.length).toBe(13);
            expect(result[0].number).toBe('111');
            expect(result[1].number).toBe('1');
            expect(result[2].number).toBe('10');
            expect(result[12].number).toBe('321');
        });

        it('returns results for exact numeric token match and numbers partially matching using the distinct token of 2 characters', async () => {
            const result = await service.search('112');

            expect(result.length).toBe(6);
            expect(result[0].number).toBe('112');
            expect(result[1].number).toBe('12');
            expect(result[2].number).toBe('102');
            expect(result[5].number).toBe('321');
        });

        it('returns results for exact numeric token match and numbers with the same digits using distinct characters', async () => {
            const result = await service.search('231');

            expect(result.length).toBe(3);
            expect(result[0].number).toBe('231');
            expect(result[1].number).toBe('123');
            expect(result[2].number).toBe('321');
        });

        it('returns results for large numeric token and numbers with the same digits using distinct characters', async () => {
            const result = await service.search('111111222222333333111111222222333333111111222222333333111111222222333333');

            expect(result.length).toBe(3);
            expect(result[0].number).toBe('123');
            expect(result[1].number).toBe('231');
            expect(result[2].number).toBe('321');
        });

        it('returns results for exact word', async () => {
            const result = await service.search('Thirty');

            expect(result.length).toBe(1);
            expect(result[0].text).toBe('Two Hundred Thirty One');
        });

        it('returns results for partial word', async () => {
            const result = await service.search('red');

            expect(result.length).toBe(8);
            expect(result[0].text).toBe('One Hundred');
            expect(result[7].text).toBe('Three Hundred Twenty One');
        });

        it('returns results for partial words', async () => {
            const result = await service.search('ree red one');

            expect(result.length).toBe(2);
            expect(result[0].text).toBe('One Hundred Twenty Three');
            expect(result[1].text).toBe('Three Hundred Twenty One');
        });

        it('returns results for duplicate partial words in mixed case', async () => {
            const result = await service.search('ree RED one ree red ONE REE red one rEe rEd oNe');

            expect(result.length).toBe(2);
            expect(result[0].text).toBe('One Hundred Twenty Three');
            expect(result[1].text).toBe('Three Hundred Twenty One');
        });

        it('returns results for mixed numbers and partial words and ignores non alphanumeric', async () => {
            const result = await service.search('ree|1red3|one');

            expect(result.length).toBe(4);
            expect(result[0].number).toBe('13');
            expect(result[0].text).toBe('Thirteen');
            expect(result[3].number).toBe('321');
            expect(result[3].text).toBe('Three Hundred Twenty One');
        });

        it('handles cancellation via AbortSignal', async () => {
            const abortController = new AbortController();

            setTimeout(() => abortController.abort());
            const result = await service
                .search('One', abortController.signal)
                .catch(error => error);

            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe('Operation aborted');
        });
    });
});