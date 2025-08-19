import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';

type Delivery = { id: string; date: string; quantity: number; outsourceDate?: string | null; outsourceQty?: number | null };
type Receipt = { id: string; orderDate: string; orderNo: string; orderQty: number; deliveries: Delivery[]; collapsed?: boolean; status?: 'open'|'done' };

@Component({
	selector: 'app-rice-bran-water-h',
	standalone: true,
	imports: [CommonModule, FormsModule],
	template: `
	<div class="sale-page">
		<header class="head">
			<h2>Rice Bran Water H</h2>
			<div class="head-actions">
				<button class="btn primary" (click)="addReceipt()">+ 수주 추가</button>
				<button class="btn" (click)="addOutsourceOrder()">+ 외주 추가</button>
				<div class="stat total"><span>총 수주</span><b>{{ rootTotal() | number }}</b><span class="unit">kg</span></div>
				<div class="stat total"><span>총 외주</span><b>{{ totalOutsource() | number }}</b><span class="unit">kg</span></div>
			</div>
			<div class="filters">
				<label><input type="radio" name="f" [(ngModel)]="filter" value="all" /> 전체보기</label>
				<label><input type="radio" name="f" [(ngModel)]="filter" value="open" /> 완료안된거</label>
				<label><input type="radio" name="f" [(ngModel)]="filter" value="done" /> 완료된거</label>
			</div>
		</header>

		<!-- root card removed: moved actions to header -->

		<section class="layout">
			<div class="left">
				<div class="receipt" *ngFor="let r of receipts(); let ri = index" [hidden]="filter==='done' ? r.status!=='done' : (filter==='open'? r.status==='done' : false)">
					<div class="r-head">
						<h3>수주 #{{ ri+1 }}</h3>
						<div class="sum">상태:
							<select [(ngModel)]="r.status" (ngModelChange)="refresh()">
								<option value="open">진행중</option>
								<option value="done">완료</option>
							</select>
							| 분할 합계: <b>{{ receiptSum(r) | number }}</b> / 수주 수량
							<input class="qty-input" type="number" [(ngModel)]="r.orderQty" min="0" (ngModelChange)="refresh()" />
							<button class="btn icon danger" title="삭제" (click)="deleteReceipt(ri)">×</button>
						</div>
					</div>
					<div class="grid">
						<label>수주 일자</label>
						<input class="date-input compact" type="date" [(ngModel)]="r.orderDate" (ngModelChange)="refresh()" />
						<label>수주 번호</label>
						<input class="pono-input" type="text" [(ngModel)]="r.orderNo" placeholder="예: PO-2025-0001" />
					</div>
					<div class="d-head">
						<h4>납기/수량 분할</h4>
						<button class="btn" (click)="addDelivery(ri)">+ 납기 추가</button>
					</div>
					<div class="deliv" *ngFor="let d of r.deliveries; let di = index">
						<div class="pair due">
							<span class="chip">납기</span>
							<input class="compact" type="date" [ngModel]="d.date" (ngModelChange)="onDeliveryFieldChange(d,'date',$event)" />
							<input class="wide" type="number" [ngModel]="d.quantity" (ngModelChange)="onDeliveryFieldChange(d,'quantity',$event)" min="0" />
						</div>
						<div class="actions">
							<button class="btn icon" title="분할" (click)="splitDelivery(ri, di)">⎘</button>
							<button class="btn icon danger" title="삭제" (click)="removeDelivery(ri, di)">×</button>
						</div>
					</div>
				</div>
				<!-- Outsource orders (left panel) -->
				<div class="outs" *ngFor="let o of outsourceOrders(); let oi = index">
					<div class="r-head" (click)="toggleOutsource(oi)">
						<h3><span class="caret" [class.closed]="o.collapsed"></span> 외주 #{{ oi+1 }}</h3>
						<div class="sum">합계: <b>{{ shipmentSum(o) | number }}</b> / 외주 수량
							<input class="qty-input" type="number" [(ngModel)]="o.totalQty" min="0" (ngModelChange)="refresh()" />
							<button class="btn icon danger" title="삭제" (click)="deleteOutsource(oi); $event.stopPropagation()">×</button>
						</div>
					</div>
					<div class="d-head" *ngIf="!o.collapsed">
						<h4>외주 납기/수량</h4>
						<button class="btn" (click)="addShipment(oi)">+ 외주 납기 추가</button>
					</div>
					<div class="deliv" *ngFor="let s of o.shipments; let si = index" [hidden]="o.collapsed">
						<div class="pair due">
							<span class="chip">납기</span>
							<input class="compact" type="date" [(ngModel)]="s.date" (ngModelChange)="refresh()" />
							<input class="wide" type="number" [(ngModel)]="s.qty" (ngModelChange)="refresh()" min="0" />
						</div>
						<div class="actions">
							<button class="btn icon danger" title="삭제" (click)="removeShipment(oi, si)">×</button>
						</div>
					</div>
				</div>
			</div>
			<div class="right">
				<h3>납기표</h3>
				<div class="schedule">
					<table>
						<thead>
							<tr>
								<th>발주접수</th>
								<th>수주번호</th>
								<th>납기일</th>
								<th>수량</th>
								<th>외주 납기</th>
								<th>외주 수량</th>
							</tr>
						</thead>
						<tbody>
							<ng-container *ngFor="let r of receipts(); let ri = index">
								<ng-container *ngIf="!r.collapsed">
									<tr *ngFor="let d of r.deliveries">
										<td>발주접수 #{{ ri+1 }}</td>
										<td>{{ r.orderNo || '-' }}</td>
										<td>{{ d.date }}</td>
										<td>{{ d.quantity | number }}</td>
										<td>{{ d.outsourceDate || '-' }}</td>
										<td>{{ d.outsourceQty || 0 | number }}</td>
									</tr>
								</ng-container>
							</ng-container>
						</tbody>
					</table>
				</div>
			</div>
		</section>
	</div>
	`,
	styles: [`
	.sale-page{ padding:16px; }
	.head{ display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; }
	.head-actions{ display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
	.head h2{ margin:0; }
	:host, .sale-page{ --row-h: 36px; --radius: 10px; --font-sm: 12px; --font-xs: 11px; }
	.root-card{ background:#fff; border:1px solid #eee; border-radius:12px; padding:12px; margin-bottom:12px; }
	.root-row{ display:flex; align-items:center; justify-content:space-between; }
	.root-row .stat span{ color:#475569; margin-right:8px; }
	.btn{ display:inline-flex; align-items:center; gap:6px; padding:6px 10px; border-radius:12px; border:1px solid #e5e7eb; background:#ffffff; color:#0f172a; font-weight:700; font-size: var(--font-sm); box-shadow:0 1px 2px rgba(2,6,23,.04); transition: transform .06s ease, box-shadow .15s ease; }
	.btn:hover{ box-shadow:0 4px 12px rgba(2,6,23,.08); }
	.btn:active{ transform: translateY(1px); }
	.btn.primary{ background:linear-gradient(180deg,#f0f9ff,#e0f2fe); border-color:#bae6fd; color:#0c4a6e; }
	.btn.icon{ width:28px; height:28px; padding:0; justify-content:center; border-radius:10px; }
	.btn.danger{ background:linear-gradient(180deg,#fee2e2,#fecaca); border-color:#fecaca; color:#7f1d1d; }

	.layout{ display:grid; grid-template-columns: minmax(520px, 46%) minmax(0,1fr); gap:16px; align-items:start; }
	.left, .right{ background:#fff; border:1px solid #eee; border-radius:12px; padding:12px; }
	.receipt{ border:1px solid #e5e7eb; border-radius:10px; padding:10px; margin-bottom:12px; }
	.r-head{ display:flex; align-items:center; justify-content:space-between; cursor:pointer; }
	.r-head.collapsed{ opacity:.8; }
	.caret{ display:inline-block; width:0; height:0; border-left:6px solid transparent; border-right:6px solid transparent; border-top:8px solid #334155; margin-right:6px; transform: rotate(180deg); transition: transform .15s ease; }
	.caret.closed{ transform: rotate(0deg); }
	.r-head h3{ font-size:14px; margin:0; }
	.r-head .sum{ display:flex; align-items:center; gap:6px; font-size: var(--font-sm); color:#0f172a; }
	.r-head .qty-input{ width:90px; height: 30px; padding:6px 8px; border:1px solid #e5e7eb; border-radius:10px; font-size: var(--font-sm); }
	.grid{ display:grid; grid-template-columns: 72px minmax(120px,1fr) 72px minmax(160px,1.2fr); gap:10px; align-items:center; margin:8px 0; font-size: var(--font-sm); }
	.date-input{ width: 140px; }
	.date-input.compact{ width: 120px; }
	.pono-input{ width: 180px; }
	.d-head{ display:flex; align-items:center; justify-content:space-between; margin:8px 0; flex-wrap:wrap; }
	.deliv{ display:grid; grid-template-columns: 1fr 1fr auto; gap:8px; align-items:center; margin-bottom:6px; min-height: var(--row-h); font-size: var(--font-sm); }
	.pair{ display:grid; grid-template-columns: 44px 1fr 90px; align-items:center; gap:6px; }
	/* compact widths to just needed characters */
	.pair input[type="date"]{ width: 120px; }
	.pair input[type="date"].compact{ width: 110px; }
	.pair input[type="number"]{ width: 80px; }
	.pair input[type="number"].wide{ width: 120px; }
	.chip{ display:inline-flex; align-items:center; justify-content:center; height: 24px; padding:0 8px; border-radius:999px; background:#eef2ff; color:#3730a3; font-weight:700; font-size:10px; }
	.deliv input{ padding:4px 6px; border:1px solid #e5e7eb; border-radius:10px; height: 26px; width:100%; box-sizing:border-box; font-size: var(--font-sm); }
	.deliv .actions{ display:flex; gap:6px; justify-content:flex-end; flex-wrap:wrap; }

	/* schedule table */
	.right{ display:flex; flex-direction:column; align-items:center; }
	.schedule{ margin-top:8px; max-width: 820px; width:100%; }
	.schedule table{ width:100%; border-collapse:collapse; font-size:12px; }
	.schedule th, .schedule td{ border:1px solid #e5e7eb; padding:6px 8px; text-align:left; white-space:nowrap; }
	.schedule thead th{ background:#f8fafc; position:sticky; top:0; z-index:1; }

	.head-actions .stat.total{ background:#0f172a; color:#fff; padding:6px 10px; border-radius:999px; font-weight:800; }
	.head-actions .stat.total .unit{ margin-left:4px; opacity:.8; font-weight:600; }
	.filters{ display:flex; gap:12px; align-items:center; margin-top:8px; flex-wrap:wrap; }

	@media (max-width: 1300px){ .layout{ grid-template-columns: 1fr; } .right{ order:2; } .left{ order:1; } }
	@media (max-width: 900px){ .grid{ grid-template-columns: 90px 1fr; } .deliv{ grid-template-columns: 1fr 1fr; } .deliv .actions{ grid-column: 1 / -1; justify-content:flex-start; } .head-actions{ width:100%; justify-content:space-between; } }
	`]
})
export class RiceBranWaterHComponent {
	// Data
	receipts = signal<Receipt[]>([]);
  constructor(private supabase: SupabaseService){}

	// Days window for the timeline (60 days from today)
	readonly days: Date[] = Array.from({ length: 60 }, (_, i) => { const d = new Date(); d.setDate(d.getDate()+i); return d; });

	rootTotal = computed(() => this.receipts().reduce((sum, r) => sum + (Number(r.orderQty)||0), 0));

	receiptSum(r: Receipt){ return (r.deliveries||[]).reduce((s, d) => s + (Number(d.quantity)||0), 0); }
	outsourceSum(r: Receipt){ return 0; }

	// Outsource orders state
	outsourceOrders = signal<Array<{ id: string; totalQty: number; collapsed?: boolean; shipments: Array<{ date: string; qty: number }> }>>([]);
	addOutsourceOrder(){
		const d = new Date();
		const o = { id: this.uid(), totalQty: 0, collapsed: false, shipments: [] as Array<{ date: string; qty: number }> };
		this.outsourceOrders.set([ ...this.outsourceOrders(), o ]);
	}
	toggleOutsource(idx: number){ const arr = this.outsourceOrders(); arr[idx].collapsed = !arr[idx].collapsed; this.outsourceOrders.set([ ...arr ]); }
	addShipment(oi: number){ const arr = this.outsourceOrders(); const o = arr[oi]; if(!o) return; const d = new Date(); o.shipments.push({ date: d.toISOString().slice(0,10), qty: 0 }); this.outsourceOrders.set([ ...arr ]); }
	removeShipment(oi: number, si: number){ const arr = this.outsourceOrders(); const o = arr[oi]; if(!o) return; o.shipments.splice(si,1); this.outsourceOrders.set([ ...arr ]); }
	shipmentSum(o: any){ return (o?.shipments||[]).reduce((s: number, x: any)=> s + (Number(x.qty)||0), 0); }

	filter: 'all'|'open'|'done' = 'all';

	totalOutsource(){
		return (this.outsourceOrders()||[]).reduce((s,o)=> s + (Number(o.totalQty)||0), 0);
	}

	scheduleRows = computed(() => {
		const rows: Array<{ group: string; orderNo: string; date: string; qty: number; outDate?: string|null; outQty?: number|null }> = [];
		this.receipts().forEach((r, ri) => {
			if (this.filter==='open' && r.status==='done') return;
			if (this.filter==='done' && r.status!=='done') return;
			(r.deliveries||[]).forEach(d => rows.push({ group: `발주접수 #${ri+1}` , orderNo: r.orderNo||'-', date: d.date, qty: Number(d.quantity)||0, outDate: null, outQty: null }));
		});
		return rows.sort((a,b)=> new Date(a.date).getTime() - new Date(b.date).getTime());
	});

	addReceipt(){
		const now = new Date();
		const rec: Receipt = { id: this.uid(), orderDate: now.toISOString().slice(0,10), orderNo: '', orderQty: 0, deliveries: [], status: 'open' };
		this.receipts.set([ ...this.receipts(), rec ]);
	}
	addDelivery(receiptIndex: number){
		const rec = this.receipts()[receiptIndex]; if(!rec) return;
		const d = new Date();
		const row: Delivery = { id: this.uid(), date: d.toISOString().slice(0,10), quantity: 0, outsourceDate: null, outsourceQty: null };
		rec.deliveries = [ ...(rec.deliveries||[]), row ];
		this.refresh();
	}
	splitDelivery(receiptIndex: number, deliveryIndex: number){
		const rec = this.receipts()[receiptIndex]; if(!rec) return;
		const src = rec.deliveries[deliveryIndex]; if(!src) return;
		const clone: Delivery = { id: this.uid(), date: src.date, quantity: 0, outsourceDate: src.outsourceDate || null, outsourceQty: 0 };
		rec.deliveries.splice(deliveryIndex+1, 0, clone);
		this.refresh();
	}
	removeDelivery(receiptIndex: number, deliveryIndex: number){
		const rec = this.receipts()[receiptIndex]; if(!rec) return;
		rec.deliveries.splice(deliveryIndex, 1);
		this.refresh();
	}
	refresh(){ this.receipts.set([ ...this.receipts() ]); }

  // Persist change log for delivery updates
  private async recordChange(delivery: Delivery, field: 'date'|'quantity'|'outsourceDate'|'outsourceQty', oldVal: any, newVal: any){
    try{
      const u = await this.supabase.getCurrentUser();
      await this.supabase.logDeliveryChange({
        delivery_id: (delivery as any).db_id || delivery.id,
        field,
        old_value: oldVal==null? null : String(oldVal),
        new_value: newVal==null? null : String(newVal),
        changed_by: u?.id || null,
        changed_by_name: u?.email || null,
      });
    }catch{}
  }

  onDeliveryFieldChange(delivery: Delivery, field: 'date'|'quantity'|'outsourceDate'|'outsourceQty', value: any){
    const before = (delivery as any)[field];
    (delivery as any)[field] = value;
    this.refresh();
    if (before !== value) this.recordChange(delivery, field, before, value);
  }

	// Timeline rows: deliveries across all receipts, sorted by delivery date; if a receipt has no deliveries, create a placeholder row
	rows = computed(() => {
		const rows: Array<{ type: 'delivery'|'placeholder'; receipt: Receipt; delivery?: Delivery; label: string; date: string }>=[];
		this.receipts().forEach((r, ri) => {
			if (r.collapsed) return; // skip collapsed in timeline
			const header = `발주접수#${ri+1} ${r.orderNo||''}`.trim();
			if(!r.deliveries || r.deliveries.length===0){
				rows.push({ type:'placeholder', receipt:r, label: header, date: r.orderDate });
				return;
			}
			// ensure deliveries of later receipts stack below earlier ones: preserve receipt order
			for(const d of r.deliveries){
				rows.push({ type:'delivery', receipt:r, delivery:d, label: header, date: d.date });
			}
		});
		// sort only within each receipt group to align vertically while keeping group order
		const grouped: Record<string, Array<any>> = {};
		for(const row of rows){
			const key = row.receipt.id;
			(grouped[key] ||= []).push(row);
		}
		const merged: Array<any> = [];
		for(const r of this.receipts()){
			const arr = (grouped[r.id]||[]).sort((a,b)=> new Date(a.date).getTime() - new Date(b.date).getTime());
			merged.push(...arr);
		}
		return merged;
	});

	// Map receipt id to first row index
	private receiptFirstRowIndex(): Record<string, number> {
		const map: Record<string, number> = {};
		this.rows().forEach((row, idx) => { if(!map[row.receipt.id]) map[row.receipt.id] = idx; });
		return map;
	}

	// Bars
	orderBars(){
		const start = this.days[0]; const map = this.receiptFirstRowIndex();
		return this.receipts().map(r => {
			const row = (map[r.id] ?? 0) + 2; // +2 to skip header
			const col = `${this.dateToCol(r.orderDate)} / span 1`;
			return { row, col, label: `${r.orderQty}`, tooltip: `발주 ${r.orderNo||''} (${r.orderDate})` };
		});
	}
	deliveryBars(){
		const list: Array<{ row: number; col: string; label: string; tooltip: string; receipt: Receipt; delivery: Delivery }>=[];
		this.rows().forEach((row, idx) => {
			if(row.type!=='delivery' || !row.delivery) return;
			const col = `${this.dateToCol(row.delivery.date)} / span 1`;
			list.push({ row: idx+2, col, label: `${row.delivery.quantity}`, tooltip:`납기 ${row.delivery.date}`, receipt: row.receipt, delivery: row.delivery });
		});
		this._dragList = list; // maintain parallel list for dragging
		return list;
	}
	outsourceBars(){
		const list: Array<{ row:number; col:string; label:string; tooltip:string }>=[];
		this.rows().forEach((row, idx) => {
			const d = row.delivery; if(!d || !d.outsourceDate || !d.outsourceQty) return;
			const col = `${this.dateToCol(d.outsourceDate)} / span 1`;
			list.push({ row: idx+2, col, label: `${d.outsourceQty}`, tooltip:`외주 ${d.outsourceDate}` });
		});
		return list;
	}

	// Drag-to-change for delivery bars
	private _draggingIndex: number | null = null;
	private _dragStartX = 0;
	private _dragStartCol = 0;
	private _dragList: Array<{ row: number; col: string; label: string; tooltip: string; receipt: Receipt; delivery: Delivery }> = [];
	private _dragStartDueIdx = 0;
	private _dragOutsOffset: number | null = null;
	private _dragStartDueVal: string | null = null;
	private _dragStartOutVal: string | null = null;

	onDeliveryDragStart(i: number, ev: MouseEvent | TouchEvent){
		this._draggingIndex = i;
		this._dragStartX = ('touches' in ev ? ev.touches[0].clientX : ev.clientX);
		const b = this._dragList[i];
		this._dragStartCol = this.dateToIndex(b.delivery.date);
		this._dragStartDueIdx = this._dragStartCol;
		this._dragStartDueVal = b.delivery.date;
		this._dragStartOutVal = b.delivery.outsourceDate || null as any;
		this._dragOutsOffset = b.delivery.outsourceDate ? (this.dateToIndex(b.delivery.outsourceDate as any) - this._dragStartCol) : null;
		document.addEventListener('mousemove', this.onDragMove as any);
		document.addEventListener('touchmove', this.onDragMove as any, { passive:false });
		document.addEventListener('mouseup', this.onDragEnd as any);
		document.addEventListener('touchend', this.onDragEnd as any);
	}
	private onDragMove = (ev: MouseEvent | TouchEvent) => {
		if(this._draggingIndex==null) return;
		const x = ('touches' in ev ? ev.touches[0].clientX : ev.clientX);
		const deltaPx = x - this._dragStartX;
		const cellWidth = this.estimateCellWidthPx();
		if(cellWidth<=0) return;
		const deltaDays = Math.round(deltaPx / cellWidth);
		const idx = Math.max(0, Math.min(this.days.length-1, this._dragStartCol + deltaDays));
		const b = this._dragList[this._draggingIndex];
		b.delivery.date = this.indexToDateString(idx);
		if (this._dragOutsOffset != null) {
			const outIdx = Math.max(0, Math.min(this.days.length-1, idx + this._dragOutsOffset));
			b.delivery.outsourceDate = this.indexToDateString(outIdx);
		}
		this.refresh();
		if('preventDefault' in ev) ev.preventDefault();
	}
	private onDragEnd = () => {
		this._draggingIndex = null; this._dragStartX = 0; this._dragStartCol = 0;
		// log history if dates changed
		try{
			const last = this._dragList?.[0]; // not used
		}catch{}
		document.removeEventListener('mousemove', this.onDragMove as any);
		document.removeEventListener('touchmove', this.onDragMove as any);
		document.removeEventListener('mouseup', this.onDragEnd as any);
		document.removeEventListener('touchend', this.onDragEnd as any);
	}

	// Utilities
	private uid(){ return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`; }
	private dateToIndex(dateStr: string){ const d = new Date(dateStr); const start = this.days[0]; const diffMs = d.getTime() - start.getTime(); return Math.floor(diffMs / (1000*60*60*24)); }
	private dateToCol(dateStr: string){ const idx = Math.max(0, Math.min(this.days.length-1, this.dateToIndex(dateStr))); return idx + 2; }
	private indexToDateString(idx: number){ const d = new Date(this.days[0]); d.setDate(d.getDate()+idx); return d.toISOString().slice(0,10); }
	private estimateCellWidthPx(){
		try{
			const el = document.querySelector('.gantt') as HTMLElement | null; if(!el) return 0;
			const rect = el.getBoundingClientRect(); const labelWidth = 160; const width = rect.width - labelWidth - 2*2; // minus gaps approx
			return Math.max(8, width / 60);
		}catch{ return 16; }
	}

	deliveryStyleFor(receipt: Receipt){
		const idx = this.receipts().findIndex(r => r.id === receipt.id);
		const palette = [
			'linear-gradient(90deg,#93c5fd,#60a5fa)',
			'linear-gradient(90deg,#fde68a,#fbbf24)',
			'linear-gradient(90deg,#c4b5fd,#a78bfa)',
			'linear-gradient(90deg,#a7f3d0,#34d399)',
			'linear-gradient(90deg,#fda4af,#fb7185)'
		];
		return palette[idx % palette.length];
	}

	toggleReceipt(index: number){
		const arr = this.receipts();
		arr[index].collapsed = !arr[index].collapsed;
		this.receipts.set([ ...arr ]);
	}

	deleteReceipt(index: number){ const arr = this.receipts(); arr.splice(index,1); this.receipts.set([ ...arr ]); this.refresh(); }
	deleteOutsource(index: number){ const arr = this.outsourceOrders(); arr.splice(index,1); this.outsourceOrders.set([ ...arr ]); this.refresh(); }
}


