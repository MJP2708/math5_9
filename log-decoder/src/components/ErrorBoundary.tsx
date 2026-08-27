// กันชนสุดท้าย (last-resort safety net) กรณีมี error ที่ไม่คาดคิดหลุดรอดมาถึง React
// เสริมจาก Result<T> แบบ typed error ที่ใช้ทั่ว engine — อันนี้ป้องกันไม่ให้จอว่างเปล่า
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ERRORS_TH } from '../strings';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // เก็บ log ไว้ใน console สำหรับดีบัก (ไม่ใช่ทางเดียวที่ผู้ใช้เห็น error)
    console.error('Log-Decoder error boundary:', error, info);
  }

  reset = () => this.setState({ hasError: false });

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-6 text-center">
          <div className="max-w-md rounded-xl border border-[var(--danger)] bg-[var(--bg-panel)] p-8">
            <h1 className="mb-3 text-xl font-semibold text-[var(--danger)]">{ERRORS_TH.boundaryTitle}</h1>
            <p className="mb-6 text-[var(--text-dim)]">{ERRORS_TH.boundaryBody}</p>
            <button
              type="button"
              onClick={this.reset}
              className="rounded-lg border border-[var(--accent)] px-4 py-2 font-mono-th text-[var(--accent)] hover:bg-[var(--accent)]/10"
            >
              {ERRORS_TH.boundaryReset}
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
