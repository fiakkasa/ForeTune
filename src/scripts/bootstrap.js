const _appStyleAttributeName = 'app-id';
const _appStyleHrefPostFix = '/style/app.css';
const _appScriptLinkPostFix = '/scripts/app.js';
let _loaderTimeoutRef;

function showLoader(autoHideTimeout = null) {
    if (_loaderTimeoutRef) {
        clearTimeout(_loaderTimeoutRef);
    }

    let loader = document.getElementById('loader');

    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'loader';
        loader.className = 'loader';
        loader.innerHTML = '<div class="loader-animation"></div>';

        document.body.appendChild(loader);
    }

    const normalizedAutoHideTimeout = autoHideTimeout === null
        || typeof autoHideTimeout === 'number' && autoHideTimeout >= 0
            ? autoHideTimeout
            : 0;

    if (normalizedAutoHideTimeout === 0) {
        loader.style.display = 'none';
        return;
    }

    loader.style.display = 'unset';

    if (normalizedAutoHideTimeout === null) {
        return;
    }

    _loaderTimeoutRef = setTimeout(() => {
        loader.style.display = 'none';
    }, normalizedAutoHideTimeout)
}

function getAppStylesCssSelector(id) {
    return `[${_appStyleAttributeName}="${id}"]`;
}

function setAppStyles(appConfig) {
    const { id = '', path = '' } = appConfig || {};

    if (!id || !path) {
        return;
    }

    const currentLinkEl = document.body.querySelector(getAppStylesCssSelector(id));

    if (currentLinkEl) {
        return;
    }

    const linkEl = document.createElement('link');
    linkEl.rel = 'stylesheet';
    linkEl.setAttribute(_appStyleAttributeName, id);
    linkEl.href = path + _appStyleHrefPostFix;

    document.body.appendChild(linkEl);
}

function unsetAppStyles(appConfig) {
    const { id = '', path = '' } = appConfig || {};

    if (!id || !path) {
        return;
    }

    const currentLinkEl = document.body.querySelector(getAppStylesCssSelector(id));

    if (!currentLinkEl) {
        return;
    }

    currentLinkEl.remove();
}

function registerApp(
    appConfig,
    uiConfig,
    urlConfig,
    storageService
) {
    singleSpa.registerApplication(
        appConfig.id,
        async () => {
            const { appInit, appModuleLoadError } = await import(
                `../${appConfig.path}/${_appScriptLinkPostFix}`
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

                    app.mount(`#${appConfig.id}`);

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
}

function registerNavigatorApp(
    appConfig,
    uiConfig,
    appsConfig,
    storageService
) {
    singleSpa.registerApplication(
        appConfig.id,
        async () => {
            const appConfig = appsConfig.main;
            const { appInit, appModuleLoadError } = await import(
                `../${appConfig.path}/${_appScriptLinkPostFix}`
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

                    app.mount(`#${appConfig.id}`);
                },
                unmount: async () => {
                    unsetAppStyles(appConfig);
                }
            };
        },
        () => true
    );
}

async function init() {
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

    for (let appConfig of Object.values(appsConfig)) {
        if (appConfig.id === appsConfig.main.id) {
            continue;
        }

        registerApp(appConfig, uiConfig, urlConfig, storageService);
    }

    registerNavigatorApp(appsConfig.main, uiConfig, appsConfig, storageService);

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
}
