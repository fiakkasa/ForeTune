const boolToChar = value => value ? '1' : '0';
const charToBool = value => value === '1';
const _charBool = new Set(['0', '1']);

const IndexPage = {
    inject: ['uiService', 'filteringService', 'bookmarksService'],
    template: `
        <div class="an-app h-100 overflow-auto">
            <div class="an-search-input-container container position-sticky sticky-top px-3 pt-4">
                <search-input :text="searchToken"
                              :loading="loading"
                              :focus-on-load="true"
                              @update:text="onTextChange">
                    <template #controls>
                        <template v-if="bookmarksService.HasData">
                            <button type="button"
                                    class="btn d-flex position-relative align-items-start justify-content-start p-2"
                                    :class="[viewOnlyBookmarks ? 'btn-info' : 'btn-secondary']"
                                    :title="$t('view_only_bookmarks')"
                                    @click="toggleViewOnlyBookmarks">
                                <i class="fa fa-bookmark z-0"></i>
                                <i class="fa fa-filter small position-absolute top-50 start-50 z-1"></i>
                            </button>
                            <button type="button"
                                    class="btn btn-danger position-relative d-flex align-items-start justify-content-start p-2"
                                    v-if="bookmarksService.HasData"
                                    :title="$t('clear_bookmarks')"
                                    v-confirm="{
                                        okText: $t('ok'),
                                        cancelText: $t('cancel'),
                                        message: $t('x_bookmarks_will_be_removed', { count: bookmarksService.Count }),
                                        customClass: {
                                            mainContent: 'card',
                                            body: 'card-body',
                                            footer: 'card-footer d-flex justify-content-between',
                                            ok: 'btn btn-danger',
                                            cancel: 'btn btn-secondary'
                                        }
                                    }"
                                    @click="clearBookmarks">
                                <i class="fa fa-bookmark"></i>
                                <i class="fa fa-trash-can small position-absolute top-50 start-50 z-1"></i>
                            </button>
                        </template>
                    </template>
                </search-input>
            </div>
            <div class="an-skeleton container d-flex flex-column"
                 v-if="showSkeleton">
                <div class="an-card card">
                    <div class="card-body">
                        <h5 class="card-title d-flex align-items-center justify-content-between">
                            <div class="placeholder-glow">
                                <span class="placeholder"></span>
                            </div>
                        </h5>
                        <p class="card-text placeholder-glow">
                            <div class="placeholder w-75"></div>
                            <div class="placeholder w-100"></div>
                            <div class="placeholder w-75"></div>
                        </p>
                    </div>
                </div>
            </div>
            <small class="p-1 px-3 d-flex justify-content-center text-body-secondary"
                   v-else-if="!loading && !filteringService.Data.length">
                <span v-text="$t('no_data')"></span>
            </small>
            <small class="p-1 px-3 d-flex justify-content-center text-body-secondary"
                   v-else-if="!loading && !visibleDataCount">
                <span v-text="$t('nothing_found')"></span>
            </small>
            <div class="an-cards container d-flex flex-column"
                 v-else-if="visibleData.length">
                <template v-for="item in visibleData">
                    <div class="an-card card"
                         v-if="bookmarksService.isBookmarked(item.key)"
                         :key="item.key">
                        <div class="card-body">
                            <h5 class="card-title d-flex align-items-center justify-content-between lh-base">
                                <div class="an-card-number" v-text="item.number"></div>
                                <button type="button"
                                        class="btn btn-default text-success d-flex align-items-center justify-content-center p-1"
                                        @click="toggleBookmark(item.key)">
                                    <i class="fa fa-bookmark"></i>
                                </button>
                            </h5>
                            <p class="card-text" v-text="item.text"></p>
                        </div>
                    </div>
                </template>
                <template v-if="!viewOnlyBookmarks">
                    <template v-for="item in visibleData">
                        <div class="an-card card"
                             v-if="!bookmarksService.isBookmarked(item.key)"
                             :key="item.key">
                            <div class="card-body">
                                <h5 class="card-title d-flex align-items-center justify-content-between lh-base">
                                    <div class="an-card-number" v-text="item.number"></div>
                                    <button type="button"
                                            class="btn btn-default text-secondary d-flex align-items-center justify-content-center p-1"
                                            @click="toggleBookmark(item.key)">
                                        <i class="fa fa-bookmark"></i>
                                    </button>
                                </h5>
                                <p class="card-text" v-text="item.text"></p>
                            </div>
                        </div>
                    </template>
                </template>
            </div>

            <small class="an-footer justify-content-end container position-sticky sticky-bottom p-1 px-3 d-flex text-body-secondary"
                   v-if="!showSkeleton && visibleDataCount">
                <span class="px-1 bg-body rounded"
                      v-text="$t('items_of_total', { items: visibleDataCount, total: filteringService.Data.length })">
                </span>
            </small>
        </div>
    `,
    data() {
        return {
            searchToken: '',
            trimmedSearchToken: '',
            loading: false,
            init: false,
            visibleData: [],
            visibleBookmarksCount: 0,
            timeoutRef: null,
            viewOnlyBookmarks: false,
            findAbortController: new AbortController(),
            bookmarkAbortController: new AbortController()
        };
    },
    beforeMount() {
        this.process(this.$route.query);
    },
    beforeUnmount() {
        this.findAbortController.abort();
        this.bookmarkAbortController.abort();
    },
    watch: {
        $route(to, from) {
            if (
                to.query.search === this.searchToken
                && to.query.viewOnlyBookmarks === boolToChar(this.viewOnlyBookmarks)
            ) {
                return;
            }

            this.process(to.query);
        }
    },
    computed: {
        showSkeleton() {
            return !this.init
                || (this.loading && !this.visibleDataCount);
        },
        visibleDataCount() {
            return this.viewOnlyBookmarks
                ? this.visibleBookmarksCount
                : this.visibleData.length;
        }
    },
    methods: {
        process(query) {
            const keys = new Set(Object.keys(query));

            if (keys.size === 0) {
                this.setSearchTokens('');
                this.viewOnlyBookmarks = false;

                this.find();

                return;
            }

            const searchToken = query.search ?? '';
            const viewOnlyBookmarksValue = charToBool(query.viewOnlyBookmarks);
            const viewOnlyBookmarks = viewOnlyBookmarksValue && this.bookmarksService.HasData;

            if (
                keys.size !== 2
                || (viewOnlyBookmarksValue !== viewOnlyBookmarks)
                || !(keys.has('search') && keys.has('viewOnlyBookmarks'))
                || !_charBool.has(query.viewOnlyBookmarks)
            ) {
                this.setRoute(searchToken, viewOnlyBookmarks);
                return;
            }

            const setSearchTokens = searchToken !== this.searchToken;
            const setViewOnlyBookmarks = viewOnlyBookmarks !== this.viewOnlyBookmarks;
            const runFind = !this.init || setSearchTokens;

            setSearchTokens && (this.setSearchTokens(searchToken));
            setViewOnlyBookmarks && (this.viewOnlyBookmarks = viewOnlyBookmarks);

            runFind && this.find();
        },
        setRoute(searchToken, viewOnlyBookmarks) {
            this.$router.push({
                query: {
                    search: searchToken,
                    viewOnlyBookmarks: boolToChar(viewOnlyBookmarks)
                }
            });
        },
        onTextChange(text) {
            this.setRoute(text, this.viewOnlyBookmarks);
        },
        toggleViewOnlyBookmarks() {
            this.setRoute(this.searchToken, !this.viewOnlyBookmarks);
        },
        async toggleBookmark(number) {
            this.loading = true;

            this.bookmarkAbortController.abort();
            this.bookmarkAbortController = new AbortController();

            await this.bookmarksService.toggleBookmark(
                number,
                this.bookmarkAbortController.signal
            );
            this.setVisibleBookmarksCount(this.bookmarkAbortController.signal);

            this.loading = false;

            if (!this.bookmarksService.HasData && this.viewOnlyBookmarks) {
                this.setRoute(this.searchToken, false);
            }
        },
        async clearBookmarks() {
            this.loading = true;

            this.bookmarkAbortController.abort();
            this.bookmarkAbortController = new AbortController();

            await this.bookmarksService.clear(this.bookmarkAbortController.signal);
            this.setVisibleBookmarksCount(this.bookmarkAbortController.signal);

            this.loading = false;

            if (this.viewOnlyBookmarks) {
                this.setRoute(this.searchToken, false);
            }
        },
        setVisibleBookmarksCount(cancellationSignal = null) {
            if (cancellationSignal?.aborted) {
                return;
            }

            if (!this.bookmarksService.HasData) {
                this.visibleBookmarksCount = 0;
                return;
            }

            let count = 0;

            for (const { key } of this.visibleData) {
                if (cancellationSignal?.aborted) {
                    return;
                }

                this.bookmarksService.isBookmarked(key) && count++;
            }

            this.visibleBookmarksCount = count;
        },
        async find() {
            this.loading = true;

            this.findAbortController.abort();
            this.findAbortController = new AbortController();

            if (!this.trimmedSearchToken) {
                this.visibleData = this.filteringService.Data;
                this.setVisibleBookmarksCount(this.findAbortController.signal);
                this.loading = false;
                this.init = true;

                return;
            }

            const { result, error } = await this.uiService
                .delay(this.findAbortController.signal)
                .then(() => this.filteringService.search(
                    this.trimmedSearchToken,
                    this.findAbortController.signal
                ))
                .then(result => ({ result }))
                .catch(error => ({ error }));

            if (error) {
                return;
            }

            this.visibleData = result;
            this.setVisibleBookmarksCount(this.findAbortController.signal);
            this.loading = false;
            this.init = true;
        },
        setSearchTokens(text) {
            this.searchToken = (text || '').replaceAll('%20', ' ').replaceAll('.', ' ');
            this.trimmedSearchToken = this.searchToken.trim();
        }
    }
};

export { IndexPage };
