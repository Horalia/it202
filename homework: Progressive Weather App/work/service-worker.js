// JavaScript 
var dataCacheName = 'weatherData-v1';
var cacheName = 'weatherPWA-step-6-1';
var filesToCache = [
  'https://preview.c9users.io/_static/preview/livecss.js',
  'https://preview.c9users.io/harmas/it202spr17/your-first-pwapp-master/work/index.html?_c9_id=livepreview4&_c9_host=https://ide.c9.io',
  'https://preview.c9users.io/harmas/it202spr17/your-first-pwapp-master/',
  'https://preview.c9users.io/harmas/it202spr17/your-first-pwapp-master/work/index.html',
  'https://preview.c9users.io/harmas/it202spr17/your-first-pwapp-master/work/scripts/app.js',
  'https://preview.c9users.io/harmas/it202spr17/your-first-pwapp-master/work/styles/inline.css',
  'https://preview.c9users.io/harmas/it202spr17/your-first-pwapp-master/work/images/clear.png',
  'https://preview.c9users.io/harmas/it202spr17/your-first-pwapp-master/work/images/cloudy-scattered-showers.png',
  'https://preview.c9users.io/harmas/it202spr17/your-first-pwapp-master/work/images/cloudy.png',
  'https://preview.c9users.io/harmas/it202spr17/your-first-pwapp-master/work/images/fog.png',
  'https://preview.c9users.io/harmas/it202spr17/your-first-pwapp-master/work/images/ic_add_white_24px.svg',
  'https://preview.c9users.io/harmas/it202spr17/your-first-pwapp-master/work/images/ic_refresh_white_24px.svg',
  'https://preview.c9users.io/harmas/it202spr17/your-first-pwapp-master/work/images/partly-cloudy.png',
  'https://preview.c9users.io/harmas/it202spr17/your-first-pwapp-master/work/images/rain.png',
  'https://preview.c9users.io/harmas/it202spr17/your-first-pwapp-master/work/images/scattered-showers.png',
  'https://preview.c9users.io/harmas/it202spr17/your-first-pwapp-master/work/images/sleet.png',
  'https://preview.c9users.io/harmas/it202spr17/your-first-pwapp-master/work/images/snow.png',
  'https://preview.c9users.io/harmas/it202spr17/your-first-pwapp-master/work/images/thunderstorm.png',
  'https://preview.c9users.io/harmas/it202spr17/your-first-pwapp-master/work/images/wind.png'
];

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});
self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheName && key !== dataCacheName) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});
self.addEventListener('fetch', function(e) {
  console.log('[ServiceWorker] Fetch', e.request.url);
    var dataUrl = 'https://query.yahooapis.com/v1/public/yql';
  if (e.request.url.indexOf(dataUrl) > -1) {
    /*
     * When the request URL contains dataUrl, the app is asking for fresh
     * weather data. In this case, the service worker always goes to the
     * network and then caches the response. This is called the "Cache then
     * network" strategy:
     * https://jakearchibald.com/2014/offline-cookbook/#cache-then-network
     */
    e.respondWith(
      caches.open(dataCacheName).then(function(cache) {
        return fetch(e.request).then(function(response){
          cache.put(e.request.url, response.clone());
          return response;
        });
      })
    );
  } else {
    /*
     * The app is asking for app shell files. In this scenario the app uses the
     * "Cache, falling back to the network" offline strategy:
     * https://jakearchibald.com/2014/offline-cookbook/#cache-falling-back-to-network
     */
    e.respondWith(
      caches.match(e.request).then(function(response) {
        return response || fetch(e.request);
      })
    );
  }
});