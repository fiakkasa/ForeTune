const splitToken = (token) => {
    const numericToken = token.replace(/[^\d]/gi, '');
    const textToken = token.replace(/[\d]/gi, '').toLowerCase().trim();

    return { numericToken, textToken };
};

const findSimpleNumericMatch = (data, numericToken) => {
    if (!numericToken) {
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
    if (!numericToken) {
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

    if (tokenizedNumber.length > 3) {
        return {};
    }

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

    async search(token, cancellationSignal) {
        return new Promise(
            (resolve, reject) => {
                setTimeout(() => {
                    if (!token || !this._data.length) {
                        return Promise.resolve([]);
                    }

                    const { numericToken, textToken } = splitToken(token);

                    if (!numericToken && !textToken) {
                        resolve([]);

                        return;
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

                    resolve([
                        ...Object.values(simpleNumericMatchResult),
                        ...Object.values(simpleTextMatchResult),
                        ...Object.values(tokenizedNumberResult),
                        ...Object.values(tokenizedTextResult)
                    ]);
                });

                cancellationSignal?.addEventListener('abort', () => {
                    reject(new Error('Operation aborted'));
                }, { once: true });
            }
        );
    }
}

export { FilteringService }
