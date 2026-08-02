import React, { useState, useRef, useEffect } from "react";
import { Layers, Check, Plus, Pencil, Trash2 } from "lucide-react";
import { useStore } from "../lib/store";

export function ProfileSwitcher() {
  const profiles = useStore(state => state.profiles);
  const activeProfileId = useStore(state => state.activeProfileId);
  const switchProfile = useStore(state => state.switchProfile);
  const addProfile = useStore(state => state.addProfile);
  const renameProfile = useStore(state => state.renameProfile);
  const deleteProfile = useStore(state => state.deleteProfile);

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const active = profiles.find(p => p.id === activeProfileId);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="p-2 text-slate-500 hover:text-blue-600 bg-white/40 hover:bg-white/60 backdrop-blur-2xl backdrop-saturate-[150%] border border-white/50 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
        title="切换空间"
      >
        <Layers size={18} />
        <span className="hidden sm:inline text-sm font-medium max-w-[80px] truncate">{active?.name}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl py-2 z-[120]">
          <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">我的空间</div>
          {profiles.map(p => (
            <div key={p.id} className="group/item flex items-center gap-1 px-2">
              <button
                onClick={() => { switchProfile(p.id); setOpen(false); }}
                className={`flex-1 text-left px-2 py-2 rounded-lg flex items-center gap-2 transition-colors ${p.id === activeProfileId ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-100 text-slate-700'}`}
              >
                {p.id === activeProfileId && <Check size={14} className="text-blue-600 shrink-0" />}
                <span className="text-sm truncate flex-1">{p.name}</span>
              </button>
              <button
                onClick={() => { const n = window.prompt("重命名空间", p.name); if (n != null) renameProfile(p.id, n); }}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md opacity-0 group-hover/item:opacity-100 transition-opacity"
                title="重命名"
              >
                <Pencil size={13} />
              </button>
              {profiles.length > 1 && (
                <button
                  onClick={() => { if (window.confirm(`删除空间「${p.name}」？该空间内的书签将一并删除，不可恢复。`)) { deleteProfile(p.id); setOpen(false); } }}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md opacity-0 group-hover/item:opacity-100 transition-opacity"
                  title="删除"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => { const n = window.prompt("新空间名称", "新空间"); if (n != null) { addProfile(n); setOpen(false); } }}
            className="w-full mt-1 px-4 py-2 text-left text-sm font-medium text-blue-600 hover:bg-blue-50 flex items-center gap-2 transition-colors border-t border-slate-100"
          >
            <Plus size={15} /> 新建空间
          </button>
        </div>
      )}
    </div>
  );
}
