const splitToken = (token) => {
    const numericToken = token.replace(/[^\d]/gi, '');
    const textToken = token.replace(/[\d]/gi, '').toLowerCase().trim();

    return { numericToken, textToken };
};

const findSimpleNumericMatch = (data, numericToken) => {
    if (!numericToken || numericToken.length > 3) {
        return {};
    }

    return data.reduce(
        (acc, { number, text, processedText }) => {
            if (numericToken && number === numericToken) {
                acc[number] = {
                    number,
                    text,
                    processedText
                };
            }
            return acc;
        },
        {}
    );
};

const findSimpleTextMatch = (data, textToken, simpleNumericMatchResult) => {
    if (!textToken) {
        return {};
    }

    return data.reduce(
        (acc, { number, text, processedText }) => {
            if (!simpleNumericMatchResult[number]
                && textToken && processedText.includes(textToken)) {
                acc[number] = {
                    number,
                    text,
                    processedText
                };
            }
            return acc;
        },
        {}
    );
};

const findTokenizedNumber = (
    data,
    numericToken,
    simpleNumericMatchResult,
    simpleTextMatchResult
) => {
    if (!numericToken || numericToken.length > 3) {
        return {};
    }

    const tokenizedNumber = Object.keys(
        numericToken.split('').reduce(
            (acc, v) => {
                if (!acc[v]) {
                    acc[v] = v;
                }

                return acc;
            },
            {}
        )
    );

    return data.reduce(
        (acc, { number, text, processedText }) => {
            if (!simpleNumericMatchResult[number]
                && !simpleTextMatchResult[number]
                && tokenizedNumber.every(fragment => number.includes(fragment))) {
                acc[number] = {
                    number,
                    text,
                    processedText
                };
            }
            return acc;
        },
        {}
    );
};

const findTokenizedText = (
    data,
    textToken,
    simpleNumericMatchResult,
    simpleTextMatchResult,
    tokenizedNumberResult
) => {
    if (!textToken) {
        return {};
    }

    const tokenizedText = textToken.split(' ');

    return data.reduce(
        (acc, { number, text, processedText }) => {
            if (!simpleNumericMatchResult[number]
                && !simpleTextMatchResult[number]
                && !tokenizedNumberResult[number]
                && tokenizedText.every(fragment => processedText.includes(fragment))) {
                acc[number] = {
                    number,
                    text,
                    processedText
                };
            }
            return acc;
        },
        {}
    );
};

class FilteringService {
    _data = [];

    get Data() {
        return this._data;
    }
    set Data(value) {
        this._data = (value || []).map(({ number, text }) => ({
            number,
            text,
            processedText: text.toLowerCase().replaceAll(' ', '')
        }));
    }

    constructor(task) {
        this._task = task;
    }

    async search(token, cancellationSignal) {
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
                numericToken,
                simpleNumericMatchResult,
                simpleTextMatchResult
            );
            // text tokenized match
            const tokenizedTextResult = findTokenizedText(
                this._data,
                textToken,
                simpleNumericMatchResult,
                simpleTextMatchResult,
                tokenizedNumberResult
            );

            return [
                ...Object.values(simpleNumericMatchResult),
                ...Object.values(simpleTextMatchResult),
                ...Object.values(tokenizedNumberResult),
                ...Object.values(tokenizedTextResult)
            ];
        }, cancellationSignal);
    }
}

export { FilteringService }
