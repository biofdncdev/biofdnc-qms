export type RecordFeatureKey = 'uploadFiles' | 'uploadImages';

export interface RecordFeatureDef {
  key: RecordFeatureKey;
  label: string;
  default: boolean;
}

export const RECORD_FEATURE_DEFS: ReadonlyArray<RecordFeatureDef> = [
  { key: 'uploadFiles', label: '파일 업로드 기능', default: false },
  { key: 'uploadImages', label: '이미지 업로드 기능', default: false },
];

export type RecordFeatures = { [K in RecordFeatureKey]: boolean };

export function getDefaultRecordFeatures(): RecordFeatures {
  const out = {} as RecordFeatures;
  for (const def of RECORD_FEATURE_DEFS) (out as any)[def.key] = def.default;
  return out;
}

export function normalizeRecordFeatures(value: any): RecordFeatures {
  const base = getDefaultRecordFeatures();
  const src = value && typeof value === 'object' ? value : {};
  for (const def of RECORD_FEATURE_DEFS) {
    const v = !!src[def.key];
    (base as any)[def.key] = v;
  }
  return base;
}

export function recordFeaturesToText(value: any): string {
  const v = normalizeRecordFeatures(value);
  const parts: string[] = [];
  for (const def of RECORD_FEATURE_DEFS) if ((v as any)[def.key]) parts.push(def.label);
  return parts.length ? parts.join(', ') : '-';
}


