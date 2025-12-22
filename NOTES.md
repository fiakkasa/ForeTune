# Notes

## Workbox handlers

| `handler` value            | Description                                                                        | Best used for                                | Pros                           | Cons                        |
| -------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------ | --------------------------- |
| **`CacheFirst`**           | Serve from cache if available; otherwise fetch from network and cache the response | Fonts, icons, logos, versioned static assets | Very fast, works offline       | Can serve stale content     |
| **`NetworkFirst`**         | Try the network first; fall back to cache if the network fails or times out        | APIs, dynamic JSON, user data                | Fresh data, offline fallback   | Slower response when online |
| **`StaleWhileRevalidate`** | Serve cached response immediately, then update cache in the background             | Images, CSS, non-critical assets             | Fast + stays updated           | First response may be stale |
| **`CacheOnly`**            | Serve only from cache; fail if resource is not cached                              | App shell, offline pages, precached assets   | Guaranteed offline, no network | No updates possible         |
| **`NetworkOnly`**          | Always fetch from network; never cache                                             | Auth, login, POST requests, payments         | Always fresh, secure           | No offline support          |
