import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
	selector: 'app-delete-confirm-dialog',
	standalone: true,
	imports: [CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
	template: `
	<div class="delete-dialog">
		<h2 mat-dialog-title>계정 탈퇴</h2>
		<mat-dialog-content>
			<p class="warning">이 작업은 되돌릴 수 없습니다. 계정과 데이터가 영구 삭제되며 복구할 수 없습니다.</p>
			<p class="desc">보안을 위해 본인 확인이 필요합니다. 아래 내용을 입력해 주세요.</p>
			<mat-form-field appearance="outline">
				<mat-label>이메일</mat-label>
				<input matInput [(ngModel)]="email" placeholder="email@example.com" autocomplete="off" autocapitalize="none" spellcheck="false">
				<mat-hint align="start">프로필 이메일과 정확히 일치해야 합니다.</mat-hint>
			</mat-form-field>
			<mat-form-field appearance="outline">
				<mat-label>확인 문구</mat-label>
				<input matInput [(ngModel)]="confirmText" placeholder="탈퇴합니다" autocomplete="off" spellcheck="false">
				<mat-hint align="start">확인 문구로 "탈퇴합니다"를 입력하세요.</mat-hint>
			</mat-form-field>
		</mat-dialog-content>
		<mat-dialog-actions align="end">
			<button mat-button mat-dialog-close>취소</button>
			<button mat-flat-button color="warn" [disabled]="!canConfirm()" [mat-dialog-close]="{ email, confirm: true }">탈퇴</button>
		</mat-dialog-actions>
	</div>
	`,
	styles: [
		`
		.delete-dialog{ max-width:480px; width:100%; }
		.delete-dialog .warning{ background:#fef2f2; color:#b91c1c; border:1px solid #fecaca; padding:8px 10px; border-radius:8px; font-size:12px; margin:0 0 8px; }
		.delete-dialog .desc{ font-size:12.5px; color:#374151; margin:0 0 12px; }
		.delete-dialog mat-form-field{ width:100%; margin-bottom:8px; }
		/* Compact and clean input visuals without breaking the notched outline */
		.delete-dialog ::ng-deep .mat-mdc-form-field-infix{ padding-top: 10px; padding-bottom: 10px; }
		.delete-dialog ::ng-deep .mat-mdc-text-field-wrapper{ border-radius:8px; }
		.delete-dialog ::ng-deep .mdc-notched-outline__leading, 
		.delete-dialog ::ng-deep .mdc-notched-outline__trailing{ border-radius:8px; }
		.delete-dialog ::ng-deep .mat-mdc-form-field-subscript-wrapper{ margin: 4px 0 0; }
		`
	]
})
export class DeleteConfirmDialogComponent {
	email = '';
	confirmText = '';
	expectedEmail = '';
	canConfirm(): boolean {
		return this.email.trim().toLowerCase() === this.expectedEmail && this.confirmText.trim() === '탈퇴합니다';
	}
}

@Component({
	selector: 'app-profile',
	standalone: true,
	imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatDividerModule, MatDialogModule],
	template: `
	<div class="profile" *ngIf="profile">
		<mat-card style="max-width:420px;">
			<mat-card-header>
				<mat-card-title>내 프로필</mat-card-title>
			</mat-card-header>
			<mat-card-content>
				<div style="display:grid; grid-template-columns: 92px 1fr; row-gap:8px; column-gap:12px;">
					<div>이름</div><div>{{ profile.name || '-' }}</div>
					<div>이메일</div><div>{{ profile.email }}</div>
					<div>권한</div><div>{{ profile.role }}</div>
					<div>가입일시</div><div>{{ profile.created_at | date:'yyyy-MM-dd HH:mm' }}</div>
					<div>최종수정일시</div><div>{{ profile.updated_at ? (profile.updated_at | date:'yyyy-MM-dd HH:mm') : '-' }}</div>
					<div>마지막 로그인</div><div>{{ profile.last_sign_in_at ? (profile.last_sign_in_at | date:'yyyy-MM-dd HH:mm') : '-' }}</div>
				</div>
				<mat-divider style="margin:14px 0;"></mat-divider>
				<div style="display:flex; gap:8px;">
					<button mat-flat-button color="primary" (click)="sendPasswordReset()">비밀번호 변경 메일 보내기</button>
					<button mat-stroked-button color="warn" (click)="confirmDelete()">탈퇴</button>
				</div>
			</mat-card-content>
		</mat-card>
	</div>
	`,
})
export class ProfileComponent implements OnInit {
	profile: any;
	private dialog = inject(MatDialog);
	private router = inject(Router);
	constructor(private supabase: SupabaseService) {}
	async ngOnInit() {
		const user = await this.supabase.getCurrentUser();
		if (user) {
			const { data } = await this.supabase.getUserProfile(user.id);
			this.profile = data;
		}
	}

	async sendPasswordReset() {
		if (!this.profile?.email) return;
		await this.supabase.getClient().auth.resetPasswordForEmail(this.profile.email, { redirectTo: location.origin + '/forgot-credentials' });
		alert('비밀번호 변경 메일을 보냈습니다. 메일의 링크를 눌러 새 비밀번호를 설정하세요.');
	}

	async confirmDelete() {
		if (!this.profile) return;
		const ref = this.dialog.open(DeleteConfirmDialogComponent);
		(ref.componentInstance as DeleteConfirmDialogComponent).expectedEmail = (this.profile.email || '').toLowerCase();
		(ref.componentInstance as DeleteConfirmDialogComponent).email = (this.profile.email || '').toLowerCase();
		const result = await ref.afterClosed().toPromise();
		if (!result || !result.confirm) return;
		try {
			await this.supabase.selfDelete(String(result.email || '').toLowerCase());
			// 로컬 세션 정리 및 메뉴/상태 초기화 전에 약간의 지연
			await new Promise(r => setTimeout(r, 300));
			await this.supabase.signOut();
			alert('탈퇴가 완료되었습니다. 이용해 주셔서 감사합니다.');
			this.router.navigate(['/login']);
		} catch (e: any) {
			alert('탈퇴 처리 중 오류가 발생했습니다: ' + (e?.message || e));
		}
	}
}
