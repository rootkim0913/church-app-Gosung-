// Service Worker - 은월리 재건교회 PWA
const CACHE_NAME = 'eunwolri-church-v1';

// 오프라인에서도 사용 가능하도록 캐시할 파일 목록
// GitHub Pages 배포 시 자동으로 base URL을 감지합니다
const SW_BASE = self.registration.scope;
const STATIC_ASSETS = [
    SW_BASE,
    SW_BASE + 'index.html',
    SW_BASE + 'styles.css',
    SW_BASE + 'app.js',
    SW_BASE + 'manifest.json',
    SW_BASE + 'icons/icon-192x192.png',
    SW_BASE + 'icons/icon-512x512.png'
];

// Google Fonts 등 외부 리소스 캐시용
const EXTERNAL_CACHE = 'eunwolri-external-v1';

// Install: 정적 파일 캐시
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] 정적 파일 캐시 중...');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
            .catch(err => {
                console.log('[SW] 캐시 실패 (일부 파일 누락 가능):', err);
                return self.skipWaiting();
            })
    );
});

// Activate: 이전 캐시 정리
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME && name !== EXTERNAL_CACHE)
                    .map(name => {
                        console.log('[SW] 이전 캐시 삭제:', name);
                        return caches.delete(name);
                    })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch: Network First + Cache Fallback 전략
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // POST 등 비-GET 요청은 무시
    if (request.method !== 'GET') return;

    // Google Maps iframe 등 외부 임베드는 캐시하지 않음
    if (request.url.includes('google.com/maps')) return;

    // 같은 origin의 정적 파일 → Network First
    if (request.url.startsWith(self.location.origin)) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // 성공하면 캐시에 복사 후 반환
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                    return response;
                })
                .catch(() => {
                    // 네트워크 실패 시 캐시에서 반환
                    return caches.match(request).then(cached => {
                        return cached || createOfflinePage();
                    });
                })
        );
        return;
    }

    // 외부 리소스 (Google Fonts 등) → Cache First
    event.respondWith(
        caches.match(request).then(cached => {
            if (cached) return cached;
            return fetch(request).then(response => {
                const clone = response.clone();
                caches.open(EXTERNAL_CACHE).then(cache => cache.put(request, clone));
                return response;
            }).catch(() => new Response('', { status: 408 }));
        })
    );
});

// 오프라인 폴백 페이지
function createOfflinePage() {
    const html = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>은월리 재건교회 - 오프라인</title>
    <style>
        body {
            font-family: 'Noto Sans KR', sans-serif;
            display: flex; align-items: center; justify-content: center;
            min-height: 100vh; margin: 0;
            background: #FCFBf6; color: #4a4238;
            text-align: center; padding: 20px;
        }
        .offline-box { max-width: 400px; }
        .offline-icon { font-size: 4rem; margin-bottom: 20px; }
        h1 { font-size: 1.5rem; margin-bottom: 10px; }
        p { color: #7a7065; line-height: 1.6; }
        button {
            margin-top: 20px; padding: 12px 24px;
            background: #b8a391; color: white;
            border: none; border-radius: 8px;
            font-size: 1rem; cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="offline-box">
        <div class="offline-icon">⛪</div>
        <h1>은월리 재건교회</h1>
        <p>현재 인터넷 연결이 되지 않습니다.<br>Wi-Fi 또는 데이터 연결을 확인해 주세요.</p>
        <button onclick="location.reload()">다시 시도</button>
    </div>
</body>
</html>`;
    return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
}
