/*
  Warnings:

  - You are about to drop the `FechaOcupada` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "FechaOcupada";

-- CreateTable
CREATE TABLE "Reserva" (
    "id" SERIAL NOT NULL,
    "fechaInicio" TEXT NOT NULL,
    "fechaFin" TEXT NOT NULL,
    "motivo" TEXT,
    "cliente" TEXT,
    "sena" BOOLEAN NOT NULL DEFAULT false,
    "montoSena" DOUBLE PRECISION,
    "pago" BOOLEAN NOT NULL DEFAULT false,
    "montoPago" DOUBLE PRECISION,
    "googleEventId" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reserva_pkey" PRIMARY KEY ("id")
);
