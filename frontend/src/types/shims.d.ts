// Minimal ambient module declarations for browser-only libs used via dynamic import
// Keep types loose to avoid cross-OS ts resolution differences

declare module 'jspdf' {
  export const jsPDF: any;
  const _default: any;
  export default _default;
}

declare module 'html2canvas' {
  const html2canvas: any;
  export default html2canvas;
}

declare module 'exceljs' {
  const ExcelJS: any;
  export default ExcelJS;
}


