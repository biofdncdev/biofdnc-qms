# Supabase Service Refactoring Plan

## Current Status
- `supabase.service.ts`: 2194 lines (too large, contains all functionality)
- Other services partially implemented but mostly delegating back to supabase.service.ts

## Issues Found
1. Many methods are duplicated between services
2. Some services just delegate to supabase.service.ts instead of implementing directly
3. `syncProductsByExcel` and `syncMaterialsByExcel` are very large methods (200+ lines each) still in supabase.service.ts
4. Record file index methods added after initial refactoring are still in supabase.service.ts

## Refactoring Steps

### 1. Core Service (supabase-core.service.ts)
- **Keep only**: Client management (getClient)
- **Remove**: All business logic

### 2. Auth Service (auth.service.ts)
**Already has:**
- Basic auth methods
- User management
- Notifications (partial)

**Need to add from supabase.service.ts:**
- countUnreadNotifications()
- markAllNotificationsRead()
- addSignupNotification()
- addDeleteRequestNotification()
- resendConfirmationEmail() - full implementation
- purgeEmailEverywhere()
- selfDelete()

### 3. ERP Data Service (erp-data.service.ts)
**Already has:**
- Product/Material/Ingredient CRUD
- Basic search methods

**Need to add from supabase.service.ts:**
- syncProductsByExcel() - full implementation (200+ lines)
- syncMaterialsByExcel() - full implementation (100+ lines)
- getIngredientsByNames()
- getCompositionCountsForIngredients()
- getMaterialsByIds()

### 4. Record Service (record.service.ts)
**Already has:**
- Form metadata
- TH records
- Categories

**Need to add from supabase.service.ts:**
- getRecordIdFromRecordNo()
- All recent record_id related updates

### 5. Storage Service (storage.service.ts)
**Already has:**
- File upload methods
- Template management

**Need to add from supabase.service.ts:**
- Record file index methods (getRecordFileIndex, saveRecordFileIndex, updateRecordFileIndexEntry)
- extractFormIdFromPath()

### 6. Audit Service (audit.service.ts)
- Already complete

### 7. Organization Service (organization.service.ts)
**Already has:**
- Department management

**Need to add from supabase.service.ts:**
- Company management methods

## Implementation Order
1. Update each service with full implementations (not delegates)
2. Remove duplicated methods from supabase.service.ts
3. Update all imports in components to use specific services
4. Rename supabase.service.ts to supabase-core.service.ts with only client management
5. Create compatibility layer for gradual migration
