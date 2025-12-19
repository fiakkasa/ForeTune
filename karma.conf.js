module.exports = function (config) {
    config.set({
        frameworks: ['jasmine'],
        files: [
            { pattern: 'src/libs/vue.global.prod.min.js' },
            { pattern: 'src/libs/vue-router.global.min.js' },
            { pattern: 'src/libs/vue-i18n.global.prod.js' },
            { pattern: 'src/components/*.js', type: 'module' },
            { pattern: 'src/utils/*.js', type: 'module' },
            { pattern: 'src/apps/**/components/*.js', type: 'module' },
            { pattern: 'src/apps/**/pages/*.js', type: 'module' },
            { pattern: 'src/apps/**/services/*.js', type: 'module' },
            { pattern: 'tests/**/*.spec.js', type: 'module' }
        ],
        browsers: ['ChromeHeadlessCustom'],
        customLaunchers: {
            ChromeHeadlessCustom: {
                base: 'ChromeHeadless',
                flags: ['--no-sandbox', '--disable-setuid-sandbox']
            }
        },
        reporters: ['mocha'],
        mochaReporter: {
            output: 'full'
        },
        singleRun: true,
        port: 9876
    });
};