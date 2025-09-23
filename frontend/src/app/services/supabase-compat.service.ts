import { Injectable } from '@angular/core';
import { SupabaseClient, User } from '@supabase/supabase-js';
import { SupabaseCoreService } from './supabase-core.service';
import { AuthService } from './auth.service';
import { ErpDataService } from './erp-data.service';
import { RecordService } from './record.service';
import { StorageService } from './storage.service';
import { AuditService } from './audit.service';
import { OrganizationService } from './organization.service';

/**
 * Supabase Service (Compatibility Layer)
 * 
 * 기존 코드와의 호환성을 위한 서비스입니다.
 * 모든 메서드는 deprecated이며, 점진적으로 각 도메인 서비스로 마이그레이션해야 합니다.
 * 
 * @deprecated 이 서비스 대신 도메인별 서비스를 직접 사용하세요:
 * - AuthService: 인증 및 사용자 관리
 * - ErpDataService: 제품, 자재, 원료 관리
 * - RecordService: 기록 및 문서 관리
 * - StorageService: 파일 저장소 관리
 * - AuditService: 감사 관리
 * - OrganizationService: 조직 관리
 */
@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  constructor(
    private core: SupabaseCoreService,
    private auth: AuthService,
    private erpData: ErpDataService,
    private record: RecordService,
    private storage: StorageService,
    private audit: AuditService,
    private organization: OrganizationService
  ) {}

  /**
   * @deprecated Use SupabaseCoreService.getClient() instead
   */
  getClient(): SupabaseClient {
    return this.core.getClient();
  }

  /**
   * @deprecated Use SupabaseCoreService.getClient() instead
   */
  private ensureClient(): SupabaseClient {
    return this.core.getClient();
  }

  // ===== Auth Methods (Delegate to AuthService) =====
  
  /**
   * @deprecated Use AuthService.signIn() instead
   */
  async signIn(email: string, password: string) {
    return this.auth.signIn(email, password);
  }

  /**
   * @deprecated Use AuthService.signOut() instead
   */
  async signOut() {
    return this.auth.signOut();
  }

  /**
   * @deprecated Use AuthService.getCurrentUser() instead
   */
  async getCurrentUser(): Promise<User | null> {
    return this.auth.getCurrentUser();
  }

  /**
   * @deprecated Use AuthService.getUserProfile() instead
   */
  async getUserProfile(id: string) {
    return this.auth.getUserProfile(id);
  }

  /**
   * @deprecated Use AuthService.listUsers() instead
   */
  async listUsers() {
    return this.auth.listUsers();
  }

  /**
   * @deprecated Use AuthService.updateUserRole() instead
   */
  async updateUserRole(id: string, role: string) {
    return this.auth.updateUserRole(id, role);
  }

  /**
   * @deprecated Use AuthService.updateUserName() instead
   */
  async updateUserName(id: string, name: string) {
    return this.auth.updateUserName(id, name);
  }

  /**
   * @deprecated Use AuthService.sendPasswordResetEmail() instead
   */
  async sendPasswordResetEmail(email: string) {
    return this.auth.sendPasswordResetEmail(email);
  }

  /**
   * @deprecated Use AuthService.updateLoginState() instead
   */
  async updateLoginState(id: string, isOnline: boolean) {
    return this.auth.updateLoginState(id, isOnline);
  }

  /**
   * @deprecated Use AuthService.setUserPassword() instead
   */
  async setUserPassword(id: string, newPassword: string) {
    return this.auth.setUserPassword(id, newPassword);
  }

  /**
   * @deprecated Use AuthService.deleteUser() instead
   */
  async deleteUser(id: string) {
    return this.auth.deleteUser(id);
  }

  /**
   * @deprecated Use AuthService.forceConfirmUser() instead
   */
  async forceConfirmUser(userId: string) {
    return this.auth.forceConfirmUser(userId);
  }

  /**
   * @deprecated Use AuthService.forceConfirmByEmail() instead
   */
  async forceConfirmByEmail(email: string) {
    return this.auth.forceConfirmByEmail(email);
  }

  /**
   * @deprecated Use AuthService.ensureUserProfileById() instead
   */
  async ensureUserProfileById(userId: string, fallback?: { email: string; name?: string }) {
    return this.auth.ensureUserProfileById(userId, fallback);
  }

  /**
   * @deprecated Use AuthService.findUserIdByEmail() instead
   */
  async findUserIdByEmail(email: string) {
    return this.auth.findUserIdByEmail(email);
  }

  /**
   * @deprecated Use AuthService.listNotifications() instead
   */
  async listNotifications() {
    return this.auth.listNotifications();
  }

  /**
   * @deprecated Use AuthService.countUnreadNotifications() instead
   */
  async countUnreadNotifications() {
    return this.auth.countUnreadNotifications();
  }

  /**
   * @deprecated Use AuthService.markAllNotificationsRead() instead
   */
  async markAllNotificationsRead() {
    return this.auth.markAllNotificationsRead();
  }

  /**
   * @deprecated Use AuthService.addSignupNotification() instead
   */
  async addSignupNotification(payload: { email: string; name?: string | null }) {
    return this.auth.addSignupNotification(payload);
  }

  /**
   * @deprecated Use AuthService.addDeleteRequestNotification() instead
   */
  async addDeleteRequestNotification(payload: { email: string }) {
    return this.auth.addDeleteRequestNotification(payload);
  }

  /**
   * @deprecated Use AuthService.resendConfirmationEmail() instead
   */
  async resendConfirmationEmail(email: string) {
    return this.auth.resendConfirmationEmail(email);
  }

  /**
   * @deprecated Use AuthService.purgeEmailEverywhere() instead
   */
  async purgeEmailEverywhere(email: string) {
    return this.auth.purgeEmailEverywhere(email);
  }

  /**
   * @deprecated Use AuthService.selfDelete() instead
   */
  async selfDelete(confirmEmail: string) {
    return this.auth.selfDelete(confirmEmail);
  }

  /**
   * @deprecated No longer needed
   */
  async ensureUserProfile(user: User) {
    // No longer auto-creates profiles
    return;
  }

  // ===== ERP Data Methods (Delegate to ErpDataService) =====

  /**
   * @deprecated Use ErpDataService.listProducts() instead
   */
  async listProducts(params: { page?: number; pageSize?: number; keyword?: string; keywordOp?: 'AND'|'OR' }) {
    return this.erpData.listProducts(params);
  }

  /**
   * @deprecated Use ErpDataService.quickSearchProducts() instead
   */
  async quickSearchProducts(keyword: string) {
    return this.erpData.quickSearchProducts(keyword);
  }

  /**
   * @deprecated Use ErpDataService.getProduct() instead
   */
  async getProduct(id: string) {
    return this.erpData.getProduct(id);
  }

  /**
   * @deprecated Use ErpDataService.getProductByCode() instead
   */
  async getProductByCode(product_code: string) {
    return this.erpData.getProductByCode(product_code);
  }

  /**
   * @deprecated Use ErpDataService.upsertProduct() instead
   */
  async upsertProduct(row: any) {
    return this.erpData.upsertProduct(row);
  }

  /**
   * @deprecated Use ErpDataService.deleteProduct() instead
   */
  async deleteProduct(id: string) {
    return this.erpData.deleteProduct(id);
  }

  /**
   * @deprecated Use ErpDataService.getProductColumnMap() instead
   */
  async getProductColumnMap() {
    return this.erpData.getProductColumnMap();
  }

  /**
   * @deprecated Use ErpDataService.syncProductsByExcel() instead
   */
  async syncProductsByExcel(payload: { sheet: any[]; headerMap?: Record<string,string>; deleteMode?: 'none' | 'missing' | 'all' }) {
    return this.erpData.syncProductsByExcel(payload);
  }

  /**
   * @deprecated Use ErpDataService.getProductVerifyLogs() instead
   */
  async getProductVerifyLogs(id: string) {
    return this.erpData.getProductVerifyLogs(id);
  }

  /**
   * @deprecated Use ErpDataService.setProductVerifyLogs() instead
   */
  async setProductVerifyLogs(id: string, logs: Array<{ user: string; time: string }>) {
    return this.erpData.setProductVerifyLogs(id, logs);
  }

  /**
   * @deprecated Use ErpDataService.getProductMaterialsVerifyLogs() instead
   */
  async getProductMaterialsVerifyLogs(id: string) {
    return this.erpData.getProductMaterialsVerifyLogs(id);
  }

  /**
   * @deprecated Use ErpDataService.setProductMaterialsVerifyLogs() instead
   */
  async setProductMaterialsVerifyLogs(id: string, logs: Array<{ user: string; time: string }>) {
    return this.erpData.setProductMaterialsVerifyLogs(id, logs);
  }

  /**
   * @deprecated Use ErpDataService.listProductCompositions() instead
   */
  async listProductCompositions(product_id: string) {
    return this.erpData.listProductCompositions(product_id);
  }

  /**
   * @deprecated Use ErpDataService.addProductComposition() instead
   */
  async addProductComposition(row: { product_id: string; ingredient_id: string; percent?: number | null; note?: string | null; }) {
    return this.erpData.addProductComposition(row);
  }

  /**
   * @deprecated Use ErpDataService.updateProductComposition() instead
   */
  async updateProductComposition(id: string, row: Partial<{ percent: number; note: string; }>) {
    return this.erpData.updateProductComposition(id, row);
  }

  /**
   * @deprecated Use ErpDataService.deleteProductComposition() instead
   */
  async deleteProductComposition(id: string) {
    return this.erpData.deleteProductComposition(id);
  }

  /**
   * @deprecated Use ErpDataService.getBomMaterialSelection() instead
   */
  async getBomMaterialSelection(product_code: string) {
    return this.erpData.getBomMaterialSelection(product_code);
  }

  /**
   * @deprecated Use ErpDataService.setBomMaterialSelection() instead
   */
  async setBomMaterialSelection(row: { product_code: string; ingredient_name: string; selected_material_id?: string | null; selected_material_number?: string | null; note?: string | null; }) {
    return this.erpData.setBomMaterialSelection(row);
  }

  /**
   * @deprecated Use ErpDataService.listMaterials() instead
   */
  async listMaterials(params: { page?: number; pageSize?: number; keyword?: string; keywordOp?: 'AND' | 'OR' }) {
    return this.erpData.listMaterials(params);
  }

  /**
   * @deprecated Use ErpDataService.upsertMaterial() instead
   */
  async upsertMaterial(row: any) {
    return this.erpData.upsertMaterial(row);
  }

  /**
   * @deprecated Use ErpDataService.deleteMaterial() instead
   */
  async deleteMaterial(id: string) {
    return this.erpData.deleteMaterial(id);
  }

  /**
   * @deprecated Use ErpDataService.getMaterial() instead
   */
  async getMaterial(id: string) {
    return this.erpData.getMaterial(id);
  }

  /**
   * @deprecated Use ErpDataService.getMaterialColumnMap() instead
   */
  async getMaterialColumnMap() {
    return this.erpData.getMaterialColumnMap();
  }

  /**
   * @deprecated Use ErpDataService.getMaterialsByIds() instead
   */
  async getMaterialsByIds(ids: string[]) {
    return this.erpData.getMaterialsByIds(ids);
  }

  /**
   * @deprecated Use ErpDataService.syncMaterialsByExcel() instead
   */
  async syncMaterialsByExcel(payload: { sheet: any[]; headerMap?: Record<string,string> }) {
    return this.erpData.syncMaterialsByExcel(payload);
  }

  /**
   * @deprecated Use ErpDataService.listMaterialsBySpecificationExact() instead
   */
  async listMaterialsBySpecificationExact(spec: string) {
    return this.erpData.listMaterialsBySpecificationExact(spec);
  }

  /**
   * @deprecated Use ErpDataService.listIngredients() instead
   */
  async listIngredients(params: { page?: number; pageSize?: number; keyword?: string; keywordOp?: 'AND' | 'OR'; }) {
    return this.erpData.listIngredients(params);
  }

  /**
   * @deprecated Use ErpDataService.getIngredient() instead
   */
  async getIngredient(id: string) {
    return this.erpData.getIngredient(id);
  }

  /**
   * @deprecated Use ErpDataService.upsertIngredient() instead
   */
  async upsertIngredient(row: any) {
    return this.erpData.upsertIngredient(row);
  }

  /**
   * @deprecated Use ErpDataService.searchIngredientsBasic() instead
   */
  async searchIngredientsBasic(keyword: string) {
    return this.erpData.searchIngredientsBasic(keyword);
  }

  /**
   * @deprecated Use ErpDataService.getIngredientsByNames() instead
   */
  async getIngredientsByNames(names: string[]) {
    return this.erpData.getIngredientsByNames(names);
  }

  /**
   * @deprecated Use ErpDataService.getCompositionCountsForIngredients() instead
   */
  async getCompositionCountsForIngredients(ingredientIds: string[]) {
    return this.erpData.getCompositionCountsForIngredients(ingredientIds);
  }

  /**
   * @deprecated Use ErpDataService.createSalesOrder() instead
   */
  async createSalesOrder(row: { product_key: string; order_no?: string | null; order_date?: string | null; order_qty?: number | null; created_by?: string | null; created_by_name?: string | null; }) {
    return this.erpData.createSalesOrder(row);
  }

  /**
   * @deprecated Use ErpDataService.updateSalesOrder() instead
   */
  async updateSalesOrder(id: string, row: Partial<{ order_no: string; order_date: string; order_qty: number; }>) {
    return this.erpData.updateSalesOrder(id, row);
  }

  /**
   * @deprecated Use ErpDataService.listSalesOrders() instead
   */
  async listSalesOrders(product_key: string) {
    return this.erpData.listSalesOrders(product_key);
  }

  /**
   * @deprecated Use ErpDataService.addSalesDelivery() instead
   */
  async addSalesDelivery(row: { order_id: string; due_date?: string | null; qty?: number | null; outsource_date?: string | null; outsource_qty?: number | null; }) {
    return this.erpData.addSalesDelivery(row);
  }

  /**
   * @deprecated Use ErpDataService.updateSalesDelivery() instead
   */
  async updateSalesDelivery(id: string, row: Partial<{ due_date: string; qty: number; outsource_date: string; outsource_qty: number; }>) {
    return this.erpData.updateSalesDelivery(id, row);
  }

  /**
   * @deprecated Use ErpDataService.deleteSalesDelivery() instead
   */
  async deleteSalesDelivery(id: string) {
    return this.erpData.deleteSalesDelivery(id);
  }

  /**
   * @deprecated Use ErpDataService.logDeliveryChange() instead
   */
  async logDeliveryChange(row: { delivery_id: string; field: string; old_value?: string | null; new_value?: string | null; changed_by?: string | null; changed_by_name?: string | null; }) {
    return this.erpData.logDeliveryChange(row);
  }

  /**
   * @deprecated Use ErpDataService.listDeliveryChanges() instead
   */
  async listDeliveryChanges(delivery_id: string) {
    return this.erpData.listDeliveryChanges(delivery_id);
  }

  // ===== Record Methods (Delegate to RecordService) =====

  /**
   * @deprecated Use RecordService.getFormMeta() instead
   */
  async getFormMeta(form_id: string) {
    return this.record.getFormMeta(form_id);
  }

  /**
   * @deprecated Use RecordService.upsertFormMeta() instead
   */
  async upsertFormMeta(row: any) {
    return this.record.upsertFormMeta(row);
  }

  /**
   * @deprecated Use RecordService.updateFormMetaByRecordNo() instead
   */
  async updateFormMetaByRecordNo(prevRecordNo: string, changes: any) {
    return this.record.updateFormMetaByRecordNo(prevRecordNo, changes);
  }

  /**
   * @deprecated Use RecordService.deleteFormMeta() instead
   */
  async deleteFormMeta(recordNo: string) {
    return this.record.deleteFormMeta(recordNo);
  }

  /**
   * @deprecated Use RecordService.listAllFormMeta() instead
   */
  async listAllFormMeta() {
    return this.record.listAllFormMeta();
  }

  /**
   * @deprecated Use RecordService.getThRecord() instead
   */
  async getThRecord(formId: string, weekStart: string) {
    return this.record.getThRecord(formId, weekStart);
  }

  /**
   * @deprecated Use RecordService.upsertThRecord() instead
   */
  async upsertThRecord(row: any) {
    return this.record.upsertThRecord(row);
  }

  /**
   * @deprecated Use RecordService.getLatestThRecord() instead
   */
  async getLatestThRecord(formId: string) {
    return this.record.getLatestThRecord(formId);
  }

  /**
   * @deprecated Use RecordService.listThWeeks() instead
   */
  async listThWeeks(formId: string) {
    return this.record.listThWeeks(formId);
  }

  /**
   * @deprecated Use RecordService.listRmdCategories() instead
   */
  async listRmdCategories() {
    return this.record.listRmdCategories();
  }

  /**
   * @deprecated Use RecordService.upsertRmdCategory() instead
   */
  async upsertRmdCategory(row: any) {
    return this.record.upsertRmdCategory(row);
  }

  /**
   * @deprecated Use RecordService.deleteRmdCategory() instead
   */
  async deleteRmdCategory(id: string) {
    return this.record.deleteRmdCategory(id);
  }

  /**
   * @deprecated Use RecordService.listRmdRecords() instead
   */
  async listRmdRecords() {
    return this.record.listRmdRecords();
  }

  /**
   * @deprecated Use RecordService.isRecordDocNoTaken() instead
   */
  async isRecordDocNoTaken(doc_no: string) {
    return this.record.isRecordDocNoTaken(doc_no);
  }

  /**
   * @deprecated Use RecordService.getNextRecordDocNo() instead
   */
  async getNextRecordDocNo(docPrefix: string) {
    return this.record.getNextRecordDocNo(docPrefix);
  }

  /**
   * @deprecated Use RecordService.upsertRmdRecord() instead
   */
  async upsertRmdRecord(row: any) {
    return this.record.upsertRmdRecord(row);
  }

  /**
   * @deprecated Use RecordService.deleteRmdRecord() instead
   */
  async deleteRmdRecord(id: string) {
    return this.record.deleteRmdRecord(id);
  }

  /**
   * @deprecated Use RecordService.getRecordIdFromRecordNo() instead
   */
  async getRecordIdFromRecordNo(record_no: string) {
    return this.record.getRecordIdFromRecordNo(record_no);
  }

  // ===== Storage Methods (Delegate to StorageService) =====

  /**
   * @deprecated Use StorageService.uploadAuditFile() instead
   */
  async uploadAuditFile(file: File, path: string) {
    return this.storage.uploadAuditFile(file, path);
  }

  /**
   * @deprecated Use StorageService.uploadRecordImage() instead
   */
  async uploadRecordImage(blob: Blob, path: string) {
    return this.storage.uploadRecordImage(blob, path);
  }

  /**
   * @deprecated Use StorageService.uploadRecordPdf() instead
   */
  async uploadRecordPdf(file: File, form_id: string) {
    return this.storage.uploadRecordPdf(file, form_id);
  }

  /**
   * @deprecated Use StorageService.listRecordPdfs() instead
   */
  async listRecordPdfs(form_id: string) {
    return this.storage.listRecordPdfs(form_id);
  }

  /**
   * @deprecated Use StorageService.deleteRecordPdf() instead
   */
  async deleteRecordPdf(path: string, bucket?: string) {
    return this.storage.deleteRecordPdf(path, bucket);
  }

  /**
   * @deprecated Use StorageService.uploadCompositionTemplate() instead
   */
  async uploadCompositionTemplate(file: File) {
    return this.storage.uploadCompositionTemplate(file);
  }

  /**
   * @deprecated Use StorageService.getCompositionTemplate() instead
   */
  async getCompositionTemplate() {
    return this.storage.getCompositionTemplate();
  }

  /**
   * @deprecated Use StorageService.deleteCompositionTemplate() instead
   */
  async deleteCompositionTemplate() {
    return this.storage.deleteCompositionTemplate();
  }

  /**
   * @deprecated Use StorageService.uploadProductExport() instead
   */
  async uploadProductExport(blob: Blob, path: string) {
    return this.storage.uploadProductExport(blob, path);
  }

  // ===== Audit Methods (Delegate to AuditService) =====

  /**
   * @deprecated Use AuditService.getGivaudanAssessment() instead
   */
  async getGivaudanAssessment(number: number) {
    return this.audit.getGivaudanAssessment(number);
  }

  /**
   * @deprecated Use AuditService.getGivaudanProgress() instead
   */
  async getGivaudanProgress(number: number, audit_date?: string | null) {
    return this.audit.getGivaudanProgress(number, audit_date);
  }

  /**
   * @deprecated Use AuditService.getGivaudanProgressByDate() instead
   */
  async getGivaudanProgressByDate(number: number, audit_date: string) {
    return this.audit.getGivaudanProgressByDate(number, audit_date);
  }

  /**
   * @deprecated Use AuditService.listAllGivaudanProgress() instead
   */
  async listAllGivaudanProgress(audit_date?: string | null) {
    return this.audit.listAllGivaudanProgress(audit_date);
  }

  /**
   * @deprecated Use AuditService.listGivaudanProgressByDate() instead
   */
  async listGivaudanProgressByDate(audit_date: string) {
    return this.audit.listGivaudanProgressByDate(audit_date);
  }

  /**
   * @deprecated Use AuditService.getAuditDateCreatedAt() instead
   */
  async getAuditDateCreatedAt(audit_date: string) {
    return this.audit.getAuditDateCreatedAt(audit_date);
  }

  /**
   * @deprecated Use AuditService.deleteGivaudanProgressByDate() instead
   */
  async deleteGivaudanProgressByDate(audit_date: string) {
    return this.audit.deleteGivaudanProgressByDate(audit_date);
  }

  /**
   * @deprecated Use AuditService.upsertGivaudanProgress() instead
   */
  async upsertGivaudanProgress(row: any) {
    return this.audit.upsertGivaudanProgress(row);
  }

  /**
   * @deprecated Use AuditService.upsertGivaudanProgressMany() instead
   */
  async upsertGivaudanProgressMany(rows: any[]) {
    return this.audit.upsertGivaudanProgressMany(rows);
  }

  /**
   * @deprecated Use AuditService.listSavedAuditDates() instead
   */
  async listSavedAuditDates() {
    return this.audit.listSavedAuditDates();
  }

  /**
   * @deprecated Use AuditService.upsertAuditDateMeta() instead
   */
  async upsertAuditDateMeta(audit_date: string, meta: any) {
    return this.audit.upsertAuditDateMeta(audit_date, meta);
  }

  /**
   * @deprecated Use AuditService.getAuditDateMeta() instead
   */
  async getAuditDateMeta(audit_date: string) {
    return this.audit.getAuditDateMeta(audit_date);
  }

  /**
   * @deprecated Use AuditService.listAllAuditDateMeta() instead
   */
  async listAllAuditDateMeta() {
    return this.audit.listAllAuditDateMeta();
  }

  /**
   * @deprecated Use AuditService.upsertAuditItems() instead
   */
  async upsertAuditItems(items: any[]) {
    return this.audit.upsertAuditItems(items);
  }

  /**
   * @deprecated Use AuditService.listAuditItems() instead
   */
  async listAuditItems() {
    return this.audit.listAuditItems();
  }

  /**
   * @deprecated Use AuditService.listAuditCompanies() instead
   */
  async listAuditCompanies() {
    return this.audit.listAuditCompanies();
  }

  /**
   * @deprecated Use AuditService.addAuditCompany() instead
   */
  async addAuditCompany(row: any) {
    return this.audit.addAuditCompany(row);
  }

  /**
   * @deprecated Use AuditService.updateAuditCompany() instead
   */
  async updateAuditCompany(id: string, row: any) {
    return this.audit.updateAuditCompany(id, row);
  }

  /**
   * @deprecated Use AuditService.deleteAuditCompany() instead
   */
  async deleteAuditCompany(id: string) {
    return this.audit.deleteAuditCompany(id);
  }

  /**
   * @deprecated Use AuditService.listGivaudanResources() instead
   */
  async listGivaudanResources(number: number) {
    return this.audit.listGivaudanResources(number);
  }

  /**
   * @deprecated Use AuditService.addGivaudanResource() instead
   */
  async addGivaudanResource(row: any) {
    return this.audit.addGivaudanResource(row);
  }

  /**
   * @deprecated Use AuditService.updateGivaudanResource() instead
   */
  async updateGivaudanResource(id: string, row: any) {
    return this.audit.updateGivaudanResource(id, row);
  }

  /**
   * @deprecated Use AuditService.deleteGivaudanResource() instead
   */
  async deleteGivaudanResource(id: string) {
    return this.audit.deleteGivaudanResource(id);
  }

  // ===== Organization Methods (Delegate to OrganizationService) =====

  /**
   * @deprecated Use OrganizationService.listDepartments() instead
   */
  async listDepartments() {
    return this.organization.listDepartments();
  }

  /**
   * @deprecated Use OrganizationService.upsertDepartment() instead
   */
  async upsertDepartment(row: any) {
    return this.organization.upsertDepartment(row);
  }

  /**
   * @deprecated Use OrganizationService.deleteDepartment() instead
   */
  async deleteDepartment(id: string) {
    return this.organization.deleteDepartment(id);
  }

  /**
   * @deprecated Use OrganizationService.countDepartmentUsage() instead
   */
  async countDepartmentUsage(params: { code: string; name: string }) {
    return this.organization.countDepartmentUsage(params);
  }

  /**
   * @deprecated Use OrganizationService.listCompanies() instead
   */
  async listCompanies() {
    return this.organization.listCompanies();
  }

  /**
   * @deprecated Use OrganizationService.upsertCompany() instead
   */
  async upsertCompany(row: any) {
    return this.organization.upsertCompany(row);
  }

  // Helper methods for internal use
  private recordIndexBucketId = 'rmd_records';

  /**
   * @deprecated Use StorageService.getRecordFileIndex() instead
   */
  async getRecordFileIndex(formId: string) {
    return this.storage.getRecordFileIndex(formId);
  }

  /**
   * @deprecated Use StorageService.saveRecordFileIndex() instead
   */
  async saveRecordFileIndex(formId: string, index: any) {
    return this.storage.saveRecordFileIndex(formId, index);
  }

  /**
   * @deprecated Use StorageService.updateRecordFileIndexEntry() instead
   */
  async updateRecordFileIndexEntry(formId: string, filePath: string, entry: any) {
    return this.storage.updateRecordFileIndexEntry(formId, filePath, entry);
  }

  /**
   * @deprecated Use StorageService.extractFormIdFromPath() instead
   */
  extractFormIdFromPath(path: string): string | null {
    return this.storage.extractFormIdFromPath(path);
  }
}
