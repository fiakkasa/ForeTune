const _keyPrefix = '_';
const _emptyMap = new Map();

const splitToken = (token) => {
    const numericToken = token.replace(/[^\d]/gi, '');
    const textToken = token.replace(/[\d]/gi, '').toLowerCase().trim();

    return { numericToken, textToken };
};

const findSimpleNumericMatch = (data, numericToken) => {
    if (!numericToken || numericToken.length > 3) {
        return _emptyMap;
    }

    return data.reduce(
        (acc, item) => {
            const { key, number } = item;

            if (
                !acc.has(key)
                && numericToken
                && number === numericToken
            ) {
                acc.set(key, item);
            }

            return acc;
        },
        new Map()
    );
};

const findSimpleTextMatch = (data, textToken, simpleNumericMatchResult) => {
    if (!textToken) {
        return _emptyMap;
    }

    return data.reduce(
        (acc, item) => {
            const { key, processedText } = item;

            if (
                !acc.has(key)
                && !simpleNumericMatchResult.has(key)
                && textToken
                && processedText.includes(textToken)
            ) {
                acc.set(key, item);
            }

            return acc;
        },
        new Map()
    );
};

const findTokenizedNumber = (
    data,
    config,
    numericToken,
    simpleNumericMatchResult,
    simpleTextMatchResult
) => {
    if (!numericToken || numericToken.length > config.maxChars) {
        return _emptyMap;
    }

    const tokenizedNumber = [...new Set(numericToken)];

    return data.reduce(
        (acc, item) => {
            const { key, number } = item;

            if (
                !acc.has(key)
                && !simpleNumericMatchResult.has(key)
                && !simpleTextMatchResult.has(key)
                && tokenizedNumber.every(fragment => number.includes(fragment))
            ) {
                acc.set(key, item);
            }

            return acc;
        },
        new Map()
    );
};

const findTokenizedText = (
    data,
    config,
    textToken,
    simpleNumericMatchResult,
    simpleTextMatchResult,
    tokenizedNumberResult
) => {
    if (!textToken || textToken.length > config.maxChars) {
        return _emptyMap;
    }

    const tokenizedText = [
        ...new Set(
            textToken
                .split(' ')
                .map(v => v.toLowerCase())
                .filter(Boolean)
        )
    ];

    return data.reduce(
        (acc, item) => {
            const { key, processedText } = item;

            if (
                !acc.has(key)
                && !simpleNumericMatchResult.has(key)
                && !simpleTextMatchResult.has(key)
                && !tokenizedNumberResult.has(key)
                && tokenizedText.every(fragment => processedText.includes(fragment))) {
                acc.set(key, item);
            }

            return acc;
        },
        new Map()
    );
};

class FilteringService {
    _data = [];

    get Data() {
        return this._data;
    }
    set Data(value) {
        this._data = (value || []).map(({ number, text }, index) => ({
            key: _keyPrefix + number,
            ordinal: index,
            number,
            text,
            processedText: text.toLowerCase().replaceAll(' ', '')
        }));
    }

    constructor(config, task) {
        this._config = config;
        this._task = task;
    }

    search(token, cancellationSignal) {
        return this._task.run(() => {
            if (!token || !this._data.length) {
                return [];
            }

            const { numericToken, textToken } = splitToken(token);

            if (!numericToken && !textToken) {
                return [];
            }

            // simple numeric match
            const simpleNumericMatchResult = findSimpleNumericMatch(
                this._data,
                numericToken
            );
            // simple text match
            const simpleTextMatchResult = findSimpleTextMatch(
                this._data,
                textToken,
                simpleNumericMatchResult
            );
            // number tokenized match
            const tokenizedNumberResult = findTokenizedNumber(
                this._data,
                this._config,
                numericToken,
                simpleNumericMatchResult,
                simpleTextMatchResult
            );
            // text tokenized match
            const tokenizedTextResult = findTokenizedText(
                this._data,
                this._config,
                textToken,
                simpleNumericMatchResult,
                simpleTextMatchResult,
                tokenizedNumberResult
            );

            return [
                ...simpleNumericMatchResult.values(),
                ...simpleTextMatchResult.values(),
                ...tokenizedNumberResult.values(),
                ...tokenizedTextResult.values()
            ];
        }, cancellationSignal);
    }
}

export { FilteringService }
