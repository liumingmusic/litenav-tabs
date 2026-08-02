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

interface AppState {
  groups: Group[];
  links: LinkItem[];
  groupPosition?: 'top' | 'left' | 'right';
  webdavConfig: WebDAVConfig | null;
  webdavSyncStatus?: 'idle' | 'syncing' | 'success' | 'error';
  webdavLastSyncTime?: number;
  webdavError?: string;
  activeGroupId: string | null;
  backgroundImage: string | null;
  backgroundBlur: number;
  borderRadius: number;
  baseBlockSize: number;
  blockGap: number;
  clockColor: string;
  groupColor: string; // Used as inactive color
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
  
  addGroup: (name: string, color?: string | null) => void;
  updateGroup: (id: string, name: string, color?: string | null) => void;
  deleteGroup: (id: string) => void;
  reorderGroups: (groupIds: string[]) => void;
  
  addLink: (link: Omit<LinkItem, 'id' | 'order'>) => void;
  updateLink: (id: string, link: Partial<LinkItem>) => void;
  deleteLink: (id: string) => void;
  deleteLinksInGroup: (groupId: string) => void;
  reorderLinks: (groupId: string, linkIds: string[]) => void;
  moveLinkToGroup: (linkId: string, newGroupId: string) => void;
  
  // Folder logic
  addFolder: (folder: Omit<LinkItem, 'id' | 'order' | 'itemType'>) => void;
  dissolveFolder: (folderId: string) => void;
  moveLinkToFolder: (linkId: string, folderId: string) => void;
  removeLinkFromFolder: (linkId: string) => void;
  
  setActiveGroup: (id: string | null) => void;
  setWebdavConfig: (config: WebDAVConfig | null) => void;
  setWebdavSyncStatus: (status: 'idle' | 'syncing' | 'success' | 'error', error?: string) => void;
  setWebdavLastSyncTime: (time: number) => void;
  setGroupPosition: (position: 'top' | 'left' | 'right') => void;
  importData: (data: { groups: Group[], links: LinkItem[] }) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      groups: [{ id: 'default', name: 'Default', order: 0 }],
      links: [],
      groupPosition: 'right',
      webdavConfig: null,
      webdavSyncStatus: 'idle',
      webdavLastSyncTime: undefined,
      webdavError: undefined,
      activeGroupId: 'default',
      backgroundImage: null,
      backgroundBlur: 20,
      borderRadius: 24,
      baseBlockSize: 100,
      blockGap: 30,
      clockColor: '#ffffff',
      groupColor: '#475569',
      groupActiveColor: '#2563eb', // text-blue-600 hex
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

      addGroup: (name, color) => set((state) => {
        const newGroup = { id: uuidv4(), name, order: state.groups.length, color: color || undefined };
        return { groups: [...state.groups, newGroup], activeGroupId: newGroup.id };
      }),
      
      updateGroup: (id, name, color) => set((state) => ({
        groups: state.groups.map(g => g.id === id ? { ...g, name, color: color === null ? undefined : (color || g.color) } : g)
      })),
      
      deleteGroup: (id) => set((state) => {
        const remaining = state.groups.filter(g => g.id !== id);
        return {
          groups: remaining,
          links: state.links.filter(l => l.groupId !== id),
          activeGroupId: state.activeGroupId === id ? (remaining[0]?.id || null) : state.activeGroupId
        };
      }),
      
      reorderGroups: (groupIds) => set((state) => {
        const newGroups = [...state.groups];
        groupIds.forEach((id, index) => {
          const group = newGroups.find(g => g.id === id);
          if (group) group.order = index;
        });
        return { groups: newGroups.sort((a, b) => a.order - b.order) };
      }),

      addLink: (linkData) => set((state) => {
        const groupLinks = state.links.filter(l => l.groupId === linkData.groupId);
        const newLink = { ...linkData, id: uuidv4(), order: groupLinks.length };
        return { links: [...state.links, newLink] };
      }),
      
      updateLink: (id, linkData) => set((state) => ({
        links: state.links.map(l => l.id === id ? { ...l, ...linkData } : l)
      })),
      
      deleteLink: (id) => set((state) => ({
        links: state.links.filter(l => l.id !== id)
      })),
      
      deleteLinksInGroup: (groupId) => set((state) => ({
        links: state.links.filter(l => l.groupId !== groupId)
      })),

      reorderLinks: (groupId, linkIds) => set((state) => {
        const newLinks = [...state.links];
        linkIds.forEach((id, index) => {
          const link = newLinks.find(l => l.id === id);
          if (link && link.groupId === groupId) link.order = index;
        });
        return { links: newLinks };
      }),
      
      moveLinkToGroup: (linkId, newGroupId) => set((state) => {
        const link = state.links.find(l => l.id === linkId);
        if (!link) return state;
        if (link.groupId === newGroupId && !link.folderId) return state;
        // Exclude the moving link itself so the appended order can't collide
        // with an existing sibling's order.
        const nextOrder = state.links.filter(
          l => l.groupId === newGroupId && !l.folderId && l.id !== linkId
        ).length;
        return {
          links: state.links.map(l =>
            l.id === linkId
              ? { ...l, groupId: newGroupId, folderId: undefined, order: nextOrder }
              : l
          )
        };
      }),

      addFolder: (folderData) => set((state) => {
        const groupLinks = state.links.filter(l => l.groupId === folderData.groupId && !l.folderId);
        const newFolder: LinkItem = {
          ...folderData,
          id: uuidv4(),
          order: groupLinks.length,
          itemType: 'folder'
        };
        return { links: [...state.links, newFolder] };
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
        
        return { links: newLinks };
      }),

      moveLinkToFolder: (linkId, folderId) => set((state) => {
        const folder = state.links.find(l => l.id === folderId);
        if (!folder) return state;
        
        // Exclude the moving link itself: re-dropping a link into the folder it
        // already occupies would otherwise reuse a sibling's order.
        const nextOrder = state.links.filter(
          l => l.folderId === folderId && l.id !== linkId
        ).length;
        
        return {
          links: state.links.map(l => {
            if (l.id === linkId) {
              return { ...l, groupId: folder.groupId, folderId, order: nextOrder };
            }
            return l;
          })
        };
      }),

      removeLinkFromFolder: (linkId) => set((state) => {
        const link = state.links.find(l => l.id === linkId);
        if (!link || !link.folderId) return state;
        
        const currentRootOrder = state.links.filter(l => l.groupId === link.groupId && !l.folderId).length;
        
        return {
          links: state.links.map(l => {
            if (l.id === linkId) {
              return { ...l, folderId: undefined, order: currentRootOrder };
            }
            return l;
          })
        };
      }),

      setActiveGroup: (id) => set({ activeGroupId: id }),
      setWebdavConfig: (config) => set({ webdavConfig: config }),
      setWebdavSyncStatus: (status, error) => set({ webdavSyncStatus: status, webdavError: error }),
      setWebdavLastSyncTime: (time) => set({ webdavLastSyncTime: time }),
      setGroupPosition: (position) => set({ groupPosition: position }),
      importData: (data) => set({ groups: data.groups, links: data.links, activeGroupId: data.groups[0]?.id || null })
    }),
    {
      name: 'bookmark-manager-storage',
      partialize: (state) => Object.fromEntries(
        Object.entries(state).filter(([key]) => !['webdavSyncStatus', 'webdavError'].includes(key))
      ),
    }
  )
);
