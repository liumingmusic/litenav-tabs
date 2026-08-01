import React from "react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Modal } from "./Modal";
import { useStore, Group } from "../lib/store";

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupToEdit?: Group;
}

export function GroupModal({ isOpen, onClose, groupToEdit }: GroupModalProps) {
  const addGroup = useStore(state => state.addGroup);
  const updateGroup = useStore(state => state.updateGroup);
  const deleteGroup = useStore(state => state.deleteGroup);
  const groups = useStore(state => state.groups);

  const [name, setName] = useState("");
  const [color, setColor] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (groupToEdit) {
        setName(groupToEdit.name);
        setColor(groupToEdit.color || "");
      } else {
        setName("");
        setColor("");
      }
    }
  }, [isOpen, groupToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (groupToEdit) {
      updateGroup(groupToEdit.id, name, color === "" ? null : color);
      toast.success("分组已更新");
    } else {
      addGroup(name, color || undefined);
      toast.success("分组已添加");
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={groupToEdit ? "编辑分组" : "添加分组"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">分组名称 <span className="text-red-500">*</span></label>
          <input
            autoFocus
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="例如：工作、娱乐、学习"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">分组颜色 (可选)</label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={color || "#475569"} // Default display color if none selected
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 border border-gray-200 rounded-xl cursor-pointer p-1"
            />
            {color && (
              <button
                type="button"
                onClick={() => setColor("")}
                className="text-xs text-slate-500 hover:text-slate-800 underline"
              >
                清除颜色
              </button>
            )}
            {!color && (
              <span className="text-xs text-slate-400">使用系统默认颜色</span>
            )}
          </div>
        </div>

        <div className="pt-4 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 sm:gap-0">
          <div className="w-full sm:w-auto">
            {groupToEdit && groups.length > 1 && (
               <button
                 type="button"
                 onClick={() => {
                   deleteGroup(groupToEdit.id);
                   toast.success("分组已删除");
                   onClose();
                 }}
                 className="w-full sm:w-auto text-red-500 text-sm font-medium px-4 py-2 rounded-xl hover:bg-red-50 transition-colors border border-red-100 sm:border-transparent"
               >
                 删除分组
               </button>
            )}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors border border-gray-200 sm:border-transparent"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
            >
              {groupToEdit ? "保存更改" : "创建分组"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
