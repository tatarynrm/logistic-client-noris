-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenders" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "load_date" TIMESTAMP(3) NOT NULL,
    "unload_date" TIMESTAMP(3),
    "driver_name" TEXT NOT NULL,
    "driver_phone" TEXT NOT NULL,
    "vehicle_info" TEXT NOT NULL,
    "owner_name" TEXT,
    "owner_phone" TEXT,
    "client_name" TEXT NOT NULL,
    "client_phone" TEXT,
    "client_payment" DOUBLE PRECISION NOT NULL,
    "my_margin" DOUBLE PRECISION NOT NULL,
    "margin_payer" TEXT NOT NULL DEFAULT 'client',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tender_routes" (
    "id" TEXT NOT NULL,
    "tender_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "display_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tender_routes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "tenders_user_id_idx" ON "tenders"("user_id");

-- CreateIndex
CREATE INDEX "tenders_load_date_idx" ON "tenders"("load_date");

-- CreateIndex
CREATE INDEX "tenders_status_idx" ON "tenders"("status");

-- CreateIndex
CREATE INDEX "tender_routes_tender_id_idx" ON "tender_routes"("tender_id");

-- CreateIndex
CREATE INDEX "tender_routes_type_idx" ON "tender_routes"("type");

-- AddForeignKey
ALTER TABLE "tenders" ADD CONSTRAINT "tenders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tender_routes" ADD CONSTRAINT "tender_routes_tender_id_fkey" FOREIGN KEY ("tender_id") REFERENCES "tenders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
