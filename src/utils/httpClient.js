const httpClient = {
    getJson: (url, cancellationSignal = null) =>
        fetch(url, { signal: cancellationSignal })
            .then(response => response.json())
};

export { httpClient };
