import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { LinkItem, useStore } from "../lib/store";
import { cn } from "../lib/utils";

interface FolderBlockProps {
  folder: LinkItem;
  onEdit: (folder: LinkItem) => void;
  onClick: (folder: LinkItem) => void;
  onContextMenu?: (e: React.MouseEvent, folder: LinkItem) => void;
}

export const FolderBlock: React.FC<FolderBlockProps> = ({ folder, onEdit, onClick, onContextMenu }) => {
  const borderRadius = useStore(state => state.borderRadius);
  const linkLabelColor = useStore(state => state.linkLabelColor);
  const allLinks = useStore(state => state.links);
  const folderLinks = allLinks.filter(l => l.folderId === folder.id).sort((a, b) => a.order - b.order);

  const dragStartPos = React.useRef<{x: number, y: number} | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ 
    id: folder.id, 
    data: { itemType: 'folder' } 
  });

  const { isOver, setNodeRef: setDroppableRef } = useDroppable({
    id: `folder-drop-${folder.id}`,
    data: { isFolderDrop: true, folderId: folder.id }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isSortableDragging ? 50 : 1,
    opacity: isSortableDragging ? 0.8 : 1,
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(folder);
  };

  const sizeClasses = {
    '1x1': 'col-span-1 row-span-1',
    '1x2': 'col-span-1 row-span-2',
    '2x1': 'col-span-2 row-span-1',
    '2x2': 'col-span-2 row-span-2',
  }[folder.size || '1x1'];

  return (
    <div
      ref={setSortableRef}
      style={style}
      className={cn("relative group w-full h-full hover:z-50", sizeClasses)}
      onContextMenu={(e) => onContextMenu && onContextMenu(e, folder)}
    >
      {/* Absolute overlay for droppable area that doesn't trigger sortable swaps */}
      <div 
        ref={setDroppableRef}
        className={cn(
          "absolute inset-0 z-20 transition-all pointer-events-none rounded-xl",
          isOver && !isSortableDragging ? "ring-4 ring-blue-500 bg-blue-500/10 scale-[1.05]" : ""
        )}
      />

      <div 
        {...attributes} 
        {...listeners}
        onPointerDown={(e) => {
          // React event object.
          dragStartPos.current = { x: e.clientX, y: e.clientY };
        }}
        onClick={(e) => {
          if (dragStartPos.current) {
            const dx = e.clientX - dragStartPos.current.x;
            const dy = e.clientY - dragStartPos.current.y;
            dragStartPos.current = null;
            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
              return;
            }
          }
          onClick(folder);
        }}
        className={cn(
          "w-full h-full relative overflow-hidden transition-all duration-200 group/inner p-2 flex flex-wrap gap-1 content-start",
          isSortableDragging 
            ? "scale-[1.02] shadow-2xl cursor-grabbing ring-2 ring-blue-500/50" 
            : "hover:scale-[1.03] cursor-pointer hover:shadow-lg shadow-sm"
        )}
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(8px)',
          border: `2px solid ${folder.backgroundColor}`,
          borderRadius: `${borderRadius}px`
        }}
      >
        {/* Render mini icons of links inside the folder */}
        {folderLinks.slice(0, 9).map(link => {
          const hasImage = link.imageUrl && true; // we can't easily track image errors for thumbnails here without extra state, but mostly fine
          return (
            <div 
              key={link.id} 
              className={cn(
                "aspect-square rounded-md overflow-hidden flex items-center justify-center pointer-events-none",
                hasImage ? "bg-transparent" : "shadow-sm"
              )}
              style={{ 
                width: 'calc(33.33% - 4px)', 
                height: 'calc(33.33% - 4px)',
                backgroundColor: hasImage ? "transparent" : (link.backgroundColor || "#e5e7eb")
              }}
            >
              {hasImage ? (
                <img src={link.imageUrl} alt="" className="w-full h-full object-contain" />
              ) : (
                <span className="text-[10px] font-bold uppercase text-white truncate px-1" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                  {link.title.substring(0, 2)}
                </span>
              )}
            </div>
          );
        })}
        {folderLinks.length > 9 && (
          <div className="absolute bottom-1 right-1 text-white text-[10px] font-bold drop-shadow-md">
            +{folderLinks.length - 9}
          </div>
        )}
      </div>
      
      <div
        className="absolute -bottom-[27px] left-0 right-0 text-center truncate text-[13px] font-medium drop-shadow-sm px-1 transition-opacity hover:opacity-80 block pointer-events-none"
        style={{ color: linkLabelColor }}
      >
        {folder.title}
      </div>
    </div>
  );
}
