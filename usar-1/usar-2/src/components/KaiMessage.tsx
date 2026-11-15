/* Render de mensagem do K-AI com links clicáveis + popover ao segurar 1s.
   Quando a resposta contém código HTML, mostra tabs Preview/Código. */

import { useRef, useState, useEffect, useCallback } from 'react';
import { Copy, Trash2, Share2, Pencil, Eye, Code2, Check } from 'lucide-react';

interface Props {
  text: string;
  role: 'user' | 'kai';
  onCopy?: (text: string) => void;
  onDelete?: () => void;
  onEdit?: (text: string) => void;
}

function detectCode(text: string): { isCode: boolean; language: string; codeBlock: string } {
  const htmlMatch = text.match(/```html\n([\s\S]*?)```/);
  if (htmlMatch) return { isCode: true, language: 'html', codeBlock: htmlMatch[1].trim() };
  const codeMatch = text.match(/```(\w+)?\n([\s\S]*?)```/);
  if (codeMatch) return { isCode: true, language: codeMatch[1] || 'code', codeBlock: codeMatch[2].trim() };
  const startsWithTag = /^\s*<(html|div|span|section|article|head|body|p|button|a|h[1-6]|ul|ol|li|table|img|input|form)\b/i.test(text.trim());
  if (startsWithTag && text.trim().length > 50) return { isCode: true, language: 'html', codeBlock: text.trim() };
  return { isCode: false, language: '', codeBlock: '' };
}

function splitMessage(text: string): { before: string; after: string; code: string | null; language: string } {
  const match = text.match(/```(\w+)?\n([\s\S]*?)```/);
  if (match) {
    const idx = text.indexOf(match[0]);
    const before = text.slice(0, idx).trim();
    const after = text.slice(idx + match[0].length).trim();
    return { before, after, code: match[2].trim(), language: match[1] || 'code' };
  }
  const startsWithTag = /^\s*<(html|div|span|section|article|head|body|p|button|a|h[1-6]|ul|ol|li|table|img|input|form)\b/i.test(text.trim());
  if (startsWithTag && text.trim().length > 50) {
    return { before: '', after: '', code: text.trim(), language: 'html' };
  }
  return { before: text, after: '', code: null, language: '' };
}

function linkify(text: string): Array<{ kind: 'text' | 'link'; value: string }> {
  const parts: Array<{ kind: 'text' | 'link'; value: string }> = [];
  const re = /(https?:\/\/[^\s<]+)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push({ kind: 'text', value: text.slice(last, m.index) });
    parts.push({ kind: 'link', value: m[0] });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ kind: 'text', value: text.slice(last) });
  return parts;
}

export default function KaiMessage({ text, role, onCopy, onDelete, onEdit }: Props) {
  const [popover, setPopover] = useState(false);
  const [tab, setTab] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const movedRef = useRef(false);

  const { before, after, code, language } = splitMessage(text);
  const isHtml = language === 'html' || (code !== null && /^\s*< /.test(code));
  const showTabs = code !== null && isHtml;

  const startPress = useCallback(() => {
    movedRef.current = false;
    pressTimer.current = setTimeout(() => {
      if (!movedRef.current) setPopover(true);
    }, 1000);
  }, []);

  const cancelPress = useCallback(() => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }, []);

  useEffect(() => {
    if (!popover) return;
    const close = () => setPopover(false);
    const t = setTimeout(() => {
      window.addEventListener('click', close, { once: true });
    }, 50);
    return () => {
      clearTimeout(t);
      window.removeEventListener('click', close);
    };
  }, [popover]);

  useEffect(() => {
    const onContext = (e: Event) => {
      const t = e.target as Element | null;
      if (t && (t.closest('.chat-msg') || t.closest('[class*="message"]'))) e.preventDefault();
    };
    const onSelect = (e: Event) => {
      const t = e.target as Element | null;
      if (t && t.closest('.chat-msg')) e.preventDefault();
    };
    document.addEventListener('contextmenu', onContext);
    document.addEventListener('selectstart', onSelect);
    return () => {
      document.removeEventListener('contextmenu', onContext);
      document.removeEventListener('selectstart', onSelect);
    };
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignora
    }
    onCopy?.(text);
    setPopover(false);
  };

  const copyCode = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignora
    }
  };

  const del = () => {
    onDelete?.();
    setPopover(false);
  };

  const forward = async () => {
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
    setPopover(false);
  };

  const edit = () => {
    onEdit?.(text);
    setPopover(false);
  };

  const renderText = (t: string) =>
    linkify(t).map((p, i) =>
      p.kind === 'link' ? (
        <a key={i} href={p.value} target="_blank" rel="noreferrer" className="kai-link" onClick={(e) => e.stopPropagation()}>
          {p.value}
        </a>
      ) : (
        <span key={i}>{p.value}</span>
      )
    );

  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'} relative`}>
      <div
        className={`chat-msg max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
          role === 'user' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-100'
        }`}
        style={{ WebkitUserSelect: 'none', userSelect: 'none', WebkitTouchCallout: 'none', WebkitTapHighlightColor: 'transparent' }}
        onContextMenu={(e) => e.preventDefault()}
        onMouseDown={startPress}
        onMouseUp={cancelPress}
        onMouseLeave={cancelPress}
        onMouseMove={() => { movedRef.current = true; cancelPress(); }}
        onTouchStart={(e) => { e.preventDefault(); startPress(); }}
        onTouchEnd={cancelPress}
        onTouchMove={() => { movedRef.current = true; cancelPress(); }}
      >
        {before && <div className="mb-1">{renderText(before)}</div>}

        {showTabs && code ? (
          <div className="rounded-xl overflow-hidden border border-zinc-700/60 my-1">
            <div className="flex items-center justify-between bg-zinc-900/90 px-2 py-1">
              <div className="flex gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); setTab('preview'); }}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold transition ${
                    tab === 'preview' ? 'bg-cyan-500/20 text-cyan-300' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Eye size={11} /> Preview
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setTab('code'); }}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold transition ${
                    tab === 'code' ? 'bg-cyan-500/20 text-cyan-300' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Code2 size={11} /> Código
                </button>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); void copyCode(); }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold text-zinc-400 hover:text-cyan-300 transition"
              >
                {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
            {tab === 'preview' ? (
              <iframe
                srcDoc={code}
                title="preview"
                sandbox="allow-scripts allow-same-origin"
                className="w-full bg-white"
                style={{ minHeight: '120px', maxHeight: '300px', pointerEvents: 'auto' }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <pre
                className="bg-zinc-950 text-zinc-300 text-[11px] p-2.5 overflow-x-auto max-h-[300px] font-mono leading-relaxed"
                style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
                onClick={(e) => e.stopPropagation()}
              >
                <code>{code}</code>
              </pre>
            )}
          </div>
        ) : code ? (
          <pre
            className="bg-zinc-950 text-zinc-300 text-[11px] p-2 rounded-lg overflow-x-auto max-h-[200px] font-mono my-1"
            style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
            onClick={(e) => e.stopPropagation()}
          >
            <code>{code}</code>
          </pre>
        ) : null}

        {after && <div className="mt-1">{renderText(after)}</div>}

        {!code && !before && !after && (
          <>
            {linkify(text).map((p, i) =>
              p.kind === 'link' ? (
                <a key={i} href={p.value} target="_blank" rel="noreferrer" className="kai-link" onClick={(e) => e.stopPropagation()}>
                  {p.value}
                </a>
              ) : (
                <span key={i}>{p.value}</span>
              )
            )}
          </>
        )}
      </div>

      {popover && (
        <div
          className="absolute z-[72] top-full mt-1 bg-zinc-900 border border-cyan-500/40 rounded-xl shadow-2xl shadow-cyan-500/20 py-1 flex items-center gap-0.5 px-1 animate-[kaiPopIn_0.15s_ease-out]"
          style={{ left: role === 'user' ? 'auto' : 0, right: role === 'user' ? 0 : 'auto' }}
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={copy} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-zinc-300 hover:text-cyan-300 hover:bg-zinc-800 transition text-[11px]" title="Copiar">
            <Copy size={13} /> Copiar
          </button>
          {onDelete && (
            <button onClick={del} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-zinc-300 hover:text-red-400 hover:bg-zinc-800 transition text-[11px]" title="Excluir">
              <Trash2 size={13} /> Excluir
            </button>
          )}
          <button onClick={forward} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-zinc-300 hover:text-cyan-300 hover:bg-zinc-800 transition text-[11px]" title="Encaminhar">
            <Share2 size={13} /> Encaminhar
          </button>
          {role === 'user' && onEdit && (
            <button onClick={edit} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-zinc-300 hover:text-cyan-300 hover:bg-zinc-800 transition text-[11px]" title="Editar">
              <Pencil size={13} /> Editar
            </button>
          )}
        </div>
      )}
    </div>
  );
}
