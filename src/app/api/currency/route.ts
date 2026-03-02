// src/app/api/currency/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const valcode = searchParams.get('valcode');
  const startDate = searchParams.get('start');
  const endDate = searchParams.get('end');


  if (!valcode || !startDate || !endDate) {
    return NextResponse.json({ error: 'Missing required query parameters' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://bank.gov.ua/NBU_Exchange/exchange_site?start=${startDate}&end=${endDate}&valcode=${valcode}&sort=exchangedate&order=desc&json`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from NBU API');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}
