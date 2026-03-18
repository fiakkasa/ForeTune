import { toDeltaInt, toDeltaIntCollectionSequence, toSumString, calculateSumAndStep } from '../../../src/apps/numerology-calculator/services/CalculatorUtils.js';

describe('CalculatorUtils', () => {
    describe('toDeltaInt', () => {
        it('returns 0 for non-digit input', () => {
            expect(toDeltaInt('a')).toBe(0);
            expect(toDeltaInt('z')).toBe(0);
        });

        it('returns correct delta integer for digit characters', () => {
            expect(toDeltaInt('0')).toBe(0);
            expect(toDeltaInt('1')).toBe(1);
            expect(toDeltaInt('9')).toBe(9);
        });
    });

    describe('toDeltaIntCollectionSequence', () => {
        it('returns array of zeros for non-digit input', () => {
            expect(toDeltaIntCollectionSequence('abc')).toEqual([0, 0, 0]);
        });

        it('returns correct array of delta integers for digit characters', () => {
            expect(toDeltaIntCollectionSequence('123')).toEqual([1, 2, 3]);
        });

        it('returns correct array of delta integers and zeros for mixed characters', () => {
            expect(toDeltaIntCollectionSequence('1a2b3c')).toEqual([1, 0, 2, 0, 3, 0]);
        });

        it('handles cancellation via AbortSignal', () => {
            const abortController = new AbortController();

            abortController.abort();
            const result = toDeltaIntCollectionSequence('123456789', abortController.signal);

            expect(result).toEqual([]);
        });
    });

    describe('toSumString', () => {
        it('returns empty string for empty collection', () => {
            expect(toSumString([])).toBe('');
        });

        it('returns correct sum as string for array of numbers', () => {
            expect(toSumString([1, 2, 3])).toBe('6');
        });

        it('returns correct sum as string for array of mixed characters', () => {
            expect(toSumString([1, 0, 2, 0, 3])).toBe('6');
        });

        it('handles cancellation via AbortSignal', () => {
            const abortController = new AbortController();

            abortController.abort();
            const result = toSumString([1, 2, 3], abortController.signal);

            expect(result).toBe('');
        });
    });

    describe('calculateSumAndStep', () => {
        it('returns correct sum and step for array of digits', () => {
            const digits = [1, 2, 3];
            const sequence = '123';
            const equation = '1+2+3';

            const { sum, step } = calculateSumAndStep(digits, sequence, equation);

            expect(sum).toBe('6');
            expect(step).toEqual({
                equation,
                sum,
                numberOfCharacters: digits.length,
                sequence
            });
        });

        it('handles cancellation via AbortSignal', () => {
            const abortController = new AbortController();
            const digits = [1, 2, 3];
            const sequence = '123';
            const equation = '1+2+3';

            abortController.abort();
            const { sum, step } = calculateSumAndStep(digits, sequence, equation, abortController.signal);

            expect(sum).toBe('');
            expect(step).toEqual({
                equation,
                sum,
                numberOfCharacters: 0,
                sequence
            });
        });
    });
});
