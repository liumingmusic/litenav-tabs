import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { LinkItem, useStore } from "../lib/store";
import { StickyNote } from "lucide-react";
import { cn } from "../lib/utils";
import { NoteModal } from "./NoteModal";

interface LinkBlockProps {
  link: LinkItem;
  onEdit: (link: LinkItem) => void;
  onContextMenu?: (e: React.MouseEvent, link: LinkItem) => void;
  forceSquare?: boolean;
}

export const LinkBlock: React.FC<LinkBlockProps> = ({ link, onEdit, onContextMenu, forceSquare }) => {
  const borderRadius = useStore(state => state.borderRadius);
  const linkLabelColor = useStore(state => state.linkLabelColor);

  const [isNoteViewerOpen, setIsNoteViewerOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const dragStartPos = React.useRef<{x: number, y: number} | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(link);
  };

  const sizeClasses = forceSquare ? 'col-span-1 row-span-1' : {
    '1x1': 'col-span-1 row-span-1',
    '1x2': 'col-span-1 row-span-2',
    '2x1': 'col-span-2 row-span-1',
    '2x2': 'col-span-2 row-span-2',
  }[link.size || '1x1'];

  const hasImage = link.imageUrl && !imageError;

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={cn("relative group w-full h-full hover:z-50", sizeClasses)}
        onContextMenu={(e) => onContextMenu && onContextMenu(e, link)}
      >
        <div 
          {...attributes} 
          {...listeners}
          className={cn(
            "w-full h-full relative overflow-hidden transition-transform duration-200 group/inner flex items-center justify-center",
            isDragging 
              ? "scale-[1.02] shadow-2xl cursor-grabbing ring-2 ring-blue-500/50" 
              : "hover:scale-[1.03] cursor-grab hover:shadow-lg shadow-sm"
          )}
          style={{ 
            backgroundColor: hasImage ? "transparent" : (link.backgroundColor || "#e5e7eb"),
            borderRadius: `${borderRadius}px`
          }}
        >
          {/* Clickable Area */}
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            draggable={false}
            className="absolute inset-0 z-0 block cursor-pointer"
            onPointerDown={(e) => {
              dragStartPos.current = { x: e.clientX, y: e.clientY };
            }}
            onClick={(e) => {
              if (isDragging) {
                e.preventDefault();
              } else if (dragStartPos.current) {
                const dx = e.clientX - dragStartPos.current.x;
                const dy = e.clientY - dragStartPos.current.y;
                if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                  e.preventDefault();
                }
              }
              dragStartPos.current = null;
            }}
          />

          {hasImage ? (
            <div className="w-full h-full flex items-center justify-center pointer-events-none">
              <img 
                src={link.imageUrl} 
                alt={link.title} 
                draggable={false}
                className="w-full h-full object-contain transition-transform duration-200" 
                onError={() => setImageError(true)}
              />
            </div>
          ) : (
            <span 
              title={link.title}
              className="text-white font-bold uppercase pointer-events-none drop-shadow-sm max-w-[80%] text-center overflow-hidden text-clip whitespace-nowrap"
              style={{ fontSize: (link.size === '2x2') ? '4rem' : (link.size === '2x1' || link.size === '1x2') ? '3rem' : '2.25rem' }}
            >
              {link.title.substring(0, 2)}
            </span>
          )}
          
          {/* Note Info Tooltip at bottom center */}
          {link.note && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center opacity-0 group-hover/inner:opacity-100 transition-opacity">
              <button 
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsNoteViewerOpen(true);
                }}
                className="bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full backdrop-blur-md flex items-center justify-center transition-colors cursor-pointer shadow-sm"
              >
                <StickyNote size={14} />
              </button>
            </div>
          )}
        </div>
        
        <a 
          href={link.url}
          title={link.title}
          className="absolute -bottom-[27px] left-0 right-0 text-center truncate text-[13px] font-medium drop-shadow-sm px-1 transition-opacity hover:opacity-80 block"
          style={{ color: linkLabelColor }}
          target="_blank"
          rel="noopener noreferrer"
        >
          {link.title}
        </a>
      </div>

      <NoteModal 
        isOpen={isNoteViewerOpen} 
        onClose={() => setIsNoteViewerOpen(false)} 
        linkItem={link} 
      />
    </>
  );
}
