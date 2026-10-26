import { useState } from 'react';
import { X, Copy, Check, Github, ExternalLink, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';

interface GitHubDeployGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GitHubDeployGuide({ isOpen, onClose }: GitHubDeployGuideProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const englishPromptForAIStudio = `Build a professional, mobile-first Restaurant Menu Web App designed specifically to share with customers over the LINE messaging app and deploy 100% free on GitHub Pages without any white screen issues.

Key Requirements:
1. Customer View (Default & Link View):
   - Customers only see high-resolution restaurant menu JPG pages in a clean, distraction-free viewer.
   - Zero admin controls, edit buttons, or delete icons visible to customers.
   - Smooth swipe gestures for changing pages, pinch-to-zoom / pan to read dish prices, full-screen mode, and page indicator dots.
   - Fast thumbnail drawer to jump between pages.
   - Direct button to order or contact the restaurant via LINE app or phone.

2. Owner / Admin Management Mode:
   - Protected by a 4-digit PIN lock (default: 1234) or secret URL parameter (?admin=true).
   - Customize Restaurant Name and upload/set custom Restaurant Logo image (displayed in both Customer and Admin headers).
   - Add new menu pages by uploading JPG/PNG images or entering direct GitHub raw image URLs.
   - Edit menu page titles, categories, and descriptions.
   - Delete menu pages with confirmation.
   - Drag & Drop reordering: Users can click and hold (or touch-drag) to reorder menu pages freely.
   - Up/Down fallback buttons for quick reordering on mobile screens.

3. GitHub Integration & 100% Free Hosting:
   - Support storing images in GitHub repository and referencing them via GitHub raw URLs or relative paths.
   - 1-click Export menu-data.json so owners can save their menu list directly to GitHub.
   - 1-click Import menu-data.json to restore.

4. Zero White Screen (No Blank Page) Guarantee on GitHub Pages:
   - In vite.config.ts, configure 'base: ./' so assets load correctly under github.io/repo-name/.
   - Do not use HTML5 browser history routing that causes 404/blank screen on refresh; use state/hash/query routing.
   - Include a robust Error Boundary to catch any image or network failures without crashing.
   - Provide a complete GitHub Actions deployment workflow file for automated GitHub Pages hosting.`;

  const githubActionYaml = `name: Deploy Line Menu to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 font-['Sarabun',sans-serif]">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-neutral-100 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors cursor-pointer"
          aria-label="ปิด"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-neutral-800 border border-neutral-700 rounded-2xl flex items-center justify-center shrink-0 text-white">
            <Github className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">คู่มือ GitHub & โค้ดคำสั่ง Google AI Studio</h3>
            <p className="text-xs text-neutral-400">
              วิธีนำขึ้น GitHub Pages ฟรี 100% และเทคนิคป้องกันอาการจอขาวเด็ดขาด
            </p>
          </div>
        </div>

        {/* Section 1: English Prompt for AI Studio */}
        <div className="bg-neutral-950/80 border border-amber-500/30 rounded-2xl p-4 mb-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
              <Sparkles className="w-4 h-4" />
              <span>โค้ดคำสั่งภาษาอังกฤษสำหรับ Google AI Studio (English Prompt)</span>
            </div>
            <button
              onClick={() => copyToClipboard(englishPromptForAIStudio, 'prompt')}
              className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              {copiedSection === 'prompt' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'prompt' ? 'คัดลอกแล้ว' : 'คัดลอก Prompt'}</span>
            </button>
          </div>
          <p className="text-xs text-neutral-400 mb-2">
            นำคำสั่งนี้ไปใส่ใน Google AI Studio เพื่อสร้างแอปพลิเคชันรูปแบบนี้ได้ฟรีทุกขั้นตอน:
          </p>
          <pre className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-300 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-48">
            {englishPromptForAIStudio}
          </pre>
        </div>

        {/* Section 2: Why White Screen happens and how we prevent it */}
        <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-4 mb-5">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold mb-2">
            <ShieldAlert className="w-4 h-4" />
            <span>3 กฎเหล็ก ป้องกันอาการจอขาว (White Screen) หลัง Deploy บน GitHub Pages</span>
          </div>
          <div className="space-y-2.5 text-xs text-neutral-300">
            <div className="flex gap-2">
              <span className="w-5 h-5 rounded-full bg-neutral-800 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
              <div>
                <strong className="text-white">ตั้งค่า Base Path เป็น Relative (<code className="text-amber-400">base: './'</code>) ใน vite.config.ts:</strong>
                <p className="text-neutral-400 mt-0.5">
                  เพราะ GitHub Pages จะมีชื่อ Repository ต่อท้าย เช่น <code className="text-neutral-300">username.github.io/my-menu/</code> หากไม่ตั้ง base เป็น <code className="text-amber-400">'./'</code> เบราว์เซอร์จะหาไฟล์ index.js ไม่เจอจนเกิดจอขาว (โปรเจกต์นี้ตั้งค่าให้แล้วเรียบร้อย)
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <span className="w-5 h-5 rounded-full bg-neutral-800 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
              <div>
                <strong className="text-white">ไม่ใช้ BrowserRouter ของ React Router:</strong>
                <p className="text-neutral-400 mt-0.5">
                  บน GitHub Pages การกดรีเฟรชหรือเปิดลิงก์ย่อยผ่าน BrowserRouter จะทำให้เซิร์ฟเวอร์ส่ง 404 Not Found แล้วจอขาว แอปนี้จึงใช้ Safe State Routing ที่ทำงานได้ 100% ไม่ว่าผู้ใช้จะรีเฟรชหน้ากี่ครั้ง
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <span className="w-5 h-5 rounded-full bg-neutral-800 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
              <div>
                <strong className="text-white">มี Error Boundary ป้องกันโค้ดพัง:</strong>
                <p className="text-neutral-400 mt-0.5">
                  หากรูปภาพใน GitHub หายไปหรืออินเทอร์เน็ตสะดุด ระบบจะมีกรอบแจ้งเตือนพร้อมปุ่มโหลดใหม่ทันที จะไม่มีอาการหน้าจอขาวล้วนเด็ดขาด
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: How to Store Menu JPGs in GitHub */}
        <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-4 mb-5">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold mb-2">
            <BookOpen className="w-4 h-4" />
            <span>วิธีเก็บรูปใบเมนูไว้ใน GitHub เพื่อส่งให้ลูกค้า</span>
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-xs text-neutral-300 leading-relaxed">
            <li>สร้างโฟลเดอร์ชื่อ <code className="text-amber-300">public/menu/</code> ใน Repository บน GitHub</li>
            <li>อัปโหลดไฟล์รูปใบเมนู เช่น <code className="text-amber-300">page1.jpg</code>, <code className="text-amber-300">page2.jpg</code> เข้าไป</li>
            <li>
              นำลิงก์รูป Raw URL จาก GitHub มาใส่ในหน้าจัดการเมนู เช่น:
              <br />
              <code className="text-[11px] text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded break-all mt-1 inline-block">
                https://raw.githubusercontent.com/ชื่อคุณ/ชื่อโปรเจกต์/main/public/menu/page1.jpg
              </code>
            </li>
            <li>หรืออัปโหลดรูปผ่านแอปนี้ได้โดยตรง ระบบจะเก็บไว้ในความจำเบราว์เซอร์ให้ทันที</li>
          </ol>
        </div>

        {/* Section 4: GitHub Actions Workflow */}
        <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-neutral-200">
              ไฟล์ Deploy อัตโนมัติ (.github/workflows/deploy.yml)
            </span>
            <button
              onClick={() => copyToClipboard(githubActionYaml, 'workflow')}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded-lg transition-colors cursor-pointer"
            >
              {copiedSection === 'workflow' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'workflow' ? 'คัดลอกแล้ว' : 'คัดลอก YAML'}</span>
            </button>
          </div>
          <pre className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-[11px] text-neutral-400 font-mono overflow-x-auto max-h-36">
            {githubActionYaml}
          </pre>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[11px] text-neutral-400">
              สร้างไฟล์นี้บน GitHub จากนั้นไปที่ Settings &gt; Pages &gt; Source เลือก GitHub Actions
            </span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-amber-400 hover:underline"
            >
              เปิด GitHub <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
