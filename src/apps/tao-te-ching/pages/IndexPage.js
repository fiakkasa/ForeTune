const boolToChar = value => value ? '1' : '0';
const charToBool = value => value === '1';
const _charBool = new Set(['0', '1']);

const IndexPage = {
    inject: ['uiService', 'filteringService', 'bookmarksService'],
    template: `
        <div class="ttc-app h-100 overflow-auto">
            <div class="ttc-search-input-container container position-sticky sticky-top px-3 pt-4">
                <search-input :text="searchToken"
                              :loading="loading"
                              :focus-on-load="true"
                              @update:text="onTextChange">
                    
                    <template #controlsPre>
                        <button type="button" 
                                class="btn d-flex position-relative align-items-center justify-content-center p-2"
                                :class="[textVisible ? 'btn-primary' : 'btn-secondary']"
                                :title="$t('english')"
                                @click="toggleTextVisible()">
                            <i class="fa fa-font"></i>
                        </button>
                        <button type="button" 
                                class="btn d-flex position-relative align-items-start justify-content-start p-2"
                                :class="[originalTextVisible ? 'btn-primary' : 'btn-secondary']"
                                :title="$t('original')"
                                @click="toggleOriginalTextVisible()">
                            <i class="fa fa-font"></i>
                            <small class="position-absolute top-50 start-50 z-1 lh-1">繁</small>
                        </button>
                    </template>

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
            <div class="ttc-skeleton container d-flex flex-column"
                 v-if="showSkeleton">
                <div class="ttc-card card">
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
                   v-else-if="!loading && !visibleColumns">
                <span v-text="$t('no_text_mode_selected')"></span>
            </small>
            <small class="p-1 px-3 d-flex justify-content-center text-body-secondary"
                   v-else-if="!loading && !visibleDataCount">
                <span v-text="$t('nothing_found')"></span>
            </small>
            <div class="ttc-cards container d-flex flex-column"
                 v-else-if="visibleData.length">
                <template v-for="item in visibleData">
                    <div class="ttc-card card"
                         v-if="bookmarksService.isBookmarked(item.key)"
                         :key="item.key">
                        <div class="card-body">
                            <h5 class="card-title d-flex align-items-center lh-base">
                                <div class="ttc-card-chapter" v-text="item.chapter"></div>
                                <div class="ttc-card-title flex-fill text-truncate" v-text="item.title"></div>
                                <button type="button"
                                        class="btn btn-default text-success d-flex align-items-center justify-content-center p-1"
                                        @click="toggleBookmark(item.key)">
                                    <i class="fa fa-bookmark"></i>
                                </button>
                            </h5>
                            <div class="card-text" :class="cardContentClass">
                                <div v-if="textVisible">
                                    <h6 v-if="visibleColumns > 1" v-text="$t('english')"></h6>
                                    <p v-text="item.text"></p>
                                </div>
                                <div v-if="originalTextVisible">
                                    <h6 v-if="visibleColumns > 1" v-text="$t('original')"></h6>
                                    <p v-text="item.originalText"></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
                <template v-if="!viewOnlyBookmarks">
                    <template v-for="item in visibleData">
                        <div class="ttc-card card"
                             v-if="!bookmarksService.isBookmarked(item.key)"
                             :key="item.key">
                            <div class="card-body">
                                <h5 class="card-title d-flex align-items-center lh-base">
                                    <div class="ttc-card-chapter" v-text="item.chapter"></div>
                                    <div class="ttc-card-title flex-fill text-truncate" v-text="item.title"></div>
                                    <button type="button"
                                            class="btn btn-default text-secondary d-flex align-items-center justify-content-center p-1"
                                            @click="toggleBookmark(item.key)">
                                        <i class="fa fa-bookmark"></i>
                                    </button>
                                </h5>
                                <div class="card-text" :class="cardContentClass">
                                    <div v-if="textVisible">
                                        <h6 v-if="visibleColumns > 1" v-text="$t('english')"></h6>
                                        <p v-text="item.text"></p>
                                    </div>
                                    <div v-if="originalTextVisible">
                                        <h6 v-if="visibleColumns > 1" v-text="$t('original')"></h6>
                                        <p v-text="item.originalText"></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </template>
            </div>

            <small class="ttc-footer justify-content-end container position-sticky sticky-bottom p-1 px-3 d-flex text-body-secondary"
                   v-if="!showSkeleton && visibleDataCount && visibleColumns">
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
            loadingTextMode: false,
            init: false,
            visibleData: [],
            visibleBookmarksCount: 0,
            timeoutRef: null,
            viewOnlyBookmarks: false,
            findAbortController: new AbortController(),
            bookmarkAbortController: new AbortController(),
            textVisible: true,
            originalTextVisible: true
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
                && to.query.textVisible === boolToChar(this.textVisible)
                && to.query.originalTextVisible === boolToChar(this.originalTextVisible)
            ) {
                return;
            }

            this.process(to.query);
        }
    },
    computed: {
        showSkeleton() {
            return !this.init
                || this.loadingTextMode
                || (this.loading && !this.visibleDataCount);
        },
        visibleDataCount() {
            return this.viewOnlyBookmarks
                ? this.visibleBookmarksCount
                : this.visibleData.length;
        },
        visibleColumns() {
            return Math.trunc(this.textVisible)
                + Math.trunc(this.originalTextVisible);
        },
        cardContentClass() {
            return `visible-columns-${this.visibleColumns}`;
        }
    },
    methods: {
        process(query) {
            const keys = new Set(Object.keys(query));

            if (keys.size === 0) {
                this.setSearchTokens('');
                this.viewOnlyBookmarks = false;
                this.textVisible = true;
                this.originalTextVisible = true;

                this.find();

                return;
            }

            const searchToken = query.search ?? '';
            const viewOnlyBookmarksValue = charToBool(query.viewOnlyBookmarks);
            const textVisible = charToBool(query.textVisible);
            const originalTextVisible = charToBool(query.originalTextVisible);
            const viewOnlyBookmarks = viewOnlyBookmarksValue && this.bookmarksService.HasData;

            if (
                keys.size !== 4
                || (viewOnlyBookmarksValue !== viewOnlyBookmarks)
                || !(
                    keys.has('search')
                    && keys.has('viewOnlyBookmarks')
                    && keys.has('textVisible')
                    && keys.has('originalTextVisible')
                )
                || !_charBool.has(query.viewOnlyBookmarks)
                || !_charBool.has(query.textVisible)
                || !_charBool.has(query.originalTextVisible)
            ) {
                this.setRoute(
                    searchToken,
                    viewOnlyBookmarks,
                    textVisible || !keys.has('textVisible'),
                    originalTextVisible || !keys.has('originalTextVisible')
                );
                return;
            }

            const setSearchTokens = searchToken !== this.searchToken;
            const setViewOnlyBookmarks = viewOnlyBookmarks !== this.viewOnlyBookmarks;
            const setTextVisible = textVisible !== this.textVisible;
            const setOriginalTextVisible = originalTextVisible !== this.originalTextVisible;
            const runFind = !this.init
                || setSearchTokens
                || setTextVisible
                || setOriginalTextVisible;

            this.loadingTextMode = this.init && (setTextVisible || setOriginalTextVisible);

            setSearchTokens && (this.setSearchTokens(searchToken));
            setViewOnlyBookmarks && (this.viewOnlyBookmarks = viewOnlyBookmarks);
            setTextVisible && (this.textVisible = textVisible);
            setOriginalTextVisible && (this.originalTextVisible = originalTextVisible);

            runFind && this.find();
        },
        setRoute(searchToken, viewOnlyBookmarks, textVisible, originalTextVisible) {
            this.$router.push({
                query: {
                    search: searchToken,
                    viewOnlyBookmarks: boolToChar(viewOnlyBookmarks),
                    textVisible: boolToChar(textVisible),
                    originalTextVisible: boolToChar(originalTextVisible)
                }
            });
        },
        onTextChange(text) {
            this.setRoute(
                text,
                this.viewOnlyBookmarks,
                this.textVisible,
                this.originalTextVisible
            );
        },
        toggleTextVisible() {
            this.setRoute(
                this.searchToken,
                this.viewOnlyBookmarks,
                !this.textVisible,
                this.originalTextVisible
            );
        },
        toggleOriginalTextVisible() {
            this.setRoute(
                this.searchToken,
                this.viewOnlyBookmarks,
                this.textVisible,
                !this.originalTextVisible
            );
        },
        toggleViewOnlyBookmarks() {
            this.setRoute(
                this.searchToken,
                !this.viewOnlyBookmarks,
                this.textVisible,
                this.originalTextVisible
            );
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
                this.setRoute(
                    this.searchToken,
                    false,
                    this.textVisible,
                    this.originalTextVisible
                );
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
                this.setRoute(
                    this.searchToken,
                    false,
                    this.textVisible,
                    this.originalTextVisible
                );
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

            if (!this.trimmedSearchToken || !this.visibleColumns) {
                this.visibleData = this.filteringService.Data;
                this.setVisibleBookmarksCount(this.findAbortController.signal);
                this.loading = false;
                this.loadingTextMode = false;
                this.init = true;

                return;
            }

            const { result, error } = await this.uiService
                .delay(this.findAbortController.signal)
                .then(() => this.filteringService.search(
                    this.trimmedSearchToken,
                    {
                        chapter: true,
                        title: true,
                        text: this.textVisible,
                        originalText: this.originalTextVisible
                    },
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
            this.loadingTextMode = false;
            this.init = true;
        },
        setSearchTokens(text) {
            this.searchToken = (text || '').replaceAll('%20', ' ').replaceAll('.', ' ');
            this.trimmedSearchToken = this.searchToken.trim();
        }
    }
};

export { IndexPage };
