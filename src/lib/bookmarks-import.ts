import { v4 as uuidv4 } from 'uuid';
import { Group, LinkItem } from './store';
import { getRandomColor } from './utils';

export interface ParsedBookmarks {
  groups: Group[];
  links: LinkItem[];
}

function normalizeUrl(url: string): string {
  const trimmed = (url || '').trim();
  if (!trimmed) return '';
  try {
    new URL(trimmed);
    return trimmed;
  } catch {
    return `https://${trimmed}`;
  }
}

function domainOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url.replace(/^https?:\/\//, '').split('/')[0];
  }
}

function makeLink(groupId: string, title: string, url: string, order: number): LinkItem {
  const finalUrl = normalizeUrl(url);
  const domain = domainOf(finalUrl);
  return {
    id: uuidv4(),
    groupId,
    title: (title || domain || '链接').trim(),
    url: finalUrl,
    imageUrl: `https://s2.googleusercontent.com/s2/favicons?domain=${domain}&sz=128`,
    backgroundColor: getRandomColor(),
    order,
    size: '1x1',
  };
}

function reindex(links: LinkItem[]): LinkItem[] {
  const byGroup: Record<string, LinkItem[]> = {};
  links.forEach(l => {
    (byGroup[l.groupId] ||= []).push(l);
  });
  const out: LinkItem[] = [];
  Object.values(byGroup).forEach(arr => {
    arr.forEach((l, i) => out.push({ ...l, order: i }));
  });
  return out;
}

// --- Netscape bookmark HTML (Chrome / Edge / Safari exports) ---
function parseNetscape(html: string): ParsedBookmarks {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const groups: Group[] = [];
  const links: LinkItem[] = [];
  let order = 0;

  const root = doc.querySelector('dl');
  if (!root) return { groups: [], links: [] };

  const processDl = (dl: Element, group: Group | null, isRoot: boolean) => {
    const dts = Array.from(dl.children).filter(c => c.tagName === 'DT');
    for (const dt of dts) {
      const h3 = dt.querySelector(':scope > h3');
      const a = dt.querySelector(':scope > a');
      if (a && a.getAttribute('href')) {
        const target = group || fallbackGroup();
        links.push(makeLink(target.id, a.textContent || '', a.getAttribute('href') || '', 0));
      } else if (h3) {
        const childDl = dt.querySelector(':scope > dl');
        if (isRoot) {
          const ng: Group = { id: uuidv4(), name: (h3.textContent || '文件夹').trim(), order: order++ };
          groups.push(ng);
          if (childDl) processDl(childDl, ng, false);
        } else if (childDl && group) {
          processDl(childDl, group, false); // flatten nested into current group
        }
      }
    }
  };

  let fallbackCreated = false;
  const fallbackGroup = (): Group => {
    if (!fallbackCreated) {
      groups.push({ id: uuidv4(), name: '导入书签', order: order++ });
      fallbackCreated = true;
    }
    return groups[groups.length - 1];
  };

  processDl(root, null, true);
  if (groups.length === 0) fallbackGroup();
  return { groups, links: reindex(links) };
}

// --- Firefox bookmarks.json ---
function parseFirefox(json: any): ParsedBookmarks {
  const groups: Group[] = [];
  const links: LinkItem[] = [];
  let order = 0;

  const roots = json?.roots;
  const containers = [roots?.bookmarkToolbarFolder, roots?.bookmarkMenuFolder, roots?.unfiledBookmarks].filter(Boolean);
  if (containers.length === 0 && Array.isArray(json?.children)) containers.push(json);

  let fallbackCreated = false;
  const fallbackGroup = (): Group => {
    if (!fallbackCreated) {
      groups.push({ id: uuidv4(), name: '导入书签', order: order++ });
      fallbackCreated = true;
    }
    return groups[groups.length - 1];
  };

  const walk = (node: any, group: Group | null, isRoot: boolean) => {
    (node?.children || []).forEach((child: any) => {
      if (child.type === 'text/x-moz-place-container') {
        if (isRoot) {
          const ng: Group = { id: uuidv4(), name: (child.title || '文件夹').trim(), order: order++ };
          groups.push(ng);
          walk(child, ng, false);
        } else {
          walk(child, group, false);
        }
      } else if (child.type === 'text/x-moz-place' && child.uri && !String(child.uri).startsWith('place:')) {
        const target = group || fallbackGroup();
        links.push(makeLink(target.id, child.title || '', child.uri, 0));
      }
    });
  };

  containers.forEach(c => walk(c, null, true));
  if (groups.length === 0) fallbackGroup();
  return { groups, links: reindex(links) };
}

export function parseBrowserBookmarks(text: string): ParsedBookmarks {
  const trimmed = (text || '').trim();
  if (trimmed.startsWith('<') || trimmed.toLowerCase().includes('<!doctype') || trimmed.includes('<DT')) {
    try {
      return parseNetscape(trimmed);
    } catch {
      return { groups: [], links: [] };
    }
  }
  try {
    return parseFirefox(JSON.parse(trimmed));
  } catch {
    try {
      return parseNetscape(trimmed);
    } catch {
      return { groups: [], links: [] };
    }
  }
}
