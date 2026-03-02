import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { RouteType, type TenderRoute } from '@/types/prisma';
import { transformTenderToTrip } from '@/lib/transformers';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Не авторизовано' }, { status: 401 });
    }

    const { status } = await request.json();
    const { id } = params;

    const existingTender = await prisma.tender.findUnique({ where: { id } });
    if (!existingTender || existingTender.userId !== session.userId) {
      return NextResponse.json({ error: 'Рейс не знайдено' }, { status: 404 });
    }

    const tender = await prisma.tender.update({
      where: { id },
      data: { status },
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
    console.error('Помилка оновлення статусу:', error);
    return NextResponse.json({ error: 'Помилка оновлення статусу' }, { status: 500 });
  }
}
