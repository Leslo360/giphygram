// SW Version
const version = "1.0";

// static content
const appAssets = [
  "index.html",
  "main.js",
  "images/flame.jpg",
  "images/logo.png",
  "images/spinner.png",
  "vendor/bootstrap.min.css",
  "vendor/jquery.min.js",
];

// SW Install
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(`static-${version}`).then((cache) => cache.addAll(appAssets))
  );
});

// SW Activate
self.addEventListener("activate", (e) => {
  // clean static cache
  let cleaned = caches.keys().then((keys) => {
    keys.forEach((key) => {
      if (key !== `static-${version}` && key.match("static-")) {
        return caches.delete(key);
      }
    });
  });
  e.waitUntil(cleaned);
});

// Static cache strategy - cache with network fallback
const staticCache = (req, cahceName = `static-${version}`) => {
  return caches.match(req).then((cachedRes) => {
    // return cached respond if found
    if (cachedRes) return cachedRes;

    // fallback to network
    return fetch(req).then((networkRes) => {
      // update cache with new response
      caches.open(cahceName).then((cache) => cache.put(req, networkRes));

      // return clone of network response
      return networkRes.clone();
    });
  });
};

// Network with cache fallback
const fallbackCache = (req) => {
  // Try Network
  return (
    fetch(req)
      .then((networkRes) => {
        // check res is OK, else go to cahce
        if (!networkRes.ok) throw "Fetch Error";
        // update cahce
        caches
          .open(`static-${version}`)
          .then((cache) => cache.put(req, networkRes));
        // return clone of network response
        return networkRes.clone();
      })
      // Try cache
      .catch((err) => caches.match(req))
  );
};

// Clean old giphy from the "giphy" cache
const cleanGiphyCache = (giphys) => {
  caches.open("giphy").then((cache) => {
    // Get all cache entries
    cache.keys().then((keys) => {
      // loop entries
      keys.forEach((key) => {
        // if entry is not part of current giphys, delete
        if (!giphys.includes(key.url)) cache.delete(key);
      });
    });
  });
};

// SW Fetch
self.addEventListener("fetch", (e) => {
  // App shell
  if (e.request.url.match(location.origin)) {
    e.respondWith(staticCache(e.request));

    // Giphy API
  } else if (e.request.url.match("api.giphy.com/v1/gifs/trending")) {
    e.respondWith(fallbackCache(e.request));

    // Giphy Media
  } else if (e.request.url.match("giphy.com/media")) {
    e.respondWith(staticCache(e.request, "giphy"));
  }
});

// Listen for message from client
self.addEventListener("message", (e) => {
  // identify the message
  if (e.data.action === "cleanGiphyCache") cleanGiphyCache(e.data.giphys);
});
