import { WebSocketServer } from "ws";
import { Server } from "http";

let wss: WebSocketServer;

export const setupWebSocketServer = (server: Server) => {
  wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    console.log("New client connected");

    ws.on("message", (message) => {
      console.log(`Server Received message`);
    });

    ws.on("close", () => {
      console.log("Client disconnected");
    });

    ws.send(JSON.stringify({ message: "Welcome from server :)" }));
  });
};

export const broadcastMessage = (message: any) => {
  if (!wss) {
    console.error("WebSocketServer not initialized");
    return;
  }

  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
};
