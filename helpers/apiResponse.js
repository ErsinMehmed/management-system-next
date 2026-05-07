import { NextResponse } from "next/server";

// Стандартизиран shape на API отговорите. Frontend очаква:
//   data.status — boolean (true при успех, false при грешка)
//   data.message — string (винаги present, дори при empty body 401-ци)
//   ...допълнителни данни — spread-нати на top-level (напр. items, pagination)
//
// HTTP статус кодът отделно носи семантика (200 OK, 4xx грешки),
// но `status: boolean` го има в тялото, защото клиентският код в момента
// разчита на него (`if (data.status) { ... }`).

export function apiOk(data = {}, message = "") {
  return NextResponse.json({ status: true, message, ...data });
}

export function apiError(message, statusCode = 400, extra = {}) {
  return NextResponse.json(
    { status: false, message, ...extra },
    { status: statusCode }
  );
}

// Често срещани грешки като helpers — еднакъв текст и status code в цялата система
export const apiUnauthorized = (message = "Не сте оторизирани.") =>
  apiError(message, 401);

export const apiForbidden = (message = "Нямате достъп до тази операция.") =>
  apiError(message, 403);

export const apiNotFound = (message = "Не е намерено.") =>
  apiError(message, 404);

export const apiBadRequest = (message = "Невалидна заявка.") =>
  apiError(message, 400);
