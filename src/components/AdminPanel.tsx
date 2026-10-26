import { useState, useRef } from 'react';
import type { MenuPage, RestaurantConfig } from '../types';
import {
  Plus,
  Trash2,
  Edit2,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Upload,
  Link as LinkIcon,
  Eye,
  Share2,
  Download,
  FileCode,
  Github,
  KeyRound,
  Check,
  X,
  AlertCircle,
  Settings
} from 'lucide-react';

interface AdminPanelProps {
  pages: MenuPage[];
  config: RestaurantConfig;
  onUpdatePages: (pages: MenuPage[]) => void;
  onUpdateConfig: (config: RestaurantConfig) => void;
  onOpenCustomerView: () => void;
  onOpenLineShare: () => void;
  onOpenGitHubGuide: () => void;
}

export function AdminPanel({
  pages,
  config,
  onUpdatePages,
  onUpdateConfig,
  onOpenCustomerView,
  onOpenLineShare,
  onOpenGitHubGuide,
}: AdminPanelProps) {
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<MenuPage | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Form states for Add / Edit
  const [pageTitle, setPageTitle] = useState('');
  const [pageCategory, setPageCategory] = useState('');
  const [pageDescription, setPageDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadMode, setUploadMode] = useState<'upload' | 'url'>('upload');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formError, setFormError] = useState('');

  // Drag and Drop states
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Config form state
  const [tempConfig, setTempConfig] = useState<RestaurantConfig>(config);
  const [configSaved, setConfigSaved] = useState(false);
  const [logoUploadMode, setLogoUploadMode] = useState<'upload' | 'url'>('upload');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // Logo file upload handler
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพ (JPG, PNG หรือ WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setTempConfig((prev) => ({ ...prev, logoUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  // Handle Drag & Drop
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const updated = [...pages];
      const [removed] = updated.splice(draggedIndex, 1);
      updated.splice(dragOverIndex, 0, removed);
      onUpdatePages(updated);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Up/Down reorder fallback for mobile
  const moveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...pages];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    onUpdatePages(updated);
  };

  const moveDown = (index: number) => {
    if (index === pages.length - 1) return;
    const updated = [...pages];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    onUpdatePages(updated);
  };

  // File Upload handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('กรุณาเลือกไฟล์รูปภาพ (JPG, PNG หรือ WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImageUrl(result);
      setImagePreview(result);
      setFormError('');
    };
    reader.readAsDataURL(file);
  };

  const openAddModal = () => {
    setEditingPage(null);
    setPageTitle(`หน้า ${pages.length + 1}`);
    setPageCategory('');
    setPageDescription('');
    setImageUrl('');
    setImagePreview('');
    setUploadMode('upload');
    setFormError('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (page: MenuPage) => {
    setEditingPage(page);
    setPageTitle(page.title);
    setPageCategory(page.category || '');
    setPageDescription(page.description || '');
    setImageUrl(page.imageUrl);
    setImagePreview(page.imageUrl);
    setUploadMode(page.imageUrl.startsWith('data:') ? 'upload' : 'url');
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleSavePage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      setFormError('กรุณาอัปโหลดรูปภาพใบเมนู หรือ ใส่ลิงก์ URL');
      return;
    }
    if (!pageTitle.trim()) {
      setFormError('กรุณาระบุชื่อหน้าเมนู');
      return;
    }

    if (editingPage) {
      // Edit existing
      const updated = pages.map((p) =>
        p.id === editingPage.id
          ? {
              ...p,
              title: pageTitle.trim(),
              category: pageCategory.trim() || undefined,
              description: pageDescription.trim() || undefined,
              imageUrl,
            }
          : p
      );
      onUpdatePages(updated);
    } else {
      // Add new
      const newPage: MenuPage = {
        id: `page-${Date.now()}`,
        title: pageTitle.trim(),
        category: pageCategory.trim() || undefined,
        description: pageDescription.trim() || undefined,
        imageUrl,
        createdAt: Date.now(),
      };
      onUpdatePages([...pages, newPage]);
    }

    setIsAddModalOpen(false);
  };

  const handleDeletePage = (id: string) => {
    onUpdatePages(pages.filter((p) => p.id !== id));
    setDeleteConfirmId(null);
  };

  // Export & Import menu data
  const handleExportData = () => {
    const data = {
      config,
      pages,
      exportedAt: new Date().toISOString(),
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', 'menu-data.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.pages && Array.isArray(parsed.pages)) {
          onUpdatePages(parsed.pages);
          if (parsed.config) onUpdateConfig(parsed.config);
          alert('นำเข้าข้อมูลเมนูสำเร็จเรียบร้อย!');
        } else {
          alert('รูปแบบไฟล์ menu-data.json ไม่ถูกต้อง');
        }
      } catch (err) {
        console.error(err);
        alert('เกิดข้อผิดพลาดในการอ่านไฟล์ JSON');
      }
    };
    reader.readAsText(file);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(tempConfig);
    setConfigSaved(true);
    setTimeout(() => {
      setConfigSaved(false);
      setIsConfigModalOpen(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-['Sarabun',sans-serif] pb-24">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div
            onClick={() => {
              setTempConfig(config);
              setIsConfigModalOpen(true);
            }}
            className="flex items-center gap-3 cursor-pointer group"
            title="คลิกเพื่อแก้ไขชื่อร้านและโลโก้"
          >
            {config.logoUrl ? (
              <div className="w-10 h-10 rounded-2xl bg-neutral-800 border border-neutral-700 overflow-hidden shrink-0 shadow-sm group-hover:border-amber-400 transition-colors">
                <img
                  src={config.logoUrl}
                  alt={config.restaurantName}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-base group-hover:border-amber-400 transition-colors">
                {config.restaurantName ? config.restaurantName.charAt(0) : 'R'}
              </div>
            )}
            <div>
              <h1 className="text-sm sm:text-base font-bold text-neutral-100 flex items-center gap-2 group-hover:text-amber-400 transition-colors">
                <span>{config.restaurantName || 'ระบบจัดการใบเมนู'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  โหมดเจ้าของร้าน
                </span>
              </h1>
              <p className="text-xs text-neutral-400 truncate max-w-[200px] sm:max-w-xs flex items-center gap-1">
                <span>{config.tagline || 'คลิกที่นี่เพื่อแก้ไขชื่อและโลโก้'}</span>
                <Edit2 className="w-3 h-3 text-neutral-400 group-hover:text-amber-400" />
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setTempConfig(config);
                setIsConfigModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs transition-all cursor-pointer shadow-sm active:scale-95"
              title="แก้ไขชื่อร้านและเปลี่ยนรูปโลโก้"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>⚙️ แก้ไขชื่อร้าน & โลโก้</span>
            </button>

            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-sm active:scale-95"
              title="เพิ่มรูปภาพใบเมนูใหม่"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>➕ เพิ่มรูปเมนู</span>
            </button>

            <button
              onClick={onOpenCustomerView}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold rounded-xl text-xs transition-colors cursor-pointer border border-neutral-700"
              title="เปิดดูในมุมมองของลูกค้า (LINE)"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>ดูมุมมองลูกค้า</span>
            </button>

            <button
              onClick={onOpenLineShare}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#06C755] hover:bg-[#05b34c] text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
              title="ส่งลิงก์ให้ลูกค้าทาง LINE"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>ส่งทาง LINE</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-5xl mx-auto px-4 pt-6">
        {/* Prominent Restaurant Profile & Quick Actions Hero Card */}
        <div className="mb-6 p-5 rounded-3xl bg-neutral-900/80 border border-neutral-800 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Logo Avatar (Clickable to edit) */}
              <div
                onClick={() => {
                  setTempConfig(config);
                  setIsConfigModalOpen(true);
                }}
                className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-neutral-800 border-2 border-amber-500/40 overflow-hidden shrink-0 shadow-lg cursor-pointer group"
                title="คลิกเพื่อเปลี่ยนรูปโลโก้"
              >
                {config.logoUrl ? (
                  <img
                    src={config.logoUrl}
                    alt={config.restaurantName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-amber-500/10 text-amber-400 text-2xl font-bold">
                    {config.restaurantName ? config.restaurantName.charAt(0) : 'R'}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[10px] text-amber-300 transition-opacity font-medium">
                  <Edit2 className="w-4 h-4 mb-0.5" />
                  <span>เปลี่ยน</span>
                </div>
              </div>

              {/* Restaurant Details */}
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-neutral-100">
                    {config.restaurantName || 'ชื่อร้านของคุณ'}
                  </h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                    ร้านของคุณ
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {config.tagline || 'อาหารอร่อย สดใหม่ บริการประทับใจ'}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-neutral-400">
                  {config.lineId && (
                    <span className="text-[#06C755] font-medium flex items-center gap-1">
                      LINE: {config.lineId}
                    </span>
                  )}
                  {config.phone && (
                    <span className="text-neutral-400">
                      โทร: {config.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action Buttons for Owner */}
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={() => {
                  setTempConfig(config);
                  setIsConfigModalOpen(true);
                }}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-2xl text-xs transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Settings className="w-4 h-4" />
                <span>⚙️ แก้ไขชื่อร้าน & โลโก้</span>
              </button>

              <button
                onClick={openAddModal}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>➕ เพิ่มรูปใบเมนู</span>
              </button>
            </div>
          </div>
        </div>

        {/* Menu Section Header */}
        <div className="mb-4 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-neutral-200 flex items-center gap-2">
              <span>📋 รายการใบเมนูอาหารของร้าน ({pages.length} หน้า)</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              สามารถกดเม้าส์ค้างไว้ที่ใบเมนูแล้วลากวางเพื่อเปลี่ยนลำดับได้ทันที
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenGitHubGuide}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-medium transition-colors cursor-pointer border border-neutral-700"
            >
              <Github className="w-3.5 h-3.5" />
              <span>คู่มือ GitHub & AI Studio</span>
            </button>

            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-md shadow-amber-500/10"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มรูปใบเมนู</span>
            </button>
          </div>
        </div>

        {/* Menu Pages List with Drag & Drop */}
        {pages.length === 0 ? (
          <div className="bg-neutral-900/40 border border-dashed border-neutral-800 rounded-3xl p-12 text-center">
            <p className="text-neutral-400 text-sm mb-4">ยังไม่มีรูปใบเมนูอาหารในระบบ</p>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มรูปใบเมนูแรกเลย</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {pages.map((page, index) => {
              const isDragging = draggedIndex === index;
              const isOver = dragOverIndex === index;

              return (
                <div
                  key={page.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`relative flex items-center gap-3 p-3.5 rounded-2xl border transition-all select-none ${
                    isDragging
                      ? 'opacity-40 bg-neutral-900 scale-[0.99] border-dashed border-amber-500'
                      : isOver
                      ? 'border-amber-400 bg-amber-500/10'
                      : 'bg-neutral-900/70 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {/* Drag Handle */}
                  <div
                    className="p-2 text-neutral-400 hover:text-neutral-200 cursor-grab active:cursor-grabbing shrink-0"
                    title="กดเม้าส์ค้างไว้แล้วลากเพื่อเปลี่ยนตำแหน่ง"
                  >
                    <GripVertical className="w-5 h-5" />
                  </div>

                  {/* Page Order Number Badge */}
                  <div className="w-7 h-7 rounded-xl bg-neutral-800 text-neutral-300 font-bold text-xs flex items-center justify-center shrink-0 border border-neutral-700">
                    {index + 1}
                  </div>

                  {/* Thumbnail */}
                  <div className="w-14 h-18 bg-neutral-800 rounded-xl overflow-hidden shrink-0 border border-neutral-700/60 shadow-sm relative group">
                    <img
                      src={page.imageUrl}
                      alt={page.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-neutral-100 truncate">
                        {page.title}
                      </h3>
                      {page.category && (
                        <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 shrink-0">
                          {page.category}
                        </span>
                      )}
                    </div>
                    {page.description && (
                      <p className="text-xs text-neutral-400 truncate mt-0.5">
                        {page.description}
                      </p>
                    )}
                    <span className="text-[10px] text-neutral-400 font-mono mt-1 block truncate max-w-xs">
                      {page.imageUrl.startsWith('data:') ? 'ไฟล์อัปโหลด' : page.imageUrl}
                    </span>
                  </div>

                  {/* Move Up/Down Controls (Convenient for mobile or quick sort) */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-20 disabled:hover:text-neutral-500 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
                      title="เลื่อนขึ้น"
                      aria-label="เลื่อนขึ้น"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveDown(index)}
                      disabled={index === pages.length - 1}
                      className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-20 disabled:hover:text-neutral-500 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
                      title="เลื่อนลง"
                      aria-label="เลื่อนลง"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Edit / Delete Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0 pl-1 border-l border-neutral-800">
                    <button
                      onClick={() => openEditModal(page)}
                      className="p-2 text-neutral-300 hover:text-amber-400 hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
                      title="แก้ไขข้อมูล"
                      aria-label="แก้ไขข้อมูล"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(page.id)}
                      className="p-2 text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                      title="ลบหน้านี้"
                      aria-label="ลบหน้านี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Backup & GitHub Export Tools */}
        <div className="mt-8 pt-6 border-t border-neutral-800">
          <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-neutral-200 mb-1 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-amber-400" />
              <span>สำรองข้อมูล & นำไปใช้กับ GitHub (ฟรี 100%)</span>
            </h3>
            <p className="text-xs text-neutral-400 mb-4">
              คุณสามารถส่งออกไฟล์ <code className="text-amber-300">menu-data.json</code> เพื่อนำไปใส่ในโฟลเดอร์ GitHub ของคุณได้ ทำให้ข้อมูลเมนูคงอยู่ถาวร
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleExportData}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium rounded-xl text-xs transition-colors cursor-pointer border border-neutral-700"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ดาวน์โหลด menu-data.json</span>
              </button>

              <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium rounded-xl text-xs transition-colors cursor-pointer border border-neutral-700">
                <Upload className="w-3.5 h-3.5" />
                <span>นำเข้าไฟล์ menu-data.json</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportData}
                />
              </label>
            </div>
          </div>
        </div>
      </main>

      {/* Add / Edit Menu Page Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-neutral-100 shadow-2xl max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold mb-1">
              {editingPage ? 'แก้ไขใบเมนู' : 'เพิ่มรูปใบเมนูใหม่'}
            </h3>
            <p className="text-xs text-neutral-400 mb-5">
              อัปโหลดรูปภาพใบเมนู (JPG, PNG) หรือใส่ลิงก์รูปภาพจาก GitHub
            </p>

            <form onSubmit={handleSavePage} className="space-y-4">
              {/* Image Source Mode Selector */}
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-2">
                  วิธีนำเข้ารูปใบเมนู
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setUploadMode('upload')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      uploadMode === 'upload'
                        ? 'bg-amber-500 text-neutral-950 border-amber-400'
                        : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>อัปโหลดไฟล์จากเครื่อง</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode('url')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      uploadMode === 'url'
                        ? 'bg-amber-500 text-neutral-950 border-amber-400'
                        : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>ใส่ URL จาก GitHub / เว็บ</span>
                  </button>
                </div>
              </div>

              {/* Upload input or URL input */}
              {uploadMode === 'upload' ? (
                <div>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-neutral-700 hover:border-amber-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-neutral-950/40"
                  >
                    <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-neutral-200">
                      คลิกเพื่อเลือกไฟล์รูปภาพใบเมนู (JPG, PNG)
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      รองรับไฟล์รูปภาพความละเอียดสูง
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-medium text-neutral-400 block mb-1">
                    URL รูปภาพ (เช่น GitHub Raw URL หรือ Image URL)
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setImagePreview(e.target.value);
                    }}
                    placeholder="https://raw.githubusercontent.com/.../menu.jpg"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-100 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              )}

              {/* Image Preview */}
              {imagePreview && (
                <div className="flex items-center gap-3 p-3 bg-neutral-950/60 rounded-xl border border-neutral-800">
                  <div className="w-16 h-20 bg-neutral-800 rounded-lg overflow-hidden shrink-0">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-xs">
                    <p className="text-neutral-200 font-medium">รูปภาพที่เลือกพร้อมใช้งาน</p>
                    <p className="text-neutral-400 text-[11px] mt-0.5">
                      ขนาดจะปรับพอดีหน้าจอลูกค้าโดยอัตโนมัติ
                    </p>
                  </div>
                </div>
              )}

              {/* Title Input */}
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  ชื่อหน้าเมนู <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={pageTitle}
                  onChange={(e) => setPageTitle(e.target.value)}
                  placeholder="เช่น หน้า 1: อาหารแนะนำ หรือ จานหลัก"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Category Input */}
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  หมวดหมู่อาหาร (ไม่บังคับ)
                </label>
                <input
                  type="text"
                  value={pageCategory}
                  onChange={(e) => setPageCategory(e.target.value)}
                  placeholder="เช่น อาหารจานด่วน, ต้มยำ, ของหวาน"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  คำอธิบายหรือรายการอาหารเด่น (ไม่บังคับ)
                </label>
                <input
                  type="text"
                  value={pageDescription}
                  onChange={(e) => setPageDescription(e.target.value)}
                  placeholder="เช่น กะเพราถาด, ต้มยำกุ้งน้ำข้น, ผัดไทยโบราณ"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              {formError && (
                <div className="flex items-center gap-1.5 text-rose-400 text-xs bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md"
                >
                  {editingPage ? 'บันทึกการแก้ไข' : 'เพิ่มใบเมนู'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-neutral-100 shadow-2xl text-center">
            <div className="w-12 h-12 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold mb-1">ยืนยันการลบใบเมนูนี้?</h3>
            <p className="text-xs text-neutral-400 mb-5">
              เมื่อลบแล้วรูปภาพจะหายไปจากรายการของลูกค้า
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-medium transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleDeletePage(deleteConfirmId)}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                ลบใบเมนู
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restaurant Settings & PIN Modal */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-neutral-100 shadow-2xl">
            <button
              onClick={() => setIsConfigModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold mb-1">ตั้งค่าชื่อร้านและรูปโลโก้</h3>
            <p className="text-xs text-neutral-400 mb-5">
              แก้ไขชื่อร้าน รูปโลโก้ และข้อมูลติดต่อที่แสดงให้ลูกค้าเห็น
            </p>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              {/* Logo Section */}
              <div className="p-3.5 bg-neutral-950/60 border border-neutral-800 rounded-2xl">
                <label className="text-xs font-semibold text-amber-400 block mb-2">
                  รูปโลโก้ร้าน (Logo)
                </label>
                
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-14 h-14 rounded-2xl bg-neutral-800 border-2 border-neutral-700 overflow-hidden shrink-0 flex items-center justify-center shadow-inner">
                    {tempConfig.logoUrl ? (
                      <img
                        src={tempConfig.logoUrl}
                        alt="Logo Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-base font-bold text-neutral-400">
                        {tempConfig.restaurantName ? tempConfig.restaurantName.charAt(0) : 'R'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 text-xs">
                    <p className="text-neutral-200 font-medium">ตัวอย่างโลโก้</p>
                    <p className="text-[11px] text-neutral-400">
                      แสดงบนแถบหัวเว็บของทั้งลูกค้าและเจ้าของร้าน
                    </p>
                    {tempConfig.logoUrl && (
                      <button
                        type="button"
                        onClick={() => setTempConfig((prev) => ({ ...prev, logoUrl: undefined }))}
                        className="text-[11px] text-rose-400 hover:text-rose-300 mt-1 cursor-pointer block"
                      >
                        ลบรูปโลโก้ (ใช้ตัวอักษรย่อแทน)
                      </button>
                    )}
                  </div>
                </div>

                {/* Logo input mode toggle */}
                <div className="grid grid-cols-2 gap-1.5 mb-2.5">
                  <button
                    type="button"
                    onClick={() => setLogoUploadMode('upload')}
                    className={`py-1.5 px-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1 border transition-colors cursor-pointer ${
                      logoUploadMode === 'upload'
                        ? 'bg-amber-500 text-neutral-950 border-amber-400 font-semibold'
                        : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-800'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>อัปโหลดรูปโลโก้</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogoUploadMode('url')}
                    className={`py-1.5 px-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1 border transition-colors cursor-pointer ${
                      logoUploadMode === 'url'
                        ? 'bg-amber-500 text-neutral-950 border-amber-400 font-semibold'
                        : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-800'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>ใส่ URL จาก GitHub</span>
                  </button>
                </div>

                {logoUploadMode === 'upload' ? (
                  <div>
                    <button
                      type="button"
                      onClick={() => logoFileInputRef.current?.click()}
                      className="w-full py-2.5 px-3 bg-neutral-900 hover:bg-neutral-800 border border-dashed border-neutral-700 hover:border-amber-500 rounded-xl text-xs text-neutral-300 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>เลือกไฟล์รูปโลโก้จากเครื่อง (JPG/PNG)</span>
                    </button>
                    <input
                      ref={logoFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoFileChange}
                    />
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      value={tempConfig.logoUrl || ''}
                      onChange={(e) =>
                        setTempConfig((prev) => ({ ...prev, logoUrl: e.target.value }))
                      }
                      placeholder="https://raw.githubusercontent.com/.../logo.png"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Restaurant Name */}
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  ชื่อร้านอาหาร <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={tempConfig.restaurantName}
                  onChange={(e) =>
                    setTempConfig({ ...tempConfig, restaurantName: e.target.value })
                  }
                  placeholder="เช่น ร้านอาหารบ้านคุณยาย หรือ Baan Thai Kitchen"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-100 focus:outline-none focus:border-amber-400 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  สโลแกน / คำโปรยสั้นๆ
                </label>
                <input
                  type="text"
                  value={tempConfig.tagline}
                  onChange={(e) =>
                    setTempConfig({ ...tempConfig, tagline: e.target.value })
                  }
                  placeholder="เช่น อร่อย สะอาด บริการประทับใจ"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#06C755] block mb-1">
                  LINE ID ของร้าน (สำหรับให้ลูกค้ากดสั่งอาหาร)
                </label>
                <input
                  type="text"
                  value={tempConfig.lineId}
                  onChange={(e) =>
                    setTempConfig({ ...tempConfig, lineId: e.target.value })
                  }
                  placeholder="เช่น @myrestaurant"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  เบอร์โทรศัพท์ร้าน
                </label>
                <input
                  type="tel"
                  value={tempConfig.phone}
                  onChange={(e) =>
                    setTempConfig({ ...tempConfig, phone: e.target.value })
                  }
                  placeholder="เช่น 081-234-5678"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-amber-400 block mb-1">
                  รหัส PIN ป้องกันลูกค้าเข้าหน้าแอดมิน (4 หลัก)
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={tempConfig.adminPin}
                  onChange={(e) =>
                    setTempConfig({ ...tempConfig, adminPin: e.target.value })
                  }
                  placeholder="ค่าเริ่มต้น: 1234"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-400 font-mono"
                />
                <p className="text-[11px] text-neutral-400 mt-1">
                  ใช้เมื่อกดไอคอนแม่กุญแจเพื่อปลดล็อกหน้าจัดการ
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                >
                  ปิด
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  {configSaved ? <Check className="w-3.5 h-3.5" /> : null}
                  <span>{configSaved ? 'บันทึกเรียบร้อย!' : 'บันทึกการตั้งค่า'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
