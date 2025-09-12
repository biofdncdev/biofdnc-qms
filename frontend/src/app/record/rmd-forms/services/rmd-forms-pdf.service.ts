import { Injectable, signal } from '@angular/core';
import { SupabaseService } from '../../../services/supabase.service';
import { PdfFile } from '../rmd-forms.types';

@Injectable()
export class RmdFormsPdfService {
  // PDF handling signals
  recordPdfs = signal<PdfFile[]>([]);
  selectedPdfPath = signal<string>('');
  dragOver = signal<boolean>(false);
  pendingPdfFile = signal<File | null>(null);
  isUploadingPdf = signal<boolean>(false);
  pdfUploadError = signal<string>('');
  // Image preview state
  showImagePreview = signal<boolean>(false);
  previewImageUrl = signal<string>('');
  // Clipboard paste image state
  pastedImageUrl = signal<string>('');
  pastedImageBlob = signal<Blob | null>(null);
  pastedFileName = signal<string>('');
  isSavingPasted = signal<boolean>(false);
  pasteError = signal<string>('');

  constructor(private supabase: SupabaseService) {}

  async refreshPdfList(formId: string): Promise<void> {
    if (!formId) return;
    try {
      const pdfs = await this.supabase.listRecordPdfs(formId);
      const uploadInfo = this.getPdfUploadInfo(formId);
      const pdfList = pdfs.map((pdf: any) => {
        const info = uploadInfo[pdf.path] || {};
        const originalName = info.originalName || pdf.originalName || '알 수 없는 파일';
        return {
          ...pdf,
          originalName: originalName,
          uploadedBy: info.uploadedBy || '알 수 없음',
          uploadedAt: info.uploadedAt || new Date().toISOString()
        };
      }).reverse(); // 최신 파일이 위에 오도록
      
      this.recordPdfs.set(pdfList);
      
      if (pdfList.length && !this.selectedPdfPath()) { 
        this.selectedPdfPath.set(pdfList[0].url); 
      }
    } catch(error) {
      console.error('PDF 목록 불러오기 실패:', error);
      this.recordPdfs.set([]);
    }
  }

  async handlePdfPick(file: File | null, formId: string): Promise<void> {
    if (!file || !formId) return;
    // Allow common document types beyond PDFs
    const okMimePrefixes = ['application/pdf','image/','application/vnd.openxmlformats-officedocument','application/msword','application/vnd.ms-excel','text/csv','application/haansofthwp','application/x-hwp'];
    const okExts = ['.pdf','.png','.jpg','.jpeg','.gif','.webp','.bmp','.tif','.tiff','.xlsx','.xls','.csv','.doc','.docx','.hwp','.hwpx'];
    const name = (file.name || '').toLowerCase();
    const hasOkExt = okExts.some(ext => name.endsWith(ext));
    const hasOkMime = okMimePrefixes.some(prefix => (file.type || '').startsWith(prefix));
    if (!hasOkExt && !hasOkMime){
      this.pdfUploadError.set('지원되지 않는 파일 형식입니다. (PDF, 이미지, 엑셀, 워드, 한글)');
      return;
    }
    
    this.pendingPdfFile.set(file);
    this.pdfUploadError.set('');
  }

  async handleDrop(ev: DragEvent, formId: string): Promise<void> {
    ev.preventDefault(); 
    this.dragOver.set(false);
    const file = ev.dataTransfer?.files?.[0]; 
    if (!file || !formId) return;
    
    await this.handlePdfPick(file, formId);
  }
  
  handleDragOver(ev: DragEvent): void {
    ev.preventDefault();
    this.dragOver.set(true);
  }
  
  handleDragLeave(ev: DragEvent): void {
    ev.preventDefault();
    this.dragOver.set(false);
  }

  async removePdf(pdf: PdfFile, formId: string): Promise<void> {
    if (!confirm('이 PDF 파일을 삭제하시겠습니까?')) return;
    try { 
      await this.supabase.deleteRecordPdf(pdf.path, pdf.bucket);
      // localStorage에서도 업로드 정보 삭제
      const uploadInfo = this.getPdfUploadInfo(formId);
      delete uploadInfo[pdf.path];
      this.savePdfUploadInfo(formId, uploadInfo);
      await this.refreshPdfList(formId);
    } catch(error) {
      console.error('PDF 삭제 실패:', error);
      alert('PDF 삭제에 실패했습니다.');
    }
  }
  
  removePendingPdf(): void {
    this.pendingPdfFile.set(null);
    this.pdfUploadError.set('');
  }
  
  async savePdf(formId: string): Promise<void> {
    const pendingFile = this.pendingPdfFile();
    if (!pendingFile || !formId) return;
    
    this.isUploadingPdf.set(true);
    this.pdfUploadError.set('');
    
    try {
      const result = await this.supabase.uploadRecordPdf(pendingFile, formId);
      
      if (result && result.path) {
        // 업로드 정보를 localStorage에 저장
        const user = await this.supabase.getCurrentUser();
        const uploadInfo = this.getPdfUploadInfo(formId);
        uploadInfo[result.path] = {
          uploadedBy: user?.email || '알 수 없음',
          uploadedAt: new Date().toISOString(),
          originalName: result.originalName
        };
        this.savePdfUploadInfo(formId, uploadInfo);
        
        this.pendingPdfFile.set(null);
        this.pdfUploadError.set('');
        await this.refreshPdfList(formId);
      } else {
        throw new Error('업로드 결과를 받지 못했습니다.');
      }
    } catch(error: any) {
      console.error('PDF 업로드 실패:', error);
      // 더 자세한 에러 메시지 표시
      if (error?.message?.includes('Row level security') || error?.message?.includes('RLS')) {
        this.pdfUploadError.set('권한이 없습니다. 로그인 상태를 확인하세요.');
      } else if (error?.message?.includes('size') || error?.message?.includes('exceeds')) {
        this.pdfUploadError.set('파일 크기가 너무 큽니다. (최대 50MB)');
      } else if (error?.message?.includes('timeout')) {
        this.pdfUploadError.set('업로드 시간이 초과되었습니다. 네트워크를 확인하세요.');
      } else {
        this.pdfUploadError.set(`업로드 실패: ${error?.message || '알 수 없는 오류'}`);
      }
    } finally {
      this.isUploadingPdf.set(false);
    }
  }
  
  openPdf(url: string): void {
    window.open(url, '_blank');
  }

  // Public helper to decide and open: image preview vs new tab
  openFile(file: PdfFile): void {
    const name = (file.originalName || file.name || '').toLowerCase();
    if (this.isImageName(name)){
      this.previewImageUrl.set(file.url);
      this.showImagePreview.set(true);
    } else {
      this.openPdf(file.url);
    }
  }

  closeImagePreview(): void {
    this.showImagePreview.set(false);
    this.previewImageUrl.set('');
  }

  // Expose image check for templates (thumbnails etc.)
  isImage(file: PdfFile): boolean {
    const name = (file.originalName || file.name || '').toLowerCase();
    return this.isImageName(name);
  }

  private isImageName(name: string): boolean {
    return ['.png','.jpg','.jpeg','.gif','.webp','.bmp','.tif','.tiff']
      .some(ext => name.endsWith(ext));
  }

  // ===== Clipboard paste handling =====
  handleImagePaste(ev: ClipboardEvent, recordTitle?: string){
    try{
      const items = ev.clipboardData?.items || [] as any;
      for (let i=0;i<items.length;i++){
        const it = items[i];
        if (!it) continue;
        const type = it.type || '';
        if (type.startsWith('image/')){
          const blob = it.getAsFile() as Blob | null;
          if (blob){
            const url = URL.createObjectURL(blob);
            // clean previous
            try{ URL.revokeObjectURL(this.pastedImageUrl()); }catch{}
            this.pastedImageBlob.set(blob);
            this.pastedImageUrl.set(url);
            this.pasteError.set('');
            const def = this.defaultImageName(recordTitle || '기록');
            this.pastedFileName.set(def);
            ev.preventDefault();
            return;
          }
        }
      }
      this.pasteError.set('클립보드에서 이미지를 찾을 수 없습니다.');
    }catch(e:any){
      this.pasteError.set('붙여넣기 처리 중 오류가 발생했습니다.');
    }
  }

  clearPastedImage(){
    try{ URL.revokeObjectURL(this.pastedImageUrl()); }catch{}
    this.pastedImageUrl.set('');
    this.pastedImageBlob.set(null);
    this.pastedFileName.set('');
    this.pasteError.set('');
  }

  setPastedFileName(v: string){ this.pastedFileName.set(this.sanitizeFileName(v)); }

  private defaultImageName(title: string): string{
    const ymd = new Date().toISOString().slice(0,10).replace(/-/g,'');
    const base = this.sanitizeFileName(title).slice(0,80) || '기록';
    return `${ymd}_${base}.png`;
  }

  private sanitizeFileName(name: string): string{
    return (name||'').toString().trim().replace(/[\\/:*?"<>|]+/g,'-');
  }

  async savePastedImage(formId: string, recordTitle?: string){
    const blob = this.pastedImageBlob();
    if (!blob) { this.pasteError.set('붙여넣은 이미지가 없습니다.'); return; }
    const fileName = this.pastedFileName() || this.defaultImageName(recordTitle||'기록');
    const safeFolder = String(formId).replace(/[^a-zA-Z0-9._-]/g,'-');
    const storageName = `${Date.now()}_${Math.random().toString(36).slice(2,8)}.png`;
    const storagePath = `pdfs/${safeFolder}/${storageName}`;
    this.isSavingPasted.set(true);
    try{
      // Upload blob as PNG
      const pngBlob = blob.type === 'image/png' ? blob : await this.convertToPng(blob);
      const { path, publicUrl } = await this.supabase.uploadRecordImage(pngBlob, storagePath);
      // Map originalName for display
      try{
        const user = await this.supabase.getCurrentUser();
        const uploadInfo = this.getPdfUploadInfo(formId);
        uploadInfo[path] = {
          uploadedBy: user?.email || '알 수 없음',
          uploadedAt: new Date().toISOString(),
          originalName: fileName
        };
        this.savePdfUploadInfo(formId, uploadInfo);
      }catch{}
      this.clearPastedImage();
      await this.refreshPdfList(formId);
    }catch(e:any){
      this.pasteError.set('이미지 저장 중 오류가 발생했습니다.');
    }finally{
      this.isSavingPasted.set(false);
    }
  }

  private async convertToPng(blob: Blob): Promise<Blob>{
    // Draw to canvas and export to PNG
    const img = await new Promise<HTMLImageElement>((resolve, reject)=>{
      const url = URL.createObjectURL(blob);
      const image = new Image();
      image.onload = ()=>{ URL.revokeObjectURL(url); resolve(image); };
      image.onerror = (e)=>{ URL.revokeObjectURL(url); reject(e); };
      image.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = img.width; canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return blob;
    ctx.drawImage(img, 0, 0);
    return await new Promise<Blob>((resolve)=> canvas.toBlob(b=> resolve(b as Blob), 'image/png') );
  }
  
  async downloadPdf(pdf: PdfFile): Promise<void> {
    try {
      const response = await fetch(pdf.url);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = pdf.originalName || pdf.name || 'document';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('PDF 다운로드 실패:', error);
      alert('PDF 다운로드에 실패했습니다.');
    }
  }
  
  // localStorage helper methods
  private getPdfUploadInfo(formId: string): Record<string, any> {
    try {
      const key = `pdf_upload_info_${formId}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }
  
  private savePdfUploadInfo(formId: string, info: Record<string, any>): void {
    try {
      const key = `pdf_upload_info_${formId}`;
      localStorage.setItem(key, JSON.stringify(info));
    } catch {}
  }
}
