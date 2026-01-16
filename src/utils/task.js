const task = {
    run: (delegate, cancellationSignal = null) => {
        return new Promise(
            (resolve, reject) => {
                const timeoutRef = setTimeout(() => {
                    try {
                        if (cancellationSignal?.aborted) {
                            reject(new Error('Operation aborted'));
                            return;
                        }

                        resolve(delegate(cancellationSignal));
                    } catch (error) {
                        reject(error);
                    }
                });

                cancellationSignal?.addEventListener('abort', () => {
                    clearTimeout(timeoutRef);
                    reject(new Error('Operation aborted'));
                }, { once: true });
            }
        );
    },
    delay: (timeout, cancellationSignal = null) => {
        const normalizedTimeout = ~~timeout;

        return new Promise(
            (resolve, reject) => {
                const timeoutRef = setTimeout(resolve, Math.max(normalizedTimeout, 0));

                cancellationSignal?.addEventListener('abort', () => {
                    clearTimeout(timeoutRef);
                    reject(new Error('Operation aborted'));
                }, { once: true });
            }
        );
    }
};

export { task }
