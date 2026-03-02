import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { tripSchema } from '@/lib/validations/trip';
import { z } from 'zod';
import { MarginPayer, TenderStatus, RouteType, type TenderWithRoutes, type TenderRoute } from '@/types/prisma';
import { transformTenderToTrip } from '@/lib/transformers';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Не авторизовано' }, { status: 401 });
    }

    const tenders = await prisma.tender.findMany({
      where: { userId: session.userId },
      include: {
        routes: {
          orderBy: { sequence: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    // Конвертуємо в формат фронтенду
    const trips = tenders.map(transformTenderToTrip);

    return NextResponse.json({ trips });
  } catch (error) {
    console.error('Помилка завантаження рейсів:', error);
    return NextResponse.json({ error: 'Помилка завантаження рейсів' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Не авторизовано' }, { status: 401 });
    }

    const body = await request.json();

    // Валідація з Zod
    const validatedData = tripSchema.parse(body);

    // Конвертація значень в енуми
    let marginPayerValue: MarginPayer;
    if (validatedData.margin_payer.toLowerCase() === 'client') {
      marginPayerValue = MarginPayer.CLIENT;
    } else {
      marginPayerValue = MarginPayer.OWNER;
    }

    // Status вже в правильному форматі (UPPERCASE)
    const statusValue = validatedData.status as TenderStatus;

    const tender = await prisma.tender.create({
      data: {
        userId: session.userId,
        loadDate: new Date(validatedData.load_date),
        unloadDate: validatedData.unload_date ? new Date(validatedData.unload_date) : null,
        driverName: validatedData.driver_name,
        driverPhone: validatedData.driver_phone,
        vehicleInfo: validatedData.vehicle_info,
        ownerName: validatedData.owner_name || null,
        ownerPhone: validatedData.owner_phone || null,
        clientName: validatedData.client_name,
        clientPhone: validatedData.client_phone || null,
        clientPayment: typeof validatedData.client_payment === 'string'
          ? parseFloat(validatedData.client_payment)
          : validatedData.client_payment,
        myMargin: typeof validatedData.my_margin === 'string'
          ? parseFloat(validatedData.my_margin)
          : validatedData.my_margin,
        marginPayer: marginPayerValue,
        status: statusValue,
routes: {
          create: [
            // Load points: починаємо з 0
            ...validatedData.load_points.map((point, index) => ({
              type: 'LOADING',
              sequence: index, 
              name: point.name,
              lat: point.lat,
              lng: point.lng,
              displayName: point.displayName,
            })),
            // Unload points: продовжуємо нумерацію після load_points
            ...validatedData.unload_points.map((point, index) => ({
              type: 'UNLOADING',
              sequence: validatedData.load_points.length + index, // <--- ЗМІНА ТУТ
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
    console.log(tender, 'TENDER');

    // Конвертуємо в формат фронтенду
    const trip = transformTenderToTrip(tender);

    const io = (global as any).io;
    if (io) {
      io.to(`user-${session.userId}`).emit('trip-created', trip);
    }

    return NextResponse.json({ trip });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: error.errors[0].message,
          field: error.errors[0].path[0],
          errors: error.errors
        },
        { status: 400 }
      );
    }

    console.error('Помилка створення рейсу:', error);
    return NextResponse.json({ error: 'Помилка створення рейсу' }, { status: 500 });
  }
}
