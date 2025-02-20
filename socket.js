const { Server } = require("socket.io");

let io;
const activeAdmins = new Set();
const activeDeliveryPersons = new Set();

const initWebSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", 
      methods: ["GET", "POST"],
    },
  });
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
    socket.on("register", (role) => {
      if (role === "admin") {
        activeAdmins.add(socket);
      } else if (role === "delivery") {
        activeDeliveryPersons.add(socket);
      }
      console.log(`${role} registered: ${socket.id}`);
    });
    socket.on("request_delivery", (data) => {
      console.log("New sick meal request:", data);
      activeAdmins.forEach((admin) => admin.emit("new_delivery_request", data));
      activeDeliveryPersons.forEach((delivery) =>
        delivery.emit("new_delivery_request", data)
      );
    });
    socket.on("update_delivery_status", (update) => {
      console.log("Delivery status updated:", update);
      io.emit("delivery_status", update);
    });
    socket.on("disconnect", () => {
      activeAdmins.delete(socket);
      activeDeliveryPersons.delete(socket);
      console.log(`User disconnected: ${socket.id}`);
    });
  });
  console.log("WebSocket server initialized!");
};

module.exports = { initWebSocket, io };
