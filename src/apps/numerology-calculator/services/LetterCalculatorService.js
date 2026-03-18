import { toDeltaIntCollectionSequence, calculateSumAndStep } from './CalculatorUtils.js';

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
    /* */ J: 1, S: 1,
    B: 2, K: 2, T: 2,
    C: 3, L: 3,
    D: 4, M: 4, V: 4,
    /* */ N: 5, W: 5,
    F: 6,/*  */ X: 6,
    G: 7, P: 7, Y: 7,
    H: 8, Q: 8, Z: 8,
    /* */ R: 9
};

const getLettersAndDigits = (
    text,
    characterMap,
    composeFn,
    cancellationSignal = null
) => {
    const letters = [];
    const digits = [];
    const composed = [];

    if (cancellationSignal?.aborted) {
        return { letters, digits, composed };
    }

    for (const ch of text) {
        if (cancellationSignal?.aborted) {
            return { letters, digits, composed };
        }

        if (!characterMap[ch]) {
            continue;
        }

        letters.push(ch);
        digits.push(characterMap[ch]);
        composed.push(composeFn(ch, characterMap[ch]));
    }

    return { letters, digits, composed };
};

const getEmptyResult = () => ({ result: '', steps: [] });

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
        return this._task.run(ct => {
            const normalizedText = (text || '').toUpperCase();

            if (!normalizedText) {
                return getEmptyResult();
            }

            const {
                letters,
                digits,
                composed
            } = getLettersAndDigits(
                normalizedText,
                this.resolveCharacterMap(type),
                (ch, digit) => this._uiService.composeCombinedItem(ch, digit),
                ct
            );

            if (!digits.length) {
                return getEmptyResult();
            }

            let result = '';
            const steps = [];

            let { sum, step } = calculateSumAndStep(
                digits,
                this._uiService.composeEntrySequence(letters),
                this._uiService.composeEntryEquation(composed),
                ct
            );

            result = sum;
            steps.push(step);

            while (result.length > 1) {
                if (ct?.aborted) {
                    return getEmptyResult();
                }

                const nextDigits = toDeltaIntCollectionSequence(result, ct);
                let { sum, step } = calculateSumAndStep(
                    nextDigits,
                    this._uiService.composeEntrySequence(nextDigits),
                    this._uiService.composeEntryEquation(nextDigits),
                    ct
                );

                result = sum;
                steps.push(step);
            }

            return { result, steps };
        }, cancellationSignal);
    }
}

export { LetterCalculatorService };
