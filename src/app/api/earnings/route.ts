import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { RouteType, type TenderWithRoutes, type TenderRoute } from '@/types/prisma';
import { transformTenderToTrip } from '@/lib/transformers';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Не авторизовано' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Потрібні дати початку та кінця' }, { status: 400 });
    }

    const tenders = await prisma.tender.findMany({
      where: {
        userId: session.userId,
        loadDate: {
          gte: new Date(startDate),
          lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
        },
      },
      include: {
        routes: {
          orderBy: { sequence: 'asc' }
        }
      },
      orderBy: { loadDate: 'asc' },
    });

    // Конвертуємо в формат фронтенду
    const trips = tenders.map(transformTenderToTrip);

    const totalMargin = trips.reduce((sum: number, trip) => sum + trip.my_margin, 0);
    const totalPayment = trips.reduce((sum: number, trip) => sum + trip.client_payment, 0);

    return NextResponse.json({
      trips,
      summary: {
        totalMargin,
        totalPayment,
        tripCount: trips.length,
      },
    });
  } catch (error) {
    console.error('Помилка завантаження даних:', error);
    return NextResponse.json({ error: 'Помилка завантаження даних' }, { status: 500 });
  }
}
