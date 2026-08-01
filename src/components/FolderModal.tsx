import React, { useState, useEffect } from 'react';
import { Modal } from "./Modal";
import { useStore, LinkItem } from "../lib/store";
import { getRandomColor } from "../lib/utils";
import { FolderPlus } from 'lucide-react';
import { toast } from 'sonner';

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  folderItem?: LinkItem; // if passed, we edit
}

export function FolderModal({ isOpen, onClose, groupId, folderItem }: FolderModalProps) {
  const addFolder = useStore(state => state.addFolder);
  const updateLink = useStore(state => state.updateLink);
  const dissolveFolder = useStore(state => state.dissolveFolder);
  const groups = useStore(state => state.groups);

  const [title, setTitle] = useState("");
  const [bgColor, setBgColor] = useState("");
  const [size, setSize] = useState<'1x1' | '1x2' | '2x1' | '2x2'>('1x1');

  const activeGroup = groups.find(g => g.id === groupId);
  const defaultBgColor = activeGroup?.color || getRandomColor();

  useEffect(() => {
    if (isOpen) {
      if (folderItem) {
        setTitle(folderItem.title);
        setBgColor(folderItem.backgroundColor);
        setSize(folderItem.size || '1x1');
      } else {
        setTitle("");
        setBgColor(defaultBgColor);
        setSize('1x1');
      }
    }
  }, [isOpen, folderItem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("请输入文件夹名称");
      return;
    }
    
    if (folderItem) {
      updateLink(folderItem.id, { title: title.trim(), backgroundColor: bgColor, size });
      toast.success("文件夹已更新");
    } else {
      addFolder({ 
        groupId, 
        title: title.trim(), 
        url: '', 
        backgroundColor: bgColor, 
        size 
      });
      toast.success("文件夹已添加");
    }
    onClose();
  };

  const handleDissolve = () => {
    if (folderItem) {
      dissolveFolder(folderItem.id);
      toast.success("文件夹已解散，内部分块已移出");
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={folderItem ? "编辑文件夹" : "添加文件夹"}
      className="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">文件夹名称 <span className="text-red-500">*</span></label>
          <input
            autoFocus
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="例如: 常用工具"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">边框/主题颜色</label>
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-full h-10 border border-gray-200 rounded-xl cursor-pointer p-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">文件夹大小</label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value as any)}
              className="w-full h-10 px-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-sm"
            >
              <option value="1x1">1 x 1 (1x)</option>
              <option value="1x2">1 x 2 (高)</option>
              <option value="2x1">2 x 1 (宽)</option>
              <option value="2x2">2 x 2 (大)</option>
            </select>
          </div>
        </div>

        <div className="pt-4 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 sm:gap-0 border-t border-gray-100">
          <div className="w-full sm:w-auto">
            {folderItem && (
               <button
                 type="button"
                 onClick={handleDissolve}
                 className="w-full sm:w-auto text-orange-500 text-sm font-medium px-4 py-2 rounded-xl hover:bg-orange-50 transition-colors border border-orange-100 sm:border-transparent"
               >
                 解散文件夹
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
              className="flex-1 sm:flex-none px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm"
            >
              {folderItem ? "保存更改" : "创建文件夹"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
