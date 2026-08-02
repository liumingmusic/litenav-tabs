import { Search, CornerDownLeft, Tag as TagIcon } from "lucide-react";
import { useState, useRef, useMemo } from "react";
import { useStore, LinkItem } from "../lib/store";

export function SearchBox() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const searchEngines = useStore(state => state.searchEngines) || [];
  const activeSearchEngineId = useStore(state => state.activeSearchEngineId);
  const links = useStore(state => state.links);
  const groups = useStore(state => state.groups);
  const tags = useStore(state => state.tags) || [];
  const recordLinkClick = useStore(state => state.recordLinkClick);
  const blurTimer = useRef<number | null>(null);

  const matches = useMemo<LinkItem[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const tagNameById = new Map(tags.map(t => [t.id, t.name.toLowerCase()]));
    return links
      .filter(l => l.itemType !== 'folder')
      .filter(l => {
        if (l.title.toLowerCase().includes(q)) return true;
        if (l.url.toLowerCase().includes(q)) return true;
        if (l.note && l.note.toLowerCase().includes(q)) return true;
        return (l.tagIds || []).some(id => tagNameById.get(id)?.includes(q));
      })
      .slice(0, 8);
  }, [query, links, tags]);

  const buildSearchUrl = (q: string): string => {
    let targetUrl = "https://www.google.com/search";
    if (activeSearchEngineId && searchEngines.length > 0) {
      const activeEngine = searchEngines.find(engine => engine.id === activeSearchEngineId);
      if (activeEngine) targetUrl = activeEngine.url;
    }
    if (targetUrl.includes("%s")) {
      return targetUrl.replace("%s", encodeURIComponent(q));
    } else if (targetUrl.endsWith("=") || targetUrl.endsWith("?")) {
      return `${targetUrl}${encodeURIComponent(q)}`;
    } else {
      const separator = targetUrl.includes("?") ? "&" : "?";
      if (targetUrl.includes("baidu.com")) {
        return `${targetUrl}${separator}wd=${encodeURIComponent(q)}`;
      }
      return `${targetUrl}${separator}q=${encodeURIComponent(q)}`;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    window.open(buildSearchUrl(query.trim()), "_blank");
    setOpen(false);
  };

  const openLink = (link: LinkItem) => {
    recordLinkClick(link.id);
    window.open(link.url, "_blank");
    setOpen(false);
    setQuery("");
  };

  const groupName = (groupId: string) => groups.find(g => g.id === groupId)?.name || "";

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto mt-4 mb-4 sm:mb-10 group px-2 sm:px-0">
      <div className="relative flex items-center w-full">
        <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none text-slate-400">
          <Search size={18} className="sm:w-5 sm:h-5 w-4 h-4" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => { blurTimer.current = window.setTimeout(() => setOpen(false), 150); }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
            if (e.key === "ArrowDown" && matches.length > 0) {
              // focus first result
              const first = document.getElementById("local-search-0");
              first?.focus();
            }
          }}
          placeholder="搜索书签或输入 URL..."
          className="block w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 bg-white/90 backdrop-blur-md border border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-2xl text-base sm:text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder-slate-400"
        />

        {open && query.trim() && (
          <div className="absolute z-50 top-full mt-2 w-full bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl overflow-hidden max-h-[360px] overflow-y-auto">
            {matches.length > 0 ? (
              <ul className="py-1">
                {matches.map((m, idx) => (
                  <li key={m.id}>
                    <button
                      id={`local-search-${idx}`}
                      onMouseDown={(e) => { e.preventDefault(); openLink(m); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-100 flex items-center gap-3 transition-colors"
                    >
                      {m.imageUrl ? (
                        <img src={m.imageUrl} alt="" className="w-5 h-5 rounded" onError={(e) => (e.currentTarget.style.visibility = 'hidden')} />
                      ) : (
                        <span className="w-5 h-5 rounded bg-slate-200 text-[10px] flex items-center justify-center text-slate-500 font-bold uppercase">
                          {m.title.substring(0, 1)}
                        </span>
                      )}
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-medium text-slate-800 truncate">{m.title}</span>
                        <span className="block text-[11px] text-slate-400 truncate">{m.url}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
                        <TagIcon size={11} /> {groupName(m.groupId)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-3 text-sm text-slate-400">没有匹配的书签，回车用搜索引擎查找</div>
            )}
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleSubmit(e as any); }}
              className="w-full text-left px-4 py-2.5 border-t border-slate-100 hover:bg-blue-50 flex items-center gap-2 text-sm text-blue-600 font-medium transition-colors"
            >
              <CornerDownLeft size={15} /> 用搜索引擎查找 “{query.trim()}”
            </button>
          </div>
        )}
      </div>
    </form>
  );
}
