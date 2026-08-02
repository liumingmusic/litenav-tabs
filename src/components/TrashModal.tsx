import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Drawer } from "./Drawer";
import { useStore, TrashItem } from "../lib/store";
import { RotateCcw, Trash2, Trash } from "lucide-react";
import { toast } from "sonner";

interface TrashModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function describe(item: TrashItem): { title: string; type: string } {
  if (item.type === 'group') {
    const payload = item.data as { group: { name: string } };
    return { title: payload.group.name, type: '分组' };
  }
  const link = item.data as { title: string; itemType?: string };
  return { title: link.title, type: link.itemType === 'folder' ? '文件夹' : '书签' };
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return '刚刚';
  if (m < 60) return `${m} 分钟前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} 小时前`;
  return `${Math.floor(h / 24)} 天前`;
}

export function TrashModal({ isOpen, onClose }: TrashModalProps) {
  const trash = useStore(state => state.trash) || [];
  const restoreFromTrash = useStore(state => state.restoreFromTrash);
  const purgeTrashItem = useStore(state => state.purgeTrashItem);
  const emptyTrash = useStore(state => state.emptyTrash);
  const retentionDays = useStore(state => state.trashRetentionDays);

  const handleEmpty = () => {
    if (window.confirm(`确定要彻底清空回收站吗？此操作不可恢复（共 ${trash.length} 项）。`)) {
      emptyTrash();
      toast.success("回收站已清空");
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="回收站" className="max-w-[520px]">
      <div className="space-y-4">
        <p className="text-sm text-gray-500">
          删除的书签会先进入回收站，保留 {retentionDays} 天。在此期间可随时恢复；超过保留期或手动清空后将永久删除。
        </p>
        {trash.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Trash size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">回收站为空</p>
          </div>
        ) : (
          <>
            <div className="flex justify-end">
              <button onClick={handleEmpty} className="text-xs text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                <Trash size={13} /> 清空回收站
              </button>
            </div>
            <ul className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {trash.map(item => {
                const d = describe(item);
                return (
                  <li key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-800 truncate">{d.title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-500">{d.type}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">删除于 {timeAgo(item.deletedAt)}</p>
                    </div>
                    <button
                      onClick={() => { restoreFromTrash(item.id); toast.success("已恢复"); }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="恢复"
                    >
                      <RotateCcw size={16} />
                    </button>
                    <button
                      onClick={() => purgeTrashItem(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="彻底删除"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </Drawer>
  );
}
