const CACHE = 'korvil-runtime-v2';
const ASSETS = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// NetworkFirst: sempre tenta a rede primeiro; só usa cache se estiver offline.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone)).catch(() => {});
        }
        return res;
      })
      .catch(() =>
        caches.match(e.request).then((cached) => cached || caches.match('/index.html'))
      )
  );
});

// Permite que a página dispare a checagem de nova versão e recarregue quando o SW novo assumir.
self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('push', (e) => {
  let data = {};
  try {
    data = e.data ? e.data.json() : {};
  } catch (_) {
    data = { title: 'KORVIL App', body: e.data ? e.data.text() : '' };
  }

  const notifOptions = {
    body: data.body || '',
    tag: data.tag,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: { url: data.url || '/', proposal_id: data.data?.proposal_id, type: data.data?.type },
    requireInteraction: data.requireInteraction || false,
  };

  // K-AI evolution notifications get SIM/NÃO action buttons
  if (data.data && data.data.type === 'kai-evolve' && data.actions) {
    notifOptions.actions = data.actions;
  }

  e.waitUntil(
    self.registration.showNotification(data.title || 'KORVIL App', notifOptions)
  );
});

// Handle notification click + action buttons (SIM/NÃO from K-AI evolution)
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const nData = e.notification.data || {};
  const proposalId = nData.proposal_id;
  const isKaiEvolve = nData.type === 'kai-evolve';
  const action = e.action; // 'sim', 'nao', or '' (normal click)

  // If it's a K-AI evolution notification with an action button
  if (isKaiEvolve && proposalId) {
    const apiUrl = nData.api_url;

    if (action === 'sim') {
      // User approved — call kai-evolve to execute the proposal for real
      e.waitUntil(
        (apiUrl
          ? fetch(apiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'execute', proposal_id: proposalId }),
            })
          : Promise.reject(new Error('no api_url'))
        ).then(() => {
          return self.registration.showNotification('K-AI executando', {
            body: 'Aprovado! Aplicando a mudança no app agora.',
            tag: `kai-evolve-confirm-${proposalId}`,
            icon: '/icons/icon-192.png',
          });
        }).catch(() => {
          // Fallback: open the app so the user can approve there
          return openApp(nData.url || '/');
        })
      );
      return;
    }

    if (action === 'nao') {
      // User rejected — tell the server, next cycle will suggest something different
      if (apiUrl) {
        e.waitUntil(
          fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'reject', proposal_id: proposalId }),
          }).catch(() => {})
        );
      }
      // Show a small confirmation
      e.waitUntil(
        self.registration.showNotification('K-AI', {
          body: 'Ok, vou sugerir outra coisa em 5 minutos.',
          tag: `kai-evolve-reject-${proposalId}`,
          icon: '/icons/icon-192.png',
        })
      );
      return;
    }

    // Normal click on a K-AI evolution notification (no action button, e.g. iOS)
    // Open the app where the user can approve/reject from the UI
    e.waitUntil(openApp(nData.url || '/'));
    return;
  }

  // Regular notification — open the app
  const url = nData.url || '/';
  e.waitUntil(openApp(url));
});

function openApp(url) {
  return clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    for (const c of list) {
      if ('focus' in c) {
        c.navigate(url);
        return c.focus();
      }
    }
    return clients.openWindow(url);
  });
}
