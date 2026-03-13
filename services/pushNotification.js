import admin from "@/libs/firebase-admin";
import User from "@/models/user";

export async function notifyUser(userId, { title, body, data = {} }) {
  const user = await User.findById(userId, { fcmTokens: 1 }).lean();
  if (!user || user.fcmTokens.length === 0) return;

  const message = {
    notification: { title, body },
    data,
    tokens: user.fcmTokens,
  };

  const response = await admin.messaging().sendEachForMulticast(message);

  const invalidTokens = [];
  response.responses.forEach((res, idx) => {
    if (!res.success) {
      const code = res.error?.code;
      if (
        code === "messaging/invalid-registration-token" ||
        code === "messaging/registration-token-not-registered"
      ) {
        invalidTokens.push(user.fcmTokens[idx]);
      }
    }
  });

  if (invalidTokens.length > 0) {
    await User.updateOne(
      { _id: userId },
      { $pull: { fcmTokens: { $in: invalidTokens } } }
    );
  }
}

export async function notifyAllEmployees({ title, body, data = {} }) {
  // Взимаме всички служители с поне един FCM token
  const employees = await User.find(
    { fcmTokens: { $exists: true, $not: { $size: 0 } } },
    { fcmTokens: 1 }
  ).lean();

  const allTokens = employees.flatMap((e) => e.fcmTokens);

  if (allTokens.length === 0) return;

  const message = {
    notification: { title, body },
    data,
    tokens: allTokens,
  };

  const response = await admin.messaging().sendEachForMulticast(message);

  // Почистваме невалидни токени от DB
  const invalidTokens = [];
  response.responses.forEach((res, idx) => {
    if (!res.success) {
      const code = res.error?.code;
      if (
        code === "messaging/invalid-registration-token" ||
        code === "messaging/registration-token-not-registered"
      ) {
        invalidTokens.push(allTokens[idx]);
      }
    }
  });

  if (invalidTokens.length > 0) {
    await User.updateMany(
      {},
      { $pull: { fcmTokens: { $in: invalidTokens } } }
    );
  }
}
