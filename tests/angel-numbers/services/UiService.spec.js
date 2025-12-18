import { task } from '../../../src/scripts/utils/task.js';
import { UiService } from '../../../src/apps/angel-numbers/scripts/services/UiService.js';

describe('UiService', function () {
    const config = {
        maxSearchInputChars: 1000,
        uiDefaultDelay: 250
    };
    let service;

    beforeEach(function () {
        service = new UiService(config, task);
    });

    describe('delay', function () {
        it('resolves after configured delay', async function () {
            const start = Date.now();
            await service.delay();
            const elapsed = Date.now() > start;

            expect(elapsed).toBeTrue();
        });

        it('handles cancellation via AbortSignal', async function () {
            const abortController = new AbortController();
            const resultPromise = service.delay(abortController.signal);

            abortController.abort();

            try {
                await resultPromise;
                fail('Expected calculation to be aborted');
            } catch (error) {
                expect(error).toBeDefined();
                expect(error.message).toBe('Operation aborted');
            }
        });
    });
});