module.exports = {
    globDirectory: 'src/',
    globPatterns: [
        '**/*.{html,js,css,png,jpg,svg,ico,json,woff2}'
    ],
    swDest: 'src/sw.js',
    cleanupOutdatedCaches: true,
    runtimeCaching: [
        {
            urlPattern: ({ request }) => request.destination === 'style',
            handler: 'StaleWhileRevalidate',
            options: {
                cacheName: 'styles',
            },
        },
        {
            urlPattern: ({ request }) => request.destination === 'script',
            handler: 'StaleWhileRevalidate',
            options: {
                cacheName: 'scripts',
            },
        },
        {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'StaleWhileRevalidate',
            options: {
                cacheName: 'images',
            },
        },
        {
            urlPattern: /.+\.json/i,
            handler: 'NetworkFirst',
            options: {
                cacheName: 'data',
                networkTimeoutSeconds: 5,
            }
        },
        {
            urlPattern: ({ request }) => request.destination === 'font',
            handler: 'CacheFirst',
            options: {
                cacheName: 'fonts',
            },
        },
    ],
};
