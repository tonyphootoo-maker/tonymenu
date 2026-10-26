import { useState } from 'react';
import { Lock, X, ArrowRight, KeyRound } from 'lucide-react';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  correctPin: string;
}

export function PinModal({ isOpen, onClose, onSuccess, correctPin }: PinModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pin === correctPin || (!correctPin && pin === '1234')) {
      setError(false);
      setPin('');
      onSuccess();
    } else {
      setError(true);
      setPin('');
    }
  };

  const handleKeyPress = (num: string) => {
    if (pin.length < 6) {
      const nextPin = pin + num;
      setPin(nextPin);
      setError(false);
      if (nextPin === correctPin || (!correctPin && nextPin === '1234')) {
        setTimeout(() => {
          setPin('');
          onSuccess();
        }, 150);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-neutral-100 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
          aria-label="ปิด"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold">เข้าสู่ระบบจัดการเมนู</h3>
          <p className="text-xs text-neutral-400 mt-1">
            ใส่รหัส PIN เพื่อเปิดโหมดเจ้าของร้าน (ค่าเริ่มต้น: 1234)
          </p>
        </div>

        {/* PIN Dots */}
        <div className="flex justify-center items-center gap-3 mb-6">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-3.5 h-3.5 rounded-full border transition-all ${
                pin.length > idx
                  ? 'bg-amber-400 border-amber-400 scale-110 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                  : 'border-neutral-700 bg-neutral-800'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs text-rose-400 text-center mb-4 font-medium animate-shake">
            รหัส PIN ไม่ถูกต้อง (ลองพิมพ์ 1234)
          </p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyPress(digit)}
              className="h-13 rounded-2xl bg-neutral-800/80 hover:bg-neutral-700 active:scale-95 text-lg font-semibold text-neutral-100 flex items-center justify-center transition-all cursor-pointer border border-neutral-700/50"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleDelete}
            className="h-13 rounded-2xl bg-neutral-800/40 hover:bg-neutral-800 active:scale-95 text-xs font-medium text-neutral-400 flex items-center justify-center transition-all cursor-pointer"
          >
            ลบ
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="h-13 rounded-2xl bg-neutral-800/80 hover:bg-neutral-700 active:scale-95 text-lg font-semibold text-neutral-100 flex items-center justify-center transition-all cursor-pointer border border-neutral-700/50"
          >
            0
          </button>
          <button
            type="button"
            onClick={() => handleSubmit()}
            className="h-13 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-neutral-950 font-bold flex items-center justify-center transition-all cursor-pointer"
            aria-label="ยืนยัน"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center pt-2 border-t border-neutral-800/80">
          <span className="text-[11px] text-neutral-400 flex items-center justify-center gap-1">
            <KeyRound className="w-3 h-3 text-neutral-400" />
            รหัส PIN เริ่มต้นจากโรงงานคือ 1234
          </span>
        </div>
      </div>
    </div>
  );
}
