class NumerologyUiService {
    constructor(config, task) {
        this._config = config;
        this._task = task;
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

        if (normalizedText.length > this._config.maxSearchInputChars) {
            return normalizedText.slice(0, this._config.maxSearchInputChars);
        }

        return normalizedText;
    }

    delay(cancellationSignal) {
        return this._task.delay(
            this._config.uiDefaultDelay,
            cancellationSignal
        );
    }
}

export { NumerologyUiService };
