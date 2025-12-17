class UiService {
    constructor(config) {
        this._config = config;
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

export { UiService };
