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

const toDeltaIntCollectionSequence = (text, cancellationSignal = null) => {
    if (cancellationSignal?.aborted || !text) {
        return [];
    }

    const result = [];

    for (const ch of text) {
        if (cancellationSignal?.aborted) {
            return [];
        }

        result.push(toDeltaInt(ch));
    }

    return result;
};

const toSumString = (collection, cancellationSignal = null) => {
    if (cancellationSignal?.aborted || !collection?.length) {
        return '';
    }

    let result = 0;

    for (const item of collection) {
        if (cancellationSignal?.aborted) {
            return '';
        }

        result += Math.trunc(item);
    }

    return result.toString();
};

const calculateSumAndStep = (
    digits,
    sequence,
    equation,
    cancellationSignal = null
) => {
    let sum = '';
    let step = {
        equation,
        sum,
        numberOfCharacters: 0,
        sequence
    };

    if (cancellationSignal?.aborted || !digits?.length) {
        return { sum, step };
    }

    sum = toSumString(digits, cancellationSignal);
    step.sum = sum;
    step.numberOfCharacters = digits.length;

    return { sum, step };
};

export { toDeltaInt, toDeltaIntCollectionSequence, toSumString, calculateSumAndStep };