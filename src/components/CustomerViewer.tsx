import { useState, useRef, useEffect, useCallback } from 'react';
import type { MenuPage, RestaurantConfig } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Phone,
  MessageCircle,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';

interface CustomerViewerProps {
  pages: MenuPage[];
  config: RestaurantConfig;
  onOpenAdmin: () => void;
  isAdminUnlocked?: boolean;
}

export function CustomerViewer({
  pages,
  config,
  onOpenAdmin,
}: CustomerViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDistance, setTouchDistance] = useState<number | null>(null);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [imageError, setImageError] = useState<Record<string, boolean>>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const currentPage = pages[currentIndex] || pages[0];

  // Reset zoom and pan when changing page
  useEffect(() => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (pages.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % pages.length);
  }, [pages.length]);

  const handlePrev = useCallback(() => {
    if (pages.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + pages.length) % pages.length);
  }, [pages.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') {
        setZoomLevel(1);
        setPanPosition({ x: 0, y: 0 });
        if (isFullscreen) document.exitFullscreen?.().catch(() => {});
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, isFullscreen]);

  // Touch handlers for mobile swipe and pinch-to-zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setTouchStartX(e.touches[0].clientX);
      if (zoomLevel > 1) {
        setIsPanning(true);
        setStartPan({
          x: e.touches[0].clientX - panPosition.x,
          y: e.touches[0].clientY - panPosition.y,
        });
      }
    } else if (e.touches.length === 2) {
      // Pinch to zoom start
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setTouchDistance(dist);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && zoomLevel > 1 && isPanning) {
      setPanPosition({
        x: e.touches[0].clientX - startPan.x,
        y: e.touches[0].clientY - startPan.y,
      });
    } else if (e.touches.length === 2 && touchDistance !== null) {
      const newDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const diff = newDist - touchDistance;
      if (Math.abs(diff) > 5) {
        const factor = diff > 0 ? 1.05 : 0.95;
        setZoomLevel((prev) => Math.min(Math.max(1, prev * factor), 4));
        setTouchDistance(newDist);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX !== null && zoomLevel === 1 && e.changedTouches.length === 1) {
      const touchEndX = e.changedTouches[0].clientX;
      const diffX = touchStartX - touchEndX;
      if (Math.abs(diffX) > 45) {
        if (diffX > 0) handleNext();
        else handlePrev();
      }
    }
    setTouchStartX(null);
    setTouchDistance(null);
    setIsPanning(false);
  };

  // Mouse pan handlers for desktop zoom
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsPanning(true);
      setStartPan({
        x: e.clientX - panPosition.x,
        y: e.clientY - panPosition.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && zoomLevel > 1) {
      setPanPosition({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPanPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  if (!pages || pages.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-6 text-center">
        <Sparkles className="w-12 h-12 text-amber-400 mb-4 animate-pulse" />
        <h2 className="text-xl font-bold mb-2">ยังไม่มีรูปใบเมนูอาหาร</h2>
        <p className="text-sm text-neutral-400 max-w-sm mb-6">
          กรุณาเข้าสู่ระบบจัดการเพื่อเพิ่มรูปภาพใบเมนูของทางร้าน
        </p>
        <button
          onClick={onOpenAdmin}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold rounded-xl text-sm transition-colors cursor-pointer"
        >
          เปิดระบบจัดการ (สำหรับเจ้าของร้าน)
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col h-screen w-screen bg-neutral-950 text-neutral-100 select-none overflow-hidden touch-none"
    >
      {/* Top Customer Header Bar (Minimal, clean, restaurant branding only) */}
      <header className="relative z-20 flex items-center justify-between px-3 py-2.5 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800/80">
        <div className="flex items-center gap-2.5 min-w-0">
          {config.logoUrl ? (
            <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 overflow-hidden shrink-0 shadow-sm">
              <img
                src={config.logoUrl}
                alt={config.restaurantName || 'โลโก้ร้าน'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback if logo fails to load
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400 font-bold text-xs">
              {config.restaurantName ? config.restaurantName.charAt(0) : 'R'}
            </div>
          )}
          <div className="truncate">
            <h1 className="text-sm font-semibold text-neutral-100 truncate">
              {config.restaurantName || 'ใบเมนูอาหาร'}
            </h1>
            <p className="text-[11px] text-neutral-400 truncate">
              {currentPage?.title || config.tagline}
            </p>
          </div>
        </div>

        {/* Header Right: Page Counter & Hidden Admin Unlock Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          {pages.length > 1 && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-neutral-800/80 text-neutral-300 border border-neutral-700/50">
              {currentIndex + 1} / {pages.length}
            </span>
          )}

          {/* Discreet Admin Lock Button for Shop Owner (Discreet so normal customers won't notice) */}
          <button
            onClick={onOpenAdmin}
            title="สำหรับเจ้าของร้าน (Admin Login)"
            className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 rounded-lg transition-colors cursor-pointer"
            aria-label="Admin Settings"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Menu Image Viewer Canvas */}
      <main
        className="relative flex-1 flex items-center justify-center overflow-hidden bg-neutral-950"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* The Menu JPG Image */}
        <div
          className={`relative max-w-full max-h-full flex items-center justify-center transition-transform ${
            isPanning ? 'cursor-grabbing duration-0' : 'duration-150'
          }`}
          style={{
            transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
            cursor: zoomLevel > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default',
          }}
        >
          {!imageError[currentPage.id] ? (
            <img
              ref={imageRef}
              src={currentPage.imageUrl}
              alt={currentPage.title}
              referrerPolicy="no-referrer"
              className="max-h-[calc(100vh-125px)] max-w-full object-contain shadow-2xl rounded-sm pointer-events-none transition-opacity duration-300"
              onError={() => {
                setImageError((prev) => ({ ...prev, [currentPage.id]: true }));
              }}
              draggable={false}
            />
          ) : (
            <div className="w-[320px] sm:w-[420px] aspect-[3/4] bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col items-center justify-center p-6 text-center">
              <span className="text-4xl mb-3">📄</span>
              <p className="text-sm font-semibold text-neutral-200 mb-1">{currentPage.title}</p>
              <p className="text-xs text-neutral-400 mb-4">
                ไม่สามารถโหลดรูปภาพจากลิงก์ได้ กรุณาตรวจสอบ URL หรืออัปโหลดไฟล์ใหม่
              </p>
              <span className="text-[10px] text-neutral-400 bg-neutral-800 px-2 py-1 rounded max-w-full truncate">
                {currentPage.imageUrl}
              </span>
            </div>
          )}
        </div>

        {/* Previous / Next Desktop Navigation Arrows */}
        {pages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-neutral-900/80 hover:bg-neutral-800 active:scale-95 text-neutral-200 border border-neutral-700/50 flex items-center justify-center backdrop-blur-md shadow-lg transition-all z-10 cursor-pointer"
              aria-label="หน้าก่อนหน้า"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-neutral-900/80 hover:bg-neutral-800 active:scale-95 text-neutral-200 border border-neutral-700/50 flex items-center justify-center backdrop-blur-md shadow-lg transition-all z-10 cursor-pointer"
              aria-label="หน้าถัดไป"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Floating Zoom Controls for Customers */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5 bg-neutral-900/85 backdrop-blur-md border border-neutral-800/80 p-1.5 rounded-2xl shadow-xl">
          <button
            onClick={handleZoomIn}
            className="p-2 text-neutral-300 hover:text-white hover:bg-neutral-800 active:scale-90 rounded-xl transition-all cursor-pointer"
            title="ขยาย (Zoom In)"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 text-neutral-300 hover:text-white hover:bg-neutral-800 active:scale-90 rounded-xl transition-all cursor-pointer"
            title="ย่อ (Zoom Out)"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          {zoomLevel > 1 && (
            <button
              onClick={handleResetZoom}
              className="p-2 text-amber-400 hover:bg-neutral-800 active:scale-90 rounded-xl transition-all cursor-pointer"
              title="ขนาดปกติ (Reset Zoom)"
              aria-label="Reset zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={toggleFullscreen}
            className="p-2 text-neutral-300 hover:text-white hover:bg-neutral-800 active:scale-90 rounded-xl transition-all cursor-pointer hidden sm:block"
            title="เต็มจอ (Fullscreen)"
            aria-label="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Hint banner for swipe/pinch when user opens on mobile */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <div className="px-2.5 py-1 rounded-full bg-neutral-900/70 backdrop-blur-sm border border-neutral-800/60 text-[11px] text-neutral-400 flex items-center gap-1.5">
            <span>แตะซูม หรือ ปัดซ้าย-ขวา เพื่อเปลี่ยนหน้า</span>
          </div>
        </div>
      </main>

      {/* Thumbnails Drawer (When multiple pages exist) */}
      {showThumbnails && pages.length > 1 && (
        <div className="relative z-20 bg-neutral-900/95 backdrop-blur-lg border-t border-neutral-800 p-3 max-h-28 overflow-x-auto flex items-center gap-2.5 animate-in slide-in-from-bottom-4 duration-150 scrollbar-none">
          {pages.map((page, idx) => (
            <button
              key={page.id}
              onClick={() => {
                setCurrentIndex(idx);
                setShowThumbnails(false);
              }}
              className={`shrink-0 flex items-center gap-2 p-1.5 rounded-xl border transition-all cursor-pointer ${
                idx === currentIndex
                  ? 'border-amber-400 bg-amber-500/10'
                  : 'border-neutral-800 hover:border-neutral-700 bg-neutral-950/60'
              }`}
            >
              <div className="w-10 h-14 bg-neutral-800 rounded overflow-hidden shrink-0">
                <img
                  src={page.imageUrl}
                  alt={page.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left pr-2">
                <p className="text-xs font-semibold text-neutral-200 line-clamp-1">{page.title}</p>
                <p className="text-[10px] text-neutral-400">หน้า {idx + 1}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Bottom Floating Bar: Quick Jump, Thumbnails, & Order/Contact LINE */}
      <footer className="relative z-20 flex items-center justify-between px-3 py-2 bg-neutral-950/95 backdrop-blur-md border-t border-neutral-800/80">
        {/* Thumbnails toggle */}
        <button
          onClick={() => setShowThumbnails(!showThumbnails)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors cursor-pointer ${
            showThumbnails
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>ทุกหน้า ({pages.length})</span>
        </button>

        {/* Quick Page Indicator Dots for Mobile */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-[140px] px-2 py-1">
          {pages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentIndex
                  ? 'w-5 bg-amber-400'
                  : 'w-1.5 bg-neutral-700 hover:bg-neutral-500'
              }`}
              aria-label={`ไปหน้า ${idx + 1}`}
            />
          ))}
        </div>

        {/* Contact/Order via LINE CTA */}
        <div className="flex items-center gap-2">
          {config.lineId && (
            <a
              href={`https://line.me/R/ti/p/~${config.lineId.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#06C755] hover:bg-[#05b34c] text-white font-medium text-xs rounded-xl shadow-sm transition-transform active:scale-95"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>สั่งทาง LINE</span>
            </a>
          )}
          {config.phone && (
            <a
              href={`tel:${config.phone.replace(/[^0-9]/g, '')}`}
              className="p-1.5 bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white rounded-xl transition-colors"
              title={`โทร ${config.phone}`}
            >
              <Phone className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </footer>
    </div>
  );
}
