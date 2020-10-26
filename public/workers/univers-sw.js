var staticCacheName = 'univers-cache-v2';
var validCacheItems = [".html", ".htm", ".css", ".js", ".jpg", ".jpeg", ".png", ".gif"];
// ffhf
self.addEventListener("install", function(event) {
	event.waitUntil(
		caches.open(staticCacheName)
		.then(function(cache) {
			console.log("Opened Cache!");
			var urlToCache = [
				'/',
				'/assets/images/portfolium-robot.png',
				'/assets/icofont/icofont.min.css',
				'/css/style.min.css',
				'/js/main.min.js',
				'/assets/images/fav-logo.png',
				'/assets/images/express.png',
				'/assets/images/nullimg.png',
			];
			return cache.addAll(urlToCache);
		})
	);
});

self.addEventListener("activate", function(event) {
	event.waitUntil(
		caches.keys().then(function(cacheNames) {
			return Promise.all(
				cacheNames.filter(function(cacheName) {
					return cacheName.startsWith("univers-") && cacheName != staticCacheName;
				}).map(function(cacheName) {
					return cache.delete(cacheName);
				})
			);
		})
	);
});

self.addEventListener("fetch", function(event){
     // console.log(event.request);

	function isValidItem(url) {

		var url = url.split("?")[0];
		for (let index = 0; index < validCacheItems.length; index++) {
			if (url.endsWith(validCacheItems[index])){
				return true;
			}
		}
		return false;
	}

	function fromServer(request){
		
		return fetch(request.clone())
		.then(function(response) {
			// var res = response.clone();

			// if (isValidItem(request.url) == true){
			// 	caches.open(staticCacheName).then(function(cache){
			// 		return cache.put(request, res).then(function() {
			// 			// console.log("Cache update success");
			// 		}).catch(function(e){
			// 			console.log('Put in cache:',e.message);
			// 		});
			// 	});
			// }

			return response;
		})
		.catch(function(err) {
			console.log(err.message);
			return caches.open(staticCacheName).then(function(cache) {
				return cache.match('/dummy.html');
			});
		});
	}

	function updateCache(request) {
		return caches.open(staticCacheName)
		.then(function(cache) {
			return fetch(request).then(function(response) {
				return cache.put(request, response.clone())
				.then(function(){
					// console.log("Cache update success");
					return response;
				})
				.catch(function(err){
					console.log(err);
				});
			});
		});
	}

	function fromCache(request) {
		request.url = request.url.split("?")[0];
		return caches.open(staticCacheName)
		.then(function(cache) {
			return cache.match(request)
			.then(function(response) {
				if(response) return response;
				return fromServer(event.request);
			});
		});
	}

	event.respondWith(
		fromCache(event.request)
	);

	// if (isValidItem(event.request.url) === true){
	// 	// console.log(event);
	// 	event.waitUntil(
	// 		updateCache(event.request).then(function() {
	// 			// console.log("update done");
	// 		})
	// 	);
	// }
     
});