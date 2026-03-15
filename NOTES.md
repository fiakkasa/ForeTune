# Notes

## Workbox handlers

| `handler` value            | Description                                                                        | Best used for                                | Pros                           | Cons                        |
| -------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------ | --------------------------- |
| **`CacheFirst`**           | Serve from cache if available; otherwise fetch from network and cache the response | Fonts, icons, logos, versioned static assets | Very fast, works offline       | Can serve stale content     |
| **`NetworkFirst`**         | Try the network first; fall back to cache if the network fails or times out        | APIs, dynamic JSON, user data                | Fresh data, offline fallback   | Slower response when online |
| **`StaleWhileRevalidate`** | Serve cached response immediately, then update cache in the background             | Images, CSS, non-critical assets             | Fast + stays updated           | First response may be stale |
| **`CacheOnly`**            | Serve only from cache; fail if resource is not cached                              | App shell, offline pages, precached assets   | Guaranteed offline, no network | No updates possible         |
| **`NetworkOnly`**          | Always fetch from network; never cache                                             | Auth, login, POST requests, payments         | Always fresh, secure           | No offline support          |

## Libs

- Vue (vue.global.prod.min.js): https://app.unpkg.com/vue@3.5.30/files/dist/vue.global.prod.js
- Vue Router (vue-router.prod.min.js): https://app.unpkg.com/vue-router@5.0.3/files/dist/vue-router.global.prod.js
- Vue Ls (vue-ls.min.js): https://app.unpkg.com/vue-ls@4.2.0/files/dist/vue-ls.min.js
- Vue i18n (vue-i18n.global.prod.js): https://app.unpkg.com/vue-i18n@11.3.0/files/dist/vue-i18n.global.prod.js
- Single Spa (single-spa.min.js): https://app.unpkg.com/single-spa@6.0.3/files/lib/es2015/umd/single-spa.min.cjs
- Vue JS Dialog (vuejs-dialog.umd.min.js, vuejs-dialog.min.css): https://app.unpkg.com/vuejs-dialog@2.0.0-rc.1/files/dist
