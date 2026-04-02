import User from "@/models/user";

export async function notifyUserExpo(userId, { title, body, data = {} }) {
  const user = await User.findById(userId, { expoPushTokens: 1 }).lean();
  if (!user?.expoPushTokens?.length) return;

  const messages = user.expoPushTokens.map((token) => ({
    to: token,
    title,
    body,
    data,
    sound: "default",
    priority: "high",
  }));

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(messages),
  });
}
