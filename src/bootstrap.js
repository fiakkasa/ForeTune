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

const setAppStyles = (id = '', path = '') => {
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

const unsetAppStyles = (id = '', path = '') => {
    if (!id || !path) {
        return;
    }

    document.body.querySelector(
        getAppStylesQuerySelector(id)
    )?.remove();
};

const removeAppEl = (id) => {
    const appElSelector = getAppQuerySelector(id);
    document.body.querySelector(appElSelector)?.remove();
};

const createAppEl = (appsQuerySelector, id) => {
    const appElSelector = getAppQuerySelector(id);
    document.body.querySelector(appElSelector)?.remove();

    const appEl = document.createElement('div');
    appEl.setAttribute(_appIdentifierAttributeName, id);
    appEl.className = 'app-container h-100 overflow-hidden';

    document.body.querySelector(appsQuerySelector)?.appendChild(appEl);
};

const registerApp = (querySelector, configuration, services) => {
    const { appConfig, uiConfig, urlConfig } = configuration;
    const { id, path, urlFragment } = appConfig;
    const urlMatch = urlConfig.baseUrlPrefix + urlFragment;

    singleSpa.registerApplication(
        id,
        async () => {
            const { appInit, appModuleLoadError } = await import(
                `./${path}${_appScriptLinkPostFix}`
            ).catch(appModuleLoadError =>
                ({ appModuleLoadError })
            );

            if (appModuleLoadError) {
                showLoader(uiConfig.loaderTimeout);

                return await Promise.reject(new Error(
                    `Failed to load module for app with id: ${id}`
                ));
            }

            let appRef;

            return {
                bootstrap: async () => setAppStyles(id, path),
                mount: async () => {
                    setAppStyles(id, path);

                    const { app, appInitError } = await appInit(configuration, services)
                        .then(app => ({ app }))
                        .catch(appInitError => ({ appInitError }));

                    if (appInitError) {
                        return await Promise.reject(new Error(
                            `Failed to initialize module for app with id: ${id}`
                        ));
                    }

                    createAppEl(querySelector, id);
                    app.mount(getAppQuerySelector(id));

                    appRef = app;
                },
                unmount: async () => {
                    appRef?.unmount();
                    removeAppEl(id);
                    unsetAppStyles(id, path);
                }
            };
        },
        location => {
            const queryIndex = location.hash.indexOf('?');
            const resolvedUrl = queryIndex === -1
                ? location.hash
                : location.hash.slice(0, queryIndex);

            return resolvedUrl === urlMatch;
        }
    );
};

const registerNavigatorApp = (querySelector, configuration, services) => {
    const { appConfig, uiConfig } = configuration;
    const { id, path } = appConfig;

    singleSpa.registerApplication(
        id,
        async () => {
            const { appInit, appModuleLoadError } = await import(
                `./${path}${_appScriptLinkPostFix}`
            ).catch(appModuleLoadError =>
                ({ appModuleLoadError })
            );

            if (appModuleLoadError) {
                showLoader(uiConfig.loaderTimeout);

                return await Promise.reject(new Error(
                    `Failed to load module for app with id: ${id}`
                ));
            }

            return {
                bootstrap: async () => setAppStyles(id, path),
                mount: async () => {
                    setAppStyles(id, path);

                    const { app, appInitError } = await appInit(
                        configuration,
                        services
                    )
                        .then(app => ({ app }))
                        .catch(appInitError => ({ appInitError }));

                    if (appInitError) {
                        return await Promise.reject(new Error(
                            `Failed to initialize module for app with id: ${id}`
                        ));
                    }

                    app.mount(querySelector);
                },
                unmount: async () => {
                    unsetAppStyles(id, path);
                }
            };
        },
        () => true
    );
};

const registerServiceWorker = async (serviceWorkerConfig) => {
    try {
        const { path, scope, type } = serviceWorkerConfig;

        if (
            type === 'classic'
            && 'serviceWorker' in navigator
        ) {
            await navigator.serviceWorker.register(path, { scope, type });
        }
    } catch (error) {
        console.error(error);
    }
};

const init = async (navigatorQuerySelector, appsQuerySelector) => {
    showLoader();

    const {
        appsConfig,
        urlConfig,
        uiConfig,
        singleSpaConfig,
        serviceWorkerConfig,
        initialConfigLoadError
    } = await import('./config.js').catch(initialConfigLoadError =>
        ({ initialConfigLoadError })
    );

    if (initialConfigLoadError) {
        showLoader(0);
        console.error('Failed to load initial configuration...');

        return;
    }

    const sharedServices = {
        navigatorService: navigator
    };

    for (const appConfig of Object.values(appsConfig)) {
        if (appConfig.id === appsConfig.main.id) {
            continue;
        }

        registerApp(
            appsQuerySelector,
            Object.freeze({
                uiConfig,
                urlConfig,
                serviceWorkerConfig,
                appConfig
            }),
            sharedServices
        );
    }

    registerNavigatorApp(
        navigatorQuerySelector,
        Object.freeze({
            uiConfig,
            urlConfig,
            serviceWorkerConfig,
            appConfig: appsConfig.main,
            appsConfig
        }),
        sharedServices
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
            const timeout = event?.detail?.appsByNewStatus?.MOUNTED?.length
                ? uiConfig.loaderTimeout
                : 0;

            showLoader(timeout);
        }
    );

    await registerServiceWorker(serviceWorkerConfig);

    singleSpa.start();
};

export { init };
