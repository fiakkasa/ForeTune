const _loaderQuerySelector = '.loader';
const _appIdentifierAttributeName = 'app-id';
const _appStyleAttributeName = 'app-id';
const _appStyleHrefPostFix = '/app.css';
const _appScriptLinkPostFix = '/app.js';
let _loaderTimeoutRef;

const showLoader = (autoHideTimeout = null) => {
    if (_loaderTimeoutRef) {
        clearTimeout(_loaderTimeoutRef);
    }

    let loaderEl = document.querySelector(_loaderQuerySelector);

    if (!loaderEl) {
        loaderEl = document.createElement('div');
        loaderEl.className = 'loader';
        loaderEl.innerHTML = '<div class="loader-animation"></div>';

        document.body.appendChild(loaderEl);
    }

    const normalizedAutoHideTimeout = autoHideTimeout === null
        || typeof autoHideTimeout === 'number' && autoHideTimeout >= 0
        ? autoHideTimeout
        : 0;

    if (normalizedAutoHideTimeout === 0) {
        loaderEl.style.display = 'none';
        return;
    }

    loaderEl.style.display = 'unset';

    if (normalizedAutoHideTimeout === null) {
        return;
    }

    _loaderTimeoutRef = setTimeout(() => {
        loaderEl.style.display = 'none';
    }, normalizedAutoHideTimeout)
};

const getAppQuerySelector = (id) => `div[${_appIdentifierAttributeName}="${id}"]`;

const getAppStylesQuerySelector = (id) => `link[${_appStyleAttributeName}="${id}"]`;

const setAppStyles = (appConfig) => {
    const { id = '', path = '' } = appConfig || {};

    if (!id || !path) {
        return;
    }

    const currentLinkEl = document.body.querySelector(
        getAppStylesQuerySelector(id)
    );

    if (currentLinkEl) {
        return;
    }

    const linkEl = document.createElement('link');
    linkEl.rel = 'stylesheet';
    linkEl.setAttribute(_appStyleAttributeName, id);
    linkEl.href = path + _appStyleHrefPostFix;

    document.body.append(linkEl);
};

const unsetAppStyles = (appConfig) => {
    const { id = '', path = '' } = appConfig || {};

    if (!id || !path) {
        return;
    }

    document.body.querySelector(
        getAppStylesQuerySelector(id)
    )?.remove();
};

const createAppEl = (appsQuerySelector, id) => {
    const appElSelector = getAppQuerySelector(id);
    document.body.querySelector(appElSelector)?.remove();

    const appEl = document.createElement('div');
    appEl.setAttribute(_appIdentifierAttributeName, id);
    appEl.className = 'app-container h-100 overflow-hidden';

    document.body.querySelector(appsQuerySelector)?.appendChild(appEl);
}

const registerApp = (
    appsQuerySelector,
    appConfig,
    uiConfig,
    urlConfig,
    storageService
) => {
    singleSpa.registerApplication(
        appConfig.id,
        async () => {
            const { appInit, appModuleLoadError } = await import(
                `./${appConfig.path}${_appScriptLinkPostFix}`
            ).catch(appModuleLoadError =>
                ({ appModuleLoadError })
            );

            if (appModuleLoadError) {
                showLoader(uiConfig.loaderTimeout);

                return await Promise.reject(new Error(
                    `Failed to load module for app with id: ${appConfig.id}`
                ));
            }

            let appRef;

            return {
                bootstrap: async () => setAppStyles(appConfig),
                mount: async () => {
                    setAppStyles(appConfig);

                    const { app, appInitError } = await appInit(appConfig, storageService)
                        .then(app => ({ app }))
                        .catch(appInitError => ({ appInitError }));

                    if (appInitError) {
                        return await Promise.reject(new Error(
                            `Failed to initialize module for app with id: ${appConfig.id}`
                        ));
                    }

                    createAppEl(appsQuerySelector, appConfig.id);
                    app.mount(getAppQuerySelector(appConfig.id));

                    appRef = app;
                },
                unmount: async () => {
                    appRef?.unmount();
                    unsetAppStyles(appConfig);
                }
            };
        },
        location => location.hash.startsWith(
            urlConfig.baseUrlPrefix + appConfig.urlFragment
        )
    );
};

const registerNavigatorApp = (
    navigatorQuerySelector,
    appConfig,
    uiConfig,
    appsConfig,
    storageService
) => {
    singleSpa.registerApplication(
        appConfig.id,
        async () => {
            const appConfig = appsConfig.main;
            const { appInit, appModuleLoadError } = await import(
                `./${appConfig.path}${_appScriptLinkPostFix}`
            ).catch(appModuleLoadError =>
                ({ appModuleLoadError })
            );

            if (appModuleLoadError) {
                showLoader(uiConfig.loaderTimeout);

                return await Promise.reject(new Error(
                    `Failed to load module for app with id: ${appConfig.id}`
                ));
            }

            return {
                bootstrap: async () => setAppStyles(appConfig),
                mount: async () => {
                    setAppStyles(appConfig);

                    const { app, appInitError } = await appInit(appConfig, appsConfig, storageService)
                        .then(app => ({ app }))
                        .catch(appInitError => ({ appInitError }));

                    if (appInitError) {
                        return await Promise.reject(new Error(
                            `Failed to initialize module for app with id: ${appConfig.id}`
                        ));
                    }

                    app.mount(navigatorQuerySelector);
                },
                unmount: async () => {
                    unsetAppStyles(appConfig);
                }
            };
        },
        () => true
    );
};

const init = async (
    navigatorQuerySelector,
    appsQuerySelector
) => {
    showLoader();

    const {
        appsConfig,
        urlConfig,
        uiConfig,
        storageConfig,
        singleSpaConfig,
        initialConfigLoadError
    } = await import('./config.js').catch(initialConfigLoadError =>
        ({ initialConfigLoadError })
    );

    if (initialConfigLoadError) {
        showLoader(0);
        console.error('Failed to load initial configuration...');

        return;
    }

    const storageService = VueStorage.useStorage(storageConfig).ls;

    for (const appConfig of Object.values(appsConfig)) {
        if (appConfig.id === appsConfig.main.id) {
            continue;
        }

        registerApp(
            appsQuerySelector,
            appConfig,
            uiConfig,
            urlConfig,
            storageService
        );
    }

    registerNavigatorApp(
        navigatorQuerySelector,
        appsConfig.main,
        uiConfig,
        appsConfig,
        storageService
    );

    singleSpa.setBootstrapMaxTime(
        singleSpaConfig.bootstrapMaxTimeMillis,
        singleSpaConfig.bootstrapMaxTimeDieOnTimeout,
        singleSpaConfig.bootstrapMaxTimeWarningMillis
    );
    singleSpa.setMountMaxTime(
        singleSpaConfig.mountMaxTimeMillis,
        singleSpaConfig.mountMaxTimeDieOnTimeout,
        singleSpaConfig.mountMaxTimeWarningMillis
    );
    singleSpa.setUnmountMaxTime(
        singleSpaConfig.unmountMaxTimeMillis,
        singleSpaConfig.unmountMaxTimeDieOnTimeout,
        singleSpaConfig.unmountMaxTimeWarningMillis
    );
    singleSpa.setUnloadMaxTime(
        singleSpaConfig.unloadMaxTimeMillis,
        singleSpaConfig.unloadMaxTimeDieOnTimeout,
        singleSpaConfig.unloadMaxTimeWarningMillis
    );

    window.addEventListener(
        'single-spa:before-app-change',
        () => showLoader()
    );
    window.addEventListener(
        'single-spa:app-change',
        event => {
            const timeout = !event?.detail?.appsByNewStatus?.MOUNTED?.length
                ? 0
                : uiConfig.loaderTimeout;

            showLoader(timeout);
        }
    );

    singleSpa.start();
};

export { init };