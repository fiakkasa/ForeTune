const { ref } = Vue;

class BookmarksService {
    _data = ref(new Set());

    get HasData() {
        return this._data.value.size > 0;
    }

    constructor(config, storageService, task) {
        this.config = config;
        this.storageService = storageService;
        this.task = task;
    }

    async init(cancellationSignal) {
        await this.task.run(() => {
            const persistedData = this.storageService.get(this.config.storageKey);

            if (
                !persistedData
                || !Array.isArray(persistedData)
                || !persistedData.length
            ) {
                return;
            }

            this._data.value = new Set(persistedData);
        }, cancellationSignal);
    }

    async persistToStorage(cancellationSignal) {
        await this.task.run(() => {
            this.storageService.set(
                this.config.storageKey,
                [...this._data.value]
            );
        }, cancellationSignal);
    }

    isBookmarked(key) {
        return !!this._data.value.has(key);
    }

    async clear(cancellationSignal) {
        this._data.value.clear();
        await this.persistToStorage(cancellationSignal);
    }

    async toggleBookmark(key, cancellationSignal) {
        if (this.isBookmarked(key)) {
            this._data.value.delete(key);
        } else {
            this._data.value.add(key);
        }

        await this.persistToStorage(cancellationSignal);
    }
}

export { BookmarksService }
