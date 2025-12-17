'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  ClassicEditor,
  Essentials,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Subscript,
  Superscript,
  Font,
  Paragraph,
  Heading,
  Link,
  List,
  ListProperties,
  TodoList,
  Indent,
  IndentBlock,
  Alignment,
  BlockQuote,
  Image,
  ImageCaption,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  ImageInsert,
  Base64UploadAdapter,
  MediaEmbed,
  Table,
  TableToolbar,
  TableCaption,
  TableColumnResize,
  TableProperties,
  TableCellProperties,
  HorizontalLine,
  CodeBlock,
  Code,
  RemoveFormat,
  FindAndReplace,
  SourceEditing,
  GeneralHtmlSupport,
  HtmlEmbed,
  ShowBlocks,
  SpecialCharacters,
  SpecialCharactersEssentials,
  Highlight,
  PasteFromOffice,
  AutoLink,
  TextTransformation,
  Undo,
  WordCount
} from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';

interface CKEditorWrapperProps {
  value: string;
  onChange: (data: string) => void;
  placeholder?: string;
  minHeight?: string;
  onReady?: (editor: ClassicEditor) => void;
  onWordCountChange?: (stats: { words: number; characters: number }) => void;
}

// Shared CKEditor styles for both normal and fullscreen mode (single CKEditor instance; fullscreen via CSS only)
const editorStyles = `
  /* Container & toolbar layout (prevent sticky jump when focusing editor) */
  .ck-editor-container {
    position: relative;
  }
  .ck-editor-container .ck.ck-editor {
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    background: #ffffff;
    box-shadow: 0 12px 36px rgba(15, 23, 42, 0.08);
    width: 100%;
  }
  .ck-editor-container .ck.ck-toolbar,
  .ck-editor-container .ck-sticky-panel,
  .ck-editor-container .ck-sticky-panel__content,
  .ck-editor-container .ck-sticky-panel__placeholder,
  .ck-editor-container .ck-sticky-panel__content_sticky,
  .ck-editor-container .ck-editor__top .ck-sticky-panel .ck-toolbar {
    position: static !important;
    z-index: 1;
    width: 100%;
  }
  .ck-editor-container .ck-sticky-panel__placeholder {
    display: none !important;
    height: 0 !important;
  }
  .ck-editor-container .ck-editor__top,
  .ck-editor-container .ck.ck-toolbar,
  .ck-editor-container .ck-sticky-panel,
  .ck-editor-container .ck-sticky-panel__content,
  .ck-editor-container .ck-sticky-panel__content_sticky {
    width: 100% !important;
  }
  .ck-editor-container .ck.ck-toolbar {
    display: flex !important;
    flex-wrap: wrap;
  }
  .ck-editor-container .ck.ck-toolbar {
    border-radius: 14px 14px 0 0;
    border-bottom: 1px solid #e5e7eb;
  }
  .ck-editor-container .ck-editor__main {
    border-radius: 0 0 14px 14px;
  }

  /* Base editor styles */
  .ck-editor-container .ck-editor__editable_inline,
  .ck-fullscreen-editor .ck-editor__editable_inline {
    min-height: var(--ck-editor-min-height, 400px);
  }
  .ck-editor-container .ck.ck-editor__main > .ck-editor__editable,
  .ck-fullscreen-editor .ck.ck-editor__main > .ck-editor__editable {
    background: #fff;
  }
  .ck-editor-container .ck-content,
  .ck-fullscreen-editor .ck-content {
    font-family: 'Open Sans', 'Roboto', sans-serif;
    line-height: 1.7;
    color: #333;
  }
  
  /* Headings */
  .ck-editor-container .ck-content h1,
  .ck-fullscreen-editor .ck-content h1 {
    font-size: 2.25rem;
    font-weight: 700;
    margin: 1.5rem 0 1rem;
    color: #1a1a1a;
  }
  .ck-editor-container .ck-content h2,
  .ck-fullscreen-editor .ck-content h2 {
    font-size: 1.875rem;
    font-weight: 700;
    margin: 1.25rem 0 0.875rem;
    color: #1a1a1a;
  }
  .ck-editor-container .ck-content h3,
  .ck-fullscreen-editor .ck-content h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 1rem 0 0.75rem;
    color: #1a1a1a;
  }
  .ck-editor-container .ck-content h4,
  .ck-fullscreen-editor .ck-content h4 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 1rem 0 0.625rem;
    color: #1a1a1a;
  }
  .ck-editor-container .ck-content h5,
  .ck-fullscreen-editor .ck-content h5 {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0.875rem 0 0.5rem;
    color: #1a1a1a;
  }
  .ck-editor-container .ck-content h6,
  .ck-fullscreen-editor .ck-content h6 {
    font-size: 1rem;
    font-weight: 600;
    margin: 0.75rem 0 0.5rem;
    color: #1a1a1a;
  }
  
  /* Paragraphs */
  .ck-editor-container .ck-content p,
  .ck-fullscreen-editor .ck-content p {
    margin-bottom: 1rem;
  }
  
  /* Lists - IMPORTANT for numbered/bulleted lists */
  .ck-editor-container .ck-content ul,
  .ck-fullscreen-editor .ck-content ul {
    list-style-type: disc;
    padding-left: 2rem;
    margin: 1rem 0;
  }
  .ck-editor-container .ck-content ol,
  .ck-fullscreen-editor .ck-content ol {
    list-style-type: decimal;
    padding-left: 2rem;
    margin: 1rem 0;
  }
  .ck-editor-container .ck-content ul ul,
  .ck-fullscreen-editor .ck-content ul ul {
    list-style-type: circle;
  }
  .ck-editor-container .ck-content ul ul ul,
  .ck-fullscreen-editor .ck-content ul ul ul {
    list-style-type: square;
  }
  .ck-editor-container .ck-content ol ol,
  .ck-fullscreen-editor .ck-content ol ol {
    list-style-type: lower-alpha;
  }
  .ck-editor-container .ck-content ol ol ol,
  .ck-fullscreen-editor .ck-content ol ol ol {
    list-style-type: lower-roman;
  }
  .ck-editor-container .ck-content li,
  .ck-fullscreen-editor .ck-content li {
    margin-bottom: 0.5rem;
    display: list-item;
  }
  .ck-editor-container .ck-content li > p,
  .ck-fullscreen-editor .ck-content li > p {
    margin-bottom: 0.25rem;
  }
  
  /* Todo List */
  .ck-editor-container .ck-content .todo-list,
  .ck-fullscreen-editor .ck-content .todo-list {
    list-style: none;
    padding-left: 0;
    margin: 1rem 0;
  }
  .ck-editor-container .ck-content .todo-list li,
  .ck-fullscreen-editor .ck-content .todo-list li {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }
  .ck-editor-container .ck-content .todo-list li .todo-list__label,
  .ck-fullscreen-editor .ck-content .todo-list li .todo-list__label {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
  }
  .ck-editor-container .ck-content .todo-list input[type="checkbox"],
  .ck-fullscreen-editor .ck-content .todo-list input[type="checkbox"] {
    margin-top: 0.25rem;
    width: 1rem;
    height: 1rem;
  }
  
  /* Blockquote */
  .ck-editor-container .ck-content blockquote,
  .ck-fullscreen-editor .ck-content blockquote {
    border-left: 4px solid #3b82f6;
    padding: 1rem 1.5rem;
    margin: 1.5rem 0;
    font-style: italic;
    color: #4a5568;
    background-color: #f8fafc;
    border-radius: 0 0.5rem 0.5rem 0;
  }
  .ck-editor-container .ck-content blockquote p,
  .ck-fullscreen-editor .ck-content blockquote p {
    margin-bottom: 0;
  }
  .ck-editor-container .ck-content blockquote p + p,
  .ck-fullscreen-editor .ck-content blockquote p + p {
    margin-top: 0.5rem;
  }
  
  /* Links */
  .ck-editor-container .ck-content a,
  .ck-fullscreen-editor .ck-content a {
    color: #3b82f6;
    text-decoration: underline;
    text-underline-offset: 2px;
  }
  .ck-editor-container .ck-content a:hover,
  .ck-fullscreen-editor .ck-content a:hover {
    color: #2563eb;
  }
  
  /* Images */
  .ck-editor-container .ck-content img,
  .ck-fullscreen-editor .ck-content img {
    max-width: 100%;
    height: auto;
    border-radius: 0.5rem;
  }
  .ck-editor-container .ck-content figure,
  .ck-fullscreen-editor .ck-content figure {
    margin: 1.5rem 0;
  }
  .ck-editor-container .ck-content figure.image,
  .ck-fullscreen-editor .ck-content figure.image {
    text-align: center;
  }
  .ck-editor-container .ck-content figure.image-style-side,
  .ck-fullscreen-editor .ck-content figure.image-style-side {
    float: right;
    margin-left: 1.5rem;
    margin-right: 0;
    max-width: 50%;
  }
  .ck-editor-container .ck-content figure.image-style-align-left,
  .ck-fullscreen-editor .ck-content figure.image-style-align-left {
    float: left;
    margin-right: 1.5rem;
    margin-left: 0;
  }
  .ck-editor-container .ck-content figure.image-style-align-right,
  .ck-fullscreen-editor .ck-content figure.image-style-align-right {
    float: right;
    margin-left: 1.5rem;
    margin-right: 0;
  }
  .ck-editor-container .ck-content figcaption,
  .ck-fullscreen-editor .ck-content figcaption {
    font-size: 0.875rem;
    color: #6b7280;
    text-align: center;
    margin-top: 0.5rem;
    font-style: italic;
  }
  
  /* Tables */
  .ck-editor-container .ck-content table,
  .ck-fullscreen-editor .ck-content table {
    border-collapse: collapse;
    width: 100%;
    margin: 1.5rem 0;
  }
  .ck-editor-container .ck-content table td,
  .ck-editor-container .ck-content table th,
  .ck-fullscreen-editor .ck-content table td,
  .ck-fullscreen-editor .ck-content table th {
    border: 1px solid #d1d5db;
    padding: 0.75rem 1rem;
  }
  .ck-editor-container .ck-content table th,
  .ck-fullscreen-editor .ck-content table th {
    background-color: #f3f4f6;
    font-weight: 600;
  }
  .ck-editor-container .ck-content table caption,
  .ck-fullscreen-editor .ck-content table caption {
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 0.5rem;
    text-align: left;
    font-style: italic;
  }
  
  /* Code */
  .ck-editor-container .ck-content code,
  .ck-fullscreen-editor .ck-content code {
    background-color: #f1f5f9;
    color: #e11d48;
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
    font-size: 0.875em;
  }
  .ck-editor-container .ck-content pre,
  .ck-fullscreen-editor .ck-content pre {
    background-color: #1e293b;
    color: #e2e8f0;
    padding: 1.25rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
    font-size: 0.875rem;
    line-height: 1.6;
    margin: 1.5rem 0;
  }
  .ck-editor-container .ck-content pre code,
  .ck-fullscreen-editor .ck-content pre code {
    background: none;
    color: inherit;
    padding: 0;
    font-size: inherit;
  }
  
  /* Horizontal Rule */
  .ck-editor-container .ck-content hr,
  .ck-fullscreen-editor .ck-content hr {
    border: none;
    border-top: 2px solid #e5e7eb;
    margin: 2rem 0;
  }
  
  /* Highlight markers */
  .ck-editor-container .ck-content .marker-yellow,
  .ck-editor-container .ck-content mark.marker-yellow,
  .ck-fullscreen-editor .ck-content .marker-yellow,
  .ck-fullscreen-editor .ck-content mark.marker-yellow {
    background-color: #fef9c3;
    padding: 0.125rem 0.25rem;
  }
  .ck-editor-container .ck-content .marker-green,
  .ck-editor-container .ck-content mark.marker-green,
  .ck-fullscreen-editor .ck-content .marker-green,
  .ck-fullscreen-editor .ck-content mark.marker-green {
    background-color: #dcfce7;
    padding: 0.125rem 0.25rem;
  }
  .ck-editor-container .ck-content .marker-pink,
  .ck-editor-container .ck-content mark.marker-pink,
  .ck-fullscreen-editor .ck-content .marker-pink,
  .ck-fullscreen-editor .ck-content mark.marker-pink {
    background-color: #fce7f3;
    padding: 0.125rem 0.25rem;
  }
  .ck-editor-container .ck-content .marker-blue,
  .ck-editor-container .ck-content mark.marker-blue,
  .ck-fullscreen-editor .ck-content .marker-blue,
  .ck-fullscreen-editor .ck-content mark.marker-blue {
    background-color: #dbeafe;
    padding: 0.125rem 0.25rem;
  }
  .ck-editor-container .ck-content .pen-red,
  .ck-fullscreen-editor .ck-content .pen-red {
    color: #dc2626;
  }
  .ck-editor-container .ck-content .pen-green,
  .ck-fullscreen-editor .ck-content .pen-green {
    color: #16a34a;
  }
  
  /* Text alignment */
  .ck-editor-container .ck-content .text-tiny,
  .ck-fullscreen-editor .ck-content .text-tiny {
    font-size: 0.7em;
  }
  .ck-editor-container .ck-content .text-small,
  .ck-fullscreen-editor .ck-content .text-small {
    font-size: 0.85em;
  }
  .ck-editor-container .ck-content .text-big,
  .ck-fullscreen-editor .ck-content .text-big {
    font-size: 1.4em;
  }
  .ck-editor-container .ck-content .text-huge,
  .ck-fullscreen-editor .ck-content .text-huge {
    font-size: 1.8em;
  }
  
  /* Media embed */
  .ck-editor-container .ck-content .media,
  .ck-fullscreen-editor .ck-content .media {
    margin: 1.5rem 0;
  }
  .ck-editor-container .ck-content .media iframe,
  .ck-fullscreen-editor .ck-content .media iframe {
    max-width: 100%;
    border-radius: 0.5rem;
  }
  
  /* HTML embed */
  .ck-editor-container .ck-content .raw-html-embed,
  .ck-fullscreen-editor .ck-content .raw-html-embed {
    margin: 1.5rem 0;
  }
  
  /* Clear floats */
  .ck-editor-container .ck-content::after,
  .ck-fullscreen-editor .ck-content::after {
    content: '';
    display: table;
    clear: both;
  }
  
  /* Fullscreen button */
  .ck-fullscreen-btn {
    position: absolute;
    bottom: 12px;
    right: 12px;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #124e66, #1c6e8c);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    box-shadow: 0 2px 12px rgba(18, 78, 102, 0.25);
    transition: all 0.2s ease;
    z-index: 10;
  }
  .ck-fullscreen-btn:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 4px 16px rgba(18, 78, 102, 0.35);
    background: linear-gradient(135deg, #0f3e52, #165872);
  }
  .ck-fullscreen-btn:active {
    transform: translateY(0) scale(0.98);
  }
  .ck-fullscreen-btn i {
    font-size: 16px;
  }
  
  /* Fullscreen mode - Google Docs style overlay */
  .ck-editor-container.fullscreen-active {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    z-index: 999999 !important;
    background: #f8f9fa !important;
    animation: fadeIn 0.25s ease;
    display: flex;
    flex-direction: column;
    margin: 0 !important;
    padding: 0 !important;
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  .ck-editor-container.fullscreen-active .ck-editor {
    width: 100% !important;
    height: 100% !important;
    max-width: none !important;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    display: flex !important;
    flex-direction: column !important;
    animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    margin: 0 !important;
  }
  @keyframes slideDown {
    from { 
      opacity: 0; 
      transform: translateY(-20px);
    }
    to { 
      opacity: 1; 
      transform: translateY(0);
    }
  }
  
  .ck-editor-container.fullscreen-active .ck.ck-toolbar {
    position: relative !important;
    top: auto !important;
    border: none !important;
    background: #ffffff !important;
    border-bottom: 1px solid #e0e0e0 !important;
    border-radius: 0 !important;
    padding: 12px 24px !important;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05) !important;
    z-index: 10 !important;
    margin: 0 !important;
  }
  
  .ck-editor-container.fullscreen-active .ck.ck-toolbar.ck-sticky-panel__content {
    position: relative !important;
    top: auto !important;
  }
  
  .ck-editor-container.fullscreen-active .ck-sticky-panel {
    position: relative !important;
    top: auto !important;
    z-index: 10 !important;
  }
  
  .ck-editor-container.fullscreen-active .ck-sticky-panel__content {
    position: relative !important;
    top: auto !important;
  }
  
  .ck-editor-container.fullscreen-active .ck-sticky-panel .ck-sticky-panel__content_sticky {
    position: relative !important;
    top: auto !important;
  }
  
  .ck-editor-container.fullscreen-active .ck-editor__top {
    position: relative !important;
    top: auto !important;
    z-index: 10 !important;
    background: #ffffff !important;
  }
  
  .ck-editor-container.fullscreen-active .ck-editor__top .ck-sticky-panel .ck-toolbar {
    position: relative !important;
    top: auto !important;
  }
  
  .ck-editor-container.fullscreen-active .ck-editor__main {
    flex: 1 !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    background: #f8f9fa !important;
    padding: 40px 0 !important;
  }
  
  .ck-editor-container.fullscreen-active .ck-editor__editable_inline {
    min-height: calc(100vh - 200px) !important;
    max-width: 8.5in !important;
    margin: 0 auto !important;
    padding: 1in !important;
    background: #ffffff !important;
    box-shadow: 0 0 10px rgba(0,0,0,0.1) !important;
    border: 1px solid #e0e0e0 !important;
    border-radius: 0 !important;
  }
  
  /* Fullscreen controls */
  .ck-fullscreen-bar {
    position: fixed !important;
    top: 16px !important;
    right: 24px !important;
    display: flex;
    gap: 12px;
    z-index: 1000000 !important;
    animation: slideInRight 0.3s ease;
  }
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  .ck-fullscreen-close {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: #124e66;
    border: none;
    color: white;
    padding: 10px 18px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(18, 78, 102, 0.25);
  }
  .ck-fullscreen-close:hover {
    background: #0f3e52;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(18, 78, 102, 0.35);
  }
  .ck-fullscreen-close:active {
    transform: translateY(0);
  }
  
  .ck-fullscreen-footer {
    position: fixed !important;
    left: 24px !important;
    bottom: 20px !important;
    display: inline-flex;
    align-items: center;
    gap: 20px;
    padding: 12px 18px;
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    font-size: 0.875rem;
    color: #475569;
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    backdrop-filter: blur(8px);
    animation: slideInLeft 0.3s ease;
    z-index: 1000000 !important;
  }
  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  .ck-fullscreen-footer span {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
  }
  .ck-fullscreen-footer i {
    color: #124e66;
  }
`;

export function CKEditorWrapper({
  value,
  onChange,
  placeholder = 'Nhập nội dung tại đây...',
  minHeight = '400px',
  onReady,
  onWordCountChange
}: CKEditorWrapperProps) {
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wordCount, setWordCount] = useState({ words: 0, characters: 0 });
  const editorRef = useRef<ClassicEditor | null>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLayoutReady(true);
    return () => setIsLayoutReady(false);
  }, []);

  // Handle ESC key to close fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Prevent body scroll when fullscreen is open
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  // Close fullscreen on overlay ESC
  useEffect(() => {
    if (!isFullscreen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeFullscreen();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isFullscreen]);

  const handleWordCountUpdate = useCallback((stats: { words: number; characters: number }) => {
    setWordCount(stats);
    if (onWordCountChange) {
      onWordCountChange(stats);
    }
  }, [onWordCountChange]);

  const editorConfig = {
    licenseKey: 'GPL',
    plugins: [
      Essentials,
      Bold,
      Italic,
      Underline,
      Strikethrough,
      Subscript,
      Superscript,
      Font,
      Paragraph,
      Heading,
      Link,
      List,
      ListProperties,
      TodoList,
      Indent,
      IndentBlock,
      Alignment,
      BlockQuote,
      Image,
      ImageCaption,
      ImageResize,
      ImageStyle,
      ImageToolbar,
      ImageUpload,
      ImageInsert,
      Base64UploadAdapter,
      MediaEmbed,
      Table,
      TableToolbar,
      TableCaption,
      TableColumnResize,
      TableProperties,
      TableCellProperties,
      HorizontalLine,
      CodeBlock,
      Code,
      RemoveFormat,
      FindAndReplace,
      SourceEditing,
      GeneralHtmlSupport,
      HtmlEmbed,
      ShowBlocks,
      SpecialCharacters,
      SpecialCharactersEssentials,
      Highlight,
      PasteFromOffice,
      AutoLink,
      TextTransformation,
      Undo,
      WordCount
    ],
    toolbar: {
      items: [
        'undo', 'redo',
        '|',
        'sourceEditing', 'showBlocks', 'findAndReplace',
        '|',
        'heading',
        '|',
        'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor',
        '|',
        'bold', 'italic', 'underline', 'strikethrough',
        '|',
        'subscript', 'superscript', 'code', 'removeFormat',
        '-',
        'highlight',
        '|',
        'alignment',
        '|',
        'bulletedList', 'numberedList', 'todoList',
        '|',
        'outdent', 'indent',
        '|',
        'link', 'insertImage', 'insertTable', 'mediaEmbed', 'blockQuote', 'codeBlock', 'htmlEmbed',
        '|',
        'horizontalLine', 'specialCharacters'
      ],
      shouldNotGroupWhenFull: true
    },
    heading: {
      options: [
        { model: 'paragraph' as const, title: 'Đoạn văn', class: 'ck-heading_paragraph' },
        { model: 'heading1' as const, view: 'h1', title: 'Tiêu đề 1', class: 'ck-heading_heading1' },
        { model: 'heading2' as const, view: 'h2', title: 'Tiêu đề 2', class: 'ck-heading_heading2' },
        { model: 'heading3' as const, view: 'h3', title: 'Tiêu đề 3', class: 'ck-heading_heading3' },
        { model: 'heading4' as const, view: 'h4', title: 'Tiêu đề 4', class: 'ck-heading_heading4' },
        { model: 'heading5' as const, view: 'h5', title: 'Tiêu đề 5', class: 'ck-heading_heading5' },
        { model: 'heading6' as const, view: 'h6', title: 'Tiêu đề 6', class: 'ck-heading_heading6' }
      ]
    },
    fontSize: {
      options: [10, 12, 14, 'default', 18, 20, 22, 24, 26, 28, 36, 48, 72],
      supportAllValues: true
    },
    fontFamily: {
      options: [
        'default',
        'Arial, Helvetica, sans-serif',
        'Courier New, Courier, monospace',
        'Georgia, serif',
        'Lucida Sans Unicode, Lucida Grande, sans-serif',
        'Tahoma, Geneva, sans-serif',
        'Times New Roman, Times, serif',
        'Trebuchet MS, Helvetica, sans-serif',
        'Verdana, Geneva, sans-serif',
        'Roboto, sans-serif',
        'Open Sans, sans-serif',
        'Lato, sans-serif',
        'Montserrat, sans-serif',
        'Nunito, sans-serif'
      ],
      supportAllValues: true
    },
    fontColor: {
      columns: 5,
      documentColors: 10,
      colors: [
        { color: '#000000', label: 'Đen' },
        { color: '#4D4D4D', label: 'Xám đậm' },
        { color: '#999999', label: 'Xám' },
        { color: '#E6E6E6', label: 'Xám nhạt' },
        { color: '#FFFFFF', label: 'Trắng', hasBorder: true },
        { color: '#E64C4C', label: 'Đỏ' },
        { color: '#E6994C', label: 'Cam' },
        { color: '#E6E64C', label: 'Vàng' },
        { color: '#4CE64C', label: 'Xanh lá' },
        { color: '#4CE6E6', label: 'Xanh ngọc' },
        { color: '#4C4CE6', label: 'Xanh dương' },
        { color: '#994CE6', label: 'Tím' },
        { color: '#E64C99', label: 'Hồng' },
        { color: '#1ABC9C', label: 'Xanh lục bảo' },
        { color: '#2ECC71', label: 'Xanh ngọc lục bảo' },
        { color: '#3498DB', label: 'Xanh Peter River' },
        { color: '#9B59B6', label: 'Tím Amethyst' },
        { color: '#34495E', label: 'Xám xanh đậm' },
        { color: '#16A085', label: 'Xanh biển tối' },
        { color: '#27AE60', label: 'Xanh lá Nephritis' },
        { color: '#2980B9', label: 'Xanh Belize' },
        { color: '#8E44AD', label: 'Tím Wisteria' },
        { color: '#2C3E50', label: 'Xanh nửa đêm' },
        { color: '#F1C40F', label: 'Vàng Sun Flower' },
        { color: '#E67E22', label: 'Cam Carrot' }
      ]
    },
    fontBackgroundColor: {
      columns: 5,
      documentColors: 10
    },
    link: {
      addTargetToExternalLinks: true,
      defaultProtocol: 'https://',
      decorators: {
        openInNewTab: {
          mode: 'manual' as const,
          label: 'Mở trong tab mới',
          defaultValue: true,
          attributes: {
            target: '_blank',
            rel: 'noopener noreferrer'
          }
        }
      }
    },
    list: {
      properties: {
        styles: true,
        startIndex: true,
        reversed: true
      }
    },
    image: {
      toolbar: [
        'imageTextAlternative',
        'toggleImageCaption',
        '|',
        'imageStyle:inline',
        'imageStyle:wrapText',
        'imageStyle:breakText',
        '|',
        'resizeImage'
      ],
      resizeOptions: [
        { name: 'resizeImage:original', value: null, label: 'Kích thước gốc' },
        { name: 'resizeImage:25', value: '25', label: '25%' },
        { name: 'resizeImage:50', value: '50', label: '50%' },
        { name: 'resizeImage:75', value: '75', label: '75%' }
      ]
    },
    table: {
      contentToolbar: [
        'tableColumn',
        'tableRow',
        'mergeTableCells',
        'tableProperties',
        'tableCellProperties',
        'toggleTableCaption'
      ]
    },
    mediaEmbed: {
      previewsInData: true
    },
    codeBlock: {
      languages: [
        { language: 'plaintext', label: 'Plain text' },
        { language: 'javascript', label: 'JavaScript' },
        { language: 'typescript', label: 'TypeScript' },
        { language: 'python', label: 'Python' },
        { language: 'html', label: 'HTML' },
        { language: 'css', label: 'CSS' },
        { language: 'php', label: 'PHP' },
        { language: 'ruby', label: 'Ruby' },
        { language: 'java', label: 'Java' },
        { language: 'c', label: 'C' },
        { language: 'cpp', label: 'C++' },
        { language: 'csharp', label: 'C#' },
        { language: 'swift', label: 'Swift' },
        { language: 'go', label: 'Go' },
        { language: 'rust', label: 'Rust' },
        { language: 'sql', label: 'SQL' },
        { language: 'json', label: 'JSON' },
        { language: 'xml', label: 'XML' },
        { language: 'yaml', label: 'YAML' },
        { language: 'bash', label: 'Bash' },
        { language: 'shell', label: 'Shell' },
        { language: 'markdown', label: 'Markdown' }
      ]
    },
    htmlSupport: {
      allow: [
        { name: /^.*$/, attributes: true, classes: true, styles: true }
      ],
      disallow: []
    },
    highlight: {
      options: [
        { model: 'yellowMarker', class: 'marker-yellow', title: 'Đánh dấu vàng', color: 'var(--ck-highlight-marker-yellow)', type: 'marker' as const },
        { model: 'greenMarker', class: 'marker-green', title: 'Đánh dấu xanh', color: 'var(--ck-highlight-marker-green)', type: 'marker' as const },
        { model: 'pinkMarker', class: 'marker-pink', title: 'Đánh dấu hồng', color: 'var(--ck-highlight-marker-pink)', type: 'marker' as const },
        { model: 'blueMarker', class: 'marker-blue', title: 'Đánh dấu xanh dương', color: 'var(--ck-highlight-marker-blue)', type: 'marker' as const },
        { model: 'redPen', class: 'pen-red', title: 'Bút đỏ', color: 'var(--ck-highlight-pen-red)', type: 'pen' as const },
        { model: 'greenPen', class: 'pen-green', title: 'Bút xanh', color: 'var(--ck-highlight-pen-green)', type: 'pen' as const }
      ]
    },
    placeholder: placeholder,
    wordCount: {
      onUpdate: handleWordCountUpdate
    },
    ui: {
      viewportOffset: {
        top: 0
      }
    }
  };

  const openFullscreen = () => {
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
  };

  return (
    <div
      ref={editorContainerRef}
      className={`ck-editor-container ${isFullscreen ? 'fullscreen-active' : ''}`}
      style={{ position: 'relative', '--ck-editor-min-height': minHeight } as React.CSSProperties}
    >
      <style>{editorStyles}</style>
      {isLayoutReady && (
        <>
          <CKEditor
            editor={ClassicEditor}
            config={editorConfig as any}
            data={value}
            onReady={(editor) => {
              editorRef.current = editor as ClassicEditor;
              if (onReady) {
                onReady(editor as ClassicEditor);
              }
            }}
            onChange={(event, editor) => {
              const data = editor.getData();
              onChange(data);
            }}
          />
          {!isFullscreen && (
            <button
              type="button"
              className="ck-fullscreen-btn"
              onClick={openFullscreen}
              title="Mở toàn màn hình (như Google Docs)"
            >
              <i className="fas fa-expand-arrows-alt"></i>
            </button>
          )}
          {isFullscreen && (
            <>
              <div className="ck-fullscreen-bar">
                <button className="ck-fullscreen-close" onClick={closeFullscreen}>
                  <i className="fas fa-times"></i>
                  Đóng (ESC)
                </button>
              </div>
              <div className="ck-fullscreen-footer">
                <span><i className="fas fa-font"></i> {wordCount.words} từ</span>
                <span><i className="fas fa-align-left"></i> {wordCount.characters} ký tự</span>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default CKEditorWrapper;
