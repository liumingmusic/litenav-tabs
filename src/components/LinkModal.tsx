import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Modal } from "./Modal";
import { useStore, LinkItem } from "../lib/store";
import { getRandomColor } from "../lib/utils";
import MDEditor from '@uiw/react-md-editor';
import { Settings, FileText, Upload, ListPlus, Tag as TagIcon, X, Plus } from 'lucide-react';

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  linkItem?: LinkItem; // if passed, we edit
  targetFolderId?: string;
}

export function LinkModal({ isOpen, onClose, groupId, linkItem, targetFolderId }: LinkModalProps) {
  const addLink = useStore(state => state.addLink);
  const updateLink = useStore(state => state.updateLink);
  const deleteLink = useStore(state => state.deleteLink);

  const [activeTab, setActiveTab] = useState<'basic' | 'note' | 'batch'>('basic');
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [bgColor, setBgColor] = useState("");
  const [size, setSize] = useState<'1x1' | '1x2' | '2x1' | '2x2'>('1x1');
  const [note, setNote] = useState("");
  const [batchUrls, setBatchUrls] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState(groupId);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState("");

  const groups = useStore(state => state.groups);
  const tags = useStore(state => state.tags) || [];
  const addTag = useStore(state => state.addTag);
  const moveLinkToGroup = useStore(state => state.moveLinkToGroup);
  const activeGroup = groups.find(g => g.id === selectedGroupId);
  const defaultBgColor = activeGroup?.color || getRandomColor();

  useEffect(() => {
    if (isOpen) {
      setActiveTab('basic');
      setSelectedGroupId(linkItem ? linkItem.groupId : groupId);
      if (linkItem) {
        setTitle(linkItem.title);
        setUrl(linkItem.url);
        setImageUrl(linkItem.imageUrl || "");
        setBgColor(linkItem.backgroundColor);
        setSize(linkItem.size || '1x1');
        setNote(linkItem.note || "");
        setBatchUrls("");
        setSelectedTagIds(linkItem.tagIds || []);
        setNewTagName("");
      } else {
        setTitle("");
        setUrl("");
        setImageUrl("");
        setBgColor(defaultBgColor);
        setSize('1x1');
        setNote("");
        setBatchUrls("");
        setSelectedTagIds([]);
        setNewTagName("");
      }
    }
  }, [isOpen, linkItem, groupId]); // Note: intentional omit of defaultBgColor to avoid overriding when opening

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'batch') {
      const urls = batchUrls.split('\n').map(u => u.trim()).filter(Boolean);
      if (urls.length === 0) {
        toast.error("请输入至少一个网址");
        return;
      }
      
      urls.forEach(u => {
        const finalUrl = u.startsWith('http://') || u.startsWith('https://') ? u : `https://${u}`;
        let domain = u.replace(/^https?:\/\//, '').split('/')[0];
        try {
          domain = new URL(finalUrl).hostname;
        } catch(e) {}
        
        const generatedImageUrl = `https://s2.googleusercontent.com/s2/favicons?domain=${domain}&sz=128`;
        addLink({
          groupId: selectedGroupId,
          folderId: targetFolderId,
          title: domain,
          url: finalUrl,
          imageUrl: generatedImageUrl,
          backgroundColor: activeGroup?.color || getRandomColor(),
          size: '1x1',
          tagIds: []
        });
      });
      toast.success(`成功批量添加 ${urls.length} 个书签`);
      onClose();
      return;
    }

    if (!title || !url) {
      toast.error("请输入必填信息");
      return;
    }
    
    // Auto add https if not present
    const finalUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;

    if (linkItem) {
      updateLink(linkItem.id, { title, url: finalUrl, imageUrl, backgroundColor: bgColor, size, note: note.trim() || undefined, tagIds: selectedTagIds });
      if (selectedGroupId !== linkItem.groupId) {
        moveLinkToGroup(linkItem.id, selectedGroupId);
      }
      toast.success("书签已更新");
    } else {
      addLink({ groupId: selectedGroupId, folderId: targetFolderId, title, url: finalUrl, imageUrl: imageUrl || undefined, backgroundColor: bgColor, size, note: note.trim() || undefined, tagIds: selectedTagIds });
      toast.success("书签已添加");
    }
    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('请上传图片文件');
      return;
    }

    // Limit to 2MB
    if (file.size > 2 * 1024 * 1024) {
      toast.error('图片不能超过 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={linkItem ? "编辑快捷链接" : "添加快捷链接"}
      className={activeTab === 'note' ? 'max-w-4xl' : 'max-w-md'}
    >
      <div className="flex border-b border-gray-100 mb-4 whitespace-nowrap overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('basic')}
          className={`px-4 py-3 flex items-center gap-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'basic' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Settings size={16} />基本信息
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('note')}
          className={`px-4 py-3 flex items-center gap-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'note' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText size={16} />备注信息
        </button>
        {!linkItem && (
          <button
            type="button"
            onClick={() => setActiveTab('batch')}
            className={`px-4 py-3 flex items-center gap-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'batch' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <ListPlus size={16} />批量添加
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {activeTab === 'basic' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">网站标题 <span className="text-red-500">*</span></label>
              <input
                autoFocus
                type="text"
                required={activeTab === 'basic'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="例如：GitHub"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">网站地址 <span className="text-red-500">*</span></label>
              <input
                type="text"
                required={activeTab === 'basic'}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="例如：github.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between items-center">
                <span>自定义图标 (网址或本地图片)</span>
                <label className="cursor-pointer text-blue-500 hover:text-blue-600 flex items-center gap-1 text-xs font-medium transition-colors">
                  <Upload size={14} />
                  上传图片
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="例如：https://example.com/icon.png 或点击上方上传"
              />
              {imageUrl && (
                <div className="mt-2 w-12 h-12 rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white p-1">
                  <img src={imageUrl} alt="preview" className="w-full h-full object-contain rounded-md" />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">背景主题色</label>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-full h-10 border border-gray-200 rounded-xl cursor-pointer p-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">标签块大小</label>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value as any)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-sm"
                >
                  <option value="1x1">1:1 (正方形)</option>
                  <option value="1x2">1:2 (垂直长方形)</option>
                  <option value="2x1">2:1 (水平长方形)</option>
                  <option value="2x2">2:2 (大正方形)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">所属分组</label>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white disabled:opacity-50"
              >
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <TagIcon size={14} /> 标签（可多选，用于跨分组检索）
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map(t => (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => setSelectedTagIds(prev => prev.includes(t.id) ? prev.filter(x => x !== t.id) : [...prev, t.id])}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${selectedTagIds.includes(t.id) ? 'text-white border-transparent' : 'text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                    style={selectedTagIds.includes(t.id) ? { backgroundColor: t.color } : undefined}
                  >
                    {t.name}
                  </button>
                ))}
                {tags.length === 0 && <span className="text-xs text-gray-400">还没有标签，在下方新建一个</span>}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); const n = newTagName.trim(); if (n) { addTag(n); const t = useStore.getState().tags.find(x => x.name.toLowerCase() === n.toLowerCase()); if (t) setSelectedTagIds(prev => prev.includes(t.id) ? prev : [...prev, t.id]); setNewTagName(''); } } }}
                  placeholder="新建标签后回车"
                  className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => { const n = newTagName.trim(); if (n) { addTag(n); const t = useStore.getState().tags.find(x => x.name.toLowerCase() === n.toLowerCase()); if (t) setSelectedTagIds(prev => prev.includes(t.id) ? prev : [...prev, t.id]); setNewTagName(''); } }}
                  className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus size={13} /> 新建
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'batch' && (
          <div className="space-y-2">
            <p className="text-sm text-gray-500 mb-2">每行输入一个网址，系统将自动使用网址的主域名作为标题和图标。</p>
            <textarea
              autoFocus
              value={batchUrls}
              onChange={(e) => setBatchUrls(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y min-h-[200px] text-sm font-mono"
              placeholder="https://example.com&#10;https://github.com&#10;google.com"
            />
          </div>
        )}

        {activeTab === 'note' && (
          <div className="space-y-2" data-color-mode="light">
             <div className="mb-2 text-xs text-gray-500 flex justify-between px-1">
              <span>支持 Markdown 富文本、图片、视频链接。长篇幅内容、图文教程等推荐在此编写。</span>
              <span>{note.length} 字符</span>
            </div>
            <MDEditor
              value={note}
              onChange={(val) => setNote(val || '')}
              height={500}
              preview="edit"
              className="w-full !border-gray-200 !rounded-xl overflow-hidden"
              textareaProps={{
                placeholder: '在此编写富文本区块内容...'
              }}
            />
          </div>
        )}

        <div className="pt-4 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 sm:gap-0 mt-6 border-t border-gray-100 pb-2">
          <div className="w-full sm:w-auto">
            {linkItem && (
               <button
                 type="button"
                 onClick={() => {
                   deleteLink(linkItem.id);
                   toast.success("书签已删除");
                   onClose();
                 }}
                 className="w-full sm:w-auto text-red-500 text-sm font-medium px-4 py-2 rounded-xl hover:bg-red-50 transition-colors border border-red-100 sm:border-transparent"
               >
                 删除
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
              {linkItem ? "保存更改" : (activeTab === 'batch' ? "批量添加" : "添加链接")}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

