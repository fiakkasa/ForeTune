const IndexPage = {
    inject: ['appsConfig'],
    template: `
        <nav class="nv-nav d-flex align-items-center justify-content-center h-100 overflow-auto"
             :class="{ 'nv-stand-alone' : standAlone }">
            <button class="btn flex-shrink-0" 
                v-for="item of appsConfig"
                :class="getButtonClass(item)"
                :title="$t(item.title)"
                @click="navigateTo(item.urlFragment)">
                <i v-if="item.icon" :class="item.icon"></i>
                <span v-if="standAlone" v-text="$t(item.title)"></span>
            </button> 
        </nav>
    `,
    data() {
        return {
            standAlone: false,
            pageUrlFragments: {}
        };
    },
    beforeMount() {
        this.pageUrlFragments = Object.values(this.appsConfig)
            .reduce(
                (acc, { urlFragment }) => {
                    if (urlFragment !== this.appsConfig.main.urlFragment) {
                        acc[urlFragment] = urlFragment;
                    }

                    return acc;
                },
                {}
            );
        this.setIsStandAlone();
    },
    watch: {
        $route(to, from) {
            this.setIsStandAlone();
        }
    },
    methods: {
        setIsStandAlone() {
            this.standAlone = !this.$route.params.value
                || !this.pageUrlFragments[this.$route.params.value];
        },
        isActive(item) {
            return item.urlFragment === this.$route.params.value
                || this.standAlone && item.urlFragment === this.appsConfig.main.urlFragment;
        },
        getButtonClass(item) {
            const active = this.isActive(item);

            if (!this.standAlone && active) {
                return ['btn-lg', item.activeCssClass || 'btn-primary'];
            }

            if (!this.standAlone && !active) {
                return ['btn-lg', item.inactiveCssClass || 'btn-secondary'];
            }

            return active
                ? [item.activeCssClass || 'btn-primary', 'rounded-circle']
                : [item.inactiveCssClass || 'btn-secondary', 'rounded-circle', 'active'];
        },
        navigateTo(urlFragment) {
            this.$router.push(`/${urlFragment}`);
        }
    }
};

export { IndexPage };
