import { task } from '../../../src/utils/task.js';

describe('task', function () {
    describe('run', function () {
        it('executes delegate and returns result', async function () {
            const result = await task.run(() => 'hello');

            expect(result).toBe('hello');
        });

        it('handles cancellation via AbortSignal', async function () {
            const abortController = new AbortController();
            const resultPromise = task.run(() => 'hello', abortController.signal);

            abortController.abort();

            try {
                await resultPromise;
                fail('Expected task to be aborted');
            } catch (error) {
                expect(error).toBeDefined();
                expect(error.message).toBe('Operation aborted');
            }
        });

        it('catches execution error and propagates', async function () {
            try {
                await task.run(() => { throw new Error('Splash!'); });
                fail('Expected task to produce error');
            } catch (error) {
                expect(error).toBeDefined();
                expect(error.message).toBe('Splash!');
            }
        });
    });

    describe('delay', function () {
        it('resolves after provided timeout', async function () {
            const start = Date.now();
            await task.delay(250);
            const elapsed = Date.now() > start;

            expect(elapsed).toBeTrue();
        });

        it('handles cancellation via AbortSignal', async function () {
            const abortController = new AbortController();
            const resultPromise = task.delay(250, abortController.signal);

            abortController.abort();

            try {
                await resultPromise;
                fail('Expected task to be aborted');
            } catch (error) {
                expect(error).toBeDefined();
                expect(error.message).toBe('Operation aborted');
            }
        });
    });
});
