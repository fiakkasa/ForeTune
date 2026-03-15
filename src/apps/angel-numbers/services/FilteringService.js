const _keyPrefix = '_';
const _emptyMap = new Map();

const splitToken = (token, cancellationSignal = null) => {
    if (cancellationSignal?.aborted) {
        return { numericToken: '', textToken: '' };
    }

    const numericToken = token.replace(/[^\d]/gi, '');
    const textToken = token.replace(/[\d]/gi, '').toLowerCase().trim();

    return { numericToken, textToken };
};

const findSimpleNumericMatch = (
    data,
    numericToken,
    cancellationSignal = null
) => {
    if (
        cancellationSignal?.aborted
        || !numericToken
        || numericToken.length > 3
    ) {
        return _emptyMap;
    }

    const result = new Map();

    for (const item of data) {
        if (cancellationSignal?.aborted) {
            return _emptyMap;
        }

        const { key, number } = item;

        if (
            !result.has(key)
            && numericToken
            && number === numericToken
        ) {
            result.set(key, item);
        }
    }

    return result;
};

const findSimpleTextMatch = (
    data,
    textToken,
    simpleNumericMatchResult,
    cancellationSignal = null
) => {
    if (cancellationSignal?.aborted || !textToken) {
        return _emptyMap;
    }

    const result = new Map();

    for (const item of data) {
        if (cancellationSignal?.aborted) {
            return _emptyMap;
        }

        const { key, processedText } = item;

        if (
            !result.has(key)
            && !simpleNumericMatchResult.has(key)
            && textToken
            && processedText.includes(textToken)
        ) {
            result.set(key, item);
        }
    }

    return result;
};

const findTokenizedNumber = (
    data,
    config,
    numericToken,
    simpleNumericMatchResult,
    simpleTextMatchResult,
    cancellationSignal = null
) => {
    if (
        cancellationSignal?.aborted
        || !numericToken
        || numericToken.length > config.maxChars
    ) {
        return _emptyMap;
    }

    const tokenizedNumber = [...new Set(numericToken)];

    const result = new Map();

    for (const item of data) {
        if (cancellationSignal?.aborted) {
            return _emptyMap;
        }

        const { key, number } = item;

        if (
            !result.has(key)
            && !simpleNumericMatchResult.has(key)
            && !simpleTextMatchResult.has(key)
            && tokenizedNumber.every(fragment => number.includes(fragment))
        ) {
            result.set(key, item);
        }
    }

    return result;
};

const findTokenizedText = (
    data,
    config,
    textToken,
    simpleNumericMatchResult,
    simpleTextMatchResult,
    tokenizedNumberResult,
    cancellationSignal = null
) => {
    if (
        cancellationSignal?.aborted
        || !textToken
        || textToken.length > config.maxChars
    ) {
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

    const result = new Map();

    for (const item of data) {
        if (cancellationSignal?.aborted) {
            return _emptyMap;
        }

        const { key, processedText } = item;

        if (
            !result.has(key)
            && !simpleNumericMatchResult.has(key)
            && !simpleTextMatchResult.has(key)
            && !tokenizedNumberResult.has(key)
            && tokenizedText.every(fragment => processedText.includes(fragment))) {
            result.set(key, item);
        }
    }

    return result;
};

class FilteringService {
    _data = [];

    get Data() {
        return this._data;
    }

    constructor(config, httpClient, task) {
        this._config = config;
        this._httpClient = httpClient;
        this._task = task;
    }

    async init(cancellationSignal = null) {
        this._data = await this._httpClient
            .getJson(this._config.dataUrl, cancellationSignal)
            .then(data => data.map(({ number, text }, index) => ({
                key: _keyPrefix + number,
                ordinal: index,
                number,
                text,
                processedText: text.toLowerCase().replaceAll(' ', '')
            })))
            .catch(error => {
                console.error(error);
                return [];
            });
    }

    search(token, cancellationSignal = null) {
        return this._task.run(ct => {
            if (!token || !this._data.length) {
                return [];
            }

            const { numericToken, textToken } = splitToken(token, ct);

            if (!numericToken && !textToken) {
                return [];
            }

            // simple numeric match
            const simpleNumericMatchResult = findSimpleNumericMatch(
                this._data,
                numericToken,
                ct
            );
            // simple text match
            const simpleTextMatchResult = findSimpleTextMatch(
                this._data,
                textToken,
                simpleNumericMatchResult,
                ct
            );
            // number tokenized match
            const tokenizedNumberResult = findTokenizedNumber(
                this._data,
                this._config,
                numericToken,
                simpleNumericMatchResult,
                simpleTextMatchResult,
                ct
            );
            // text tokenized match
            const tokenizedTextResult = findTokenizedText(
                this._data,
                this._config,
                textToken,
                simpleNumericMatchResult,
                simpleTextMatchResult,
                tokenizedNumberResult,
                ct
            );

            return ct?.aborted
                ? []
                : [
                    ...simpleNumericMatchResult.values(),
                    ...simpleTextMatchResult.values(),
                    ...tokenizedNumberResult.values(),
                    ...tokenizedTextResult.values()
                ];
        }, cancellationSignal);
    }
}

export { FilteringService }
