class NumerologyUiService {
    constructor(config) {
        this._config = config;
    }

    composeEntryEquation(collection) {
        return (collection || []).join(this._config.calculatorEquationSeparator);
    }

    composeEntrySequence(collection) {
        return (collection || []).join('');
    }

    composeCombinedItem(left, right) {
        return this._config.calculatorEquationCombinedItemTemplate
            .replace('{0}', left)
            .replace('{1}', right);
    }

    normalizeTextInput(text) {
        const normalizedText = (text || '').replaceAll(' ', '');

        if (!normalizedText) {
            return '';
        }

        if (normalizedText.length > this._config.maxInputChars) {
            return normalizedText.slice(0, this._config.maxInputChars);
        }

        return normalizedText;
    }

    delay(cancellationSignal) {
        return new Promise(
            (resolve, reject) => {
                setTimeout(resolve, this._config.uiDefaultDelay);

                cancellationSignal?.addEventListener('abort', () => {
                    reject(new Error('Operation aborted'));
                }, { once: true });
            }
        );
    }
}

export { NumerologyUiService };
