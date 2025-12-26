const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 3000 });

let clients = [];

wss.on("connection", ws => {
  clients.push(ws);

  ws.on("message", msg => {
    // broadcast to all clients
    clients.forEach(c=>{
      if(c.readyState===WebSocket.OPEN) c.send(msg);
    });
  });

  ws.on("close", () => {
    clients = clients.filter(c=>c!==ws);
  });
});

console.log("WebSocket server running on ws://localhost:3000");
