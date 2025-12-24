'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

export interface MediaInsertEvent {
  type: 'image' | 'video';
  url: string;
  caption?: string;
}

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  minHeight?: string;
  onRequestImageUpload?: () => Promise<string | null>;
  onRequestImageAlbum?: () => void;
  pendingImageUrl?: string | null;
  pendingVideoUrl?: string | null;
  onPendingImageConsumed?: () => void;
  onPendingVideoConsumed?: () => void;
  onMediaInserted?: (event: MediaInsertEvent) => void;
}

// Color palette
const COLOR_PALETTE = [
  { name: 'Đen', value: '#000000' },
  { name: 'Xám đậm', value: '#374151' },
  { name: 'Xám', value: '#6b7280' },
  { name: 'Đỏ', value: '#dc2626' },
  { name: 'Cam', value: '#ea580c' },
  { name: 'Vàng', value: '#ca8a04' },
  { name: 'Xanh lá', value: '#16a34a' },
  { name: 'Xanh dương', value: '#2563eb' },
  { name: 'Tím', value: '#7c3aed' },
  { name: 'Hồng', value: '#db2777' },
];

const FONT_SIZES = [
  { label: '12px', value: '1' },
  { label: '14px', value: '2' },
  { label: '16px', value: '3' },
  { label: '18px', value: '4' },
  { label: '24px', value: '5' },
  { label: '32px', value: '6' },
  { label: '48px', value: '7' },
];

const HEADING_OPTIONS = [
  { label: 'Đoạn văn', tag: 'p' },
  { label: 'Tiêu đề 1', tag: 'h1' },
  { label: 'Tiêu đề 2', tag: 'h2' },
  { label: 'Tiêu đề 3', tag: 'h3' },
  { label: 'Tiêu đề 4', tag: 'h4' },
];

const TABLE_SIZES = [
  { rows: 2, cols: 2, label: '2x2' },
  { rows: 3, cols: 3, label: '3x3' },
  { rows: 4, cols: 4, label: '4x4' },
  { rows: 5, cols: 5, label: '5x5' },
];

// Helper: convert YouTube/Vimeo URL to embed
function getVideoEmbedUrl(url: string): string | null {
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  if (url.match(/\.(mp4|webm|ogg)(\?.*)?$/i)) return url;
  return null;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Nhập nội dung...',
  required = false,
  minHeight = '300px',
  onRequestImageUpload,
  onRequestImageAlbum,
  pendingImageUrl,
  pendingVideoUrl,
  onPendingImageConsumed,
  onPendingVideoConsumed,
  onMediaInserted,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [showFontSize, setShowFontSize] = useState(false);
  const [showHeading, setShowHeading] = useState(false);
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [showVideoMenu, setShowVideoMenu] = useState(false);
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const bgColorPickerRef = useRef<HTMLDivElement>(null);
  const fontSizeRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const imageMenuRef = useRef<HTMLDivElement>(null);
  const videoMenuRef = useRef<HTMLDivElement>(null);
  const tableMenuRef = useRef<HTMLDivElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);

  // Close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) setShowColorPicker(false);
      if (bgColorPickerRef.current && !bgColorPickerRef.current.contains(event.target as Node)) setShowBgColorPicker(false);
      if (fontSizeRef.current && !fontSizeRef.current.contains(event.target as Node)) setShowFontSize(false);
      if (headingRef.current && !headingRef.current.contains(event.target as Node)) setShowHeading(false);
      if (imageMenuRef.current && !imageMenuRef.current.contains(event.target as Node)) setShowImageMenu(false);
      if (videoMenuRef.current && !videoMenuRef.current.contains(event.target as Node)) setShowVideoMenu(false);
      if (tableMenuRef.current && !tableMenuRef.current.contains(event.target as Node)) setShowTableMenu(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle pending image
  useEffect(() => {
    if (pendingImageUrl && onPendingImageConsumed) {
      insertImageAtCursor(pendingImageUrl);
      onPendingImageConsumed();
    }
  }, [pendingImageUrl]);

  // Handle pending video
  useEffect(() => {
    if (pendingVideoUrl && onPendingVideoConsumed) {
      insertVideoAtCursor(pendingVideoUrl);
      onPendingVideoConsumed();
    }
  }, [pendingVideoUrl]);

  // Sync value
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = useCallback(() => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange]);

  // Handle click on delete buttons inside media elements
  useEffect(() => {
    const handleEditorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const deleteBtn = target.closest('.editor-media-delete') as HTMLElement;
      if (deleteBtn) {
        event.preventDefault();
        event.stopPropagation();
        const mediaElement = deleteBtn.closest('.editor-media');
        if (mediaElement) {
          mediaElement.remove();
          // Trigger input event to update state
          setTimeout(() => handleInput(), 10);
        }
      }
    };

    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener('click', handleEditorClick, true); // Use capture phase
      return () => editor.removeEventListener('click', handleEditorClick, true);
    }
  }, [handleInput]);

  const execCommand = useCallback((command: string, val?: string) => {
    document.execCommand(command, false, val);
    editorRef.current?.focus();
    handleInput();
  }, [handleInput]);

  const formatBlock = useCallback((tag: string) => {
    document.execCommand('formatBlock', false, tag);
    setShowHeading(false);
    editorRef.current?.focus();
    handleInput();
  }, [handleInput]);

  const saveSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
    }
  }, []);

  const restoreSelection = useCallback(() => {
    if (savedSelectionRef.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedSelectionRef.current);
      }
    }
  }, []);

  // Insert image
  const insertImageAtCursor = useCallback((url: string, alt: string = 'Ảnh chèn') => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    restoreSelection();
    const imgHtml = `<figure class="editor-media editor-media-image" data-media-type="image" data-media-url="${url}" style="margin: 1rem 0; padding: 8px; text-align: center; position: relative; cursor: default; border: 2px solid #e5e7eb; border-radius: 8px; background: #f9fafb;" contenteditable="false"><button type="button" class="editor-media-delete" onclick="this.closest('.editor-media').remove()" style="position: absolute; top: 12px; right: 12px; width: 36px; height: 36px; border-radius: 8px; border: 2px solid white; background: #dc2626; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.25); z-index: 1000; font-weight: bold; transition: all 0.2s;" title="Xóa ảnh" onmouseover="this.style.background='#b91c1c'; this.style.transform='scale(1.1)'" onmouseout="this.style.background='#dc2626'; this.style.transform='scale(1)'"><i class="fas fa-times" style="font-size: 16px;"></i></button><img src="${url}" alt="${alt}" data-no-lightbox style="max-width: 100%; height: auto; border-radius: 6px; display: block;" /></figure>`;
    document.execCommand('insertHTML', false, imgHtml);
    handleInput();
    setShowImageMenu(false);
    onMediaInserted?.({ type: 'image', url });
  }, [handleInput, restoreSelection, onMediaInserted]);

  // Insert video
  const insertVideoAtCursor = useCallback((url: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    restoreSelection();
    const embedUrl = getVideoEmbedUrl(url);
    if (!embedUrl) {
      alert('URL video không hợp lệ. Hỗ trợ YouTube, Vimeo hoặc file mp4.');
      return;
    }
    let videoHtml: string;
    if (embedUrl.match(/\.(mp4|webm|ogg)(\?.*)?$/i)) {
      videoHtml = `<figure class="editor-media editor-media-video" data-media-type="video" data-media-url="${url}" style="margin: 1rem 0; padding: 8px; text-align: center; position: relative; cursor: default; border: 2px solid #e5e7eb; border-radius: 8px; background: #f9fafb;" contenteditable="false"><button type="button" class="editor-media-delete" onclick="this.closest('.editor-media').remove()" style="position: absolute; top: 12px; right: 12px; width: 36px; height: 36px; border-radius: 8px; border: 2px solid white; background: #dc2626; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.25); z-index: 1000; font-weight: bold; transition: all 0.2s;" title="Xóa video" onmouseover="this.style.background='#b91c1c'; this.style.transform='scale(1.1)'" onmouseout="this.style.background='#dc2626'; this.style.transform='scale(1)'"><i class="fas fa-times" style="font-size: 16px;"></i></button><video src="${embedUrl}" controls style="max-width: 100%; border-radius: 6px; display: block;"></video></figure>`;
    } else {
      videoHtml = `<figure class="editor-media editor-media-video" data-media-type="video" data-media-url="${url}" style="margin: 1rem 0; padding: 8px; text-align: center; position: relative; cursor: default; border: 2px solid #e5e7eb; border-radius: 8px; background: #f9fafb;" contenteditable="false"><button type="button" class="editor-media-delete" onclick="this.closest('.editor-media').remove()" style="position: absolute; top: 12px; right: 12px; width: 36px; height: 36px; border-radius: 8px; border: 2px solid white; background: #dc2626; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.25); z-index: 1000; font-weight: bold; transition: all 0.2s;" title="Xóa video" onmouseover="this.style.background='#b91c1c'; this.style.transform='scale(1.1)'" onmouseout="this.style.background='#dc2626'; this.style.transform='scale(1)'"><i class="fas fa-times" style="font-size: 16px;"></i></button><iframe src="${embedUrl}" style="width: 100%; aspect-ratio: 16/9; border: none; border-radius: 6px;" allowfullscreen></iframe></figure>`;
    }
    document.execCommand('insertHTML', false, videoHtml);
    handleInput();
    setShowVideoMenu(false);
    onMediaInserted?.({ type: 'video', url });
  }, [handleInput, restoreSelection, onMediaInserted]);

  // Insert table
  const insertTable = useCallback((rows: number, cols: number) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    restoreSelection();
    let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">';
    for (let r = 0; r < rows; r++) {
      tableHtml += '<tr>';
      for (let c = 0; c < cols; c++) {
        const cellTag = r === 0 ? 'th' : 'td';
        tableHtml += `<${cellTag} style="border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left;">${r === 0 ? `Cột ${c + 1}` : ''}</${cellTag}>`;
      }
      tableHtml += '</tr>';
    }
    tableHtml += '</table>';
    document.execCommand('insertHTML', false, tableHtml);
    handleInput();
    setShowTableMenu(false);
  }, [handleInput, restoreSelection]);

  // Image handlers
  const handleInsertImageViaUrl = useCallback(() => {
    saveSelection();
    const url = prompt('Nhập URL ảnh:');
    if (url?.trim()) insertImageAtCursor(url.trim());
    setShowImageMenu(false);
  }, [saveSelection, insertImageAtCursor]);

  const handleInsertImageViaUpload = useCallback(async () => {
    if (!onRequestImageUpload) return;
    saveSelection();
    setIsUploading(true);
    setShowImageMenu(false);
    try {
      const url = await onRequestImageUpload();
      if (url) insertImageAtCursor(url);
    } finally {
      setIsUploading(false);
    }
  }, [onRequestImageUpload, saveSelection, insertImageAtCursor]);

  const handleInsertImageFromAlbum = useCallback(() => {
    if (!onRequestImageAlbum) return;
    saveSelection();
    setShowImageMenu(false);
    onRequestImageAlbum();
  }, [onRequestImageAlbum, saveSelection]);

  // Video handler
  const handleInsertVideoViaUrl = useCallback(() => {
    saveSelection();
    const url = prompt('Nhập URL video (YouTube, Vimeo hoặc MP4):');
    if (url?.trim()) insertVideoAtCursor(url.trim());
    setShowVideoMenu(false);
  }, [saveSelection, insertVideoAtCursor]);

  // Paste handler
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/html') || e.clipboardData.getData('text/plain');
    const cleanHtml = text
      .replace(/data-[^=]*="[^"]*"/g, '')
      .replace(/class="(?!editor-media)[^"]*"/g, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    document.execCommand('insertHTML', false, cleanHtml);
    handleInput();
  }, [handleInput]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b': e.preventDefault(); execCommand('bold'); break;
        case 'i': e.preventDefault(); execCommand('italic'); break;
        case 'u': e.preventDefault(); execCommand('underline'); break;
        case 'z': e.preventDefault(); execCommand(e.shiftKey ? 'redo' : 'undo'); break;
      }
    }
    if (e.key === 'Escape' && isExpanded) setIsExpanded(false);
  }, [execCommand, isExpanded]);

  const toolbarButtonClass = "flex items-center justify-center w-8 h-8 rounded hover:bg-slate-200 transition-colors text-slate-600 hover:text-slate-800";
  const toolbarDivider = "w-px h-6 bg-slate-300 mx-1";
  const containerClass = isExpanded ? "fixed inset-0 z-50 bg-white flex flex-col" : "relative flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden";

  return (
    <div className={containerClass}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50 px-2 py-1.5 sticky top-0 z-10">
        {/* Undo/Redo */}
        <button type="button" onClick={() => execCommand('undo')} className={toolbarButtonClass} title="Hoàn tác (Ctrl+Z)">
          <i className="fas fa-undo text-sm"></i>
        </button>
        <button type="button" onClick={() => execCommand('redo')} className={toolbarButtonClass} title="Làm lại">
          <i className="fas fa-redo text-sm"></i>
        </button>

        <div className={toolbarDivider}></div>

        {/* Heading */}
        <div className="relative" ref={headingRef}>
          <button type="button" onClick={() => setShowHeading(!showHeading)} className="flex items-center gap-1 px-2 h-8 rounded hover:bg-slate-200 text-slate-600 text-sm" title="Định dạng đoạn">
            <span>Đoạn</span>
            <i className="fas fa-caret-down text-xs"></i>
          </button>
          {showHeading && (
            <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border py-1 z-20 min-w-[120px]">
              {HEADING_OPTIONS.map(opt => (
                <button key={opt.tag} type="button" onClick={() => formatBlock(opt.tag)} className="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-sm">{opt.label}</button>
              ))}
            </div>
          )}
        </div>

        {/* Font size */}
        <div className="relative" ref={fontSizeRef}>
          <button type="button" onClick={() => setShowFontSize(!showFontSize)} className="flex items-center gap-1 px-2 h-8 rounded hover:bg-slate-200 text-slate-600 text-sm" title="Cỡ chữ">
            <i className="fas fa-text-height"></i>
            <i className="fas fa-caret-down text-xs"></i>
          </button>
          {showFontSize && (
            <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border py-1 z-20 min-w-[70px]">
              {FONT_SIZES.map(size => (
                <button key={size.value} type="button" onClick={() => { execCommand('fontSize', size.value); setShowFontSize(false); }} className="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-sm">{size.label}</button>
              ))}
            </div>
          )}
        </div>

        <div className={toolbarDivider}></div>

        {/* Text formatting */}
        <button type="button" onClick={() => execCommand('bold')} className={toolbarButtonClass} title="In đậm (Ctrl+B)">
          <i className="fas fa-bold text-sm"></i>
        </button>
        <button type="button" onClick={() => execCommand('italic')} className={toolbarButtonClass} title="In nghiêng (Ctrl+I)">
          <i className="fas fa-italic text-sm"></i>
        </button>
        <button type="button" onClick={() => execCommand('underline')} className={toolbarButtonClass} title="Gạch chân (Ctrl+U)">
          <i className="fas fa-underline text-sm"></i>
        </button>
        <button type="button" onClick={() => execCommand('strikethrough')} className={toolbarButtonClass} title="Gạch ngang">
          <i className="fas fa-strikethrough text-sm"></i>
        </button>

        <div className={toolbarDivider}></div>

        {/* Colors */}
        <div className="relative" ref={colorPickerRef}>
          <button type="button" onClick={() => setShowColorPicker(!showColorPicker)} className={toolbarButtonClass} title="Màu chữ">
            <i className="fas fa-font text-sm"></i>
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-red-500 rounded-full"></div>
          </button>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border p-2 z-20">
              <div className="grid grid-cols-5 gap-1">
                {COLOR_PALETTE.map(c => (
                  <button key={c.value} type="button" onClick={() => { execCommand('foreColor', c.value); setShowColorPicker(false); }} className="w-6 h-6 rounded border hover:scale-110" style={{ backgroundColor: c.value }} title={c.name}></button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={bgColorPickerRef}>
          <button type="button" onClick={() => setShowBgColorPicker(!showBgColorPicker)} className={toolbarButtonClass} title="Màu nền">
            <i className="fas fa-highlighter text-sm"></i>
          </button>
          {showBgColorPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border p-2 z-20">
              <div className="grid grid-cols-5 gap-1">
                <button type="button" onClick={() => { execCommand('hiliteColor', 'transparent'); setShowBgColorPicker(false); }} className="w-6 h-6 rounded border bg-white flex items-center justify-center" title="Không màu">
                  <i className="fas fa-times text-xs text-slate-400"></i>
                </button>
                {COLOR_PALETTE.slice(0, 9).map(c => (
                  <button key={c.value} type="button" onClick={() => { execCommand('hiliteColor', c.value + '40'); setShowBgColorPicker(false); }} className="w-6 h-6 rounded border hover:scale-110" style={{ backgroundColor: c.value + '40' }} title={c.name}></button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={toolbarDivider}></div>

        {/* Lists */}
        <button type="button" onClick={() => execCommand('insertUnorderedList')} className={toolbarButtonClass} title="Danh sách đầu mục">
          <i className="fas fa-list-ul text-sm"></i>
        </button>
        <button type="button" onClick={() => execCommand('insertOrderedList')} className={toolbarButtonClass} title="Danh sách đánh số">
          <i className="fas fa-list-ol text-sm"></i>
        </button>

        <div className={toolbarDivider}></div>

        {/* Indent */}
        <button type="button" onClick={() => execCommand('outdent')} className={toolbarButtonClass} title="Giảm thụt lề">
          <i className="fas fa-outdent text-sm"></i>
        </button>
        <button type="button" onClick={() => execCommand('indent')} className={toolbarButtonClass} title="Tăng thụt lề">
          <i className="fas fa-indent text-sm"></i>
        </button>

        <div className={toolbarDivider}></div>

        {/* Alignment */}
        <button type="button" onClick={() => execCommand('justifyLeft')} className={toolbarButtonClass} title="Căn trái">
          <i className="fas fa-align-left text-sm"></i>
        </button>
        <button type="button" onClick={() => execCommand('justifyCenter')} className={toolbarButtonClass} title="Căn giữa">
          <i className="fas fa-align-center text-sm"></i>
        </button>
        <button type="button" onClick={() => execCommand('justifyRight')} className={toolbarButtonClass} title="Căn phải">
          <i className="fas fa-align-right text-sm"></i>
        </button>

        <div className={toolbarDivider}></div>

        {/* Link */}
        <button type="button" onClick={() => { const url = prompt('Nhập URL:'); if (url) execCommand('createLink', url); }} className={toolbarButtonClass} title="Chèn liên kết">
          <i className="fas fa-link text-sm"></i>
        </button>

        {/* Image */}
        <div className="relative" ref={imageMenuRef}>
          <button type="button" onClick={() => { saveSelection(); setShowImageMenu(!showImageMenu); }} disabled={isUploading} className={`${toolbarButtonClass} ${isUploading ? 'opacity-50' : ''}`} title="Chèn ảnh">
            {isUploading ? <i className="fas fa-spinner fa-spin text-sm"></i> : <i className="fas fa-image text-sm"></i>}
          </button>
          {showImageMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border py-1 z-20 min-w-[150px]">
              <button type="button" onClick={handleInsertImageViaUrl} className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-slate-100">
                <i className="fas fa-link w-4 text-slate-500"></i><span>Nhập URL</span>
              </button>
              {onRequestImageUpload && (
                <button type="button" onClick={handleInsertImageViaUpload} className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-slate-100">
                  <i className="fas fa-upload w-4 text-slate-500"></i><span>Tải ảnh lên</span>
                </button>
              )}
              {onRequestImageAlbum && (
                <button type="button" onClick={handleInsertImageFromAlbum} className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-slate-100">
                  <i className="fas fa-images w-4 text-slate-500"></i><span>Chọn từ thư viện</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Video */}
        <div className="relative" ref={videoMenuRef}>
          <button type="button" onClick={() => { saveSelection(); setShowVideoMenu(!showVideoMenu); }} className={toolbarButtonClass} title="Chèn video">
            <i className="fas fa-video text-sm"></i>
          </button>
          {showVideoMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border py-1 z-20 min-w-[180px]">
              <button type="button" onClick={handleInsertVideoViaUrl} className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-slate-100">
                <i className="fas fa-link w-4 text-slate-500"></i><span>Nhập URL video</span>
              </button>
              <p className="px-3 py-1 text-xs text-slate-400">Hỗ trợ: YouTube, Vimeo, MP4</p>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="relative" ref={tableMenuRef}>
          <button type="button" onClick={() => { saveSelection(); setShowTableMenu(!showTableMenu); }} className={toolbarButtonClass} title="Chèn bảng">
            <i className="fas fa-table text-sm"></i>
          </button>
          {showTableMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border py-1 z-20 min-w-[120px]">
              <p className="px-3 py-1 text-xs text-slate-500 font-medium">Kích thước bảng</p>
              {TABLE_SIZES.map(t => (
                <button key={t.label} type="button" onClick={() => insertTable(t.rows, t.cols)} className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-slate-100">
                  <i className="fas fa-th w-4 text-slate-500"></i><span>{t.label}</span>
                </button>
              ))}
              <button type="button" onClick={() => {
                const input = prompt('Nhập kích thước (VD: 3x4):');
                if (input) {
                  const match = input.match(/(\d+)\s*[x×]\s*(\d+)/i);
                  if (match) insertTable(parseInt(match[1]), parseInt(match[2]));
                }
              }} className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-slate-100 border-t">
                <i className="fas fa-edit w-4 text-slate-500"></i><span>Tùy chọn...</span>
              </button>
            </div>
          )}
        </div>

        {/* Horizontal line */}
        <button type="button" onClick={() => execCommand('insertHorizontalRule')} className={toolbarButtonClass} title="Đường kẻ ngang">
          <i className="fas fa-minus text-sm"></i>
        </button>

        {/* Clear formatting */}
        <button type="button" onClick={() => execCommand('removeFormat')} className={toolbarButtonClass} title="Xóa định dạng">
          <i className="fas fa-eraser text-sm"></i>
        </button>

        <div className="flex-1"></div>

        {/* Expand */}
        <button type="button" onClick={() => setIsExpanded(prev => !prev)} className={`${toolbarButtonClass} ${isExpanded ? 'bg-slate-200' : ''}`} title={isExpanded ? 'Thu nhỏ (Esc)' : 'Mở rộng'}>
          <i className={`fas ${isExpanded ? 'fa-compress' : 'fa-expand'} text-sm`}></i>
        </button>
      </div>

      {/* Editor content */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        className="flex-1 overflow-auto px-4 py-3 outline-none prose prose-slate max-w-none"
        style={{ minHeight: isExpanded ? 'auto' : minHeight, fontFamily: "'Open Sans', sans-serif", lineHeight: '1.7' }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />

      <style jsx>{`
        [contenteditable]:empty:before { content: attr(data-placeholder); color: #9ca3af; pointer-events: none; }
        [contenteditable] h1 { font-size: 2rem; font-weight: 700; margin: 1rem 0; }
        [contenteditable] h2 { font-size: 1.5rem; font-weight: 600; margin: 0.875rem 0; }
        [contenteditable] h3 { font-size: 1.25rem; font-weight: 600; margin: 0.75rem 0; }
        [contenteditable] h4 { font-size: 1.125rem; font-weight: 600; margin: 0.625rem 0; }
        [contenteditable] p { margin: 0.5rem 0; }
        [contenteditable] ul { list-style-type: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
        [contenteditable] ol { list-style-type: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
        [contenteditable] li { margin: 0.25rem 0; }
        [contenteditable] a { color: #2563eb; text-decoration: underline; }
        [contenteditable] hr { margin: 1rem 0; border-color: #e5e7eb; }
        [contenteditable] img { max-width: 100%; height: auto; margin: 0.5rem 0; }
        [contenteditable] table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
        [contenteditable] th, [contenteditable] td { border: 1px solid #e5e7eb; padding: 8px 12px; }
        [contenteditable] th { background: #f8fafc; font-weight: 600; }
        [contenteditable] figure { margin: 1rem 0; }
        [contenteditable] iframe { max-width: 100%; }
        
        /* Media elements - always show delete button */
        [contenteditable] .editor-media { position: relative; }
        [contenteditable] .editor-media-delete { pointer-events: all !important; }
      `}</style>
    </div>
  );
}

export default RichTextEditor;
