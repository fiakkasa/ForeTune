class UiService {
    constructor(config, task) {
        this._config = config;
        this._task = task;
    }

    delay(cancellationSignal) {
        return this._task.delay(
            this._config.maxSearchInputChars, 
            cancellationSignal
        );
    }
}

export { UiService };
