# Service Architecture

## Overview
The services have been refactored to improve maintainability and prepare for ERP API integration.

## Service Structure

### Core Service
- **SupabaseService** - Manages the Supabase client instance
  - Provides client access to other services
  - Maintains singleton pattern with HMR support

### Feature Services

#### 1. AuthService
- User authentication and authorization
- User profile management
- Notifications
- Admin functions

#### 2. ErpDataService (ERP API Ready)
- **Products** - 품목 관리 (will be replaced by ERP API)
- **Materials** - 자재 관리 (will be replaced by ERP API)
- **Ingredients** - 원료 관리 (will be replaced by ERP API)
- Product compositions and BOM
- Sales orders and deliveries
- Excel sync functions (temporary until ERP API)

#### 3. AuditService
- Audit assessments
- Audit progress tracking
- Audit companies
- Audit resources
- Date metadata

#### 4. RecordService
- RMD form metadata
- Temperature/humidity records
- RMD categories and records
- Record document management

#### 5. StorageService
- File uploads (images, PDFs)
- Document templates
- Cross-device file indexing
- Product exports

#### 6. OrganizationService
- Department management
- Company management
- Usage tracking

## Migration Status ✅

### Migration Complete!
All components have been successfully migrated to use domain-specific services directly.
The compatibility layer (`supabase.service.ts`) has been removed.

### Current Usage:

```typescript
// All components now use domain services directly
constructor(private auth: AuthService) {}  // For authentication
constructor(private erpData: ErpDataService) {}  // For products/materials
constructor(private record: RecordService) {}  // For records
constructor(private storage: StorageService) {}  // For file storage
constructor(private audit: AuditService) {}  // For audits
constructor(private organization: OrganizationService) {}  // For org management
```

## ERP API Integration

The `ErpDataService` is designed to be easily replaced with ERP API calls:

1. All product/material/ingredient methods are isolated in this service
2. The service interface will remain the same
3. When ERP API is ready, only the implementation needs to change
4. Excel sync methods will be replaced with API sync methods

## Benefits

1. **Separation of Concerns** - Each service has a single responsibility
2. **ERP Ready** - Easy migration path for ERP data
3. **Smaller Files** - Each service is ~300-500 lines instead of 2000+
4. **Better Testing** - Services can be tested independently
5. **Clear Dependencies** - Easy to see what each component uses
6. **Maintainability** - Easier to find and fix issues
