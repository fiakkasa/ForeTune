import { task } from '../../../src/utils/task.js';
import { LetterCalculatorService } from '../../../src/apps/numerology-calculator/services/LetterCalculatorService.js';

describe('LetterCalculatorService', () => {
    let uiServiceMock;
    let service;

    beforeEach(() => {
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

    describe('calculate', () => {
        it('resolves empty result for null or undefined input', async () => {
            const nullResult = await service.calculate(null);
            const undefinedResult = await service.calculate(undefined);

            expect(nullResult).toEqual({ result: '', steps: [] });
            expect(undefinedResult).toEqual({ result: '', steps: [] });
        });

        it('resolves empty result for empty input', async () => {
            const result = await service.calculate('');

            expect(result).toEqual({ result: '', steps: [] });
        });

        it('resolves empty result for non-letter input', async () => {
            const result = await service.calculate('123!?');

            expect(result).toEqual({ result: '', steps: [] });
        });

        it('calculates single-letter input correctly', async () => {
            const result = await service.calculate('A');

            expect(result.result).toBe('1');
            expect(result.steps.length).toBe(1);

            expect(uiServiceMock.composeCombinedItem).toHaveBeenCalledWith('A', 1);
            expect(uiServiceMock.composeEntrySequence).toHaveBeenCalledWith(['A']);
            expect(uiServiceMock.composeEntryEquation).toHaveBeenCalledWith(['A:1']);
        });

        it('calculates multi-letter input with iterative sum reduction', async () => {
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

        it('for vowels type calculates multi-letter input with iterative sum reduction', async () => {
            const result = await service.calculate('AEOI', 'vowels');

            expect(result.result).toBe('3');
            expect(result.steps.length).toBe(2);

            expect(result.steps[0].sum).toBe('21');
            expect(result.steps[0].numberOfCharacters).toBe(4);

            expect(result.steps[1].sum).toBe('3');

            expect(uiServiceMock.composeCombinedItem).toHaveBeenCalledTimes(4);
            expect(uiServiceMock.composeEntrySequence).toHaveBeenCalled();
            expect(uiServiceMock.composeEntryEquation).toHaveBeenCalled();
        });

        it('for consonants type calculates multi-letter input with iterative sum reduction', async () => {
            const result = await service.calculate('BCDXYZ', 'consonants');

            expect(result.result).toBe('3');
            expect(result.steps.length).toBe(2);

            expect(result.steps[0].sum).toBe('30');
            expect(result.steps[0].numberOfCharacters).toBe(6);

            expect(result.steps[1].sum).toBe('3');

            expect(uiServiceMock.composeCombinedItem).toHaveBeenCalledTimes(6);
            expect(uiServiceMock.composeEntrySequence).toHaveBeenCalled();
            expect(uiServiceMock.composeEntryEquation).toHaveBeenCalled();
        });

        it('ignores non-mapped letters', async () => {
            const result = await service.calculate('AXYZ*!');

            expect(result.result).toBe('4');
        });
        
        it('for vowels type ignores non-mapped letters', async () => {
            const result = await service.calculate('AB!', 'vowels');

            expect(result.result).toBe('1');
        });

        it('for consonants type ignores non-mapped letters', async () => {
            const result = await service.calculate('SA$', 'consonants');

            expect(result.result).toBe('1');
        });

        it('handles cancellation via AbortSignal', async () => {
            const abortController = new AbortController();

            abortController.abort();
            const result = await service
                .calculate('abcdefg', 'all', abortController.signal)
                .catch(error => error);

            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe('Operation aborted');
        });
    });
});
