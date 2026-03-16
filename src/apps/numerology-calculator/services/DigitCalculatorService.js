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
const _codePointsMap = {
    '1': 1,
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9
};

const toDeltaInt = (character) => _codePointsMap[character] || 0;

const toDeltaIntCollectionSequence = (text, cancellationSignal = null) => {
    if (cancellationSignal?.aborted) {
        return [];
    }

    const result = [];

    for (const ch of text) {
        if (cancellationSignal?.aborted) {
            return [];
        }

        result.push(toDeltaInt(ch));
    }

    return result;
};

const toSumString = (collection, cancellationSignal = null) => {
    if (cancellationSignal?.aborted) {
        return '';
    }

    let result = 0;

    for (const item of collection) {
        if (cancellationSignal?.aborted) {
            return '';
        }

        result += item;
    }

    return result.toString();
};

const calculateSumAndStep = (
    digits,
    sequence,
    equation,
    cancellationSignal = null
) => {
    let sum = '';
    let step = {
        equation,
        sum,
        numberOfCharacters: digits.length,
        sequence
    };

    if (cancellationSignal?.aborted) {
        return {
            sum,
            step: {
                equation,
                sum,
                numberOfCharacters: digits.length,
                sequence
            }
        };
    }

    sum = toSumString(digits, cancellationSignal);
    step.sum = sum;

    return { sum, step };
};

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
