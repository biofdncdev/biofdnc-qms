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
	<div class="dialog">
		<h3>계정 탈퇴</h3>
		<p style="margin:6px 0 16px;">보안을 위해 본인 확인이 필요합니다. 아래 내용을 입력해 주세요.</p>
		<mat-form-field appearance="outline" style="width:100%; margin-bottom:10px;">
			<mat-label>이메일</mat-label>
			<input matInput [(ngModel)]="email" placeholder="email@example.com">
		</mat-form-field>
		<mat-form-field appearance="outline" style="width:100%;">
			<mat-label>확인 문구</mat-label>
			<input matInput [(ngModel)]="confirmText" placeholder="탈퇴합니다">
		</mat-form-field>
		<div style="display:flex; gap:8px; justify-content:flex-end; margin-top:16px;">
			<button mat-button mat-dialog-close>취소</button>
			<button mat-flat-button color="warn" [disabled]="!canConfirm()" [mat-dialog-close]="{ email, confirm: true }">탈퇴</button>
		</div>
	</div>
	`,
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
		await this.supabase.getClient().auth.resetPasswordForEmail(this.profile.email, { redirectTo: location.origin + '/login' });
		alert('비밀번호 변경 메일을 보냈습니다. 메일함을 확인하세요.');
	}

	async confirmDelete() {
		if (!this.profile) return;
		const ref = this.dialog.open(DeleteConfirmDialogComponent);
		(ref.componentInstance as DeleteConfirmDialogComponent).expectedEmail = (this.profile.email || '').toLowerCase();
		const result = await ref.afterClosed().toPromise();
		if (!result || !result.confirm) return;
		try {
			await this.supabase.deleteUser(this.profile.id);
			alert('탈퇴가 완료되었습니다. 이용해 주셔서 감사합니다.');
			await this.supabase.signOut();
			this.router.navigate(['/login']);
		} catch (e: any) {
			alert('탈퇴 처리 중 오류가 발생했습니다: ' + (e?.message || e));
		}
	}
}
