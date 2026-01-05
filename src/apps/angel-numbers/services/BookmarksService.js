class BookmarksService {
    _data = new Set();

    get Count() {
        return this._data.size;
    }

    get HasData() {
        return this._data.size > 0;
    }

    constructor(config, storageService, task) {
        this._config = config;
        this._storageService = storageService;
        this._task = task;
    }

    async init(cancellationSignal = null) {
        const result = await this._task
            .run(() => {
                const persistedData = this._storageService.get(
                    this._config.storageKey
                );

                return !persistedData
                    || !Array.isArray(persistedData)
                    || !persistedData.length
                    ? []
                    : persistedData;
            }, cancellationSignal)
            .catch(error => {
                console.error(error);
                return [];
            });

        this._data = new Set(result);
    }

    async persistToStorage(cancellationSignal = null) {
        await this._task
            .run(() => {
                this._storageService.set(
                    this._config.storageKey,
                    [...this._data]
                );
            }, cancellationSignal)
            .catch(console.error);
    }

    isBookmarked(key) {
        return !!this._data.has(key);
    }

    async clear(cancellationSignal = null) {
        await this._task
            .run(() =>
                this._data.clear(),
                cancellationSignal
            )
            .then(() => this.persistToStorage(cancellationSignal))
            .catch(console.error);
    }

    async toggleBookmark(key, cancellationSignal = null) {
        await this._task
            .run(() => {
                if (this.isBookmarked(key)) {
                    this._data.delete(key);
                } else {
                    this._data.add(key);
                }
            }, cancellationSignal)
            .then(() => this.persistToStorage(cancellationSignal))
            .catch(console.error);
    }
}

export { BookmarksService }
