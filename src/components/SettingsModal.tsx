import React from "react";
import { useState, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Drawer } from "./Drawer";
import { useStore } from "../lib/store";
import { backupToWebDav, restoreFromWebDav } from "../lib/webdav";
import { gradients } from "../lib/gradients";
import { Package, Shield, Zap, Sparkles, Database, Trash2, Plus } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const webdavConfig = useStore(state => state.webdavConfig);
  const setWebdavConfig = useStore(state => state.setWebdavConfig);
  const webdavSyncStatus = useStore(state => state.webdavSyncStatus);
  const webdavLastSyncTime = useStore(state => state.webdavLastSyncTime);
  const webdavError = useStore(state => state.webdavError);
  const groupPosition = useStore(state => state.groupPosition) || 'top';
  const setGroupPosition = useStore(state => state.setGroupPosition);
  const containerWidth = useStore(state => state.containerWidth);
  const setContainerWidth = useStore(state => state.setContainerWidth);
  const folderBgColor = useStore(state => state.folderBgColor) || '#ffffff';
  const setFolderBgColor = useStore(state => state.setFolderBgColor);
  const folderBgOpacity = useStore(state => state.folderBgOpacity) ?? 80;
  const setFolderBgOpacity = useStore(state => state.setFolderBgOpacity);
  const folderOverlayColor = useStore(state => state.folderOverlayColor) || '#000000';
  const setFolderOverlayColor = useStore(state => state.setFolderOverlayColor);
  const folderOverlayOpacity = useStore(state => state.folderOverlayOpacity) ?? 60;
  const setFolderOverlayOpacity = useStore(state => state.setFolderOverlayOpacity);

  const [url, setUrl] = useState(webdavConfig?.url || "");
  const [username, setUsername] = useState(webdavConfig?.username || "");
  const [password, setPassword] = useState(webdavConfig?.password || "");
  const [status, setStatus] = useState({ message: "", type: "" });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  
  const backgroundImage = useStore(state => state.backgroundImage);
  const setBackgroundImage = useStore(state => state.setBackgroundImage);
  const backgroundGradient = useStore(state => state.backgroundGradient);
  const setBackgroundGradient = useStore(state => state.setBackgroundGradient);
  const backgroundBlur = useStore(state => state.backgroundBlur);
  const setBackgroundBlur = useStore(state => state.setBackgroundBlur);
  const borderRadius = useStore(state => state.borderRadius);
  const setBorderRadius = useStore(state => state.setBorderRadius);
  const baseBlockSize = useStore(state => state.baseBlockSize);
  const setBaseBlockSize = useStore(state => state.setBaseBlockSize);
  const blockGap = useStore(state => state.blockGap);
  const setBlockGap = useStore(state => state.setBlockGap);
  const clockColor = useStore(state => state.clockColor);
  const setClockColor = useStore(state => state.setClockColor);
  const groupColor = useStore(state => state.groupColor);
  const setGroupColor = useStore(state => state.setGroupColor);
  const groupActiveColor = useStore(state => state.groupActiveColor);
  const setGroupActiveColor = useStore(state => state.setGroupActiveColor);
  const linkLabelColor = useStore(state => state.linkLabelColor);
  const setLinkLabelColor = useStore(state => state.setLinkLabelColor);
  const footerColor = useStore(state => state.footerColor);
  const setFooterColor = useStore(state => state.setFooterColor);
  const footerText = useStore(state => state.footerText);
  const setFooterText = useStore(state => state.setFooterText);
  const searchEngineUrl = useStore(state => state.searchEngineUrl);
  const setSearchEngineUrl = useStore(state => state.setSearchEngineUrl);
  const searchEngines = useStore(state => state.searchEngines) || [];
  const setSearchEngines = useStore(state => state.setSearchEngines);
  const activeSearchEngineId = useStore(state => state.activeSearchEngineId);
  const setActiveSearchEngineId = useStore(state => state.setActiveSearchEngineId);

  const customGradientSettings = useStore(state => state.customGradientSettings);
  const setCustomGradientSettings = useStore(state => state.setCustomGradientSettings);

  const [activeTab, setActiveTab] = useState<'general' | 'layout' | 'theme' | 'local' | 'webdav' | 'about'>('general');
  
  const [gradientColors, setGradientColors] = useState<{id: string, color: string, position: number}[]>(
    customGradientSettings?.colors || [
      { id: '1', color: '#4facfe', position: 0 },
      { id: '2', color: '#00f2fe', position: 100 }
    ]
  );
  const [customAngle, setCustomAngle] = useState(customGradientSettings?.angle || 120);
  const [gradientType, setGradientType] = useState<'linear' | 'radial' | 'conic'>(customGradientSettings?.type || 'linear');

  const applyCustomGradient = (colors: {id: string, color: string, position: number}[], angle: number, type: 'linear' | 'radial' | 'conic') => {
    const sortedColors = [...colors].sort((a, b) => a.position - b.position);
    const colorStops = sortedColors.map(c => `${c.color} ${c.position}%`).join(', ');
    
    let gradientStr = '';
    if (type === 'linear') {
      gradientStr = `linear-gradient(${angle}deg, ${colorStops})`;
    } else if (type === 'radial') {
      gradientStr = `radial-gradient(circle, ${colorStops})`;
    } else if (type === 'conic') {
      gradientStr = `conic-gradient(from ${angle}deg, ${colorStops})`;
    }
    
    setBackgroundGradient(gradientStr);
    setCustomGradientSettings({ colors, angle, type });
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1080;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((MAX_WIDTH / width) * height);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((MAX_HEIGHT / height) * width);
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/webp', 0.6);
        setBackgroundImage(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    if (bgInputRef.current) bgInputRef.current.value = '';
  };

  const handleSaveWebDav = async (e: React.FormEvent) => {
    e.preventDefault();
    setWebdavConfig({ url, username, password });
    setStatus({ message: "已保存 WebDAV 配置", type: "success" });
    setTimeout(() => setStatus({ message: "", type: "" }), 3000);
  };

  const handleBackup = async () => {
    try {
      setStatus({ message: "正在备份至 WebDAV...", type: "info" });
      await backupToWebDav();
      setStatus({ message: "备份成功！", type: "success" });
    } catch (err: any) {
      setStatus({ message: err.message || "备份失败", type: "error" });
    }
  };

  const handleRestore = async () => {
    try {
      setStatus({ message: "正在从 WebDAV 恢复...", type: "info" });
      await restoreFromWebDav();
      setStatus({ message: "恢复成功！", type: "success" });
    } catch (err: any) {
      setStatus({ message: err.message || "恢复失败", type: "error" });
    }
  };

  const exportLocal = () => {
    const data = {
      groups: useStore.getState().groups,
      links: useStore.getState().links
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const urlOut = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = urlOut;
    a.download = "bookmark_manager_backup.json";
    a.click();
    URL.revokeObjectURL(urlOut);
  };

  const importLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.groups && data.links) {
          useStore.getState().importData(data);
          setStatus({ message: "导入成功", type: "success" });
        } else {
          throw new Error("格式无效");
        }
      } catch (err) {
        setStatus({ message: "解析文件失败", type: "error" });
      }
    };
    reader.readAsText(file);
    if(fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="全局设置" className="max-w-[520px]">
      <div className="flex border-b border-gray-100 mb-6 gap-1 sm:gap-2 overflow-x-auto pb-1 hide-scrollbar">
        <button onClick={() => setActiveTab('general')} className={`whitespace-nowrap px-2 py-2 font-medium text-sm transition-colors ${activeTab === 'general' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>常规功能</button>
        <button onClick={() => setActiveTab('layout')} className={`whitespace-nowrap px-2 py-2 font-medium text-sm transition-colors ${activeTab === 'layout' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>布局交互</button>
        <button onClick={() => setActiveTab('theme')} className={`whitespace-nowrap px-2 py-2 font-medium text-sm transition-colors ${activeTab === 'theme' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>主题外观</button>
        <button onClick={() => setActiveTab('local')} className={`whitespace-nowrap px-2 py-2 font-medium text-sm transition-colors ${activeTab === 'local' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>本地备份</button>
        <button onClick={() => setActiveTab('webdav')} className={`whitespace-nowrap px-2 py-2 font-medium text-sm transition-colors ${activeTab === 'webdav' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>WebDAV</button>
        <button onClick={() => setActiveTab('about')} className={`whitespace-nowrap px-2 py-2 font-medium text-sm transition-colors ${activeTab === 'about' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>关于</button>
      </div>

      <div className="min-h-[280px]">
        <AnimatePresence mode="wait">
        {activeTab === 'about' && (
          <motion.div key="about" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }} className="space-y-6">
            <div className="flex flex-col items-center justify-center text-center p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100/50 mb-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
              <div className="w-16 h-16 bg-white shadow-sm rounded-2xl flex items-center justify-center mb-4 text-blue-600 relative">
                <Sparkles size={32} className="absolute blur-sm opacity-50" />
                <Sparkles size={32} className="relative" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">LiteNav Tabs</h2>
              <p className="text-xs font-semibold text-white bg-blue-600 rounded-full px-3 py-1 mt-1 shadow-sm">Release 1.0.0</p>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 px-1 border-l-2 border-blue-500 pl-2">核心特性</h3>
              <ul className="space-y-4 pb-4">
                <li className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-lg text-green-600 shrink-0 mt-0.5">
                    <Shield size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">完全支持离线与本地化</h4>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">数据基于本地域(LocalStorage)安全存储，无网络下依然丝滑可用。原生支持 WebDAV 协议进行云端同步，让书签跨设备自由流转。</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-amber-100 p-2 rounded-lg text-amber-600 shrink-0 mt-0.5">
                    <Zap size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">极速响应的丝滑交互</h4>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">提供拖拽排序、快捷键增强、高度可定制的布局模式。零冗余功能与接口请求，回归新标签页作为导航工具最纯粹的本质。</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg text-purple-600 shrink-0 mt-0.5">
                    <Package size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">高频办公特化</h4>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">集成沉浸式文件夹、富文本节点说明、内置多引擎聚合检索等高阶特性，解决重度用户的整理与检索痛点。</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-rose-100 p-2 rounded-lg text-rose-600 shrink-0 mt-0.5">
                    <Database size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">完全免费，保护隐私</h4>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">无充值套路，无需注册账号。不搜集用户隐私，所有请求您的浏览器直接发起。支持您随意导出输入 JSON 备份迁移。</p>
                  </div>
                </li>
              </ul>
            </div>
          </motion.div>
        )}

        {activeTab === 'general' && (
          <motion.div key="general" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }} className="space-y-6">
            <section>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">核心功能设置</h3>
              <div className="space-y-5">
                <div className="space-y-3">
                  <label className="block text-xs font-medium text-gray-700 mb-2">搜索引擎设置</label>
                  <div className="space-y-2">
                    {searchEngines.map((engine, idx) => (
                      <div key={engine.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center self-stretch px-1">
                          <input
                            type="radio"
                            name="activeSearchEngine"
                            checked={activeSearchEngineId === engine.id}
                            onChange={() => setActiveSearchEngineId(engine.id)}
                            className="cursor-pointer accent-blue-600"
                            title="设为默认"
                          />
                        </div>
                        <div className="flex-1 flex gap-2 w-full">
                          <input
                            type="text"
                            value={engine.name}
                            onChange={(e) => {
                              const newEngines = [...searchEngines];
                              newEngines[idx].name = e.target.value;
                              setSearchEngines(newEngines);
                            }}
                            placeholder="名称"
                            className="w-1/3 px-2 py-1.5 text-xs border border-gray-200 rounded-md outline-none focus:border-blue-500"
                          />
                          <input
                            type="text"
                            value={engine.url}
                            onChange={(e) => {
                              const newEngines = [...searchEngines];
                              newEngines[idx].url = e.target.value;
                              setSearchEngines(newEngines);
                            }}
                            placeholder="例: https://www.google.com/search?q="
                            className="flex-1 min-w-0 px-2 py-1.5 text-xs border border-gray-200 rounded-md outline-none focus:border-blue-500"
                          />
                        </div>
                        <button
                          onClick={() => {
                            if (searchEngines.length > 1) {
                              const newEngines = searchEngines.filter(e => e.id !== engine.id);
                              setSearchEngines(newEngines);
                              if (activeSearchEngineId === engine.id) {
                                setActiveSearchEngineId(newEngines[0].id);
                              }
                            }
                          }}
                          disabled={searchEngines.length <= 1}
                          className="p-1 px-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                          title="删除"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newId = Date.now().toString();
                        setSearchEngines([...searchEngines, { id: newId, name: '新引擎', url: 'https://' }]);
                      }}
                      className="w-full py-1.5 flex items-center justify-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Plus size={14} />
                      添加搜索引擎
                    </button>
                  </div>
                </div>
                <div className="pt-2">
                  <label className="block text-xs font-medium text-gray-700 mb-2">自定义页脚 (不超过100字)</label>
                  <input 
                    type="text" 
                    maxLength={100} 
                    value={footerText} 
                    onChange={(e) => setFooterText(e.target.value)} 
                    placeholder="输入要显示在页面底部的短语..." 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </section>
          </motion.div>
        )}

        {activeTab === 'layout' && (
          <motion.div key="layout" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }} className="space-y-6">
            <section>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">布局规则</h3>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-2 block">分组类别位置</label>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setGroupPosition('top')} 
                      className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${groupPosition === 'top' ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'}`}
                    >
                      顶部
                    </button>
                    <button 
                      onClick={() => setGroupPosition('left')} 
                      className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${groupPosition === 'left' ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'}`}
                    >
                      左侧悬浮
                    </button>
                    <button 
                      onClick={() => setGroupPosition('right')} 
                      className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${groupPosition === 'right' ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'}`}
                    >
                      右侧悬浮
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="flex justify-between text-xs font-medium text-gray-700 mb-2 block">
                    <span>区块显示大区固定宽度</span>
                    <span className="text-blue-600">{containerWidth}px</span>
                  </label>
                  <input 
                    type="range" 
                    min="600" 
                    max="3000" 
                    step="50"
                    value={containerWidth} 
                    onChange={(e) => setContainerWidth(Number(e.target.value))} 
                    className="w-full accent-blue-600"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">设置内部区块容器的最大宽度，以适应较宽的屏幕。</p>
                </div>
              </div>
            </section>
            
            <section className="pt-2 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">区块尺寸调整</h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">全局边框圆角: {borderRadius}px</label>
                  <input type="range" min="0" max="48" value={borderRadius} onChange={(e) => setBorderRadius(Number(e.target.value))} className="w-full accent-blue-600" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">基础块尺寸 (宽度): {baseBlockSize}px</label>
                  <input type="range" min="58" max="200" value={baseBlockSize} onChange={(e) => setBaseBlockSize(Number(e.target.value))} className="w-full accent-blue-600" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">标签块间距: {blockGap}px</label>
                  <input type="range" min="0" max="100" value={blockGap} onChange={(e) => setBlockGap(Number(e.target.value))} className="w-full accent-blue-600" />
                </div>
              </div>
            </section>
          </motion.div>
        )}

        {activeTab === 'theme' && (
          <motion.div key="theme" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }} className="space-y-6">
            <section>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">背景图片</h3>
              <div className="flex items-center gap-3 mb-4">
                <button onClick={() => bgInputRef.current?.click()} className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-sm font-medium transition-colors">
                  上传背景图片
                </button>
                {backgroundImage && (
                  <button 
                    onClick={() => setBackgroundImage(null)} 
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-medium transition-colors"
                  >
                    清除图片
                  </button>
                )}
                <input type="file" accept="image/*" className="hidden" ref={bgInputRef} onChange={handleBgUpload} />
              </div>
              
              <h3 className="text-sm font-semibold text-gray-900 mb-2">预设渐变背景</h3>
              <div className="grid grid-cols-5 sm:grid-cols-8 gap-2 mb-4">
                <button
                  onClick={() => setBackgroundGradient(null)}
                  className={`w-8 h-8 rounded-full border-2 ${!backgroundGradient && !backgroundImage ? 'border-blue-600' : 'border-transparent'} bg-slate-100 hover:scale-110 transition-transform relative`}
                  title="默认背景"
                />
                {gradients.map((gradient, idx) => (
                  <button
                    key={idx}
                    onClick={() => setBackgroundGradient(gradient)}
                    className={`w-8 h-8 rounded-full border-2 ${backgroundGradient === gradient ? 'border-blue-600 shadow-md ring-2 ring-white' : 'border-transparent'} hover:scale-110 transition-transform`}
                    style={{ background: gradient }}
                    title={`渐变 ${idx + 1}`}
                  />
                ))}
              </div>
              
              <h3 className="text-sm font-semibold text-gray-900 mb-2 mt-5">自定义渐变背景</h3>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4 space-y-4">
                <div className="space-y-3">
                  {gradientColors.map((gc, idx) => (
                    <div key={gc.id} className="flex items-center gap-3">
                      <div className="flex-1 flex items-center gap-2">
                        <input 
                          type="color" 
                          value={gc.color}
                          onChange={(e) => {
                            const newColors = [...gradientColors];
                            newColors[idx].color = e.target.value;
                            setGradientColors(newColors);
                            applyCustomGradient(newColors, customAngle, gradientType);
                          }}
                          className="w-8 h-8 rounded-md cursor-pointer border-0 p-0 shrink-0" 
                        />
                        <div className="flex flex-col flex-1">
                          <label className="text-xs font-medium text-gray-500 mb-1 flex justify-between">
                            <span>位置</span>
                            <span>{gc.position}%</span>
                          </label>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={gc.position}
                            onChange={(e) => {
                              const newColors = [...gradientColors];
                              newColors[idx].position = parseInt(e.target.value);
                              setGradientColors(newColors);
                              applyCustomGradient(newColors, customAngle, gradientType);
                            }}
                            className="w-full accent-blue-500"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (gradientColors.length > 2) {
                            const newColors = gradientColors.filter(c => c.id !== gc.id);
                            setGradientColors(newColors);
                            applyCustomGradient(newColors, customAngle, gradientType);
                          }
                        }}
                        disabled={gradientColors.length <= 2}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                      >
                         <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  
                  {gradientColors.length < 6 && (
                    <button 
                      onClick={() => {
                        const newColors = [...gradientColors, { id: Date.now().toString(), color: '#ffffff', position: 50 }];
                        setGradientColors(newColors);
                        applyCustomGradient(newColors, customAngle, gradientType);
                      }}
                      className="w-full py-1.5 flex items-center justify-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                    >
                      <Plus size={14} />
                      添加颜色
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setGradientType('linear');
                      applyCustomGradient(gradientColors, customAngle, 'linear');
                    }}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${gradientType === 'linear' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >线性</button>
                  <button 
                    onClick={() => {
                      setGradientType('radial');
                      applyCustomGradient(gradientColors, customAngle, 'radial');
                    }}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${gradientType === 'radial' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >径向</button>
                  <button 
                    onClick={() => {
                      setGradientType('conic');
                      applyCustomGradient(gradientColors, customAngle, 'conic');
                    }}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${gradientType === 'conic' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >锥形</button>
                </div>

                <div>
                   <label className="flex justify-between text-xs font-medium text-gray-600 block mb-2">
                     <span>渐变角度 {gradientType !== 'linear' && gradientType !== 'conic' && '(不适用)'}</span>
                     <span>{customAngle}°</span>
                   </label>
                   <input type="range" min="0" max="360" value={customAngle} onChange={(e) => {
                      setCustomAngle(Number(e.target.value));
                      applyCustomGradient(gradientColors, Number(e.target.value), gradientType);
                   }} className="w-full accent-blue-600" />
                </div>
              </div>

              <div className="mt-5 space-y-5">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">背景毛玻璃模糊度: {backgroundBlur}px</label>
                  <input type="range" min="0" max="80" value={backgroundBlur} onChange={(e) => setBackgroundBlur(Number(e.target.value))} className="w-full accent-blue-600" />
                </div>
              </div>
            </section>

            <section className="pt-2 border-t border-gray-100">
              <div className="space-y-4 pt-2">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">全局色彩预设</h4>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] sm:text-xs text-gray-600 mb-1.5">时钟组件颜色</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={clockColor} onChange={(e) => setClockColor(e.target.value)} className="w-8 h-8 border border-gray-200 rounded cursor-pointer p-0.5 shrink-0" />
                      <span className="text-xs font-mono text-gray-500 uppercase overflow-hidden text-ellipsis">{clockColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-xs text-gray-600 mb-1.5">选中分组文字颜色</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={groupActiveColor} onChange={(e) => setGroupActiveColor(e.target.value)} className="w-8 h-8 border border-gray-200 rounded cursor-pointer p-0.5 shrink-0" />
                      <span className="text-xs font-mono text-gray-500 uppercase overflow-hidden text-ellipsis">{groupActiveColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-xs text-gray-600 mb-1.5">未选中分组文字</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={groupColor} onChange={(e) => setGroupColor(e.target.value)} className="w-8 h-8 border border-gray-200 rounded cursor-pointer p-0.5 shrink-0" />
                      <span className="text-xs font-mono text-gray-500 uppercase overflow-hidden text-ellipsis">{groupColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-xs text-gray-600 mb-1.5">链接标题颜色</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={linkLabelColor} onChange={(e) => setLinkLabelColor(e.target.value)} className="w-8 h-8 border border-gray-200 rounded cursor-pointer p-0.5 shrink-0" />
                      <span className="text-xs font-mono text-gray-500 uppercase overflow-hidden text-ellipsis">{linkLabelColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-xs text-gray-600 mb-1.5">页脚文本颜色</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={footerColor} onChange={(e) => setFooterColor(e.target.value)} className="w-8 h-8 border border-gray-200 rounded cursor-pointer p-0.5 shrink-0" />
                      <span className="text-xs font-mono text-gray-500 uppercase overflow-hidden text-ellipsis">{footerColor}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t border-gray-100 pt-5 mt-5">
                <h4 className="text-sm font-semibold text-gray-900">文件夹展开弹窗外观</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5">卡片背景颜色</label>
                    <div className="flex items-center gap-2 mb-2">
                      <input type="color" value={folderBgColor} onChange={(e) => setFolderBgColor(e.target.value)} className="w-8 h-8 border border-gray-200 rounded cursor-pointer p-0.5 shrink-0" />
                      <span className="text-xs font-mono text-gray-500 uppercase whitespace-nowrap">{folderBgColor}</span>
                    </div>
                    <label className="flex justify-between text-[10px] text-gray-500 mb-1 block">
                      <span>不透明度 {folderBgOpacity}%</span>
                    </label>
                    <input type="range" min="0" max="100" value={folderBgOpacity} onChange={(e) => setFolderBgOpacity(Number(e.target.value))} className="w-full accent-blue-600" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5">全屏遮罩颜色</label>
                    <div className="flex items-center gap-2 mb-2">
                      <input type="color" value={folderOverlayColor} onChange={(e) => setFolderOverlayColor(e.target.value)} className="w-8 h-8 border border-gray-200 rounded cursor-pointer p-0.5 shrink-0" />
                      <span className="text-xs font-mono text-gray-500 uppercase whitespace-nowrap">{folderOverlayColor}</span>
                    </div>
                    <label className="flex justify-between text-[10px] text-gray-500 mb-1 block">
                      <span>不透明度 {folderOverlayOpacity}%</span>
                    </label>
                    <input type="range" min="0" max="100" value={folderOverlayOpacity} onChange={(e) => setFolderOverlayOpacity(Number(e.target.value))} className="w-full accent-blue-600" />
                  </div>
                </div>
              </div>
            </section>
          </motion.div>
        )}

        {activeTab === 'local' && (
          <motion.div key="local" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }} className="space-y-6">
            <section>
              <p className="text-sm text-gray-500 mb-4">将当前全部标签和分组导出为 JSON 备份文件，或从备份文件中还原数据。</p>
              <div className="flex gap-3">
                <button onClick={exportLocal} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-sm font-medium transition-colors">
                  导出备份
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-sm font-medium transition-colors">
                  导入恢复
                </button>
                <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={importLocal} />
              </div>
            </section>
          </motion.div>
        )}

        {activeTab === 'webdav' && (
          <motion.div key="webdav" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }} className="space-y-6">
            <section>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">配置您的 WebDAV 服务以实现跨设备书签同步。建议使用坚果云等稳定服务。</p>
              <form onSubmit={handleSaveWebDav} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">服务器地址 (URL)</label>
                  <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://dav.example.com" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">用户名</label>
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">密码 / 应用密钥</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                </div>
                <div className="pt-2">
                  <button type="submit" className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium transition-colors">
                    保存配置
                  </button>
                </div>
              </form>
              
              <div className="flex gap-3 mt-4 border-t border-gray-100 pt-4">
                <button onClick={handleBackup} disabled={webdavSyncStatus === 'syncing'} className="flex-1 px-4 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors">
                  {webdavSyncStatus === 'syncing' ? '处理中...' : '备份到云端'}
                </button>
                <button onClick={handleRestore} disabled={webdavSyncStatus === 'syncing'} className="flex-1 px-4 py-2.5 bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors">
                  {webdavSyncStatus === 'syncing' ? '处理中...' : '从云端恢复'}
                </button>
              </div>
              
              <div className="mt-4 text-xs">
                {webdavSyncStatus === 'syncing' && <p className="text-blue-500 font-medium">正在同步中...</p>}
                {webdavSyncStatus === 'error' && <p className="text-red-500 font-medium whitespace-pre-wrap">{webdavError || '同步失败，请检查配置或网络。'}</p>}
                {webdavSyncStatus === 'success' && webdavLastSyncTime && (
                  <p className="text-green-600 font-medium">上次同步成功: {new Date(webdavLastSyncTime).toLocaleString()}</p>
                )}
              </div>
            </section>
          </motion.div>
        )}
        </AnimatePresence>

        {status.message && (
          <div className={`mt-6 p-3 rounded-lg text-sm transition-all animate-in fade-in slide-in-from-bottom-2 ${status.type === 'error' ? 'bg-red-50 text-red-600' : status.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
            {status.message}
          </div>
        )}
      </div>
    </Drawer>
  );
}
