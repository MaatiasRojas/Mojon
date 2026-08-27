-- CreateTable
CREATE TABLE "FechaOcupada" (
    "id" SERIAL NOT NULL,
    "fecha" TEXT NOT NULL,
    "motivo" TEXT,
    "cliente" TEXT,
    "sena" BOOLEAN NOT NULL DEFAULT false,
    "montoSena" DOUBLE PRECISION,
    "pago" BOOLEAN NOT NULL DEFAULT false,
    "montoPago" DOUBLE PRECISION,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FechaOcupada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FechaOcupada_fecha_key" ON "FechaOcupada"("fecha");
