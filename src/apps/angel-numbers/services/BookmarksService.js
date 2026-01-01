const { ref } = Vue;
const _storageKey = 'angel-numbers.bookmarks';
const _keyPrefix = 'b';

class BookmarksService {
    _data = ref({});

    constructor(storageService, task) {
        this.storageService = storageService;
        this.task = task;
    }

    get HasData() {
        return Object.keys(this._data.value).length > 0;
    }

    async init(cancellationSignal) {
        await this.task.run(() => {
            const savedData = this.storageService.get(_storageKey);

            if (!savedData || !Object.values(savedData).length) {
                return;
            }

            this._data.value = savedData;
        }, cancellationSignal);
    }

    async persistToStorage(cancellationSignal) {
        await this.task.run(() => {
            this.storageService.set(
                _storageKey,
                this._data.value
            );
        }, cancellationSignal);
    }

    isBookmarked(number) {
        return this._data.value[_keyPrefix + number];
    }

    filterBookmarks(data, cancellationSignal) {
        return this.task.run(() =>
            data.filter(item => this.isBookmarked(item.number)),
            cancellationSignal
        );
    }

    async clear(cancellationSignal) {
        this._data.value = {};
        await this.persistToStorage(cancellationSignal);
    }

    async toggleBookmark(number, cancellationSignal) {
        if (
            number !== '00'
            && (
                number > 999
                || number < 0
            )

        ) {
            return;
        }

        if (this.isBookmarked(number)) {
            delete this._data.value[_keyPrefix + number];
        } else {
            this._data.value[_keyPrefix + number] = true;
        }

        await this.persistToStorage(cancellationSignal);
    }
}

export { BookmarksService }
