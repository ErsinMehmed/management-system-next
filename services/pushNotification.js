import getAdmin from "@/libs/firebase-admin";
import User from "@/models/user";
import Role from "@/models/role";

export async function notifyUser(userId, { title, body, data = {} }) {
  const user = await User.findById(userId, { fcmTokens: 1 }).lean();
  if (!user || user.fcmTokens.length === 0) return;

  const message = {
    data: { title, body, ...data },
    tokens: user.fcmTokens,
  };

  const response = await getAdmin().messaging().sendEachForMulticast(message);

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

export async function notifyAllSuperAdmins({ title, body, data = {} }) {
  const superAdminRole = await Role.findOne({ name: "Super Admin" }, { _id: 1 }).lean();
  if (!superAdminRole) return;

  const superAdmins = await User.find(
    { role: superAdminRole._id, fcmTokens: { $exists: true, $not: { $size: 0 } } },
    { fcmTokens: 1 }
  ).lean();

  const allTokens = superAdmins.flatMap((u) => u.fcmTokens);
  if (allTokens.length === 0) return;

  const message = { data: { title, body, ...data }, tokens: allTokens };
  const response = await getAdmin().messaging().sendEachForMulticast(message);

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

export async function notifyAllEmployees({ title, body, data = {} }) {
  // Взимаме всички служители с поне един FCM token
  const employees = await User.find(
    { fcmTokens: { $exists: true, $not: { $size: 0 } } },
    { fcmTokens: 1 }
  ).lean();

  const allTokens = employees.flatMap((e) => e.fcmTokens);

  if (allTokens.length === 0) return;

  const message = {
    data: { title, body, ...data },
    tokens: allTokens,
  };

  const response = await getAdmin().messaging().sendEachForMulticast(message);

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
