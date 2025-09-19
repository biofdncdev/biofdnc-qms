// 공통 타입 정의
export interface AuditItem {
  id: number;
  titleKo: string;
  titleEn: string;
  done: boolean;
  status: 'pending' | 'on-hold' | 'na' | 'impossible' | 'in-progress' | 'done';
  note: string;
  departments: string[];
  companies?: string[];
  comments?: Array<{
    user: string;
    time: string;
    text: string;
    ownerTag?: boolean;
  }>;
  owners?: string[];
  company?: string | null;
  doneBy?: string;
  doneAt?: string;
  col1Text?: string;
  col3Text?: string;
  selectedLinks?: Array<{
    id: string;
    title: string;
    kind: 'record' | 'standard';
  }>;
  __h1?: number;
  __h3?: number;
}

export interface ResourceItem {
  id?: string;
  number?: number;
  name: string;
  type?: string;
  url?: string | null;
  file_url?: string | null;
  done?: boolean;
}

export interface AuditDate {
  value: string;
  label: string;
}

export interface LinkItem {
  id: string;
  title: string;
  kind?: 'record' | 'standard';
}
