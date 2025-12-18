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

class NumerologyDigitCalculatorService {
    constructor(uiService, task) {
        this._uiService = uiService;
        this._task = task;
    }

    toDeltaInt(character) {
        return _codePointsMap[character] ?? 0;
    }

    toDeltaIntCollectionSequence(text) {
        return [...text].map(ch => this.toDeltaInt(ch));
    }

    toSumString(collection) {
        return (collection || []).reduce((a, b) => a + b, 0).toString();
    }

    calculateSumAndStep(digits, sequence) {
        const sum = this.toSumString(digits);
        const step = {
            equation: this._uiService.composeEntryEquation(digits),
            sum,
            numberOfCharacters: digits.length,
            sequence
        };

        return { sum, step };
    }

    calculate(text, cancellationSignal) {
        return this._task.run(() => {
            let digits = [...(text || '')]
                .filter(ch => /\d/.test(ch))
                .map(ch => this.toDeltaInt(ch));

            if (!digits.length) {
                return { result: '', steps: [] };
            }

            let result = '';
            const steps = [];

            let { sum, step } = this.calculateSumAndStep(
                digits,
                this._uiService.composeEntrySequence(digits)
            );

            result = sum;
            steps.push(step);

            while (result.length > 1) {
                digits = this.toDeltaIntCollectionSequence(result);
                let { sum, step } = this.calculateSumAndStep(
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

export { NumerologyDigitCalculatorService };
