import { useState, useEffect, type MouseEvent } from "react";
import { useStore } from "../lib/store";
import { LinkItem } from "../lib/store";
import { motion, AnimatePresence } from "motion/react";
import { X, Plus, Trash2 } from "lucide-react";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { LinkBlock } from "./LinkBlock";
import { toast } from "sonner";

interface FolderExpandedProps {
  folder: LinkItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEditLink: (link: LinkItem) => void;
  onContextMenu: (e: MouseEvent, link: LinkItem) => void;
  onAddLink: () => void;
}

export function FolderExpandedModal({
  folder,
  isOpen,
  onClose,
  onEditLink,
  onContextMenu,
  onAddLink,
}: FolderExpandedProps) {
  const folderBgColor = useStore(state => state.folderBgColor) || '#ffffff';
  const folderBgOpacity = useStore(state => state.folderBgOpacity) ?? 80;
  const folderOverlayColor = useStore(state => state.folderOverlayColor) || '#000000';
  const folderOverlayOpacity = useStore(state => state.folderOverlayOpacity) ?? 60;

  const getRgba = (hex: string, opacity: number) => {
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const r = parseInt(h.substring(0, 2), 16) || 0;
    const g = parseInt(h.substring(2, 4), 16) || 0;
    const b = parseInt(h.substring(4, 6), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
  };

  const [internalFolder, setInternalFolder] = useState<LinkItem | null>(
    folder,
  );

  useEffect(() => {
    if (folder) {
      setInternalFolder(folder);
    }
  }, [folder]);

  const currentFolder = folder || internalFolder;

  const links = useStore((state) => state.links);
  const reorderLinks = useStore((state) => state.reorderLinks);
  const removeLinkFromFolder = useStore((state) => state.removeLinkFromFolder);
  const deleteLink = useStore((state) => state.deleteLink);
  const baseBlockSize = useStore((state) => state.baseBlockSize);
  const blockGap = useStore((state) => state.blockGap);

  const folderLinks = currentFolder
    ? links
        .filter((l) => l.folderId === currentFolder.id)
        .sort((a, b) => a.order - b.order)
    : [];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    if (!currentFolder) return;
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = folderLinks.findIndex((l) => l.id === active.id);
      const newIndex = folderLinks.findIndex((l) => l.id === over.id);
      const newLinks = arrayMove(
        folderLinks.map((l) => l.id),
        oldIndex,
        newIndex,
      );
      reorderLinks(currentFolder.groupId, newLinks);
    }
  };

  const moveToRoot = (linkId: string) => {
    removeLinkFromFolder(linkId);
    toast.success("已移出文件夹");
  };

  const handleRemove = (linkId: string) => {
    deleteLink(linkId);
    toast.success("已删除书签");
  };

  if (!currentFolder) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="folder-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          onClick={onClose}
          className="fixed inset-0 z-[60]"
          style={{ backgroundColor: getRgba(folderOverlayColor, folderOverlayOpacity) }}
        />
      )}
      {isOpen && (
        <motion.div
          key="folder-modal"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
          className="fixed inset-0 m-auto z-[70] w-full max-w-3xl max-h-[85vh] flex flex-col pointer-events-none p-4 sm:p-6"
        >
          <div 
            className="rounded-2xl shadow-xl border border-white/20 w-full flex-shrink flex flex-col pointer-events-auto overflow-hidden backdrop-blur-2xl"
            style={{ backgroundColor: getRgba(folderBgColor, folderBgOpacity) }}
          >
            <div className="p-6 pb-4 flex justify-between items-center relative z-10">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 px-2 drop-shadow-sm">
                {currentFolder.title}
              </h2>
              <div className="flex gap-2 bg-black/5 dark:bg-white/10 rounded-full p-1 border border-white/10">
                <button
                  onClick={onAddLink}
                  className="p-2 rounded-full hover:bg-white/40 dark:hover:bg-white/10 transition-colors text-blue-600 dark:text-blue-400"
                  title="添加书签"
                >
                  <Plus size={22} />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/40 dark:hover:bg-white/10 transition-colors text-gray-700 dark:text-gray-200"
                  title="关闭"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            <div
              className="p-6 pt-2 overflow-y-auto custom-scrollbar relative z-10"
              style={{ minHeight: "400px" }}
            >
              {folderLinks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-800/60 dark:text-gray-200/60 font-medium">
                  <p className="text-lg">文件夹是空的</p>
                  <p className="text-sm mt-3 opacity-80">
                    在主页右键链接并选择"移入文件夹"即可添加
                  </p>
                </div>
              ) : (
                <DndContext
                  id={`dnd-folder-${currentFolder.id}`}
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                  modifiers={[restrictToWindowEdges]}
                >
                  <SortableContext
                    items={folderLinks.map((l) => l.id)}
                    strategy={rectSortingStrategy}
                  >
                    <div
                      className="w-full pb-8"
                      style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(auto-fill, ${baseBlockSize}px)`,
                        gridAutoRows: `${baseBlockSize}px`,
                        gap: `${Math.max(blockGap + 12, 32)}px ${blockGap}px`,
                        justifyContent: "center",
                      }}
                    >
                      {folderLinks.map((link) => (
                        <LinkBlock
                          key={link.id}
                          link={link}
                          onEdit={() => onEditLink(link)}
                          onContextMenu={onContextMenu}
                          forceSquare
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
