import { Search } from "lucide-react";
import { useState } from "react";
import { useStore } from "../lib/store";

export function SearchBox() {
  const [query, setQuery] = useState("");
  const searchEngines = useStore(state => state.searchEngines) || [];
  const activeSearchEngineId = useStore(state => state.activeSearchEngineId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    let targetUrl = "https://www.google.com/search";
    if (activeSearchEngineId && searchEngines.length > 0) {
      const activeEngine = searchEngines.find(engine => engine.id === activeSearchEngineId);
      if (activeEngine) {
        targetUrl = activeEngine.url;
      }
    }
    if (targetUrl.includes("%s")) {
      targetUrl = targetUrl.replace("%s", encodeURIComponent(query.trim()));
    } else if (targetUrl.endsWith("=") || targetUrl.endsWith("?")) {
      targetUrl = `${targetUrl}${encodeURIComponent(query.trim())}`;
    } else {
      // Default fallback logic
      const separator = targetUrl.includes("?") ? "&" : "?";
      // If Baidu
      if (targetUrl.includes("baidu.com")) {
         targetUrl = `${targetUrl}${separator}wd=${encodeURIComponent(query.trim())}`;
      } else {
         targetUrl = `${targetUrl}${separator}q=${encodeURIComponent(query.trim())}`;
      }
    }
    window.open(targetUrl, "_blank");
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto mt-4 mb-4 sm:mb-10 group px-2 sm:px-0">
      <div className="relative flex items-center w-full">
        <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none text-slate-400">
          <Search size={18} className="sm:w-5 sm:h-5 w-4 h-4" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索书签或输入 URL..."
          className="block w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 bg-white/90 backdrop-blur-md border border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-2xl text-base sm:text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder-slate-400"
        />
      </div>
    </form>
  );
}
