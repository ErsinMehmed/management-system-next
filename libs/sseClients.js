// Global store за SSE клиенти — оцелява при HMR в dev
if (!global._sseOrderClients) {
  global._sseOrderClients = new Set();
}

export const sseClients = global._sseOrderClients;

const encoder = new TextEncoder();

/**
 * Праща SSE event към всички свързани клиенти с право на достъп.
 * @param {{ type: string, orderId?: string, [key: string]: any }} event
 * @param {string|null} assignedTo — ObjectId на продавача (null = само на admins)
 */
export function notifyOrderClients(event, assignedTo = null) {
  const payload = encoder.encode(`data: ${JSON.stringify(event)}\n\n`);

  for (const client of sseClients) {
    try {
      const isAdmin = ["Admin", "Super Admin"].includes(client.role);
      const isSeller = client.role === "Seller";
      const belongsToSeller = isSeller && assignedTo && String(client.userId) === String(assignedTo);

      if (isAdmin || belongsToSeller) {
        client.controller.enqueue(payload);
      }
    } catch {
      sseClients.delete(client);
    }
  }
}
