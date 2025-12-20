class LinksService {
    constructor(config) {
        this._config = config;
    }

    isEligible(value = '') {
        return !!value && value.length > 0 && value.length <= 3;
    }

    getRoute(value = '') {
        const normalizedValue = value || '';

        if (this._config.url.includes('{0}')) {
            return this._config.url.replace('{0}', normalizedValue);
        }

        return {
            path: this._config.url,
            query: { [this._config.queryParameterName]: normalizedValue }
        }
    }
}

export { LinksService };
