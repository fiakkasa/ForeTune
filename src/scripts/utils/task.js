const task = {
    run: (delegate, cancellationSignal = null) => {
        return new Promise(
            (resolve, reject) => {
                setTimeout(() => {
                    try {
                        resolve(delegate());
                    } catch (error) {
                        reject(error);
                    }
                });

                cancellationSignal?.addEventListener('abort', () => {
                    reject(new Error('Operation aborted'));
                }, { once: true });
            }
        );
    },
    delay: (timeout, cancellationSignal = null) => {
        const normalizedTimeout = ~~timeout;

        return new Promise(
            (resolve, reject) => {
                setTimeout(resolve, normalizedTimeout < 0 ? 0 : normalizedTimeout);

                cancellationSignal?.addEventListener('abort', () => {
                    reject(new Error('Operation aborted'));
                }, { once: true });
            }
        );
    }
};

export { task }
