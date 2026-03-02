import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { MarginPayer, TenderStatus, RouteType, type TenderRoute } from '@/types/prisma';
import { transformTenderToTrip } from '@/lib/transformers';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Не авторизовано' }, { status: 401 });
    }

    const data = await request.json();
    const { id } = params;

    const existingTender = await prisma.tender.findUnique({ where: { id } });
    if (!existingTender || existingTender.userId !== session.userId) {
      return NextResponse.json({ error: 'Рейс не знайдено' }, { status: 404 });
    }

    const tender = await prisma.tender.update({
      where: { id },
      data: {
        loadDate: new Date(data.load_date),
        unloadDate: data.unload_date ? new Date(data.unload_date) : null,
        driverName: data.driver_name,
        driverPhone: data.driver_phone,
        vehicleInfo: data.vehicle_info,
        ownerName: data.owner_name || null,
        ownerPhone: data.owner_phone || null,
        clientName: data.client_name,
        clientPhone: data.client_phone || null,
        clientPayment: parseFloat(data.client_payment),
        myMargin: parseFloat(data.my_margin),
        marginPayer: data.margin_payer.toLowerCase() === 'client' ? MarginPayer.CLIENT : MarginPayer.OWNER,
        status: data.status as TenderStatus,
        routes: {
          deleteMany: {},
          create: [
            ...data.load_points.map((point: any, index: number) => ({
              type: RouteType.LOADING,
              sequence: index,
              name: point.name,
              lat: point.lat,
              lng: point.lng,
              displayName: point.displayName,
            })),
            ...data.unload_points.map((point: any, index: number) => ({
              type: RouteType.UNLOADING,
              sequence: data.load_points.length + index,
              name: point.name,
              lat: point.lat,
              lng: point.lng,
              displayName: point.displayName,
            })),
          ]
        }
      },
      include: {
        routes: {
          orderBy: { sequence: 'asc' }
        }
      }
    });

    // Конвертуємо в формат фронтенду
    const trip = transformTenderToTrip(tender);

    const io = (global as any).io;
    if (io) {
      io.to(`user-${session.userId}`).emit('trip-updated', trip);
    }

    return NextResponse.json({ trip });
  } catch (error) {
    console.error('Помилка оновлення рейсу:', error);
    return NextResponse.json({ error: 'Помилка оновлення рейсу' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Не авторизовано' }, { status: 401 });
    }

    const { id } = params;

    const existingTender = await prisma.tender.findUnique({ where: { id } });
    if (!existingTender || existingTender.userId !== session.userId) {
      return NextResponse.json({ error: 'Рейс не знайдено' }, { status: 404 });
    }

    await prisma.tender.delete({ where: { id } });
    
    const io = (global as any).io;
    if (io) {
      io.to(`user-${session.userId}`).emit('trip-deleted', { id });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Помилка видалення рейсу:', error);
    return NextResponse.json({ error: 'Помилка видалення рейсу' }, { status: 500 });
  }
}
