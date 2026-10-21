// Local preview only. Hosted pages do not connect to the reload endpoint.
if (['localhost', '127.0.0.1'].includes(location.hostname)) {
  let revision;
  setInterval(async () => {
    try {
      const response = await fetch('/__preview_revision', { cache: 'no-store' });
      if (!response.ok) return;
      const next = await response.text();
      if (!next.startsWith('revision:')) return;
      if (revision !== undefined && revision !== next) location.reload();
      revision = next;
    } catch (_) { /* Preview server may be restarting. */ }
  }, 1000);
}
