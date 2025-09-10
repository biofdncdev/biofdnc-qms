// Type definitions for RMD Forms component

export interface PdfFile {
  name: string;
  originalName?: string;
  path: string;
  url: string;
  uploadedBy?: string;
  uploadedAt?: string;
  bucket?: string;
}

export interface StrokePoint {
  x: number;
  y: number;
}

export interface Stroke {
  points: StrokePoint[];
  width: number;
  color: string;
}

export interface AuditLink {
  number: number;
  title: string;
  company?: string | null;
}

export interface StandardLink {
  id: string;
  title: string;
}

export interface UserPair {
  name: string;
  email: string;
}

export interface FormMetadata {
  department?: string;
  owner?: string;
  method?: string;
  period?: string;
  standard?: string;
  standardCategory?: string;
  certs?: string[];
}

export interface UiState {
  selectedId: string | null;
  centerScroll: number;
  rightScroll: number;
}

export type Granularity = 'day' | 'week' | 'month';
export type Tool = 'pen' | 'eraser';
