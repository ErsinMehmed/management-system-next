import { getAuth } from "@/helpers/getAuth";
import { apiOk, apiUnauthorized, apiBadRequest } from "@/helpers/apiResponse";
import connectMongoDB from "@/libs/mongodb";
import User from "@/models/user";

export async function POST(request) {
  const session = await getAuth(request);
  if (!session) return apiUnauthorized();

  const { token } = await request.json();
  if (!token) return apiBadRequest("Липсва Expo push token.");

  await connectMongoDB();
  await User.findByIdAndUpdate(session.user.id, {
    $addToSet: { expoPushTokens: token },
  });

  return apiOk({}, "Token-ът е записан.");
}

export async function DELETE(request) {
  const session = await getAuth(request);
  if (!session) return apiUnauthorized();

  const { token } = await request.json();
  await connectMongoDB();
  await User.findByIdAndUpdate(session.user.id, {
    $pull: { expoPushTokens: token },
  });

  return apiOk({}, "Token-ът е изтрит.");
}
