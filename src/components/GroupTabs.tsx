import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useStore, Group } from "../lib/store";
import { Plus, Edit2 } from "lucide-react";
import { cn } from "../lib/utils";

interface GroupTabsProps {
  onAddGroup: () => void;
  onEditGroup: (group: Group) => void;
  orientation?: 'horizontal' | 'vertical';
}

const SortableTab: React.FC<{ group: Group, activeId: string | null, textColor: string, activeTextColor: string, onSelect: () => void, onEdit: () => void, orientation?: 'horizontal' | 'vertical' }> = ({ group, activeId, textColor, activeTextColor, onSelect, onEdit, orientation }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: group.id });
  
  const isActive = activeId === group.id;

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    color: isActive ? (group.color || activeTextColor) : (group.color || textColor),
  };

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, wordBreak: 'break-all' }}
      className={cn(
        "group relative flex items-center justify-center shrink-0 rounded-lg transition-all duration-200 cursor-grab active:cursor-grabbing border",
        orientation === 'vertical' ? "w-full min-h-[48px] px-0.5 py-1" : "min-w-[100px] px-6 py-2 text-sm",
        isActive 
          ? "bg-white/90 font-bold shadow-sm border-white/20 backdrop-blur-md" 
          : "hover:bg-white/20 border-transparent shadow-none font-medium backdrop-blur-md",
        isDragging && "scale-[1.05] shadow-lg ring-2 ring-blue-500/30 opacity-90"
      )}
      {...attributes}
      {...listeners}
      onClick={onSelect}
    >
      {group.color && isActive && (
        <div 
          className="absolute rounded-full border-2 border-white pointer-events-none" 
          style={{ 
            backgroundColor: group.color,
            width: '8px',
            height: '8px',
            ...(orientation === 'vertical' ? { top: '3px', right: '3px' } : { top: '50%', transform: 'translateY(-50%)', left: '10px' })
          }} 
        />
      )}
      {group.color && !isActive && (
        <div 
          className="absolute rounded-full opacity-60 pointer-events-none" 
          style={{ 
            backgroundColor: group.color,
            width: '6px',
            height: '6px',
            ...(orientation === 'vertical' ? { top: '5px', right: '5px' } : { top: '50%', transform: 'translateY(-50%)', left: '12px' })
          }} 
        />
      )}
      <div className={cn(
        "flex-1 w-full text-center overflow-hidden",
        group.color && orientation === 'horizontal' ? "pl-2" : "",
        orientation === 'vertical' ? "text-[12px] leading-[1.3] tracking-wider" : "truncate leading-snug"
      )}>
        {orientation === 'vertical' ? (
          <div className="flex flex-col items-center justify-center font-sans">
            <span>{group.name.substring(0, 2)}</span>
            {group.name.length > 2 && <span>{group.name.substring(2, 4)}</span>}
          </div>
        ) : (
          group.name
        )}
      </div>
      {isActive && (
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className={cn(
            "absolute p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-blue-50 transition-all text-blue-600 shrink-0",
            orientation === 'vertical' ? "-bottom-2 -right-1 bg-white shadow-sm" : "right-1"
          )}
        >
          <Edit2 size={10} />
        </button>
      )}
    </div>
  );
}

export function GroupTabs({ onAddGroup, onEditGroup, orientation = 'horizontal' }: GroupTabsProps) {
  const groups = useStore(state => state.groups);
  const activeGroupId = useStore(state => state.activeGroupId);
  const setActiveGroup = useStore(state => state.setActiveGroup);
  const reorderGroups = useStore(state => state.reorderGroups);
  const groupColor = useStore(state => state.groupColor);
  const groupActiveColor = useStore(state => state.groupActiveColor);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = groups.findIndex((g) => g.id === active.id);
      const newIndex = groups.findIndex((g) => g.id === over.id);
      const newGroups = arrayMove(groups.map(g => g.id), oldIndex, newIndex);
      reorderGroups(newGroups);
    }
  };

  const isVertical = orientation === 'vertical';

  return (
    <div className={cn(
      "w-full flex scrollbar-hide",
      isVertical 
        ? "flex-col items-stretch overflow-y-auto max-h-[70vh] py-2 gap-3 px-1" 
        : "items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-6 sm:mb-10 px-2 sm:px-8 max-w-4xl mx-auto no-scrollbar"
    )}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={groups.map((g) => g.id)} strategy={isVertical ? verticalListSortingStrategy : horizontalListSortingStrategy}>
          {groups.map((group) => (
            <SortableTab 
              key={group.id} 
              group={group} 
              activeId={activeGroupId} 
              textColor={groupColor}
              activeTextColor={groupActiveColor}
              onSelect={() => setActiveGroup(group.id)}
              onEdit={() => onEditGroup(group)}
              orientation={orientation}
            />
          ))}
        </SortableContext>
      </DndContext>
      <button
        onClick={onAddGroup}
        className={cn(
          "shrink-0 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 hover:border-slate-300 hover:text-slate-500 transition-colors",
          isVertical ? "w-full py-2 min-h-[40px] rounded-lg mt-2" : "w-10 h-10 rounded-full ml-2"
        )}
      >
        <Plus size={20} />
      </button>
    </div>
  );
}
