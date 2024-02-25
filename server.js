const http = require("http");
const server = http.createServer((req, res) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://managament-system-next.vercel.app"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
});

const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "https://managament-system-next.vercel.app",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("chat message", (message) => {
    io.emit("chat message", message);
  });
});

server.listen(443, () => {
  console.log("WebSocket server listening on port 3001");
});
