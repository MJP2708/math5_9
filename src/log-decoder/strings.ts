// รวมข้อความภาษาไทยทั้งหมดที่แสดงบนหน้าจอไว้ที่ไฟล์เดียว (ห้ามฝังข้อความในคอมโพเนนต์โดยตรง)
import type { PropertyId } from './engine/steps';

export const APP_TITLE = 'Log-Decoder';
export const APP_SUBTITLE = 'ถอดรหัสลอการิทึม ทีละขั้นตอน';

export const NAV = {
  solver: 'ตัวช่วยแก้ลอการิทึม',
  scales: 'เครื่องคิดเลขมาตราส่วนโลกจริง',
  practice: 'โหมดฝึกฝน',
};

export const PROPERTY_NAMES_TH: Record<PropertyId, string> = {
  'product-rule': 'สมบัติผลคูณ (Product Rule)',
  'quotient-rule': 'สมบัติผลหาร (Quotient Rule)',
  'power-rule': 'สมบัติเลขยกกำลัง (Power Rule)',
  'change-of-base': 'การเปลี่ยนฐาน (Change of Base)',
  'log-base-self': 'ลอการิทึมฐานตัวเอง (log_b b = 1)',
  'log-of-one': 'ลอการิทึมของ 1 (log_b 1 = 0)',
  'inverse-exp-log': 'ผกผันของเลขยกกำลัง-ลอการิทึม (b^(log_b x) = x)',
  'inverse-log-exp': 'ผกผันของลอการิทึม-เลขยกกำลัง (log_b(b^k) = k)',
  'ln-is-log-base-e': 'ลอการิทึมธรรมชาติ (ln x = log_e x)',
  'combine-like-terms': 'รวมพจน์ที่คล้ายกัน',
  'isolate-term': 'จัดสมการแยกตัวแปร',
  'take-log-both-sides': 'ใส่ลอการิทึมทั้งสองข้าง',
  'exponentiate-both-sides': 'ยกกำลังฐานเดียวกันทั้งสองข้าง',
  'equate-arguments': 'เทียบอาร์กิวเมนต์ (ฐานเท่ากัน)',
  'quadratic-formula': 'สูตรกำลังสอง',
  'substitute-value': 'แทนค่ากลับตรวจคำตอบ',
  'simplify-arithmetic': 'คำนวณเลขคณิตให้ง่ายขึ้น',
};

export const PROPERTY_WHY_TH: Record<PropertyId, string> = {
  'product-rule': 'เพราะลอการิทึมของผลคูณ เท่ากับผลบวกของลอการิทึมแต่ละตัว จึงแยกออกจากกันได้',
  'quotient-rule': 'เพราะลอการิทึมของผลหาร เท่ากับผลลบของลอการิทึมตัวตั้งกับตัวหาร',
  'power-rule': 'เพราะเลขชี้กำลังในอาร์กิวเมนต์ ดึงออกมาคูณหน้าลอการิทึมได้เสมอ',
  'change-of-base': 'เพื่อคำนวณหรือเปรียบเทียบลอการิทึมต่างฐานให้อยู่ในฐานเดียวกัน',
  'log-base-self': 'เพราะฐานยกกำลัง 1 ครั้งได้ตัวมันเอง log ฐานตัวเองจึงเป็น 1 เสมอ',
  'log-of-one': 'เพราะฐานใดๆ ยกกำลัง 0 ได้ 1 เสมอ log ของ 1 จึงเป็น 0 เสมอ',
  'inverse-exp-log': 'เพราะเลขยกกำลังกับลอการิทึมเป็นฟังก์ชันผกผันกัน จึงหักล้างกันได้',
  'inverse-log-exp': 'เพราะลอการิทึมกับเลขยกกำลังเป็นฟังก์ชันผกผันกัน จึงเหลือแค่เลขชี้กำลัง',
  'ln-is-log-base-e': 'เพราะ ln คือชื่อเรียกของ log ฐาน e (ค่าคงที่ออยเลอร์)',
  'combine-like-terms': 'รวมพจน์ที่มีลักษณะเดียวกันเข้าด้วยกัน เพื่อให้สมการง่ายขึ้น',
  'isolate-term': 'ย้ายข้างเพื่อแยกพจน์ที่มีตัวแปรออกมาข้างเดียว',
  'take-log-both-sides': 'เมื่อตัวแปรอยู่บนเลขชี้กำลัง การใส่ log ทั้งสองข้างจะดึงตัวแปรลงมาคูณได้',
  'exponentiate-both-sides': 'ยกฐานเดียวกันทั้งสองข้าง เพื่อกำจัด log ออกจากสมการ',
  'equate-arguments': 'เมื่อ log ฐานเดียวกันเท่ากัน อาร์กิวเมนต์ของทั้งสองข้างต้องเท่ากัน',
  'quadratic-formula': 'ใช้สูตร x = (-b ± √(b²-4ac)) / 2a หาคำตอบของสมการกำลังสอง',
  'substitute-value': 'แทนค่าคำตอบที่ได้กลับเข้าไปในเงื่อนไขโดเมนของโจทย์ตั้งต้น เพื่อตรวจว่าเป็นคำตอบจริงหรือคำตอบแปลกปลอม',
  'simplify-arithmetic': 'คำนวณค่าตัวเลขให้อยู่ในรูปที่ง่ายที่สุด',
};

export const SOLVER = {
  heading: 'ตัวช่วยแก้ลอการิทึม',
  intro: 'ป้อนนิพจน์หรือสมการลอการิทึม แล้วดูขั้นตอนการแก้ทีละขั้น',
  inputLabel: 'นิพจน์ / สมการ',
  inputPlaceholder: 'เช่น log_2(x) + log_2(x-2) = 3 หรือ 2^x=50',
  simplifyMode: 'ทำให้ง่าย',
  solveMode: 'แก้สมการ',
  submit: 'ถอดรหัส',
  domainHeading: 'เงื่อนไข/โดเมนก่อนเริ่มแก้',
  domainEmpty: 'ไม่มีเงื่อนไขพิเศษสำหรับนิพจน์นี้',
  stepsHeading: 'ขั้นตอนการแก้ทีละขั้น',
  stepLabel: 'ขั้นที่',
  before: 'ก่อน',
  after: 'หลัง',
  why: 'ทำไมถึงทำแบบนี้?',
  next: 'ขั้นถัดไป',
  prev: 'ขั้นก่อนหน้า',
  showAll: 'แสดงทุกขั้นตอน',
  resultHeading: 'ผลลัพธ์',
  simplifiedLabel: 'นิพจน์ที่ทำให้ง่ายแล้ว',
  exactLabel: 'คำตอบแบบแม่นตรง',
  decimalLabel: 'ค่าประมาณทศนิยม',
  rootsHeading: 'คำตอบที่เป็นไปได้ทั้งหมด',
  rootValid: 'เป็นคำตอบจริง',
  rootRejected: 'ถูกตัดทิ้ง (คำตอบแปลกปลอม)',
  checkHeading: 'ตรวจคำตอบกับเงื่อนไขโดเมน',
  copyLatex: 'คัดลอกเป็น LaTeX',
  copyText: 'คัดลอกเป็นข้อความ',
  copied: 'คัดลอกแล้ว!',
  emptyState: 'ผลลัพธ์และขั้นตอนจะปรากฏที่นี่หลังจากกดถอดรหัส',
};

export const ERRORS_TH = {
  boundaryTitle: 'เกิดข้อผิดพลาดที่ไม่คาดคิด',
  boundaryBody: 'ระบบขัดข้องกะทันหัน กรุณาลองรีเฟรชหน้าเว็บ หรือป้อนข้อมูลใหม่อีกครั้ง',
  boundaryReset: 'ลองอีกครั้ง',
};

export const SCALES = {
  heading: 'เครื่องคิดเลขมาตราส่วนโลกจริง',
  intro: 'ลอการิทึมถูกใช้วัดปรากฏการณ์ที่มีค่าต่างกันมหาศาล เช่น แผ่นดินไหว เสียง และค่า pH',
  tabs: {
    richter: 'ริกเตอร์ (แผ่นดินไหว)',
    decibel: 'เดซิเบล (เสียง)',
    ph: 'pH (ความเป็นกรด-เบส)',
  },
  richter: {
    title: 'มาตราริกเตอร์และพลังงานแผ่นดินไหว',
    formula1: 'M = log₁₀(A / A₀)',
    formula2: 'log₁₀E = 4.8 + 1.5M  (E หน่วยจูล)',
    directionAtoM: 'หา M จากอัตราส่วนแอมพลิจูด A/A₀',
    directionMtoA: 'หาอัตราส่วนแอมพลิจูด A/A₀ จาก M',
    inputA: 'แอมพลิจูด A (เทียบกับ A₀)',
    inputM: 'ขนาดแผ่นดินไหว M',
    energyLabel: 'พลังงานโดยประมาณ (จูล)',
    compareHeading: 'เปรียบเทียบพลังงาน',
    compareM1: 'ขนาด M ที่ 1',
    compareM2: 'ขนาด M ที่ 2',
    compareResult: (m1: string, m2: string, ratio: string) =>
      `แผ่นดินไหวขนาด M ${m1} ปล่อยพลังงานประมาณ ${ratio} เท่าของขนาด M ${m2}`,
    scaleStrip: 'แถบเทียบระดับ',
  },
  decibel: {
    title: 'ระดับความเข้มเสียงเดซิเบล',
    formula: 'β = 10·log₁₀(I / I₀),  I₀ = 10⁻¹² W/m²',
    directionItoB: 'หาระดับเสียง β จากความเข้มเสียง I',
    directionBtoI: 'หาความเข้มเสียง I จากระดับเสียง β',
    inputI: 'ความเข้มเสียง I (W/m²)',
    inputB: 'ระดับเสียง β (dB)',
    compareHeading: 'เปรียบเทียบความเข้มเสียง',
    compareB1: 'ระดับเสียงที่ 1 (dB)',
    compareB2: 'ระดับเสียงที่ 2 (dB)',
    compareResult: (b1: string, b2: string, ratio: string) =>
      `เสียงระดับ ${b1} dB มีความเข้มมากกว่าระดับ ${b2} dB ประมาณ ${ratio} เท่า`,
    scaleStrip: 'แถบเทียบระดับ',
  },
  ph: {
    title: 'ค่า pH และความเป็นกรด-เบส',
    formula1: 'pH = -log₁₀[H⁺]',
    formula2: 'pH + pOH = 14',
    directionHtoPH: 'หา pH จากความเข้มข้น [H⁺]',
    directionPHtoH: 'หาความเข้มข้น [H⁺] จาก pH',
    inputH: 'ความเข้มข้น [H⁺] (mol/L)',
    inputPH: 'ค่า pH',
    pOHLabel: 'ค่า pOH',
    compareHeading: 'เปรียบเทียบความเป็นกรด',
    comparePH1: 'pH ที่ 1',
    comparePH2: 'pH ที่ 2',
    compareResult: (p1: string, p2: string, ratio: string) =>
      `สารที่ pH ${p1} มีความเป็นกรดมากกว่าสารที่ pH ${p2} ประมาณ ${ratio} เท่า`,
    scaleStrip: 'แถบเทียบระดับ',
  },
  invalidIntensity: 'ค่าความเข้ม/แอมพลิจูดต้องมากกว่า 0 (ค่าที่ป้อนเป็นไปไม่ได้ในทางฟิสิกส์)',
  invalidHPlus: 'ความเข้มข้น [H⁺] ต้องมากกว่า 0',
  invalidPH: 'ค่า pH ควรอยู่ระหว่าง 0 ถึง 14 โดยประมาณ',
  submit: 'คำนวณ',
  workingHeading: 'วิธีทำ (แทนค่าในสูตร)',
};

export const REFERENCE_TH = {
  richter: [
    { labelTh: 'M 4 (เล็กน้อย รู้สึกได้)', value: 4 },
    { labelTh: 'M 6 (ปานกลาง เริ่มเสียหาย)', value: 6 },
    { labelTh: 'M 7 (รุนแรง)', value: 7 },
    { labelTh: 'M 8+ (พินาศรุนแรง)', value: 8.5 },
  ],
  decibel: [
    { labelTh: 'เสียงกระซิบ', value: 30 },
    { labelTh: 'บทสนทนาปกติ', value: 60 },
    { labelTh: 'จราจรหนาแน่น', value: 85 },
    { labelTh: 'คอนเสิร์ต', value: 110 },
  ],
  ph: [
    { labelTh: 'น้ำมะนาว', value: 2 },
    { labelTh: 'นม', value: 6.5 },
    { labelTh: 'น้ำบริสุทธิ์ (กลาง)', value: 7 },
    { labelTh: 'แอมโมเนีย', value: 11 },
  ],
};

export const PRACTICE = {
  heading: 'โหมดฝึกฝน',
  intro: 'สุ่มโจทย์ลอการิทึมตามระดับความยาก แล้วลองแก้ด้วยตัวเองก่อนดูเฉลย',
  difficulty: 'ระดับความยาก',
  easy: 'ง่าย',
  medium: 'ปานกลาง',
  hard: 'ยาก',
  generate: 'สุ่มโจทย์ใหม่',
  answerLabel: 'คำตอบของคุณ (ทศนิยม 2 ตำแหน่ง หรือรูปแบบเศษส่วน)',
  check: 'ตรวจคำตอบ',
  correct: 'ถูกต้อง! เก่งมาก',
  incorrect: 'ยังไม่ถูก ลองอีกครั้ง หรือดูเฉลยด้านล่าง',
  reveal: 'ดูเฉลยทีละขั้นตอน',
  hideReveal: 'ซ่อนเฉลย',
};

export const GRAPH = {
  heading: 'กราฟ y = log_b(x)',
  baseLabel: 'ฐาน b',
  asymptoteLabel: 'เส้นกำกับแนวตั้งที่ x = 0',
  fixedPointLabel: 'จุดคงที่ (1, 0)',
  answerPointLabel: 'จุดคำตอบที่แก้ได้',
};

export const FOOTER = {
  text: 'Log-Decoder — โครงงานคณิตศาสตร์ ระดับมัธยมศึกษา · สร้างด้วย React + TypeScript',
};

export const COMMON = {
  loading: 'กำลังคำนวณ...',
  yes: 'ใช่',
  no: 'ไม่',
};
