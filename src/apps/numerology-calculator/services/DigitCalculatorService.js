import { toDeltaInt, toDeltaIntCollectionSequence, calculateSumAndStep } from './CalculatorUtils.js';

const _digitsSet = new Set([
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9'
]);

const getDigits = (text, cancellationSignal = null) => {
    if (cancellationSignal?.aborted) {
        return [];
    }

    const result = [];

    for (const ch of text) {
        if (cancellationSignal?.aborted) {
            return [];
        }

        if (_digitsSet.has(ch)) {
            result.push(toDeltaInt(ch));
        }
    }

    return result;
};

const getEmptyResult = () => ({ result: '', steps: [] });

class DigitCalculatorService {
    constructor(uiService, task) {
        this._uiService = uiService;
        this._task = task;
    }

    calculate(text, cancellationSignal = null) {
        return this._task.run(ct => {
            let digits = getDigits(text || '', ct);

            if (!digits.length) {
                return getEmptyResult();
            }

            let result = '';
            const steps = [];

            let { sum, step } = calculateSumAndStep(
                digits,
                this._uiService.composeEntrySequence(digits),
                this._uiService.composeEntryEquation(digits),
                ct
            );

            result = sum;
            steps.push(step);

            while (result.length > 1) {
                if (ct?.aborted) {
                    return getEmptyResult();
                }

                digits = toDeltaIntCollectionSequence(result, ct);
                let { sum, step } = calculateSumAndStep(
                    digits,
                    this._uiService.composeEntrySequence(digits),
                    this._uiService.composeEntryEquation(digits),
                    ct
                );

                result = sum;
                steps.push(step);
            }

            return { result, steps };
        }, cancellationSignal);
    }
}

export { DigitCalculatorService };
