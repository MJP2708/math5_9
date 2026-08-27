// ประเภทข้อมูลร่วมสำหรับ Feature 2 (เครื่องคิดเลขมาตราส่วนโลกจริง)
export interface WorkingStep {
  labelTh: string;
  detailTh: string;
}

export interface ScaleResult {
  value: number;
  steps: WorkingStep[];
}

export interface CompareResult {
  ratio: number;
  steps: WorkingStep[];
  summaryTh: string;
}
