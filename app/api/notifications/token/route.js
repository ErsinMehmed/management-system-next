import { getAuth } from "@/helpers/getAuth";
import { apiOk, apiUnauthorized, apiBadRequest } from "@/helpers/apiResponse";
import connectMongoDB from "@/libs/mongodb";
import User from "@/models/user";

// Записва FCM token към текущия потребител
export async function POST(request) {
  const session = await getAuth(request);
  if (!session) return apiUnauthorized();

  const { token } = await request.json();
  if (!token) return apiBadRequest("Липсва FCM token.");

  await connectMongoDB();

  // Добавяме token само ако не съществува вече
  await User.findByIdAndUpdate(session.user.id, {
    $addToSet: { fcmTokens: token },
  });

  return apiOk({}, "Token-ът е записан.");
}

// Изтрива FCM token (при logout)
export async function DELETE(request) {
  const session = await getAuth(request);
  if (!session) return apiUnauthorized();

  const { token } = await request.json();

  await connectMongoDB();

  await User.findByIdAndUpdate(session.user.id, {
    $pull: { fcmTokens: token },
  });

  return apiOk({}, "Token-ът е изтрит.");
}
