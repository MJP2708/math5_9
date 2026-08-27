// ข้อมูลอ้างอิงสำหรับแถบเทียบระดับ (scale strip) ของแต่ละมาตราส่วนโลกจริง
export interface ReferencePoint {
  labelTh: string;
  value: number;
}

export const RICHTER_REFERENCE: ReferencePoint[] = [
  { labelTh: 'M 4 (เล็กน้อย รู้สึกได้)', value: 4 },
  { labelTh: 'M 6 (ปานกลาง เริ่มเสียหาย)', value: 6 },
  { labelTh: 'M 7 (รุนแรง)', value: 7 },
  { labelTh: 'M 8.5 (พินาศรุนแรง)', value: 8.5 },
];

export const DECIBEL_REFERENCE: ReferencePoint[] = [
  { labelTh: 'เสียงกระซิบ', value: 30 },
  { labelTh: 'บทสนทนาปกติ', value: 60 },
  { labelTh: 'จราจรหนาแน่น', value: 85 },
  { labelTh: 'คอนเสิร์ต', value: 110 },
];

export const PH_REFERENCE: ReferencePoint[] = [
  { labelTh: 'น้ำมะนาว', value: 2 },
  { labelTh: 'นม', value: 6.5 },
  { labelTh: 'น้ำบริสุทธิ์ (กลาง)', value: 7 },
  { labelTh: 'แอมโมเนีย', value: 11 },
];
