import { Prisma } from '@prisma/client';

// TypeScript Enums (Prisma 7 не генерує їх автоматично)
export enum TenderStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum MarginPayer {
  CLIENT = 'CLIENT',
  OWNER = 'OWNER'
}

export enum RouteType {
  LOADING = 'LOADING',
  UNLOADING = 'UNLOADING'
}

// Export Prisma generated types
export type User = Prisma.UserGetPayload<{}>;
export type Tender = Prisma.TenderGetPayload<{}>;
export type TenderRoute = Prisma.TenderRouteGetPayload<{}>;

// Complex types with relations
export type TenderWithRoutes = Prisma.TenderGetPayload<{
  include: { routes: true };
}>;

export type TenderWithUser = Prisma.TenderGetPayload<{
  include: { user: true };
}>;

export type TenderWithAll = Prisma.TenderGetPayload<{
  include: { 
    routes: true;
    user: true;
  };
}>;
