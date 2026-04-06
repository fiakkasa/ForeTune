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

const findChapterMatch = (
    data,
    numericToken,
    areas,
    cancellationSignal = null
) => {
    if (
        cancellationSignal?.aborted
        || !numericToken
        || numericToken.length > 2
        || !areas?.chapter
    ) {
        return _emptyMap;
    }

    const result = new Map();

    for (const item of data) {
        if (cancellationSignal?.aborted) {
            return _emptyMap;
        }

        const { key, chapter } = item;

        if (
            !result.has(key)
            && numericToken
            && (
                chapter === numericToken
                || chapter.includes(numericToken)
            )
        ) {
            result.set(key, item);
        }
    }

    const invertedNumericToken = numericToken.length > 0
        ? `${numericToken[1]}${numericToken[0]}`
        : '';

    if (invertedNumericToken) {
        for (const item of data) {
            if (cancellationSignal?.aborted) {
                return _emptyMap;
            }

            const { key, chapter } = item;

            if (
                !result.has(key)
                && numericToken
                && chapter === invertedNumericToken
            ) {
                result.set(key, item);
            }
        }
    }

    return result;
};

const findSimpleTextMatch = (
    data,
    textToken,
    areas,
    simpleNumericMatchResult,
    cancellationSignal = null
) => {
    if (
        cancellationSignal?.aborted
        || !textToken
        || !hasSearchableTextArea(areas)
    ) {
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
            && (
                (areas?.title && item.processedTitle.includes(textToken))
                || (areas?.text && processedText.includes(textToken))
                || (areas?.originalText && item.processedOriginalText.includes(textToken))
            )
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
    areas,
    chapterMatchResult,
    simpleTextMatchResult,
    cancellationSignal = null
) => {
    if (
        cancellationSignal?.aborted
        || !textToken
        || textToken.length > config.maxChars
        || !hasSearchableTextArea(areas)
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

        const {
            key,
            processedTitle,
            processedOriginalText,
            processedText
        } = item;

        if (
            !result.has(key)
            && !chapterMatchResult.has(key)
            && !simpleTextMatchResult.has(key)
            && (
                (
                    areas?.title
                    && tokenizedText.every(fragment => processedTitle.includes(fragment))
                )
                || (
                    areas?.text
                    && tokenizedText.every(fragment => processedText.includes(fragment))
                )
                || (
                    areas?.originalText
                    && tokenizedText.every(fragment => processedOriginalText.includes(fragment))
                )
            )
        ) {
            result.set(key, item);
        }
    }

    return result;
};

const hasSearchableArea = areas =>
    areas?.chapter
    || hasSearchableTextArea(areas);

const hasSearchableTextArea = areas =>
    areas?.title
    || areas?.text
    || areas?.originalText;

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
            .then(data => data.map(({ chapter, title, originalText, text }, index) => ({
                key: _keyPrefix + chapter,
                ordinal: index,
                chapter,
                title,
                processedTitle: title.toLowerCase().replaceAll(' ', ''),
                originalText,
                processedOriginalText: originalText.replaceAll(' ', ''),
                text,
                processedText: text.toLowerCase().replaceAll(' ', '')
            })))
            .catch(error => {
                console.error(error);
                return [];
            });
    }

    search(token, areas, cancellationSignal = null) {
        return this._task.run(ct => {
            if (
                !token
                || !this._data.length
                || !hasSearchableArea(areas)
            ) {
                return [];
            }

            const { numericToken, textToken } = splitToken(token, ct);

            if (!numericToken && !textToken) {
                return [];
            }

            // simple numeric match
            const chapterMatchResult = findChapterMatch(
                this._data,
                numericToken,
                areas,
                ct
            );
            // simple text match
            const simpleTextMatchResult = findSimpleTextMatch(
                this._data,
                textToken,
                areas,
                chapterMatchResult,
                ct
            );

            // text tokenized match
            const tokenizedTextResult = findTokenizedText(
                this._data,
                this._config,
                textToken,
                areas,
                chapterMatchResult,
                simpleTextMatchResult,
                ct
            );

            return ct?.aborted
                ? []
                : [
                    ...chapterMatchResult.values(),
                    ...simpleTextMatchResult.values(),
                    ...tokenizedTextResult.values()
                ];
        }, cancellationSignal);
    }
}

export { FilteringService }
