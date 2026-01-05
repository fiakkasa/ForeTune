import { task } from '../../../src/utils/task.js';
import { UiService } from '../../../src/apps/angel-numbers/services/UiService.js';

describe('UiService', () => {
    const config = {
        maxSearchInputChars: 1000,
        uiDefaultDelay: 250
    };
    let service;

    beforeEach(() => {
        service = new UiService(config, task);
    });

    describe('delay', () => {
        it('resolves after configured delay', async () => {
            const start = Date.now();
            await service.delay();
            const elapsed = Date.now() > start;

            expect(elapsed).toBeTrue();
        });

        it('handles cancellation via AbortSignal', async () => {
            const abortController = new AbortController();

            setTimeout(() => abortController.abort());
            const result = await service
                .delay(abortController.signal)
                .catch(error => error);

            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe('Operation aborted');
        });
    });
});