importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

// Конфигурацията се вкарва от компонента при регистрация
self.addEventListener("message", (event) => {
  if (event.data?.type === "FIREBASE_CONFIG") {
    firebase.initializeApp(event.data.config);
    firebase.messaging();
  }
});

// Показва notification когато приложението е на заден план
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  const notification = data.notification ?? {};

  event.waitUntil(
    self.registration.showNotification(notification.title ?? "Нова поръчка", {
      body: notification.body ?? "",
      icon: "/icon.png",
      badge: "/icon.png",
      tag: "order-notification",
      renotify: true,
      data: data.data ?? {},
    })
  );
});

// Отваря приложението при клик върху notification
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/dashboard/client-orders";
  event.waitUntil(clients.openWindow(url));
});
