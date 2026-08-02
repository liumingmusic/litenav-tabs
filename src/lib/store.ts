import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface LinkItem {
  id: string;
  groupId: string;
  title: string;
  url: string;
  imageUrl?: string;
  backgroundColor: string;
  order: number;
  size?: '1x1' | '1x2' | '2x1' | '2x2';
  note?: string;
  itemType?: 'link' | 'folder';
  folderId?: string;
  // P1-6: tags
  tagIds?: string[];
  // P1-7: usage stats (local only)
  clickCount?: number;
  lastClickedAt?: number;
}

export interface Group {
  id: string;
  name: string;
  order: number;
  color?: string;
}

export interface WebDAVConfig {
  url: string;
  username: string;
  password?: string;
  token?: string;
}

export interface CustomGradientColor {
  id: string;
  color: string;
  position: number;
}

export interface CustomGradientSettings {
  colors: CustomGradientColor[];
  angle: number;
  type?: 'linear' | 'radial' | 'conic';
}

export interface SearchEngine {
  id: string;
  name: string;
  url: string;
}

// P1-6: tag model
export interface Tag {
  id: string;
  name: string;
  color: string;
}

// P1-8: recycle bin
export interface TrashItem {
  id: string; // trash entry id
  type: 'link' | 'folder' | 'group';
  data: LinkItem | Group | { group: Group; links: LinkItem[] };
  deletedAt: number;
}

// P2-11: multi-profile
export interface Profile {
  id: string;
  name: string;
}

export interface ProfileData {
  groups: Group[];
  links: LinkItem[];
  tags: Tag[];
  trash: TrashItem[];
}

export type LinkSortMode = 'manual' | 'frequent' | 'recent';

interface AppState {
  // ---- active profile working set (not persisted directly; lives in profileData) ----
  groups: Group[];
  links: LinkItem[];
  tags: Tag[];
  trash: TrashItem[];

  // ---- multi-profile ----
  profiles: Profile[];
  activeProfileId: string;
  profileData: Record<string, ProfileData>;

  // ---- sync / privacy ----
  webdavConfig: WebDAVConfig | null;
  webdavSyncStatus?: 'idle' | 'syncing' | 'success' | 'error';
  webdavLastSyncTime?: number;
  webdavLastPullAt?: number;
  webdavUpdatedAt?: number;
  webdavAutoSync: boolean;
  webdavError?: string;
  encryptionEnabled: boolean;
  encryptionPassphrase: string; // runtime only, never persisted

  // ---- preferences ----
  groupPosition?: 'top' | 'left' | 'right';
  activeGroupId: string | null;
  backgroundImage: string | null;
  backgroundBlur: number;
  borderRadius: number;
  baseBlockSize: number;
  blockGap: number;
  clockColor: string;
  groupColor: string;
  groupActiveColor: string;
  linkLabelColor: string;
  footerColor: string;
  backgroundGradient: string | null;
  customGradientSettings: CustomGradientSettings | null;
  footerText: string;
  searchEngines?: SearchEngine[];
  activeSearchEngineId?: string;
  containerWidth: number;
  folderBgColor?: string;
  folderBgOpacity?: number;
  folderOverlayColor?: string;
  folderOverlayOpacity?: number;
  linkSortMode: LinkSortMode;
  trashRetentionDays: number;

  setBackgroundImage: (bg: string | null) => void;
  setBackgroundBlur: (blur: number) => void;
  setBorderRadius: (radius: number) => void;
  setBaseBlockSize: (size: number) => void;
  setBlockGap: (gap: number) => void;
  setClockColor: (color: string) => void;
  setGroupColor: (color: string) => void;
  setGroupActiveColor: (color: string) => void;
  setLinkLabelColor: (color: string) => void;
  setFooterColor: (color: string) => void;
  setBackgroundGradient: (gradient: string | null) => void;
  setCustomGradientSettings: (settings: CustomGradientSettings | null) => void;
  setFooterText: (text: string) => void;
  setSearchEngines: (engines: SearchEngine[]) => void;
  setActiveSearchEngineId: (id: string) => void;
  setContainerWidth: (width: number) => void;
  setFolderBgColor: (color: string) => void;
  setFolderBgOpacity: (opacity: number) => void;
  setFolderOverlayColor: (color: string) => void;
  setFolderOverlayOpacity: (opacity: number) => void;
  setGroupPosition: (position: 'top' | 'left' | 'right') => void;
  setLinkSortMode: (mode: LinkSortMode) => void;
  setTrashRetentionDays: (days: number) => void;

  // groups
  addGroup: (name: string, color?: string | null) => void;
  updateGroup: (id: string, name: string, color?: string | null) => void;
  deleteGroup: (id: string) => void;
  reorderGroups: (groupIds: string[]) => void;

  // links / folders
  addLink: (link: Omit<LinkItem, 'id' | 'order'>) => void;
  updateLink: (id: string, link: Partial<LinkItem>) => void;
  deleteLink: (id: string) => void;
  deleteLinksInGroup: (groupId: string) => void;
  reorderLinks: (groupId: string, linkIds: string[]) => void;
  moveLinkToGroup: (linkId: string, newGroupId: string) => void;
  addFolder: (folder: Omit<LinkItem, 'id' | 'order' | 'itemType'>) => void;
  dissolveFolder: (folderId: string) => void;
  moveLinkToFolder: (linkId: string, folderId: string) => void;
  removeLinkFromFolder: (linkId: string) => void;
  recordLinkClick: (id: string) => void;

  // P1-6 tags
  addTag: (name: string, color?: string) => void;
  updateTag: (id: string, patch: Partial<Tag>) => void;
  deleteTag: (id: string) => void;

  // P1-8 recycle bin
  restoreFromTrash: (entryId: string) => void;
  purgeTrashItem: (entryId: string) => void;
  emptyTrash: () => void;
  purgeExpiredTrash: () => void;

  // P2-11 profiles
  switchProfile: (id: string) => void;
  addProfile: (name: string) => string;
  renameProfile: (id: string, name: string) => void;
  deleteProfile: (id: string) => void;

  // webdav / encryption
  setWebdavConfig: (config: WebDAVConfig | null) => void;
  setWebdavSyncStatus: (status: 'idle' | 'syncing' | 'success' | 'error', error?: string) => void;
  setWebdavLastSyncTime: (time: number) => void;
  setWebdavLastPullAt: (time: number) => void;
  setWebdavUpdatedAt: (time: number) => void;
  setWebdavAutoSync: (on: boolean) => void;
  setEncryptionEnabled: (on: boolean) => void;
  setEncryptionPassphrase: (pass: string) => void;
  setActiveGroup: (id: string | null) => void;

  // import / export
  importData: (data: { groups: Group[]; links: LinkItem[]; tags?: Tag[]; trash?: TrashItem[] }) => void;
  applyProfileData: (data: ProfileData, remoteUpdatedAt?: number) => void;
  getActiveProfileData: () => ProfileData;
  mergeImport: (data: { groups: Group[]; links: LinkItem[]; tags?: Tag[] }) => { added: number; skipped: number };
}

const DEFAULT_GROUP: Group = { id: 'default', name: 'Default', order: 0 };

const emptyProfile = (): ProfileData => ({ groups: [{ ...DEFAULT_GROUP }], links: [], tags: [], trash: [] });

// Build a fresh empty profile with a unique default group id
const freshProfile = (): ProfileData => {
  const gid = uuidv4();
  return { groups: [{ id: gid, name: 'Default', order: 0 }], links: [], tags: [], trash: [] };
};

// Keep profileData[activeProfileId] in sync with the working set.
const syncProfile = (state: AppState, next: Partial<AppState>): Partial<AppState> => {
  const groups = next.groups ?? state.groups;
  const links = next.links ?? state.links;
  const tags = next.tags ?? state.tags;
  const trash = next.trash ?? state.trash;
  return {
    ...next,
    groups,
    links,
    tags,
    trash,
    profileData: {
      ...state.profileData,
      [state.activeProfileId]: { groups, links, tags, trash },
    },
  };
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      groups: [{ ...DEFAULT_GROUP }],
      links: [],
      tags: [],
      trash: [],

      profiles: [{ id: 'default', name: '默认空间' }],
      activeProfileId: 'default',
      profileData: { default: emptyProfile() },

      webdavConfig: null,
      webdavSyncStatus: 'idle',
      webdavLastSyncTime: undefined,
      webdavLastPullAt: undefined,
      webdavUpdatedAt: undefined,
      webdavAutoSync: false,
      webdavError: undefined,
      encryptionEnabled: false,
      encryptionPassphrase: '',

      groupPosition: 'right',
      activeGroupId: 'default',
      backgroundImage: null,
      backgroundBlur: 20,
      borderRadius: 24,
      baseBlockSize: 100,
      blockGap: 30,
      clockColor: '#ffffff',
      groupColor: '#475569',
      groupActiveColor: '#2563eb',
      linkLabelColor: '#ffffff',
      footerColor: '#ffffff',
      backgroundGradient: null,
      customGradientSettings: null,
      footerText: '',
      searchEngines: [
        { id: 'google', name: '谷歌 (Google)', url: 'https://www.google.com/search' },
        { id: 'baidu', name: '百度', url: 'https://www.baidu.com/s' },
        { id: 'bing', name: '必应 (Bing)', url: 'https://www.bing.com/search' }
      ],
      activeSearchEngineId: 'google',
      containerWidth: 1024,
      folderBgColor: '#ffffff',
      folderBgOpacity: 80,
      folderOverlayColor: '#000000',
      folderOverlayOpacity: 60,
      linkSortMode: 'manual',
      trashRetentionDays: 30,

      setBackgroundImage: (bg) => set({ backgroundImage: bg, backgroundGradient: null }),
      setBackgroundBlur: (blur) => set({ backgroundBlur: blur }),
      setBorderRadius: (radius) => set({ borderRadius: radius }),
      setBaseBlockSize: (size) => set({ baseBlockSize: size }),
      setBlockGap: (gap) => set({ blockGap: gap }),
      setClockColor: (clockColor) => set({ clockColor }),
      setGroupColor: (groupColor) => set({ groupColor }),
      setGroupActiveColor: (groupActiveColor) => set({ groupActiveColor }),
      setLinkLabelColor: (linkLabelColor) => set({ linkLabelColor }),
      setFooterColor: (footerColor) => set({ footerColor }),
      setBackgroundGradient: (gradient) => set({ backgroundGradient: gradient, backgroundImage: null }),
      setCustomGradientSettings: (settings) => set({ customGradientSettings: settings }),
      setFooterText: (text) => set({ footerText: text }),
      setSearchEngines: (engines) => set({ searchEngines: engines }),
      setActiveSearchEngineId: (id) => set({ activeSearchEngineId: id }),
      setContainerWidth: (width) => set({ containerWidth: width }),
      setFolderBgColor: (color) => set({ folderBgColor: color }),
      setFolderBgOpacity: (opacity) => set({ folderBgOpacity: opacity }),
      setFolderOverlayColor: (color) => set({ folderOverlayColor: color }),
      setFolderOverlayOpacity: (opacity) => set({ folderOverlayOpacity: opacity }),
      setGroupPosition: (position) => set({ groupPosition: position }),
      setLinkSortMode: (mode) => set({ linkSortMode: mode }),
      setTrashRetentionDays: (days) => set({ trashRetentionDays: days }),

      addGroup: (name, color) => set((state) => {
        const newGroup = { id: uuidv4(), name, order: state.groups.length, color: color || undefined };
        return syncProfile(state, {
          groups: [...state.groups, newGroup],
          activeGroupId: newGroup.id,
        });
      }),

      updateGroup: (id, name, color) => set((state) => ({
        groups: state.groups.map(g => g.id === id ? { ...g, name, color: color === null ? undefined : (color || g.color) } : g)
      })),

      deleteGroup: (id) => set((state) => {
        const group = state.groups.find(g => g.id === id);
        if (!group) return state;
        const groupLinks = state.links.filter(l => l.groupId === id);
        const entry: TrashItem = {
          id: uuidv4(),
          type: 'group',
          data: { group, links: groupLinks },
          deletedAt: Date.now(),
        };
        const remaining = state.groups.filter(g => g.id !== id);
        return syncProfile(state, {
          groups: remaining,
          links: state.links.filter(l => l.groupId !== id),
          trash: [entry, ...state.trash],
          activeGroupId: state.activeGroupId === id ? (remaining[0]?.id || null) : state.activeGroupId,
        });
      }),

      reorderGroups: (groupIds) => set((state) => {
        const newGroups = [...state.groups];
        groupIds.forEach((id, index) => {
          const group = newGroups.find(g => g.id === id);
          if (group) group.order = index;
        });
        return syncProfile(state, { groups: newGroups.sort((a, b) => a.order - b.order) });
      }),

      addLink: (linkData) => set((state) => {
        const groupLinks = state.links.filter(l => l.groupId === linkData.groupId && !l.folderId);
        const newLink = { ...linkData, id: uuidv4(), order: groupLinks.length } as LinkItem;
        return syncProfile(state, { links: [...state.links, newLink] });
      }),

      updateLink: (id, linkData) => set((state) => ({
        links: state.links.map(l => l.id === id ? { ...l, ...linkData } : l)
      })),

      deleteLink: (id) => set((state) => {
        const item = state.links.find(l => l.id === id);
        if (!item) return state;
        // move item + (if folder) its children into trash
        const children = item.itemType === 'folder'
          ? state.links.filter(l => l.folderId === id)
          : [];
        const entry: TrashItem = {
          id: uuidv4(),
          type: item.itemType === 'folder' ? 'folder' : 'link',
          data: children.length ? { ...item, children } as any : item,
          deletedAt: Date.now(),
        };
        return syncProfile(state, {
          links: state.links.filter(l => l.id !== id && l.folderId !== id),
          trash: [entry, ...state.trash],
          activeGroupId: state.activeGroupId,
        });
      }),

      deleteLinksInGroup: (groupId) => set((state) => {
        const removed = state.links.filter(l => l.groupId === groupId);
        if (removed.length === 0) return state;
        const entries: TrashItem[] = removed.map(l => ({
          id: uuidv4(),
          type: l.itemType === 'folder' ? 'folder' : 'link',
          data: l,
          deletedAt: Date.now(),
        }));
        return syncProfile(state, {
          links: state.links.filter(l => l.groupId !== groupId),
          trash: [...entries, ...state.trash],
        });
      }),

      reorderLinks: (groupId, linkIds) => set((state) => {
        const newLinks = [...state.links];
        linkIds.forEach((id, index) => {
          const link = newLinks.find(l => l.id === id);
          if (link && link.groupId === groupId) link.order = index;
        });
        return syncProfile(state, { links: newLinks });
      }),

      moveLinkToGroup: (linkId, newGroupId) => set((state) => {
        const link = state.links.find(l => l.id === linkId);
        if (!link) return state;
        if (link.groupId === newGroupId && !link.folderId) return state;
        const nextOrder = state.links.filter(
          l => l.groupId === newGroupId && !l.folderId && l.id !== linkId
        ).length;
        return syncProfile(state, {
          links: state.links.map(l =>
            l.id === linkId
              ? { ...l, groupId: newGroupId, folderId: undefined, order: nextOrder }
              : l
          )
        });
      }),

      addFolder: (folderData) => set((state) => {
        const groupLinks = state.links.filter(l => l.groupId === folderData.groupId && !l.folderId);
        const newFolder: LinkItem = {
          ...folderData,
          id: uuidv4(),
          order: groupLinks.length,
          itemType: 'folder'
        };
        return syncProfile(state, { links: [...state.links, newFolder] });
      }),

      dissolveFolder: (folderId) => set((state) => {
        const folder = state.links.find(l => l.id === folderId);
        if (!folder) return state;
        let currentOrder = state.links.filter(l => l.groupId === folder.groupId && !l.folderId).length;
        const newLinks = state.links.filter(l => l.id !== folderId).map(l => {
          if (l.folderId === folderId) {
            return { ...l, folderId: undefined, order: currentOrder++ };
          }
          return l;
        });
        return syncProfile(state, { links: newLinks });
      }),

      moveLinkToFolder: (linkId, folderId) => set((state) => {
        const folder = state.links.find(l => l.id === folderId);
        if (!folder) return state;
        const nextOrder = state.links.filter(
          l => l.folderId === folderId && l.id !== linkId
        ).length;
        return syncProfile(state, {
          links: state.links.map(l => {
            if (l.id === linkId) {
              return { ...l, groupId: folder.groupId, folderId, order: nextOrder };
            }
            return l;
          })
        });
      }),

      removeLinkFromFolder: (linkId) => set((state) => {
        const link = state.links.find(l => l.id === linkId);
        if (!link || !link.folderId) return state;
        const currentRootOrder = state.links.filter(l => l.groupId === link.groupId && !l.folderId).length;
        return syncProfile(state, {
          links: state.links.map(l => {
            if (l.id === linkId) {
              return { ...l, folderId: undefined, order: currentRootOrder };
            }
            return l;
          })
        });
      }),

      recordLinkClick: (id) => set((state) => ({
        links: state.links.map(l =>
          l.id === id
            ? { ...l, clickCount: (l.clickCount || 0) + 1, lastClickedAt: Date.now() }
            : l
        )
      })),

      // ---- P1-6 tags ----
      addTag: (name, color) => set((state) => {
        const trimmed = name.trim();
        if (!trimmed) return state;
        if (state.tags.some(t => t.name.toLowerCase() === trimmed.toLowerCase())) return state;
        const palette = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];
        const tag: Tag = { id: uuidv4(), name: trimmed, color: color || palette[state.tags.length % palette.length] };
        return syncProfile(state, { tags: [...state.tags, tag] });
      }),

      updateTag: (id, patch) => set((state) => ({
        tags: state.tags.map(t => t.id === id ? { ...t, ...patch } : t)
      })),

      deleteTag: (id) => set((state) => ({
        tags: state.tags.filter(t => t.id !== id),
        links: state.links.map(l => l.tagIds ? { ...l, tagIds: l.tagIds.filter(tid => tid !== id) } : l)
      })),

      // ---- P1-8 recycle bin ----
      restoreFromTrash: (entryId) => set((state) => {
        const entry = state.trash.find(t => t.id === entryId);
        if (!entry) return state;
        let { groups, links } = { groups: [...state.groups], links: [...state.links] };
        if (entry.type === 'group') {
          const payload = entry.data as { group: Group; links: LinkItem[] };
          if (!groups.find(g => g.id === payload.group.id)) groups.push(payload.group);
          payload.links.forEach(l => { if (!links.find(x => x.id === l.id)) links.push(l); });
        } else if (entry.type === 'folder') {
          const data = entry.data as any;
          const folder = data.itemType === 'folder' ? data : data; // folder item
          if (!links.find(l => l.id === folder.id)) links.push(folder);
          (data.children || []).forEach((c: LinkItem) => { if (!links.find(l => l.id === c.id)) links.push(c); });
        } else {
          const link = entry.data as LinkItem;
          if (!links.find(l => l.id === link.id)) links.push(link);
        }
        return syncProfile(state, {
          groups,
          links,
          trash: state.trash.filter(t => t.id !== entryId),
          activeGroupId: entry.type === 'group' ? (entry.data as any).group.id : state.activeGroupId,
        });
      }),

      purgeTrashItem: (entryId) => set((state) => ({
        trash: state.trash.filter(t => t.id !== entryId)
      })),

      emptyTrash: () => set({ trash: [] }),

      purgeExpiredTrash: () => set((state) => {
        const cutoff = Date.now() - state.trashRetentionDays * 24 * 60 * 60 * 1000;
        return { trash: state.trash.filter(t => t.deletedAt >= cutoff) };
      }),

      // ---- P2-11 profiles ----
      switchProfile: (id) => set((state) => {
        const profileData = {
          ...state.profileData,
          [state.activeProfileId]: {
            groups: state.groups,
            links: state.links,
            tags: state.tags,
            trash: state.trash,
          }
        };
        const ad = profileData[id] || freshProfile();
        profileData[id] = ad;
        return {
          profileData,
          groups: ad.groups,
          links: ad.links,
          tags: ad.tags || [],
          trash: ad.trash || [],
          activeProfileId: id,
          activeGroupId: ad.groups[0]?.id || null,
        };
      }),

      addProfile: (name) => {
        const id = uuidv4();
        set((state) => {
          const profileData = { ...state.profileData, [id]: freshProfile() };
          return {
            profiles: [...state.profiles, { id, name: name.trim() || '新空间' }],
            profileData,
            groups: profileData[id].groups,
            links: profileData[id].links,
            tags: profileData[id].tags,
            trash: profileData[id].trash,
            activeProfileId: id,
            activeGroupId: profileData[id].groups[0]?.id || null,
          };
        });
        return id;
      },

      renameProfile: (id, name) => set((state) => ({
        profiles: state.profiles.map(p => p.id === id ? { ...p, name: name.trim() || p.name } : p)
      })),

      deleteProfile: (id) => set((state) => {
        if (state.profiles.length <= 1) return state; // keep at least one
        const profiles = state.profiles.filter(p => p.id !== id);
        const profileData = { ...state.profileData };
        delete profileData[id];
        const activeProfileId = state.activeProfileId === id ? profiles[0].id : state.activeProfileId;
        const ad = profileData[activeProfileId];
        return {
          profiles,
          profileData,
          activeProfileId,
          groups: ad.groups,
          links: ad.links,
          tags: ad.tags || [],
          trash: ad.trash || [],
          activeGroupId: ad.groups[0]?.id || null,
        };
      }),

      // ---- webdav / encryption ----
      setWebdavConfig: (config) => set({ webdavConfig: config }),
      setWebdavSyncStatus: (status, error) => set({ webdavSyncStatus: status, webdavError: error }),
      setWebdavLastSyncTime: (time) => set({ webdavLastSyncTime: time }),
      setWebdavLastPullAt: (time) => set({ webdavLastPullAt: time }),
      setWebdavUpdatedAt: (time) => set({ webdavUpdatedAt: time }),
      setWebdavAutoSync: (on) => set({ webdavAutoSync: on }),
      setEncryptionEnabled: (on) => set({ encryptionEnabled: on }),
      setEncryptionPassphrase: (pass) => set({ encryptionPassphrase: pass }),
      setActiveGroup: (id) => set({ activeGroupId: id }),

      // ---- import / export ----
      importData: (data) => set((state) => syncProfile(state, {
        groups: data.groups?.length ? data.groups : state.groups,
        links: data.links || state.links,
        tags: data.tags || state.tags,
        trash: data.trash || state.trash,
        activeGroupId: data.groups?.[0]?.id || state.activeGroupId,
      })),

      applyProfileData: (data, remoteUpdatedAt) => set((state) => syncProfile(state, {
        groups: data.groups,
        links: data.links,
        tags: data.tags || [],
        trash: data.trash || [],
        activeGroupId: data.groups[0]?.id || state.activeGroupId,
        webdavLastPullAt: remoteUpdatedAt ?? Date.now(),
        webdavUpdatedAt: remoteUpdatedAt ?? state.webdavUpdatedAt,
      })),

      getActiveProfileData: () => {
        const s = get();
        return {
          groups: s.groups,
          links: s.links,
          tags: s.tags || [],
          trash: s.trash || [],
        };
      },

      mergeImport: (data) => {
        let added = 0;
        let skipped = 0;
        const result = { added, skipped };
        set((state) => {
          const existingUrls = new Set(state.links.map(l => (l.url || '').toLowerCase()));
          const groupByName = new Map(state.groups.map(g => [g.name.toLowerCase(), g]));
          const newGroups = [...state.groups];
          const newLinks: LinkItem[] = [...state.links];
          (data.groups || []).forEach(g => {
            if (!groupByName.has(g.name.toLowerCase())) {
              const ng = { ...g, id: uuidv4(), order: newGroups.length };
              newGroups.push(ng);
              groupByName.set(g.name.toLowerCase(), ng);
            }
          });
          const urlSet = new Set(existingUrls);
          (data.links || []).forEach(l => {
            const norm = (l.url || '').toLowerCase();
            if (norm && urlSet.has(norm)) { skipped++; return; }
            const targetGroup = groupByName.get((state.groups.find(g => g.id === l.groupId)?.name || '').toLowerCase())
              || newGroups.find(g => g.id === l.groupId)
              || newGroups[0];
            const newLink = { ...l, id: uuidv4(), groupId: targetGroup.id } as LinkItem;
            newLinks.push(newLink);
            if (norm) urlSet.add(norm);
            added++;
          });
          const newTags = [...state.tags];
          (data.tags || []).forEach(t => {
            if (!newTags.some(x => x.name.toLowerCase() === t.name.toLowerCase())) {
              newTags.push({ ...t, id: uuidv4() });
            }
          });
          const snap = syncProfile(state, { groups: newGroups, links: newLinks, tags: newTags });
          result.added = added;
          result.skipped = skipped;
          return snap;
        });
        return result;
      },
    }),
    {
      name: 'bookmark-manager-storage',
      version: 2,
      partialize: (state) => {
        // Persist profile container + settings, NOT the working data arrays
        // (those live inside profileData and are restored via merge).
        const { groups, links, tags, trash, encryptionPassphrase, webdavSyncStatus, webdavError, ...rest } = state as any;
        return rest;
      },
      merge: (persisted: any, current: AppState) => {
        const p = persisted || {};
        // migration from v1 (top-level groups/links, no profiles)
        let profiles: Profile[] = p.profiles && p.profiles.length ? p.profiles : [{ id: 'default', name: '默认空间' }];
        let profileData: Record<string, ProfileData> = p.profileData || {};
        if ((p.groups || p.links) && !p.profileData) {
          profileData = { default: { groups: p.groups || [DEFAULT_GROUP], links: p.links || [], tags: p.tags || [], trash: p.trash || [] } };
        }
        let activeProfileId = (p.activeProfileId && profiles.find(x => x.id === p.activeProfileId)) ? p.activeProfileId : profiles[0].id;
        if (!profileData[activeProfileId]) {
          profileData[activeProfileId] = emptyProfile();
        }
        const ad = profileData[activeProfileId];
        return {
          ...current,
          ...p,
          profiles,
          activeProfileId,
          profileData,
          groups: ad.groups,
          links: ad.links,
          tags: ad.tags || [],
          trash: ad.trash || [],
        };
      },
    }
  )
);
