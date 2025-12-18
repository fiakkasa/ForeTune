const IndexPage = {
    inject: ['uiService', 'filteringService'],
    template: `
        <div class="an-container container h-100 overflow-auto">
            <div class="an-search-input-container position-sticky sticky-top px-3 pt-4">
                <search-input :text="text"
                              :loading="loading"
                              :focus-on-load="true"
                              @update:text="onTextChange" />
            </div>

            <div class="an-cards d-flex flex-column">
                <div class="an-card card"
                     v-for="item in visibleData"
                     :key="item.number">
                    <div class="card-body">
                        <h5 class="card-title" v-text="item.number"></h5>
                        <p class="card-text" v-text="item.text"></p>
                    </div>
                </div>
            </div>

            <small class="an-footer position-sticky sticky-bottom p-1 px-3 d-flex text-muted"
                   v-if="!loading || visibleData.length"
                   :class="[visibleData.length ? 'justify-content-end' : 'justify-content-center']">
                <span class="px-1 bg-white rounded"
                      v-if="visibleData.length"
                      v-text="$t('items_of_total', { items: visibleData.length, total: filteringService.Data.length })">
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
            timeoutRef: null,
            abortController: null
        };
    },
    beforeMount() {
        this.setTextItemsFromRoute();
        this.find();
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
    methods: {
        async find() {
            this.loading = true;

            if (this.abortController) {
                this.abortController.abort();
            }

            this.abortController = new AbortController();

            if (!this.trimmedText) {
                this.visibleData = this.filteringService.Data;
                this.loading = false;

                return;
            }

            const { result, error } = await this.uiService.delay(this.abortController.signal)
                .then(() => this.filteringService.search(
                    this.trimmedText,
                    this.abortController.signal
                ))
                .then(result => ({ result }))
                .catch(error => ({ error }));

            if (error) {
                return;
            }

            this.visibleData = result;
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
