import { task } from '../../../src/utils/task.js';
import { BookmarksService } from '../../../src/apps/angel-numbers/services/BookmarksService.js';

describe('BookmarksService', () => {
    const config = Object.freeze({
        storageKey: 'angel-numbers.bookmarks'
    });
    const storageServiceFactory = (response) => ({
        get: jasmine.createSpy().and.returnValue(response),
        set: jasmine.createSpy()
    });
    let service;

    describe('init', () => {
        it('set empty Data when key not found', async () => {
            const storageService = storageServiceFactory(null);
            service = new BookmarksService(config, storageService, task);

            await service.init();

            expect(service.Count).toBe(0);
            expect(service.HasData).toBeFalse();
            expect(storageService.get).toHaveBeenCalledWith(config.storageKey);
        });

        it('set empty Data when not an array', async () => {
            const storageService = storageServiceFactory('hello');
            service = new BookmarksService(config, storageService, task);

            await service.init();

            expect(service.Count).toBe(0);
            expect(service.HasData).toBeFalse();
            expect(storageService.get).toHaveBeenCalledWith(config.storageKey);
        });

        it('set empty Data when empty array', async () => {
            const storageService = storageServiceFactory([]);
            service = new BookmarksService(config, storageService, task);

            await service.init();

            expect(service.Count).toBe(0);
            expect(service.HasData).toBeFalse();
            expect(storageService.get).toHaveBeenCalledWith(config.storageKey);
        });

        it('handles cancellation via AbortSignal', async () => {
            const storageService = storageServiceFactory(['_0']);
            service = new BookmarksService(config, storageService, task);

            const abortController = new AbortController();

            abortController.abort();
            await service.init(abortController.signal);

            expect(service.Count).toBe(0);
            expect(service.HasData).toBeFalse();
            expect(storageService.get).not.toHaveBeenCalled();
        });

        it('set retrieved Data on success', async () => {
            const storageService = storageServiceFactory(['_0']);
            service = new BookmarksService(config, storageService, task);

            await service.init();

            expect(service.Count).toBe(1);
            expect(service.HasData).toBeTrue();
            expect(storageService.get).toHaveBeenCalledWith(config.storageKey);
        });
    });

    describe('persistToStorage', () => {
        it('handles cancellation via AbortSignal', async () => {
            const storageService = storageServiceFactory(['_0']);
            service = new BookmarksService(config, storageService, task);

            await service.init();

            const abortController = new AbortController();
            abortController.abort();
            await service.persistToStorage(abortController.signal);

            expect(storageService.set).not.toHaveBeenCalled();
        });

        it('set data on success', async () => {
            const storageService = storageServiceFactory(['_0']);
            service = new BookmarksService(config, storageService, task);

            await service.init();
            await service.persistToStorage();

            expect(storageService.set).toHaveBeenCalledWith(
                config.storageKey,
                ['_0']
            );
        });
    });

    describe('isBookmarked', () => {
        beforeEach(async () => {
            service = new BookmarksService(
                config,
                storageServiceFactory(['_0']),
                task
            );

            await service.init();
        });

        it('should return true when key present', () => {
            const result = service.isBookmarked('_0');

            expect(result).toBeTrue();
        });

        it('should return false when key not present', () => {
            const result = service.isBookmarked('_100');

            expect(result).toBeFalse();
        });
    });

    describe('clear', () => {
        let storageService;

        beforeEach(() => {
            storageService = storageServiceFactory(['_0']);
        });

        it('should clear data', async () => {
            service = new BookmarksService(
                config,
                storageService,
                task
            );

            await service.init();

            const count = service.Count;

            await service.clear();

            const clearedCount = service.Count;

            expect(count).toBe(1);
            expect(clearedCount).toBe(0);
            expect(storageService.set).toHaveBeenCalledWith(
                config.storageKey,
                []
            );
        });

        it('handles cancellation via AbortSignal', async () => {
            service = new BookmarksService(
                config,
                storageServiceFactory(['_0']),
                task
            );

            const abortController = new AbortController();

            await service.init();
            const count = service.Count;

            abortController.abort();
            await service.clear(abortController.signal);

            const clearedCount = service.Count;

            expect(count).toBe(1);
            expect(clearedCount).toBe(1);
            expect(storageService.set).not.toHaveBeenCalled();
        });
    });

    describe('toggleBookmark', () => {
        let storageService;

        beforeEach(async () => {
            storageService = storageServiceFactory(['_0']);
            service = new BookmarksService(config, storageService, task);

            await service.init();
        });

        it('should toggle key when key present', async () => {
            const result = service.isBookmarked('_0');

            await service.toggleBookmark('_0');

            const toggleResult = service.isBookmarked('_0');

            expect(result).toBeTrue();
            expect(toggleResult).toBeFalse();
            expect(storageService.set).toHaveBeenCalledWith(
                config.storageKey,
                []
            );
        });

        it('should toggle key when key not present', async () => {
            const result = service.isBookmarked('_100');

            await service.toggleBookmark('_100');

            const toggleResult = service.isBookmarked('_100');

            expect(result).toBeFalse();
            expect(toggleResult).toBeTrue();
            expect(storageService.set).toHaveBeenCalledWith(
                config.storageKey,
                ['_0', '_100']
            );
        });

        it('handles cancellation via AbortSignal', async () => {
            const abortController = new AbortController();

            const result = service.isBookmarked('_0');

            abortController.abort();
            await service.toggleBookmark('_0', abortController.signal);

            const toggleResult = service.isBookmarked('_0');

            expect(result).toBeTrue();
            expect(toggleResult).toBeTrue();
            expect(storageService.set).not.toHaveBeenCalled();
        });
    });
});