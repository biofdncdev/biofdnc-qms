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
    
    if (file.type !== 'application/pdf') {
      this.pdfUploadError.set('PDF 파일만 업로드 가능합니다.');
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
        this.pdfUploadError.set(`PDF 업로드 실패: ${error?.message || '알 수 없는 오류'}`);
      }
    } finally {
      this.isUploadingPdf.set(false);
    }
  }
  
  openPdf(url: string): void {
    window.open(url, '_blank');
  }
  
  async downloadPdf(pdf: PdfFile): Promise<void> {
    try {
      const response = await fetch(pdf.url);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = pdf.originalName || pdf.name || 'document.pdf';
      
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
