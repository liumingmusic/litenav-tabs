import { useStore, WebDAVConfig } from "./store";

export const backupToWebDav = async () => {
    const state = useStore.getState();
    if (!state.webdavConfig) throw new Error("WebDAV not configured");

    state.setWebdavSyncStatus('syncing');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds

    try {
      const response = await fetch('/api/webdav/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: state.webdavConfig.url,
          username: state.webdavConfig.username,
          password: state.webdavConfig.password,
          data: { groups: state.groups, links: state.links }
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Unknown error');
      }

      state.setWebdavSyncStatus('success');
      state.setWebdavLastSyncTime(Date.now());
    } catch (e: any) {
      clearTimeout(timeoutId);
      if (e.name === 'AbortError') {
        state.setWebdavSyncStatus('error', "同步请求超时 (30秒)，请重试");
        throw new Error("同步请求超时 (30秒)，请重试");
      }
      state.setWebdavSyncStatus('error', e?.message || "Unknown error");
      throw e;
    }
};

export const restoreFromWebDav = async () => {
    const state = useStore.getState();
    if (!state.webdavConfig) throw new Error("WebDAV not configured");

    state.setWebdavSyncStatus('syncing');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds

    try {
      const response = await fetch('/api/webdav/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: state.webdavConfig.url,
          username: state.webdavConfig.username,
          password: state.webdavConfig.password
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Unknown error');
      }

      const data = result.data;
      if (data && data.groups && data.links) {
          state.importData(data);
          state.setWebdavSyncStatus('success');
          state.setWebdavLastSyncTime(Date.now());
      } else {
          throw new Error("Invalid backup data format");
      }
    } catch (e: any) {
      clearTimeout(timeoutId);
      if (e.name === 'AbortError') {
        state.setWebdavSyncStatus('error', "同步请求超时 (30秒)，请重试");
        throw new Error("同步请求超时 (30秒)，请重试");
      }
      state.setWebdavSyncStatus('error', e?.message || "Unknown error");
      throw e;
    }
};
