const _letterMap = {
    A: 1, J: 1, S: 1,
    B: 2, K: 2, T: 2,
    C: 3, L: 3, U: 3,
    D: 4, M: 4, V: 4,
    E: 5, N: 5, W: 5,
    F: 6, O: 6, X: 6,
    G: 7, P: 7, Y: 7,
    H: 8, Q: 8, Z: 8,
    I: 9, R: 9
};
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
class NumerologyLetterCalculatorService {
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

    calculateSumAndStep(digits, sequence, equation) {
        const sum = this.toSumString(digits);
        const step = {
            equation,
            sum,
            numberOfCharacters: digits.length,
            sequence
        };

        return { sum, step };
    }

    calculate(text, cancellationSignal) {
        return this._task.run(() => {
            const uiService = this._uiService;
            const letters = [];
            const digits = [];
            const composed = [];

            for (const ch of (text || '').toUpperCase()) {
                if (!_letterMap[ch]) {
                    continue;
                }

                letters.push(ch);
                digits.push(_letterMap[ch]);
                composed.push(
                    uiService.composeCombinedItem(ch, _letterMap[ch])
                );
            }

            if (!digits.length) {
                return { result: '', steps: [] };
            }

            let result = '';
            const steps = [];

            let { sum, step } = this.calculateSumAndStep(
                digits,
                uiService.composeEntrySequence(letters),
                uiService.composeEntryEquation(composed)
            );

            result = sum;
            steps.push(step);

            while (result.length > 1) {
                const nextDigits = this.toDeltaIntCollectionSequence(result);
                let { sum, step } = this.calculateSumAndStep(
                    nextDigits,
                    uiService.composeEntrySequence(nextDigits),
                    uiService.composeEntryEquation(nextDigits)
                );

                result = sum;
                steps.push(step);
            }

            return { result, steps };
        }, cancellationSignal);
    }
}

export { NumerologyLetterCalculatorService };
