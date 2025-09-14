import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RECORD_FEATURE_DEFS, RecordFeatures, normalizeRecordFeatures } from './record-features.registry';

@Component({
  selector: 'record-features-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div style="display:flex; gap:16px; flex-wrap:wrap; align-items:center;">
    <label *ngFor="let def of defs" style="display:flex; gap:6px; align-items:center; font-size:13px; color:#475569;">
      <input type="checkbox" [(ngModel)]="features[def.key]" (ngModelChange)="onChanged()"/> {{ def.label }}
    </label>
  </div>
  `,
})
export class RecordFeaturesSelectorComponent {
  defs = RECORD_FEATURE_DEFS;
  @Input() features: RecordFeatures = normalizeRecordFeatures({});
  @Output() featuresChange = new EventEmitter<RecordFeatures>();

  onChanged(){
    // Normalize and emit to parent for persistence
    const normalized = normalizeRecordFeatures(this.features);
    this.features = normalized;
    this.featuresChange.emit(this.features);
  }
}


