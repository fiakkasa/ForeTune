import { task } from '../../../src/utils/task.js';
import { LetterCalculatorService } from '../../../src/apps/numerology-calculator/services/LetterCalculatorService.js';

describe('LetterCalculatorService', function () {
    let uiServiceMock;
    let service;

    beforeEach(function () {
        uiServiceMock = {
            composeCombinedItem: jasmine.createSpy('composeCombinedItem').and.callFake(
                (ch, val) => `${ch}:${val}`
            ),
            composeEntrySequence: jasmine.createSpy('composeEntrySequence').and.callFake(
                arr => arr.join('')
            ),
            composeEntryEquation: jasmine.createSpy('composeEntryEquation').and.callFake(
                arr => arr.join('+')
            )
        };

        service = new LetterCalculatorService(uiServiceMock, task);
    });

    describe('calculate', function () {
        it('resolves empty result for null or undefined input', async function () {
            const nullResult = await service.calculate(null);
            const undefinedResult = await service.calculate(undefined);

            expect(nullResult).toEqual({ result: '', steps: [] });
            expect(undefinedResult).toEqual({ result: '', steps: [] });
        });

        it('resolves empty result for empty input', async function () {
            const result = await service.calculate('');

            expect(result).toEqual({ result: '', steps: [] });
        });

        it('resolves empty result for non-letter input', async function () {
            const result = await service.calculate('123!?');

            expect(result).toEqual({ result: '', steps: [] });
        });

        it('calculates single-letter input correctly', async function () {
            const result = await service.calculate('A');

            expect(result.result).toBe('1');
            expect(result.steps.length).toBe(1);

            expect(uiServiceMock.composeCombinedItem).toHaveBeenCalledWith('A', 1);
            expect(uiServiceMock.composeEntrySequence).toHaveBeenCalledWith(['A']);
            expect(uiServiceMock.composeEntryEquation).toHaveBeenCalledWith(['A:1']);
        });

        it('calculates multi-letter input with iterative sum reduction', async function () {
            const result = await service.calculate('ABCD');

            expect(result.result).toBe('1');
            expect(result.steps.length).toBe(2);

            expect(result.steps[0].sum).toBe('10');
            expect(result.steps[0].numberOfCharacters).toBe(4);

            expect(result.steps[1].sum).toBe('1');

            expect(uiServiceMock.composeCombinedItem).toHaveBeenCalledTimes(4);
            expect(uiServiceMock.composeEntrySequence).toHaveBeenCalled();
            expect(uiServiceMock.composeEntryEquation).toHaveBeenCalled();
        });

        it('ignores non-mapped letters', async function () {
            const result = await service.calculate('AXYZ*!');

            expect(result.result).toBe('4');
        });

        it('handles cancellation via AbortSignal', async function () {
            const abortController = new AbortController();
            const calculationPromise = service.calculate('abcdefg', abortController.signal);

            abortController.abort();

            try {
                await calculationPromise;
                fail('Expected calculation to be aborted');
            } catch (error) {
                expect(error).toBeDefined();
                expect(error.message).toBe('Operation aborted');
            }
        });
    });
});
