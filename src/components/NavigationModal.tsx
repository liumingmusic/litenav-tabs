import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Plus, Compass } from 'lucide-react';
import { presetLinksData, presetCategories, PresetLink } from '../data/presetLinks';
import { useStore } from '../lib/store';
import { toast } from 'sonner';

interface NavigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeGroupId: string | null;
}

export function NavigationModal({ isOpen, onClose, activeGroupId }: NavigationModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const addLink = useStore(state => state.addLink);
  const groups = useStore(state => state.groups);
  const activeGroup = groups.find(g => g.id === activeGroupId);

  const filteredLinks = useMemo(() => {
    return presetLinksData.filter(link => {
      const matchesSearch = link.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           link.url.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === '全部' || link.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  const handleAddLink = (link: PresetLink) => {
    if (!activeGroupId) {
      toast.error('请先选择或创建一个标签分组');
      return;
    }
    
    // 使用 Google Favicon 作为网站图标
    const imageUrl = `https://s2.googleusercontent.com/s2/favicons?domain=${link.domain}&sz=128`;
    
    addLink({
      groupId: activeGroupId,
      title: link.title,
      url: link.url,
      imageUrl: imageUrl,
      size: '1x1',
      backgroundColor: activeGroup?.color || '#ffffff'
    });
    
    toast.success(`已添加 "${link.title}" 到当前分组`);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-5xl max-h-[85vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-3 sm:py-4 gap-3 sm:gap-0 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800">
                <Compass size={22} className="text-blue-500" />
                <h2 className="text-base sm:text-lg font-semibold">内置导航大全</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 sm:hidden text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <div className="relative group flex-1 sm:flex-none">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="搜索导航..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
                />
              </div>
              <button 
                onClick={onClose}
                className="hidden sm:block p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors shrink-0"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden flex-col sm:flex-row">
            {/* Sidebar Categories */}
            <div className="w-full sm:w-40 bg-gray-50/50 border-b sm:border-b-0 sm:border-r border-gray-100 overflow-x-auto sm:overflow-y-auto flex sm:flex-col hide-scrollbar py-2 sm:py-4 shrink-0">
              <button
                onClick={() => setActiveCategory('全部')}
                className={`whitespace-nowrap sm:w-full text-left px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-medium transition-colors border-b-2 sm:border-b-0 sm:border-l-2 ${
                  activeCategory === '全部' 
                    ? 'border-blue-500 text-blue-600 bg-blue-50/50' 
                    : 'border-transparent text-gray-600 hover:bg-gray-100'
                }`}
              >
                全部推荐
              </button>
              {presetCategories.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`whitespace-nowrap sm:w-full text-left px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-medium transition-colors border-b-2 sm:border-b-0 sm:border-l-2 ${
                    activeCategory === category 
                      ? 'border-blue-500 text-blue-600 bg-blue-50/50' 
                      : 'border-transparent text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
              {filteredLinks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
                  <Compass size={40} className="opacity-20" />
                  <p>没有找到相关导航</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredLinks.map((link) => (
                    <div 
                      key={link.id}
                      className="group bg-white border border-gray-100 p-3 flex items-center gap-3 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all duration-300"
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                        <img 
                          src={`https://s2.googleusercontent.com/s2/favicons?domain=${link.domain}&sz=128`} 
                          alt={link.title}
                          className="w-10 h-10 object-contain rounded-xl"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                          {link.title}
                        </h3>
                        <p className="text-xs text-slate-400 truncate w-full">
                          {link.category}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAddLink(link)}
                        className="w-8 h-8 flex items-center justify-center text-gray-400 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-full transition-colors opacity-80 group-hover:opacity-100 shrink-0"
                        title="添加到当前分组"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
