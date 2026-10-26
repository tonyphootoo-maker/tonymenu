import { useState, useEffect } from 'react';
import { X, Copy, Check, MessageSquare, Download, Share2 } from 'lucide-react';
import QRCode from 'qrcode';

interface LineShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantName: string;
  customerUrl: string;
}

export function LineShareModal({
  isOpen,
  onClose,
  restaurantName,
  customerUrl,
}: LineShareModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const lineTemplateMessage = `สวัสดีค่ะ ร้าน ${restaurantName} ขอส่งใบเมนูอาหารให้เลือกชมนะคะ 🍽️✨

กดดูใบเมนูอาหารได้ที่ลิงก์นี้เลยค่ะ:
${customerUrl}

(สามารถเลื่อนดูทีละหน้า และซูมดูราคาอาหารได้อย่างคมชัดค่ะ)`;

  useEffect(() => {
    if (customerUrl) {
      QRCode.toDataURL(customerUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR code error:', err));
    }
  }, [customerUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(customerUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(lineTemplateMessage);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `menu-qr-${restaurantName || 'shop'}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 font-['Sarabun',sans-serif]">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-neutral-100 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors cursor-pointer"
          aria-label="ปิด"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 bg-[#06C755]/15 text-[#06C755] rounded-2xl flex items-center justify-center shrink-0">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">ส่งใบเมนูให้ลูกค้าทาง LINE</h3>
            <p className="text-xs text-neutral-400">
              คัดลอกลิงก์หรือข้อความสำเร็จรูป เพื่อส่งในห้องแชท LINE ได้ทันที
            </p>
          </div>
        </div>

        {/* Section 1: Customer Link */}
        <div className="bg-neutral-950/70 border border-neutral-800 rounded-2xl p-4 mb-4">
          <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
            1. ลิงก์สำหรับลูกค้า (ไม่มีปุ่มแก้ไข)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={customerUrl}
              className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 select-all font-mono"
            />
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold rounded-xl text-xs transition-colors shrink-0 cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'คัดลอกแล้ว!' : 'คัดลอกลิงก์'}</span>
            </button>
          </div>
          <p className="text-[11px] text-neutral-400 mt-2">
            ลูกค้าเปิดลิงก์นี้จะเห็นเฉพาะรูปใบเมนูเท่านั้น ไม่เห็นแถบแก้ไขหรือปุ่มจัดการใดๆ
          </p>
        </div>

        {/* Section 2: Ready-to-Send LINE message template */}
        <div className="bg-neutral-950/70 border border-neutral-800 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-[#06C755] flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              2. ข้อความพร้อมส่งทาง LINE (คัดลอกแล้วส่งได้เลย)
            </label>
            <button
              onClick={handleCopyMessage}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded-lg transition-colors cursor-pointer"
            >
              {copiedMsg ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedMsg ? 'คัดลอกแล้ว!' : 'คัดลอกข้อความ'}</span>
            </button>
          </div>
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-300 whitespace-pre-line leading-relaxed font-sans">
            {lineTemplateMessage}
          </div>
        </div>

        {/* Section 3: QR Code Generator */}
        <div className="bg-neutral-950/70 border border-neutral-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
          {qrDataUrl && (
            <div className="bg-white p-2.5 rounded-2xl shrink-0 shadow-md">
              <img src={qrDataUrl} alt="Menu QR Code" className="w-28 h-28" />
            </div>
          )}
          <div className="flex-1 text-center sm:text-left">
            <h4 className="text-sm font-semibold mb-1">QR Code ใบเมนู</h4>
            <p className="text-xs text-neutral-400 mb-3">
              สามารถดาวน์โหลดภาพ QR Code ไปพิมพ์ตั้งหน้าร้าน ติดโต๊ะอาหาร หรือส่งรูปทาง LINE ให้ลูกค้าสแกนได้
            </p>
            <button
              onClick={handleDownloadQR}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium rounded-xl text-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              ดาวน์โหลดรูป QR Code (.PNG)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
