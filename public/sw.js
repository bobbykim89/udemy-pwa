importScripts('/src/js/idb.js')
importScripts('/src/js/utility.js')

const CACHE_STATIC_NAME = 'static-v5'
const CACHE_DYNAMIC_NAME = 'dynamic-v3'
const STATIC_FILES = [
  '/',
  '/index.html',
  '/offline.html',
  '/src/js/idb.js',
  '/src/js/app.js',
  '/src/js/feed.js',
  '/src/js/material.min.js',
  '/src/css/app.css',
  '/src/css/feed.css',
  '/src/images/main-image.jpg',
  'https://fonts.googleapis.com/css?family=Roboto:400,700',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css',
]

// const trimCache = (cacheName, maxItems) => {
//   caches
//     .open(cacheName)
//     .then((cache) => {
//       return cache.keys()
//     })
//     .then((keys) => {
//       if (keys.length > maxItems) {
//         cache.delete(keys[0]).then(trimCache(cacheName, maxItems))
//       }
//     })
// }

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing service worker...', event)
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME).then((cache) => {
      console.log('[Service Worker] Precaching App shell')
      cache.addAll(STATIC_FILES)
    })
  )
})

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating service worker...', event)
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            console.log('[Service Worker] Removing old cache', key)
            return caches.delete(key)
          }
        })
      )
    })
  )
  return self.clients.claim()
})

// self.addEventListener('fetch', (event) => {
//   event.respondWith(
//     caches.match(event.request).then((res) => {
//       if (res) {
//         return res
//       } else {
//         return fetch(event.request)
//           .then((response) => {
//             return caches.open(CACHE_DYNAMIC_NAME).then((cache) => {
//               cache.put(event.request.url, response.clone())
//               return response
//             })
//           })
//           .catch((err) => {
//             return caches.open(CACHE_STATIC_NAME)
//             .then((cache) => {
//               cache.match('/offline.html')
//             })
//           })
//       }
//     })
//   )
// })

// // Cache only
// self.addEventListener('fetch', (event) => {
//   event.respondWith(caches.match(event.request))
// })

// // Network only
// self.addEventListener('fetch', (event) => {
//   event.respondWith(fetch(event.request))
// })

// Cache then network strategy
const isInCache = (requestURL, cacheArr) =>
  cacheArr.some((url) => url === requestURL.replace(self.origin, ''))

const isInArray = (string, array) => {
  // array.forEach((item) => {
  //   if (item === string) {
  //     console.log('true')
  //     return true
  //   }
  // })
  for (let i = 0; i < array.length; i++) {
    if (array[i] === string) {
      console.log('true')
      return true
    }
  }
  console.log('false')
  return false
}

self.addEventListener('fetch', (event) => {
  const url = 'https://pwagram-48475-default-rtdb.firebaseio.com/posts.json'

  if (event.request.url.indexOf(url) > -1) {
    event.respondWith(
      fetch(event.request).then((res) => {
        const clonedRes = res.clone()
        clearAllData('posts')
          .then(() => {
            return clonedRes.json()
          })
          .then((data) => {
            for (let key in data) {
              writeData('posts', data[key])
            }
          })

        return res
      })
    )
  } else if (isInArray(event.request.url, STATIC_FILES)) {
    event.respondWith(caches.match(event.request))
  } else {
    event.respondWith(
      caches.match(event.request).then((res) => {
        if (res) {
          return res
        } else {
          return fetch(event.request)
            .then((response) => {
              return caches.open(CACHE_DYNAMIC_NAME).then((cache) => {
                // trimCache(CACHE_DYNAMIC_NAME, 3)
                cache.put(event.request.url, response.clone())
                return response
              })
            })
            .catch((err) => {
              return caches.open(CACHE_STATIC_NAME).then((cache) => {
                if (event.request.headers.get('accept').includes('text/html')) {
                  cache.match('/offline.html')
                }
              })
            })
        }
      })
    )
  }
})
