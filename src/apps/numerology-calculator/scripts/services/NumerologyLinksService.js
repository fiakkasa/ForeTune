class NumerologyLinksService {
    constructor(config) {
        this._config = config;
    }

    isEligible(value = '') {
        return !!value && value.length > 0 && value.length <= 3;
    }

    getUrl(value) {
        return this._config.url.replace('{0}', value || '');
    }
}

export { NumerologyLinksService };
