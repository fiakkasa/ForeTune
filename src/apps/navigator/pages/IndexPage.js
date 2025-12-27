const IndexPage = {
    inject: ['appsConfig', 'uiConfig', 'serviceWorkerConfig'],
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
            timeoutRef: null,
            serviceWorker: null
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
        this.serviceWorker?.removeEventListener('statechange', serviceWorkerEventHandler);
    },
    watch: {
        $route(to, from) {
            this.setIsStandAlone();
        }
    },
    methods: {
        async setServiceWorkerEvents() {
            if (!('serviceWorker' in navigator)) {
                return;
            }

            const { serviceWorker } = await navigator.serviceWorker.getRegistration(
                this.serviceWorkerConfig.path
            )
                .then(registration => ({ serviceWorker: registration?.installing }))
                .catch(_ => ({ serviceWorker: null }));

            if (!serviceWorker) {
                return;
            }

            this.serviceWorker = serviceWorker;

            this.serviceWorkerProgress = 1;

            this.serviceWorker.addEventListener('statechange', this.serviceWorkerEventHandler);
        },
        serviceWorkerEventHandler(e) {
            const eligibleStates = {
                installing: 10,
                installed: 80,
                activating: 90,
                activated: 99
            };

            if (
                this.serviceWorkerProgress >= eligibleStates.activated
                || eligibleStates[e?.target?.state] < eligibleStates.installing
            ) {
                return;
            }

            switch (e.target.state) {
                case 'installing':
                    this.serviceWorkerProgress = eligibleStates.installing;
                    break;
                case 'installed':
                    this.serviceWorkerProgress = eligibleStates.installed;
                    break;
                case 'activating':
                    this.serviceWorkerProgress = eligibleStates.activating;
                    break;
                case 'activated':
                    this.serviceWorkerProgress = eligibleStates.activated;
                    this.timeoutRef = setTimeout(
                        () => this.serviceWorkerProgress = 100,
                        this.uiConfig.serviceWorkerDoneNotificationDelay
                    );
                    this.serviceWorker?.removeEventListener('statechange', this.serviceWorkerEventHandler);
                    break;
            }
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
