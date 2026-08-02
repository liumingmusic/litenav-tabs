import React, { useState, useEffect } from "react";
import { Settings, Plus, LayoutGrid, Palette, Trash2, ExternalLink, Edit2, Maximize, Square, Compass, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'sonner';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  pointerWithin,
  rectIntersection,
  CollisionDetection
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy
} from '@dnd-kit/sortable';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';

import { useStore, Group, LinkItem } from './lib/store';
import { SearchBox } from './components/SearchBox';
import { Clock } from './components/Clock';
import { GroupTabs } from './components/GroupTabs';
import { LinkBlock } from './components/LinkBlock';
import { FolderBlock } from './components/FolderBlock';
import { LinkModal } from './components/LinkModal';
import { GroupModal } from './components/GroupModal';
import { SettingsModal } from './components/SettingsModal';
import { CommandPalette } from './components/CommandPalette';
import { TrashModal } from './components/TrashModal';
import { ProfileSwitcher } from './components/ProfileSwitcher';
import { NavigationModal } from './components/NavigationModal';
import { FolderModal } from './components/FolderModal';
import { FolderExpandedModal } from './components/FolderExpandedModal';
import { cn } from './lib/utils';

export default function App() {
  const links = useStore(state => state.links);
  const activeGroupId = useStore(state => state.activeGroupId);
  const reorderLinks = useStore(state => state.reorderLinks);
  const moveLinkToFolder = useStore(state => state.moveLinkToFolder);
  const removeLinkFromFolder = useStore(state => state.removeLinkFromFolder);
  const dissolveFolder = useStore(state => state.dissolveFolder);
  const groupPosition = useStore(state => state.groupPosition) || 'top';
  const containerWidth = useStore(state => state.containerWidth);
  const backgroundImage = useStore(state => state.backgroundImage);
  const backgroundGradient = useStore(state => state.backgroundGradient);
  const backgroundBlur = useStore(state => state.backgroundBlur);
  const borderRadius = useStore(state => state.borderRadius);
  const baseBlockSize = useStore(state => state.baseBlockSize);
  const blockGap = useStore(state => state.blockGap);
  const footerText = useStore(state => state.footerText);
  const footerColor = useStore(state => state.footerColor);
  const linkLabelColor = useStore(state => state.linkLabelColor);
  const linkSortMode = useStore(state => state.linkSortMode);

  const setBackgroundGradient = useStore(state => state.setBackgroundGradient);
  const setCustomGradientSettings = useStore(state => state.setCustomGradientSettings);
  const deleteLinksInGroup = useStore(state => state.deleteLinksInGroup);
  const updateLink = useStore(state => state.updateLink);
  const deleteLink = useStore(state => state.deleteLink);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState<Group | undefined>(undefined);
  
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkToEdit, setLinkToEdit] = useState<LinkItem | undefined>(undefined);
  
  const [targetFolderIdForNewLink, setTargetFolderIdForNewLink] = useState<string | undefined>(undefined);

  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [folderToEdit, setFolderToEdit] = useState<LinkItem | undefined>(undefined);
  const [expandedFolder, setExpandedFolder] = useState<LinkItem | null>(null);

  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isTrashOpen, setIsTrashOpen] = useState(false);

  const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);
  const [linkContextMenu, setLinkContextMenu] = useState<{ x: number, y: number, link: LinkItem } | null>(null);

  // Filter root items (links and folders), then sort according to the chosen mode
  const activeRootItems = React.useMemo(() => {
    const base = links.filter(l => l.groupId === activeGroupId && !l.folderId);
    if (linkSortMode === 'frequent') {
      return [...base].sort((a, b) => (b.clickCount ?? 0) - (a.clickCount ?? 0) || a.order - b.order);
    }
    if (linkSortMode === 'recent') {
      return [...base].sort((a, b) => (b.lastClickedAt ?? 0) - (a.lastClickedAt ?? 0) || a.order - b.order);
    }
    return base.sort((a, b) => a.order - b.order);
  }, [links, activeGroupId, linkSortMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey) {
        if (e.key.toLowerCase() === 'n') {
          e.preventDefault();
          if (activeGroupId) {
            openAddLink(expandedFolder?.id);
          } else {
            toast.error("请先选择或创建一个标签分组");
          }
        }
        if (e.key.toLowerCase() === 'g') {
          e.preventDefault();
          openAddGroup();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeGroupId]);

  // ⌘K / Ctrl+K opens the command palette
  useEffect(() => {
    const onPaletteKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen(o => !o);
      }
    };
    window.addEventListener('keydown', onPaletteKey);
    return () => window.removeEventListener('keydown', onPaletteKey);
  }, []);

  const handleContextMenu = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Don't override context menu for input or textarea
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }
    // Only open context menu if right clicking on the empty background/wrapper areas
    const isBackground = target.id === 'app-root' || target.id === 'main-content' || target.id === 'grid-container' || target.classList.contains('min-h-screen');
    
    // We can also just show it everywhere unless handled. But a specific target check prevents accidental overrides on elements that might need it.
    // Let's just allow it everywhere except interactive elements since our app is simple.
    if (target.closest('button') || target.closest('a')) {
       return;
    }

    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => setContextMenu(null);

  const handleLinkContextMenu = (e: React.MouseEvent, link: LinkItem) => {
    e.preventDefault();
    e.stopPropagation();
    setLinkContextMenu({ x: e.clientX, y: e.clientY, link });
    closeContextMenu(); // close background menu if open
  };

  const closeLinkContextMenu = () => setLinkContextMenu(null);

  const handleRandomGradient = () => {
    const r1 = Math.floor(Math.random() * 255);
    const g1 = Math.floor(Math.random() * 255);
    const b1 = Math.floor(Math.random() * 255);
    
    const r2 = Math.floor(Math.random() * 255);
    const g2 = Math.floor(Math.random() * 255);
    const b2 = Math.floor(Math.random() * 255);
    
    const c1 = `rgb(${r1},${g1},${b1})`;
    const c2 = `rgb(${r2},${g2},${b2})`;
    const angle = Math.floor(Math.random() * 360);

    const gradient = `linear-gradient(${angle}deg, ${c1} 0%, ${c2} 100%)`;
    setBackgroundGradient(gradient);
    setCustomGradientSettings({
      angle,
      colors: [
        { id: '1', color: c1, position: 0 },
        { id: '2', color: c2, position: 100 }
      ]
    });
  };

  const handleBatchDelete = () => {
    if (!activeGroupId) return;
    if (window.confirm('确定要清空当前分组的所有书签吗？操作不可逆。')) {
      deleteLinksInGroup(activeGroupId);
    }
  };

  const handleSortLinks = () => {
    if (!activeGroupId) return;
    const sorted = [...activeRootItems].sort((a, b) => a.title.localeCompare(b.title));
    reorderLinks(activeGroupId, sorted.map(l => l.id));
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  /**
   * Custom collision detection:
   * Prefer dropping onto a folder (the folder-drop-* droppable) over swapping.
   */
  const customCollisionDetection: CollisionDetection = (args) => {
    // Check if the pointer is within any droppable
    const pointerIntersections = pointerWithin(args);
    const intersections = pointerIntersections.length > 0 ? pointerIntersections : rectIntersection(args);
    
    if (intersections.length > 0) {
      // If we intersect with a folder drop target, prioritize it
      const folderDrop = intersections.find(i => String(i.id).startsWith('folder-drop-'));
      if (folderDrop) {
        return [folderDrop];
      }
    }
    
    return closestCenter(args);
  };

  const handleDragEndLinks = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id && activeGroupId) {
      if (over.data?.current?.isFolderDrop) {
        // Find if the active item is a link (we shouldn't put folders into folders right now)
        const activeItem = activeRootItems.find(l => l.id === active.id);
        if (activeItem && activeItem.itemType !== 'folder') {
          moveLinkToFolder(active.id as string, over.data.current.folderId);
          toast.success("已移入文件夹");
        } else {
          toast.error("不能将文件夹移入文件夹");
        }
        return;
      }

      const oldIndex = activeRootItems.findIndex((l) => l.id === active.id);
      const newIndex = activeRootItems.findIndex((l) => l.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newLinks = arrayMove(activeRootItems.map(l => l.id), oldIndex, newIndex);
        reorderLinks(activeGroupId, newLinks);
      }
    }
  };

  const openAddGroup = () => {
    setGroupToEdit(undefined);
    setIsGroupModalOpen(true);
  };

  const openEditGroup = (group: Group) => {
    setGroupToEdit(group);
    setIsGroupModalOpen(true);
  };

  const openAddLink = (folderId?: string) => {
    setTargetFolderIdForNewLink(folderId);
    setLinkToEdit(undefined);
    setIsLinkModalOpen(true);
  };

  const openEditLink = (link: LinkItem) => {
    setLinkToEdit(link);
    setIsLinkModalOpen(true);
  };

  return (
    <div 
      className="min-h-screen text-slate-800 font-sans selection:bg-blue-100 p-4 sm:p-8 relative overflow-x-hidden flex flex-col"
      onContextMenu={handleContextMenu}
    >
      <Toaster position="top-center" richColors />
      <div className="fixed inset-0 z-0 pointer-events-none tracking-tight leading-none bg-[#f8f9fa]">
        {backgroundImage ? (
          <img src={backgroundImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : backgroundGradient ? (
          <div className="absolute inset-0 saturate-[1.1]" style={{ background: backgroundGradient }} />
        ) : (
          <div className="absolute inset-0 saturate-[1.2]" style={{ background: 'radial-gradient(circle at 10% 20%, rgba(161, 196, 253, 0.5), transparent 50%), radial-gradient(circle at 90% 80%, rgba(194, 233, 251, 0.4), transparent 50%), radial-gradient(circle at 50% 50%, rgba(226, 209, 195, 0.3), transparent 50%)' }} />
        )}
        <div 
          className="absolute inset-0 bg-white/10 dark:bg-black/5" 
          style={{ backdropFilter: `blur(${backgroundBlur}px)`, WebkitBackdropFilter: `blur(${backgroundBlur}px)` }}
        />
      </div>

      <div className="relative z-10 w-full flex-grow flex">
        <header className={`absolute top-0 right-0 p-2 z-50 flex justify-end gap-2 ${groupPosition !== 'top' ? 'sm:hidden' : ''}`}>
          <button
            onClick={() => setIsNavigationOpen(true)}
            className="p-2 text-slate-500 hover:text-blue-600 bg-white/40 hover:bg-white/60 backdrop-blur-2xl backdrop-saturate-[150%] border border-white/50 rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            <Compass size={20} />
            <span className="hidden sm:inline text-sm font-medium">导航</span>
          </button>
          <ProfileSwitcher />
          <button
            onClick={() => setIsCommandOpen(true)}
            title="命令面板 (⌘K)"
            className="p-2 text-slate-500 hover:text-blue-600 bg-white/40 hover:bg-white/60 backdrop-blur-2xl backdrop-saturate-[150%] border border-white/50 rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            <Command size={20} />
            <span className="hidden sm:inline text-sm font-medium">命令</span>
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-slate-500 hover:text-blue-600 bg-white/40 hover:bg-white/60 backdrop-blur-2xl backdrop-saturate-[150%] border border-white/50 rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            <Settings size={20} />
            <span className="hidden sm:inline text-sm font-medium">设置</span>
          </button>
        </header>

        {groupPosition !== 'top' && (
          <aside className={`max-sm:hidden fixed top-0 bottom-0 ${groupPosition === 'left' ? 'left-4' : 'right-4'} my-auto h-[70vh] rounded-3xl w-20 bg-white/30 backdrop-blur-2xl backdrop-saturate-[150%] shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] border border-white/50 z-40 flex flex-col pt-6 pb-4 px-2`}>
            <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col items-center">
              <GroupTabs onAddGroup={openAddGroup} onEditGroup={openEditGroup} orientation="vertical" />
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/40 flex flex-col gap-2 px-1">
               <ProfileSwitcher compact />
               <button
                 onClick={() => setIsNavigationOpen(true)}
                 className="w-full p-2 text-slate-600 hover:text-blue-600 bg-white/50 hover:bg-white/70 backdrop-blur-md border border-white/50 rounded-lg transition-all shadow-sm flex flex-col items-center justify-center gap-1"
                 title="内置导航"
               >
                 <Compass size={18} />
                 <span className="text-[10px] font-medium leading-none mt-1">导航</span>
               </button>
               <button
                 onClick={() => setIsCommandOpen(true)}
                 className="w-full p-2 text-slate-600 hover:text-blue-600 bg-white/50 hover:bg-white/70 backdrop-blur-md border border-white/50 rounded-lg transition-all shadow-sm flex flex-col items-center justify-center gap-1"
                 title="命令面板 (⌘K)"
               >
                 <Command size={18} />
                 <span className="text-[10px] font-medium leading-none mt-1">命令</span>
               </button>
               <button
                 onClick={() => setIsSettingsOpen(true)}
                 className="w-full p-2 text-slate-600 hover:text-blue-600 bg-white/50 hover:bg-white/70 backdrop-blur-md border border-white/50 rounded-lg transition-all shadow-sm flex flex-col items-center justify-center gap-1"
                 title="系统设置"
               >
                 <Settings size={18} />
                 <span className="text-[10px] font-medium leading-none mt-1">设置</span>
               </button>
            </div>
          </aside>
        )}

        <div className={`flex-1 w-full flex justify-center`}>
          <main 
            className="flex-1 flex flex-col items-center pb-20 pt-16 w-full px-4 sm:px-4"
            style={{ maxWidth: containerWidth ? `${containerWidth}px` : '1024px' }}
          >
            <Clock />
            <SearchBox />
            
            <div className="w-full mt-6">
              <div className={groupPosition !== 'top' ? 'sm:hidden' : ''}>
                 <GroupTabs onAddGroup={openAddGroup} onEditGroup={openEditGroup} orientation="horizontal" />
              </div>

              <div className="w-full mt-4 sm:mt-0 pt-2 lg:pt-0">
                <DndContext 
                  id="dnd-root-links"
                  sensors={sensors} 
                  collisionDetection={customCollisionDetection} 
                  onDragEnd={handleDragEndLinks}
                  modifiers={[restrictToWindowEdges]}
                >
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={activeGroupId || 'empty'}
                      initial={{ opacity: 0, scale: 0.98, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98, y: -10 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="w-full"
                      style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(auto-fill, ${baseBlockSize}px)`,
                        gridAutoRows: `${baseBlockSize}px`,
                        gap: `${Math.max(blockGap + 12, 32)}px ${blockGap}px`,
                        justifyContent: 'center',
                        paddingBottom: '40px'
                      }}
                    >
                      <SortableContext items={activeRootItems.map(l => l.id)} strategy={rectSortingStrategy}>
                        {activeRootItems.map(item => (
                          item.itemType === 'folder' ? (
                            <FolderBlock 
                              key={item.id} 
                              folder={item} 
                              onEdit={() => { setFolderToEdit(item); setIsFolderModalOpen(true); }}
                              onClick={() => setExpandedFolder(item)}
                              onContextMenu={handleLinkContextMenu}
                            />
                          ) : (
                            <LinkBlock 
                              key={item.id} 
                              link={item} 
                              onEdit={openEditLink}
                              onContextMenu={handleLinkContextMenu}
                            />
                          )
                        ))}
                      </SortableContext>
                    </motion.div>
                  </AnimatePresence>
                </DndContext>
              </div>
            </div>
          </main>
        </div>
      </div>

      {footerText && (
        <footer className="relative z-10 text-center py-4 mt-auto">
          <p className="text-sm font-medium drop-shadow-sm opacity-80" style={{ color: footerColor }}>
            {footerText}
          </p>
        </footer>
      )}

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onOpenTrash={() => { setIsSettingsOpen(false); setIsTrashOpen(true); }} />
      <NavigationModal isOpen={isNavigationOpen} onClose={() => setIsNavigationOpen(false)} activeGroupId={activeGroupId} />
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onAddLink={() => { setIsCommandOpen(false); if (activeGroupId) openAddLink(); else toast.error("请先选择或创建一个标签分组"); }}
        onAddGroup={() => { setIsCommandOpen(false); openAddGroup(); }}
        onOpenSettings={() => { setIsCommandOpen(false); setIsSettingsOpen(true); }}
        onOpenTrash={() => { setIsCommandOpen(false); setIsTrashOpen(true); }}
      />
      <TrashModal isOpen={isTrashOpen} onClose={() => setIsTrashOpen(false)} />
      <GroupModal isOpen={isGroupModalOpen} onClose={() => setIsGroupModalOpen(false)} groupToEdit={groupToEdit} />
      {activeGroupId && (
        <>
          <LinkModal isOpen={isLinkModalOpen} onClose={() => setIsLinkModalOpen(false)} groupId={activeGroupId} linkItem={linkToEdit} targetFolderId={targetFolderIdForNewLink} />
          <FolderModal isOpen={isFolderModalOpen} onClose={() => setIsFolderModalOpen(false)} groupId={activeGroupId} folderItem={folderToEdit} />
        </>
      )}
      
      <FolderExpandedModal 
        folder={expandedFolder} 
        isOpen={!!expandedFolder} 
        onClose={() => setExpandedFolder(null)} 
        onEditLink={openEditLink}
        onContextMenu={handleLinkContextMenu}
        onAddLink={() => {
          if (expandedFolder) {
            openAddLink(expandedFolder.id);
          }
        }}
      />

      {contextMenu && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={closeContextMenu} onContextMenu={(e) => { e.preventDefault(); closeContextMenu(); }} />
          <div 
            className="fixed z-[101] bg-white/90 backdrop-blur-xl border border-slate-200/60 shadow-2xl rounded-2xl py-2 min-w-[200px] overflow-hidden"
            style={{ 
              top: Math.min(contextMenu.y, window.innerHeight - 250),
              left: Math.min(contextMenu.x, window.innerWidth - 220)
            }}
          >
            <div className="px-3 py-1 mb-1">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">快捷菜单</p>
            </div>
            {activeGroupId ? (
              <>
                <button
                  onClick={() => { closeContextMenu(); openAddLink(); }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-100 text-slate-700 text-sm flex items-center gap-3 transition-colors"
                >
                  <Plus size={16} className="text-blue-500" />
                  <span>添加书签区块</span>
                </button>
                <button
                  onClick={() => { closeContextMenu(); setFolderToEdit(undefined); setIsFolderModalOpen(true); }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-100 text-slate-700 text-sm flex items-center gap-3 transition-colors"
                >
                  <Square size={16} className="text-orange-500" />
                  <span>添加文件夹</span>
                </button>
                <button
                  onClick={() => { closeContextMenu(); setIsNavigationOpen(true); }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-100 text-slate-700 text-sm flex items-center gap-3 transition-colors"
                >
                  <Compass size={16} className="text-indigo-500" />
                  <span>从内置导航添加</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => { closeContextMenu(); openAddGroup(); }}
                className="w-full text-left px-4 py-2 hover:bg-slate-100 text-slate-700 text-sm flex items-center gap-3 transition-colors"
              >
                <Plus size={16} className="text-blue-500" />
                <span>新建分组</span>
              </button>
            )}
            
            {activeGroupId && (
              <>
                <button
                  onClick={() => { closeContextMenu(); handleSortLinks(); }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-100 text-slate-700 text-sm flex items-center gap-3 transition-colors"
                >
                  <LayoutGrid size={16} className="text-emerald-500" />
                  <span>整理布局 (按名称)</span>
                </button>
                <button
                  onClick={() => { closeContextMenu(); handleBatchDelete(); }}
                  className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 text-sm flex items-center gap-3 transition-colors"
                >
                  <Trash2 size={16} />
                  <span>清空当前分组</span>
                </button>
                <div className="h-px bg-slate-100 my-1 mx-2" />
              </>
            )}

            <button
               onClick={() => { closeContextMenu(); handleRandomGradient(); }}
              className="w-full text-left px-4 py-2 hover:bg-slate-100 text-slate-700 text-sm flex items-center gap-3 transition-colors"
            >
              <Palette size={16} className="text-purple-500" />
              <span>随机背景颜色</span>
            </button>
            <button
               onClick={() => { closeContextMenu(); setIsSettingsOpen(true); }}
              className="w-full text-left px-4 py-2 hover:bg-slate-100 text-slate-700 text-sm flex items-center gap-3 transition-colors"
            >
              <Settings size={16} className="text-slate-500" />
              <span>设置选项</span>
            </button>
          </div>
        </>
      )}

      {linkContextMenu && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={closeLinkContextMenu} onContextMenu={(e) => { e.preventDefault(); closeLinkContextMenu(); }} />
          <div 
            className="fixed z-[101] bg-white/90 backdrop-blur-xl border border-slate-200/60 shadow-2xl rounded-2xl py-2 min-w-[200px]"
            style={{ 
              top: Math.min(linkContextMenu.y, window.innerHeight - 250),
              left: Math.min(linkContextMenu.x, window.innerWidth - 220)
            }}
          >
            <div className="px-3 py-1 mb-1">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-ellipsis overflow-hidden whitespace-nowrap">{linkContextMenu.link.title}</p>
            </div>
            
            {linkContextMenu.link.itemType !== 'folder' ? (
              <>
                <button
                  onClick={() => { 
                    window.open(linkContextMenu.link.url, '_blank');
                    closeLinkContextMenu();
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-100 text-slate-700 text-sm flex items-center gap-3 transition-colors"
                >
                  <ExternalLink size={16} className="text-blue-500" />
                  <span>在新标签页打开</span>
                </button>
                <button
                  onClick={() => { 
                    openEditLink(linkContextMenu.link);
                    closeLinkContextMenu();
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-100 text-slate-700 text-sm flex items-center gap-3 transition-colors"
                >
                  <Edit2 size={16} className="text-emerald-500" />
                  <span>编辑书签</span>
                </button>
                
                {linkContextMenu.link.folderId ? (
                  <button
                    onClick={() => { 
                      removeLinkFromFolder(linkContextMenu.link.id);
                      toast.success("已移出文件夹");
                      closeLinkContextMenu();
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-100 text-slate-700 text-sm flex items-center gap-3 transition-colors"
                  >
                    <LayoutGrid size={16} className="text-orange-500" />
                    <span>移出文件夹</span>
                  </button>
                ) : activeRootItems.filter(l => l.itemType === 'folder').length > 0 && (
                  <div className="relative group/folder-menu">
                    <button className="w-full text-left px-4 py-2 hover:bg-slate-100 text-slate-700 text-sm flex items-center justify-between transition-colors">
                      <div className="flex items-center gap-3">
                        <Square size={16} className="text-orange-500" />
                        <span>移入文件夹...</span>
                      </div>
                      <span className="text-slate-400 text-xs">▶</span>
                    </button>
                    {/* Submenu on hover */}
                    <div className="absolute left-full top-0 pl-1 hidden group-hover/folder-menu:block min-w-[150px] z-[102]">
                      <div className="bg-white/90 backdrop-blur-xl border border-slate-200/60 shadow-xl rounded-xl py-1 max-h-[200px] overflow-y-auto">
                        {activeRootItems.filter(l => l.itemType === 'folder').map(f => (
                          <button
                            key={f.id}
                            onClick={() => {
                              moveLinkToFolder(linkContextMenu.link.id, f.id);
                              toast.success(`已移入 ${f.title}`);
                              closeLinkContextMenu();
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 truncate"
                          >
                            {f.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={() => { 
                    setFolderToEdit(linkContextMenu.link);
                    setIsFolderModalOpen(true);
                    closeLinkContextMenu();
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-100 text-slate-700 text-sm flex items-center gap-3 transition-colors"
                >
                  <Edit2 size={16} className="text-orange-500" />
                  <span>编辑文件夹</span>
                </button>
                <button
                  onClick={() => { 
                    dissolveFolder(linkContextMenu.link.id);
                    toast.success("文件夹已解散，内容已移至首页");
                    closeLinkContextMenu();
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-100 text-slate-700 text-sm flex items-center gap-3 transition-colors"
                >
                  <LayoutGrid size={16} className="text-indigo-500" />
                  <span>解散文件夹</span>
                </button>
              </>
            )}
            
            <div className="h-px bg-slate-100 my-1 mx-2" />
            <div className="px-3 py-1 mt-1 mb-1 relative group/size">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>区块大小</span>
                <span className="text-slate-300 text-[10px]">{linkContextMenu.link.size || '1x1'}</span>
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-1 px-2 pb-2">
              {(['1x1', '1x2', '2x1', '2x2'] as const).map(size => (
                <button
                  key={size}
                  onClick={() => {
                    updateLink(linkContextMenu.link.id, { size });
                    toast.success("区块大小已保存");
                    closeLinkContextMenu();
                  }}
                  className={cn(
                    "py-1.5 px-2 rounded hover:bg-slate-100 flex items-center justify-center gap-1.5 transition-colors text-xs font-medium",
                    linkContextMenu.link.size === size ? "bg-slate-100 text-blue-600" : "text-slate-600"
                  )}
                >
                  {size === '1x1' && <Square size={14} className="opacity-50" />}
                  {size === '1x2' && <Maximize size={14} className="opacity-50 rotate-90" />}
                  {size === '2x1' && <Maximize size={14} className="opacity-50" />}
                  {size === '2x2' && <LayoutGrid size={14} className="opacity-50" />}
                  {size}
                </button>
              ))}
            </div>

            <div className="h-px bg-slate-100 my-1 mx-2" />
            <button
              onClick={() => { 
                deleteLink(linkContextMenu.link.id);
                toast.success(linkContextMenu.link.itemType === 'folder' ? "文件夹及内容已删除" : "书签已删除");
                closeLinkContextMenu();
              }}
              className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 text-sm flex items-center gap-3 transition-colors"
            >
              <Trash2 size={16} />
              <span>{linkContextMenu.link.itemType === 'folder' ? "删除文件夹" : "删除书签"}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

