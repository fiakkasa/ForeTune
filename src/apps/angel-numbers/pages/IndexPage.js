const IndexPage = {
    inject: ['uiService', 'filteringService', 'bookmarksService'],
    template: `
        <div class="an-app h-100 overflow-auto">
            <div class="an-search-input-container container position-sticky sticky-top px-3 pt-4">
                <search-input :text="text"
                              :loading="loading"
                              :focus-on-load="true"
                              @update:text="onTextChange">
                    <template #controls>
                        <template v-if="bookmarksService.HasData">
                            <button type="button"
                                    class="btn d-flex position-relative align-items-start justify-content-start p-2"
                                    :class="[viewOnlyBookmarks ? 'btn-info' : 'btn-outline-info']"
                                    :title="$t('view_only_bookmarks')"
                                    @click="toggleViewOnlyBookmarks">
                                <i class="fa fa-bookmark z-0"></i>
                                <i class="fa fa-filter small position-absolute top-50 start-50 z-1"></i>
                            </button>
                            <button type="button"
                                    class="btn btn-danger position-relative d-flex align-items-start justify-content-start p-2"
                                    v-if="bookmarksService.HasData"
                                    :title="$t('clear_bookmarks')"
                                    @click="clearBookmarks">
                                <i class="fa fa-bookmark"></i>
                                <i class="fa fa-trash-can small position-absolute top-50 start-50 z-1"></i>
                            </button>
                        </template>
                    </template>
                </search-input>
            </div>

            <div class="an-cards container d-flex flex-column"
                 v-if="visibleData.length">
                <template v-for="item in visibleData">
                    <div class="an-card card"
                         v-if="bookmarksService.isBookmarked(item.key)"
                         :key="item.key">
                        <div class="card-body">
                            <h5 class="card-title d-flex align-items-center justify-content-between">
                                <div v-text="item.number"></div>
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
                                <h5 class="card-title d-flex align-items-center justify-content-between">
                                    <div v-text="item.number"></div>
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

            <small class="an-footer container position-sticky sticky-bottom p-1 px-3 d-flex text-body-secondary"
                   v-if="!loading || visibleDataCount"
                   :class="[visibleDataCount ? 'justify-content-end' : 'justify-content-center']">
                <span class="px-1 bg-body rounded"
                      v-if="visibleDataCount"
                      v-text="$t('items_of_total', { items: visibleDataCount, total: filteringService.Data.length })">
                </span>
                <span v-else-if="filteringService.Data.length" v-text="$t('nothing_found')"></span>
            </small>
        </div>
    `,
    data() {
        return {
            text: '',
            trimmedText: '',
            loading: false,
            visibleData: [],
            visibleBookmarksCount: 0,
            timeoutRef: null,
            viewOnlyBookmarks: false,
            findAbortController: new AbortController(),
            bookmarkAbortController: new AbortController()
        };
    },
    beforeMount() {
        this.setTextItemsFromRoute();
        this.find();
    },
    beforeUnmount() {
        this.findAbortController.abort();
        this.bookmarkAbortController.abort();
    },
    watch: {
        $route(to, from) {
            if (to.query.text === this.text) {
                return;
            }

            this.setTextItemsFromRoute();
            this.find();
        }
    },
    computed: {
        visibleDataCount() {
            return this.viewOnlyBookmarks
                ? this.visibleBookmarksCount
                : this.visibleData.length;
        }
    },
    methods: {
        toggleViewOnlyBookmarks() {
            this.viewOnlyBookmarks = !this.viewOnlyBookmarks;
        },
        async toggleBookmark(number) {
            this.loading = true;

            this.bookmarkAbortController.abort();
            this.bookmarkAbortController = new AbortController();

            await this.bookmarksService.toggleBookmark(
                number,
                this.bookmarkAbortController.signal
            );

            this.setVisibleBookmarksCount();
            this.loading = false;
        },
        async clearBookmarks() {
            this.loading = true;
            this.visibleBookmarksCount = 0;

            this.bookmarkAbortController.abort();
            this.bookmarkAbortController = new AbortController();

            await this.bookmarksService.clear(this.bookmarkAbortController.signal);

            this.viewOnlyBookmarks = false;
            this.loading = false;
        },
        setVisibleBookmarksCount() {
            let count = 0;

            for (const { key } of this.visibleData) {
                this.bookmarksService.isBookmarked(key) && count++;
            }

            this.visibleBookmarksCount = count;
        },
        async find() {
            this.loading = true;

            this.findAbortController.abort();
            this.findAbortController = new AbortController();

            if (!this.trimmedText) {
                this.visibleData = this.filteringService.Data;
                this.setVisibleBookmarksCount();
                this.loading = false;

                return;
            }

            const { result, error } = await this.uiService.delay(this.findAbortController.signal)
                .then(() => this.filteringService.search(
                    this.trimmedText,
                    this.findAbortController.signal
                ))
                .then(result => ({ result }))
                .catch(error => ({ error }));

            if (error) {
                return;
            }

            this.visibleData = result;
            this.setVisibleBookmarksCount();
            this.loading = false;
        },
        setTextItemsFromRoute() {
            this.text = this.normalizeText(
                this.$route.query.text
            );
            this.trimmedText = this.text.trim();
        },
        normalizeText(text) {
            return (text || '').replaceAll('%20', ' ').replaceAll('.', ' ');
        },
        onTextChange(text) {
            this.text = this.normalizeText(text);
            this.trimmedText = this.text.trim();
            this.$router.push({ query: { text: this.text } });
            this.find();
        }
    }
};

export { IndexPage };
