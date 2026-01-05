import { task } from '../../../src/utils/task.js';
import { DigitCalculatorService } from '../../../src/apps/numerology-calculator/services/DigitCalculatorService.js';

describe('DigitCalculatorService', () => {
    let uiServiceMock;
    let service;

    beforeEach(() => {
        uiServiceMock = {
            composeEntryEquation: jasmine.createSpy('composeEntryEquation').and.callFake(
                arr => arr.join('+')
            ),
            composeEntrySequence: jasmine.createSpy('composeEntrySequence').and.callFake(
                arr => arr.join('')
            )
        };

        service = new DigitCalculatorService(uiServiceMock, task);
    });

    describe('calculate', () => {
        it('resolves empty result and steps for non-digit input', async () => {
            const result = await service.calculate('abc');

            expect(result).toEqual({ result: '', steps: [] });
        });

        it('calculates 0 result correctly', async () => {
            const result = await service.calculate('0');

            expect(result.result).toBe('0');
            expect(result.steps.length).toBe(1);
            expect(result.steps[0].sum).toBe('0');
        });

        it('calculates single-digit result correctly', async () => {
            const result = await service.calculate('5');

            expect(result.result).toBe('5');
            expect(result.steps.length).toBe(1);
            expect(result.steps[0].sum).toBe('5');
        });

        it('calculates double-digit result correctly', async () => {
            const result = await service.calculate('99');

            expect(result.result).toBe('9');
            expect(result.steps.length).toBe(2);
            expect(result.steps[0].sum).toBe('18');
            expect(result.steps[1].sum).toBe('9');
        });

        it('calculates multi-digit input with iterative sum reduction', async () => {
            const result = await service.calculate('12345');

            expect(result.result).toBe('6');
            expect(result.steps.length).toBe(2);
            expect(result.steps[0].sum).toBe('15');
            expect(result.steps[1].sum).toBe('6');

            expect(uiServiceMock.composeEntryEquation).toHaveBeenCalled();
            expect(uiServiceMock.composeEntrySequence).toHaveBeenCalled();
        });

        it('ignores non-digit characters', async () => {
            const result = await service.calculate('a1b2c3');

            expect(result.result).toBe('6');
        });

        it('handles cancellation via AbortSignal', async () => {
            const abortController = new AbortController();

            setTimeout(() => abortController.abort());
            const result = await service
                .calculate('123456789', abortController.signal)
                .catch(error => error);

            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe('Operation aborted');
        });
    });
});
