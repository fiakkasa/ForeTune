const IndexPage = {
    inject: ['appsConfig'],
    template: `
        <div class="nv-nav-container position-relative d-flex flex-column align-items-center justify-content-center overflow-auto vh-100" 
             :class="{ 'nv-stand-alone vw-100' : standAlone }">
            <nav class="nv-nav d-flex flex-wrap align-items-center justify-content-center">
                <button class="btn d-inline-flex flex-column align-items-center justify-content-center flex-shrink-0 overflow-hidden" 
                    v-for="item of appsConfig"
                    :class="getButtonClass(item)"
                    :title="$t(item.title)"
                    @click="navigateTo(item.urlFragment)">
                    <i v-if="item.icon" :class="item.icon"></i>
                    <span class="mw-100 overflow-hidden text-nowrap text-truncate"
                          v-if="standAlone" v-text="$t(item.title)"></span>
                </button>
            </nav>
            <div class="nv-nav-lift flex-fill flex-shrink-1"></div>
        </div>
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
                : [item.inactiveCssClass || 'btn-secondary', 'rounded-circle'];
        },
        navigateTo(urlFragment) {
            this.$router.push(`/${urlFragment}`);
        }
    }
};

export { IndexPage };
