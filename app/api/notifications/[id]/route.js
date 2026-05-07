import { getAuth } from "@/helpers/getAuth";
import { apiOk, apiUnauthorized } from "@/helpers/apiResponse";
import connectMongoDB from "@/libs/mongodb";
import Notification from "@/models/notification";

export async function DELETE(request, { params }) {
  const session = await getAuth(request);
  if (!session) return apiUnauthorized();

  const { id } = await params;

  await connectMongoDB();
  await Notification.findByIdAndDelete(id);

  return apiOk({}, "Известието е изтрито.");
}
