import { Prisma } from '@prisma/client';

// Export Prisma generated types
export type User = Prisma.UserGetPayload<{}>;
export type Tender = Prisma.TenderGetPayload<{}>;
export type TenderRoute = Prisma.TenderRouteGetPayload<{}>;

// Export enums
export { TenderStatus, MarginPayer, RouteType } from '@prisma/client';

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
