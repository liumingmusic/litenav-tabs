import { useStore, ProfileData } from "./store";
import { encryptJSON, decryptJSON } from "./crypto";

interface BackupPayload {
  profileId: string;
  updatedAt: number;
  encrypted?: string;
  data?: ProfileData;
}

const pathFor = (profileId: string) => `/bookmark_manager_backup_${profileId}.json`;

export const peekWebDav = async (profileId: string): Promise<{ exists: boolean; updatedAt: number }> => {
  const state = useStore.getState();
  if (!state.webdavConfig) throw new Error("WebDAV not configured");
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch('/api/webdav/peek', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: state.webdavConfig.url,
        username: state.webdavConfig.username,
        password: state.webdavConfig.password,
        path: pathFor(profileId),
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      const r = await res.json().catch(() => ({}));
      throw new Error(r.error || 'Unknown error');
    }
    const r = await res.json();
    return { exists: !!r.exists, updatedAt: r.updatedAt || 0 };
  } catch (e: any) {
    clearTimeout(timeoutId);
    throw e;
  }
};

export const backupToWebDav = async (): Promise<{ conflict?: boolean }> => {
  const state = useStore.getState();
  if (!state.webdavConfig) throw new Error("WebDAV not configured");

  const profileId = state.activeProfileId;
  const data = state.getActiveProfileData();
  const updatedAt = Date.now();

  let payload: BackupPayload;
  if (state.encryptionEnabled) {
    if (!state.encryptionPassphrase) throw new Error("请先在设置中输入加密口令");
    const encrypted = await encryptJSON(data, state.encryptionPassphrase);
    payload = { profileId, updatedAt, encrypted };
  } else {
    payload = { profileId, updatedAt, data };
  }

  state.setWebdavSyncStatus('syncing');

  // Conflict detection: if remote has newer data than our last pull, keep a copy.
  let conflict = false;
  try {
    const meta = await peekWebDav(profileId);
    const lastPull = state.webdavLastPullAt ?? 0;
    if (meta.exists && meta.updatedAt > lastPull) {
      conflict = true;
      await saveConflictCopy(profileId, meta.updatedAt);
    }
  } catch {
    // peek failure is non-fatal; proceed with overwrite
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch('/api/webdav/backup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: state.webdavConfig.url,
        username: state.webdavConfig.username,
        password: state.webdavConfig.password,
        path: pathFor(profileId),
        data: payload,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Unknown error');

    state.setWebdavSyncStatus('success');
    state.setWebdavLastSyncTime(Date.now());
    state.setWebdavUpdatedAt(updatedAt);
    return { conflict };
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

const saveConflictCopy = async (profileId: string, remoteUpdatedAt: number) => {
  const state = useStore.getState();
  if (!state.webdavConfig) return;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  try {
    await fetch('/api/webdav/conflict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: state.webdavConfig.url,
        username: state.webdavConfig.username,
        password: state.webdavConfig.password,
        path: pathFor(profileId),
        conflictPath: `/bookmark_manager_conflict_${profileId}_${remoteUpdatedAt}.json`,
      }),
      signal: controller.signal,
    });
  } catch {
    // non-fatal
  } finally {
    clearTimeout(timeoutId);
  }
};

export const restoreFromWebDav = async (): Promise<{ conflictWarning?: boolean }> => {
  const state = useStore.getState();
  if (!state.webdavConfig) throw new Error("WebDAV not configured");

  const profileId = state.activeProfileId;
  state.setWebdavSyncStatus('syncing');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch('/api/webdav/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: state.webdavConfig.url,
        username: state.webdavConfig.username,
        password: state.webdavConfig.password,
        path: pathFor(profileId),
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Unknown error');

    const payload = result.data as BackupPayload;
    if (!payload) throw new Error("Invalid backup data format");

    let data: ProfileData;
    if (payload.encrypted) {
      if (!state.encryptionPassphrase) throw new Error("请先在设置中输入解密口令");
      data = await decryptJSON<ProfileData>(payload.encrypted, state.encryptionPassphrase);
    } else {
      data = payload.data!;
    }

    state.applyProfileData(data, payload.updatedAt);
    state.setWebdavSyncStatus('success');
    state.setWebdavLastSyncTime(Date.now());
    return {};
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
