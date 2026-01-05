import { task } from '../../../src/utils/task.js';
import { UiService } from '../../../src/apps/numerology-calculator/services/UiService.js';

describe('UiService', () => {
    const config = {
        calculatorEquationSeparator: '+',
        calculatorEquationCombinedItemTemplate: '{0}:{1}',
        maxSearchInputChars: 5,
        uiDefaultDelay: 500
    };
    let service;

    beforeEach(() => {
        service = new UiService(config, task);
    });

    describe('composeEntryEquation', () => {
        it('composes entry equation using separator', () => {
            expect(service.composeEntryEquation(['1', '2', '3'])).toBe('1+2+3');
            expect(service.composeEntryEquation([])).toBe('');
            expect(service.composeEntryEquation(null)).toBe('');
        });
    });

    describe('composeEntrySequence', () => {
        it('composes entry sequence by concatenation', () => {
            expect(service.composeEntrySequence(['1', '2', '3'])).toBe('123');
            expect(service.composeEntrySequence(null)).toBe('');
        });
    });

    describe('composeCombinedItem', () => {
        it('composes combined item from template', () => {
            expect(service.composeCombinedItem('L', 'R')).toBe('L:R');
        });
    });

    describe('normalizeTextInput', () => {
        it('normalizes text input: trims spaces and enforces max length', () => {
            expect(service.normalizeTextInput(' a b c ')).toBe('abc');
            expect(service.normalizeTextInput('')).toBe('');
            expect(service.normalizeTextInput('     ')).toBe('');
            expect(service.normalizeTextInput('abcdefg')).toBe('abcde');
            expect(service.normalizeTextInput('abc')).toBe('abc');
        });
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