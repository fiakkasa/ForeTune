const IndexPage = {
    inject: ['appsConfig', 'uiConfig'],
    template: `
        <div class="nv-app position-relative d-flex flex-column align-items-center justify-content-center overflow-auto vh-100" 
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
        <div class="nv-cache-status d-inline-flex justify-content-center align-align-items-center"
             v-if="serviceWorkerProgress > 0 && serviceWorkerProgress < 100"
             :key="'service-worker-progress' + serviceWorkerProgress"
             :title="$t('preparing_offline_support')">
            <i class="fa-solid fa-download"
               :class="[serviceWorkerProgress < 90 ? 'text-primary' : 'text-success' ]">
            </i>
        </div>
    `,
    data() {
        return {
            standAlone: false,
            serviceWorkerProgress: 0,
            pageUrlFragments: {},
            timeoutRef: null
        };
    },
    beforeMount() {
        this.setServiceWorkerEvents();
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
    beforeUnmount() {
        this.timeoutRef && clearTimeout(this.timeoutRef);
    },
    watch: {
        $route(to, from) {
            this.setIsStandAlone();
        }
    },
    methods: {
        setServiceWorkerEvents() {
            window.addEventListener('service-worker:init', () => {
                if (this.serviceWorkerProgress === 0) {
                    this.serviceWorkerProgress = 1;
                }
            }, { once: true });
            window.addEventListener('service-worker:installed', () => {
                if (this.serviceWorkerProgress === 1) {
                    this.serviceWorkerProgress = 80;
                }
            }, { once: true });
            window.addEventListener('service-worker:activating', () => {
                if (this.serviceWorkerProgress === 80) {
                    this.serviceWorkerProgress = 90;
                }
            }, { once: true });
            window.addEventListener('service-worker:activated', () => {
                if (this.serviceWorkerProgress !== 0) {
                    this.serviceWorkerProgress = 99;
                    this.timeoutRef = setTimeout(
                        () => this.serviceWorkerProgress = 100,
                        this.uiConfig.serviceWorkerDoneNotificationDelay
                    );
                }
            }, { once: true });
        },
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
            if (urlFragment !== this.$route.params.value) {
                this.$router.push(`/${urlFragment}`);
            }
        }
    }
};

export { IndexPage };
