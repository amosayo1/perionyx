var CACHE_NAME = "perionyx-v2";
var OFFLINE_URL = "/offline";
var API_PATHS = ["/api/"];
var NAV_CACHE_STRATEGIES = [
  { pattern: /\/_next\/static\/chunks\//, strategy: "network-first" },
  { pattern: /\/_next\/static\/css\//, strategy: "network-first" },
  { pattern: /\/_next\/static\/media\//, strategy: "cache-first" },
  { pattern: /\/fonts\//, strategy: "cache-first" },
  { pattern: /\/icons\//, strategy: "cache-first" },
  { pattern: /\.(png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot)$/, strategy: "cache-first" },
];

function shouldUseNetworkFirst(url) {
  return url.mode === "navigate" || (url.pathname.startsWith("/_next") && !url.pathname.startsWith("/_next/static"));
}

function isApiRequest(url) {
  return API_PATHS.some(function (p) { return url.pathname.startsWith(p); });
}

function getCachingStrategy(url) {
  for (var i = 0; i < NAV_CACHE_STRATEGIES.length; i++) {
    if (NAV_CACHE_STRATEGIES[i].pattern.test(url.pathname) || NAV_CACHE_STRATEGIES[i].pattern.test(url.href)) {
      return NAV_CACHE_STRATEGIES[i].strategy;
    }
  }
  return "network-first";
}

self.addEventListener("install", function (event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.add(OFFLINE_URL).catch(function () {});
    })
  );
});

self.addEventListener("message", function (event) {
  if (event.data && event.data.type === "GET_VERSION" && event.ports && event.ports[0]) {
    event.ports[0].postMessage({ cacheVersion: CACHE_NAME });
  }
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    Promise.all([
      caches.keys().then(function (keys) {
        return Promise.all(
          keys
            .filter(function (k) { return k !== CACHE_NAME; })
            .map(function (k) { return caches.delete(k); })
        );
      }),
      self.clients.claim(),
    ])
  );
});

self.addEventListener("fetch", function (event) {
  var request = event.request;
  var url = new URL(request.url);

  if (request.method !== "GET" || !url.protocol.startsWith("http")) return;
  if (isApiRequest(url)) return;

  var strategy = getCachingStrategy(url);

  if (strategy === "cache-first") {
    event.respondWith(
      caches.match(request).then(function (cached) {
        if (cached) return cached;
        return fetch(request).then(function (response) {
          return caches.open(CACHE_NAME).then(function (cache) {
            if (response.ok && response.type === "basic") {
              cache.put(request, response.clone());
            }
            return response;
          });
        });
      })
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then(function (response) {
        return caches.open(CACHE_NAME).then(function (cache) {
          if (response.ok && response.type === "basic") {
            cache.put(request, response.clone());
          }
          return response;
        });
      })
      .catch(function () {
        return caches.match(request).then(function (cached) {
          return cached || caches.match(OFFLINE_URL);
        });
      })
  );
});

self.addEventListener("push", function (event) {
  var data;
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: event.data ? event.data.text() : "" };
  }

  var title = data.title || "PERIONYX";
  var options = {
    body: data.body || "New update available",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: { url: data.url || "/", id: data.id },
    vibrate: [200, 100, 200],
    tag: data.tag || "default",
    renotify: true,
    requireInteraction: true,
    timestamp: Date.now(),
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  var url = event.notification.data && event.notification.data.url ? event.notification.data.url : "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then(function (clients) {
      for (var i = 0; i < clients.length; i++) {
        var client = clients[i];
        if (client.url === url && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.length > 0 && "navigate" in clients[0]) {
        return clients[0].navigate(url).then(function (c) { return c.focus(); });
      }
      return self.clients.openWindow(url);
    })
  );
});
