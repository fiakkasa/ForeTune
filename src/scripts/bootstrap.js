let _loaderTimeoutRef;

async function setLoader(show, timeout = 0) {
    const loader = document.getElementById('loader');

    if (_loaderTimeoutRef) {
        clearTimeout(_loaderTimeoutRef);
    }

    if (show) {
        loader.style.display = 'unset';
        return;
    }

    _loaderTimeoutRef = setTimeout(() => {
        loader.style.display = 'none';
    }, timeout);
}

async function init() {
    const { appsConfig, urlConfig, loaderConfig, storageConfig } = await import('./config.js');

    let _storageService = VueStorage.useStorage(storageConfig).ls;

    for (let appConfig of Object.values(appsConfig)) {
        if (appConfig.id === appsConfig.main.id) {
            continue;
        }

        singleSpa.registerApplication(
            appConfig.id,
            async () => {
                const { appInit } = await import(`../${appConfig.path}/scripts/app.js`);

                let appRef;

                return {
                    bootstrap: () => setLoader(true, loaderConfig.timeout),
                    mount: async () => {
                        setLoader(true, loaderConfig.timeout);

                        appRef = await appInit(appConfig, _storageService);

                        appRef.mount(`#${appConfig.id}`);

                        setLoader(false);
                    },
                    unmount: async () => appRef?.unmount()
                };
            },
            location => location.hash.startsWith(
                urlConfig.prefix + appConfig.urlFragment
            )
        );
    }

    singleSpa.registerApplication(
        appsConfig.main.id,
        async () => {
            const { appInit } = await import(`../${appsConfig.main.path}/scripts/app.js`);

            return {
                bootstrap: () => setLoader(true, loaderConfig.timeout),
                mount: async () => {
                    const app = await appInit(appsConfig.main, appsConfig, _storageService);

                    app.mount(`#${appsConfig.main.id}`);

                    return setLoader(false);
                },
                unmount: async () => { }
            };
        },
        location => true
    );

    singleSpa.start();
}
