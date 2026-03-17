import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sseClients } from "@/libs/sseClients";

export const dynamic = "force-dynamic";

const encoder = new TextEncoder();

export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session) return new Response("Unauthorized", { status: 401 });

  const isAllowed = ["Admin", "Super Admin", "Seller"].includes(session.user.role);

  if (!isAllowed) return new Response("Forbidden", { status: 403 });

  let client;

  const stream = new ReadableStream({
    start(controller) {
      client = {
        controller,
        userId: session.user.id,
        role:   session.user.role,
      };
      sseClients.add(client);
      // Начален heartbeat за да се установи връзката
      controller.enqueue(encoder.encode('data: {"type":"connected"}\n\n'));
    },
    cancel() {
      if (client) sseClients.delete(client);
    },
  });

  // Изчистване при затваряне на tab/навигация
  request.signal.addEventListener("abort", () => {
    if (client) sseClients.delete(client);
  });

  return new Response(stream, {
    headers: {
      "Content-Type":  "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection":    "keep-alive",
      "X-Accel-Buffering": "no", // за nginx proxies
    },
  });
}
