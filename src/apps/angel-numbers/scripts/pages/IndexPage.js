const IndexPage = {
    inject: ['data', 'uiConfig'],
    template: `
        <div class="an-container container d-flex flex-column">
            <div class="an-search-input-container position-sticky sticky-top px-3 pt-4">
                <search-input :text="text"
                              :loading="loading"
                              :focus-on-load="true"
                              @update:text="onTextChange" />
            </div>

            <div class="an-card card"
                 v-for="item in visibleData"
                 :key="item.number">
                <div class="card-body">
                    <h5 class="card-title" v-text="item.number"></h5>
                    <p class="card-text" v-text="item.text"></p>
                </div>
            </div>

            <small class="an-footer position-sticky sticky-bottom p-1 px-3 d-flex text-muted"
                   v-if="!loading || visibleData.length"
                   :class="[visibleData.length ? 'justify-content-end' : 'justify-content-center']">
                <span class="px-1 bg-white rounded"
                      v-if="visibleData.length"
                      v-text="$t('items_of_total', { items: visibleData.length, total: data.length })">
                </span>
                <span v-else-if="data.length" v-text="$t('nothing_found')"></span>
            </small>
        </div>
    `,
    data() {
        return {
            init: false,
            text: '',
            trimmedText: '',
            loading: false,
            visibleData: [],
            searchableData: [],
            timeoutRef: null,
            abortController: null
        };
    },
    beforeMount() {
        this.setTextItemsFromRoute();
        this.searchableData = this.data.map(({ number, text }) => ({
            number,
            text,
            processedText: text.toLowerCase().replaceAll(' ', '')
        }));
        this.find();
    },
    mounted() {
        this.init = true;
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
        delay(cancellationSignal) {
            return new Promise(
                (resolve, reject) => {
                    setTimeout(resolve, this.uiConfig.uiDefaultDelay);

                    cancellationSignal?.addEventListener('abort', () => {
                        reject(new Error('Operation aborted'));
                    }, { once: true });
                }
            );
        },
        async search(token, data, cancellationSignal) {
            return new Promise(
                (resolve, reject) => {
                    setTimeout(() => {
                        const numericToken = token.replace(/[^\d]/gi, '');
                        const textToken = token.replace(/[\d]/gi, '').toLowerCase().trim();

                        if (!numericToken && !textToken) {
                            resolve([]);
                            return;
                        }

                        // simple numeric match
                        let simpleNumericMatchResult = [];
                        if (numericToken) {
                            simpleNumericMatchResult = data.reduce(
                                (acc, { number, text, processedText }) => {
                                    if (numericToken && number === numericToken) {
                                        acc[number] = {
                                            number,
                                            text,
                                            processedText
                                        };
                                    }
                                    return acc;
                                },
                                {}
                            );
                        }

                        let simpleTextMatchResult = [];
                        if (textToken) {
                            simpleTextMatchResult = data.reduce(
                                (acc, { number, text, processedText }) => {
                                    if (
                                        !simpleNumericMatchResult[number]
                                        && textToken && processedText.includes(textToken)
                                    ) {
                                        acc[number] = {
                                            number,
                                            text,
                                            processedText
                                        };
                                    }
                                    return acc;
                                },
                                {}
                            );
                        }

                        // number tokenized match
                        let tokenizedNumberResult = {};
                        if (numericToken) {
                            const tokenizedNumber = Object.keys(
                                numericToken.split('').reduce(
                                    (acc, v) => {
                                        if (!acc[v]) {
                                            acc[v] = v;
                                        }

                                        return acc;
                                    },
                                    {}
                                )
                            );

                            if (tokenizedNumber.length <= 3) {
                                tokenizedNumberResult = data.reduce(
                                    (acc, { number, text, processedText }) => {
                                        if (
                                            !simpleNumericMatchResult[number]
                                            && !simpleTextMatchResult[number]
                                            && tokenizedNumber.every(fragment => number.includes(fragment))
                                        ) {
                                            acc[number] = {
                                                number,
                                                text,
                                                processedText
                                            };
                                        }
                                        return acc;
                                    },
                                    {}
                                );
                            }
                        }

                        // text tokenized match
                        let tokenizedTextResult = {};
                        if (textToken) {
                            const tokenizedText = textToken.split(' ');
                            tokenizedTextResult = data.reduce(
                                (acc, { number, text, processedText }) => {
                                    if (
                                        !simpleNumericMatchResult[number]
                                        && !simpleTextMatchResult[number]
                                        && !tokenizedNumberResult[number]
                                        && tokenizedText.every(fragment => processedText.includes(fragment))
                                    ) {
                                        acc[number] = {
                                            number,
                                            text,
                                            processedText
                                        };
                                    }
                                    return acc;
                                },
                                {}
                            );
                        }

                        resolve([
                            ...Object.values(simpleNumericMatchResult),
                            ...Object.values(simpleTextMatchResult),
                            ...Object.values(tokenizedNumberResult),
                            ...Object.values(tokenizedTextResult)
                        ]);
                    }, this.uiConfig.uiDefaultDelay);

                    cancellationSignal?.addEventListener('abort', () => {
                        reject(new Error('Operation aborted'));
                    }, { once: true });
                }
            );
        },
        async find() {
            this.loading = true;

            if (this.abortController) {
                this.abortController.abort();
            }

            this.abortController = new AbortController();

            if (!this.trimmedText) {
                this.visibleData = this.searchableData;
                this.loading = false;

                return;
            }

            const { result, error } = await this.delay(this.abortController.signal)
                .then(() => this.search(
                    this.trimmedText,
                    this.searchableData,
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
