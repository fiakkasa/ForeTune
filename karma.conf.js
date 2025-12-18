module.exports = function (config) {
    config.set({
        frameworks: ['jasmine'],
        files: [
            { pattern: 'src/scripts/vue.global.prod.min.js' },
            { pattern: 'src/scripts/vue-router.global.min.js' },
            { pattern: 'src/scripts/vue-i18n.global.prod.js' },
            { pattern: 'src/scripts/components/*.js', type: 'module' },
            { pattern: 'src/scripts/utils/*.js', type: 'module' },
            { pattern: 'src/apps/**/scripts/components/*.js', type: 'module' },
            { pattern: 'src/apps/**/scripts/pages/*.js', type: 'module' },
            { pattern: 'src/apps/**/scripts/services/*.js', type: 'module' },
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