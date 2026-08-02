import React, { useState, useEffect, useRef, useMemo } from "react";
import { Search, CornerDownLeft, Plus, FolderPlus, Settings, Trash2, Compass, Link as LinkIcon } from "lucide-react";
import { useStore, LinkItem } from "../lib/store";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLink: () => void;
  onAddGroup: () => void;
  onOpenSettings: () => void;
  onOpenTrash: () => void;
}

interface Cmd {
  id: string;
  label: string;
  hint?: string;
  icon: React.ReactNode;
  run: () => void;
  group: string;
}

export function CommandPalette({ isOpen, onClose, onAddLink, onAddGroup, onOpenSettings, onOpenTrash }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const links = useStore(state => state.links);
  const groups = useStore(state => state.groups);
  const tags = useStore(state => state.tags) || [];
  const setActiveGroup = useStore(state => state.setActiveGroup);
  const recordLinkClick = useStore(state => state.recordLinkClick);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [isOpen]);

  const commands = useMemo<Cmd[]>(() => {
    const q = query.trim().toLowerCase();
    const out: Cmd[] = [];

    if (!q) {
      out.push(
        { id: 'a-add-link', label: '新建书签', group: '操作', icon: <Plus size={16} />, run: () => { onClose(); onAddLink(); } },
        { id: 'a-add-group', label: '新建分组', group: '操作', icon: <FolderPlus size={16} />, run: () => { onClose(); onAddGroup(); } },
        { id: 'a-settings', label: '打开设置', group: '操作', icon: <Settings size={16} />, run: () => { onClose(); onOpenSettings(); } },
        { id: 'a-trash', label: '回收站', group: '操作', icon: <Trash2 size={16} />, run: () => { onClose(); onOpenTrash(); } },
      );
    }

    groups.forEach(g => {
      if (!q || g.name.toLowerCase().includes(q)) {
        out.push({
          id: `g-${g.id}`, label: `切换分组：${g.name}`, group: '分组', icon: <Compass size={16} />,
          run: () => { setActiveGroup(g.id); onClose(); }
        });
      }
    });

    links.filter(l => l.itemType !== 'folder').forEach((l: LinkItem) => {
      if (!q || l.title.toLowerCase().includes(q) || l.url.toLowerCase().includes(q)) {
        out.push({
          id: `l-${l.id}`, label: l.title, hint: l.url, group: '书签', icon: <LinkIcon size={16} />,
          run: () => { recordLinkClick(l.id); window.open(l.url, '_blank'); onClose(); }
        });
      }
    });

    return out.slice(0, 50);
  }, [query, links, groups, tags, onClose, onAddLink, onAddGroup, onOpenSettings, onOpenTrash, setActiveGroup, recordLinkClick]);

  useEffect(() => { setActive(0); }, [query]);

  if (!isOpen) return null;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, commands.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); commands[active]?.run(); }
    else if (e.key === 'Escape') { e.preventDefault(); onClose(); }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[12vh] bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 border-b border-slate-100">
          <Search size={18} className="text-slate-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="输入命令或搜索书签 / 分组…"
            className="flex-1 py-4 bg-transparent outline-none text-base"
          />
          <kbd className="text-[10px] text-slate-400 border border-slate-200 rounded px-1.5 py-0.5">ESC</kbd>
        </div>
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-2">
          {commands.length === 0 && <div className="px-4 py-6 text-sm text-slate-400 text-center">没有匹配项</div>}
          {commands.map((c, idx) => (
            <button
              key={c.id}
              onMouseEnter={() => setActive(idx)}
              onClick={c.run}
              className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors ${idx === active ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
            >
              <span className="text-slate-500 shrink-0">{c.icon}</span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-medium text-slate-800 truncate">{c.label}</span>
                {c.hint && <span className="block text-[11px] text-slate-400 truncate">{c.hint}</span>}
              </span>
              <span className="text-[10px] text-slate-300 shrink-0">{c.group}</span>
              {idx === active && <CornerDownLeft size={14} className="text-blue-400 shrink-0" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
