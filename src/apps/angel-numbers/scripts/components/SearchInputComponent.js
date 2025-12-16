const SearchInputComponent = {
    inject: ['uiConfig'],
    props: ['text', 'loading', 'focusOnLoad'],
    emits: ['update:text'],
    template: `
        <div class="input-group">
            <input type="text"
                class="form-control"
                :placeholder="$t('enter_your_values')"
                :value="inputText"
                ref="searchInput"
                :maxlength="uiConfig.maxInputChars"
                @input="update($event.target.value)" />

            <button class="btn btn-outline-secondary"
                    :disabled="!text"
                    @click="clear">
                <i class="oi oi-x"></i>
            </button>
        </div>

        <small class="d-flex text-muted mt-1">
            <span v-if="loading" class="an-loading"></span>
            <span class="flex-fill"></span>
            <span class="px-1 bg-white rounded"
                  v-text="$t('characters_of_max_characters', { characters: text?.length || 0, maxCharacters: uiConfig.maxInputChars })"></span>
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
            const text = value.length > this.uiConfig.maxInputChars
                ? value.substring(0, this.uiConfig.maxInputChars)
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
