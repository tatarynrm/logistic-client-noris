import { z } from 'zod';

const locationPointSchema = z.object({
  name: z.string().min(1, "Обов'язкове поле"),
  lat: z.number(),
  lng: z.number(),
  displayName: z.string().min(1, "Обов'язкове поле"),
});

export const tripSchema = z.object({
  load_date: z.string().min(1, 'Оберіть дату завантаження'),
  unload_date: z.string().optional().nullable(),
  driver_name: z.string().min(2, "Ім'я водія має бути мінімум 2 символи"),
  driver_phone: z.string().min(2, 'Невірний формат телефону'),
  vehicle_info: z.string().min(2, 'Вкажіть інформацію про транспорт'),
  owner_name: z.string().optional().nullable(),
  owner_phone: z.string().optional().nullable(),
  client_name: z.string().min(2, "Ім'я клієнта має бути мінімум 2 символи"),
  client_phone: z.string().optional().nullable(),
  client_payment: z.union([
    z.string().min(1, 'Вкажіть оплату клієнта'),
    z.number().positive('Оплата має бути більше 0'),
  ]),
  my_margin: z.union([
    z.string().min(1, 'Вкажіть вашу маржу'),
    z.number(),
  ]),
  margin_payer: z.enum(['client', 'owner', 'CLIENT', 'OWNER'], {
    errorMap: () => ({ message: 'Оберіть хто платить маржу' }),
  }),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).default('PENDING'),
  load_points: z.array(locationPointSchema).min(1, 'Додайте хоча б одну точку завантаження'),
  unload_points: z.array(locationPointSchema).min(1, 'Додайте хоча б одну точку вигрузки'),
});

export type TripInput = z.infer<typeof tripSchema>;
export type LocationPoint = z.infer<typeof locationPointSchema>;
