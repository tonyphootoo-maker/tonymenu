import { Component, type ReactNode, type ErrorInfo } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6 font-['Sarabun',sans-serif]">
          <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-center shadow-2xl">
            <div className="w-14 h-14 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold mb-2">เกิดข้อผิดพลาดในการโหลดระบบ</h2>
            <p className="text-sm text-neutral-400 mb-6">
              ระบบป้องกันจอขาว (White Screen Prevention) ทำงานอัตโนมัติ
              คุณสามารถกดปุ่มด้านล่างเพื่อเริ่มการทำงานใหม่ได้ทันที
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReload}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold rounded-xl transition-colors cursor-pointer text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                รีเฟรชหน้าเว็บ
              </button>
              <button
                onClick={this.handleReset}
                className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium rounded-xl transition-colors cursor-pointer text-sm"
              >
                ล้างข้อมูลชั่วคราว
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
