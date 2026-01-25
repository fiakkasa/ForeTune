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
const _vowelMap = {
    A: 1,
    E: 5,
    I: 9,
    O: 6,
    U: 3
};
const _consonantMap = {
          J: 1, S: 1,
    B: 2, K: 2, T: 2,
    C: 3, L: 3,
    D: 4, M: 4, V: 4,
          N: 5, W: 5,
    F: 6,       X: 6,
    G: 7, P: 7, Y: 7,
    H: 8, Q: 8, Z: 8,
          R: 9
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

class LetterCalculatorService {
    constructor(uiService, task) {
        this._uiService = uiService;
        this._task = task;
    }

    resolveCharacterMap(type) {
        switch (type) {
            case 'vowels':
                return _vowelMap;
            case 'consonants':
                return _consonantMap;
            default:
                return _letterMap;
        }
    }

    calculate(text, type, cancellationSignal = null) {
        return this._task.run(() => {
            const letters = [];
            const digits = [];
            const composed = [];
            const normalizedText = (text || '').toUpperCase();
            const characterMap = this.resolveCharacterMap(type);

            if (!normalizedText) {
                return { result: '', steps: [] };
            }

            for (const ch of normalizedText) {
                if (!characterMap[ch]) {
                    continue;
                }

                letters.push(ch);
                digits.push(characterMap[ch]);
                composed.push(
                    this._uiService.composeCombinedItem(ch, characterMap[ch])
                );
            }

            if (!digits.length) {
                return { result: '', steps: [] };
            }

            let result = '';
            const steps = [];

            let { sum, step } = calculateSumAndStep(
                digits,
                this._uiService.composeEntrySequence(letters),
                this._uiService.composeEntryEquation(composed)
            );

            result = sum;
            steps.push(step);

            while (result.length > 1) {
                const nextDigits = toDeltaIntCollectionSequence(result);
                let { sum, step } = calculateSumAndStep(
                    nextDigits,
                    this._uiService.composeEntrySequence(nextDigits),
                    this._uiService.composeEntryEquation(nextDigits)
                );

                result = sum;
                steps.push(step);
            }

            return { result, steps };
        }, cancellationSignal);
    }
}

export { LetterCalculatorService };
