import { task } from '../../../src/utils/task.js';

describe('task', () => {
    describe('run', () => {
        it('executes delegate and returns result', async () => {
            const result = await task.run(() => 'hello');

            expect(result).toBe('hello');
        });

        it('handles cancellation when AbortSignal is aborted', async () => {
            const abortController = new AbortController();

            abortController.abort();
            const result = await task
                .run(() => 'hello', abortController.signal)
                .catch(error => error);

            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe('Operation aborted');
        });

        it('handles cancellation via AbortSignal', async () => {
            const abortController = new AbortController();

            setTimeout(() => abortController.abort());
            const result = await task
                .run(() => 'hello', abortController.signal)
                .catch(error => error);

            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe('Operation aborted');
        });

        it('catches execution error and propagates', async () => {
            const result = await task
                .run(() => { throw new Error('Splash!'); })
                .catch(error => error);

            expect(result.message).toBe('Splash!');
        });
    });

    describe('delay', () => {
        it('resolves after provided timeout', async () => {
            const start = Date.now();
            await task.delay(250);
            const elapsed = Date.now() > start;

            expect(elapsed).toBeTrue();
        });

        it('handles cancellation via AbortSignal', async () => {
            const abortController = new AbortController();

            setTimeout(() => abortController.abort());
            const result = await task
                .delay(250, abortController.signal)
                .catch(error => error);

            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe('Operation aborted');
        });
    });
});
