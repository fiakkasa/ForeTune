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

const toDeltaIntCollectionSequence = (text) =>
    [...text].map(ch => toDeltaInt(ch));

const toSumString = (collection) =>
    collection.reduce((a, b) => a + b, 0).toString();

const calculateSumAndStep = (digits, sequence, equation) => {
    const sum = toSumString(digits);
    const step = {
        equation,
        sum,
        numberOfCharacters: digits.length,
        sequence
    };

    return { sum, step };
};

class DigitCalculatorService {
    constructor(uiService, task) {
        this._uiService = uiService;
        this._task = task;
    }

    calculate(text, cancellationSignal = null) {
        return this._task.run(() => {
            let digits = [...(text || '')]
                .filter(ch => /\d/.test(ch))
                .map(ch => toDeltaInt(ch));

            if (!digits.length) {
                return { result: '', steps: [] };
            }

            let result = '';
            const steps = [];

            let { sum, step } = calculateSumAndStep(
                digits,
                this._uiService.composeEntrySequence(digits),
                this._uiService.composeEntryEquation(digits)
            );

            result = sum;
            steps.push(step);

            while (result.length > 1) {
                digits = toDeltaIntCollectionSequence(result);
                let { sum, step } = calculateSumAndStep(
                    digits,
                    this._uiService.composeEntrySequence(digits)
                );

                result = sum;
                steps.push(step);
            }

            return { result, steps };
        }, cancellationSignal);
    }
}

export { DigitCalculatorService };
