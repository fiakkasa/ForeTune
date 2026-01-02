# ForeTune

A collection of tools related to metaphysics!

It is also a single-spa example using Vue JS apps and pure browser ES modules (no bundler).

## Installation

Ensure the latest NodeJS 24 LTS is available.

Install packages by running: `npm i`

## Running the project

- cli: `npm run start`.

📝 The project uses `lite-server` to serve the assets and is configured using `bs-config.json`.

## Unit Tests

Run unit tests by running: `npm run tests`

## PWA

### Assets

Under the src folder run: `npx pwa-asset-generator ../Material/icon-512x512.png -i ./index.html -m ./manifest.json`

### Service Worker

Under the project root folder run: `npx workbox-cli generateSW ./workbox-config.js`

## References

- https://github.com/fiakkasa/NumerologyCalculator
- https://github.com/fiakkasa/NumerologyCalculator.Vue
- https://github.com/johnpapa/lite-server
- https://single-spa.js.org
- https://github.com/elegantapp/pwa-asset-generator
- https://web.dev/learn/pwa/workboxvue
- https://vuejs.org
- https://github.com/vuejs/router
- https://github.com/intlify/vue-i18n
- https://github.com/RobinCK/vue-ls
- https://godofbrowser.github.io/vuejs-dialog
- https://getbootstrap.com
- https://bootswatch.com
