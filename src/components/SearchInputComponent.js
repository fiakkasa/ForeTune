const SearchInputComponent = {
    inject: ['uiConfig'],
    props: ['text', 'loading', 'focusOnLoad'],
    emits: ['update:text'],
    template: `
        <div class="app-search-container input-group">
            <input type="text"
                class="form-control"
                :placeholder="$t('enter_your_values')"
                :value="inputText"
                ref="searchInput"
                :maxlength="uiConfig.maxSearchInputChars"
                @input="update($event.target.value)" />

            <slot name="controls" />

            <button type="button"
                    class="btn btn-outline-secondary px-2"
                    v-if="inputText"
                    @click="clear">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>

        <small class="d-flex text-body-secondary py-1">
            <div class="app-loading" v-if="loading"></div>
            <div class="flex-fill"></div>
            <div class="px-1 bg-body rounded"
                  v-text="$t(
                    'characters_of_max_characters',
                    {
                        characters: text?.length || 0,
                        maxCharacters: uiConfig.maxSearchInputChars 
                    })">
            </div>
        </small>
    `,
    data() {
        return {
            inputText: ''
        };
    },
    mounted() {
        this.inputText = this.text || '';

        if (!this.focusOnLoad) {
            return;
        }

        setTimeout(() => this.$refs.searchInput.focus());
    },
    watch: {
        text(newValue, oldValue) {
            if (newValue === this.inputText) {
                return;
            }

            this.inputText = newValue || '';
        }
    },
    methods: {
        update(value) {
            const text = value.length > this.uiConfig.maxSearchInputChars
                ? value.substring(0, this.uiConfig.maxSearchInputChars)
                : value;
            this.inputText = text;
            this.$emit('update:text', text);
        },
        clear() {
            this.update('');
            this.$refs.searchInput.focus();
        }
    }
};

export { SearchInputComponent };
