// Import necessary packages
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const socket = require("socket.io");

app.use(cors());

app.use(express.json());

//require all routes
const userRoutes = require("./Routes/userRoutes");
const messageRoute = require("./Routes/messageRoute");

//use all routes
app.use("/api/auth", userRoutes);
app.use("/api/messages", messageRoute);

// Connect to MongoDB database
mongoose
  .connect(
    "mongodb+srv://demo7person:demo7person@cluster0.uygscs4.mongodb.net/?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connected to database"))
  .catch((error) => console.error(error));

const server = app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
});

const io = socket(server, {
  cors: {
    // origin: "http://localhost:3000",
    origin: "https://conversation-kuraakani.web.app",
    credentials: true,
  },
});

// const io = socket("https://21ae-27-34-17-227.ngrok-free.app", {
//   cors: {
//     origin: "https://conversation-ea834.web.app",
//     credentials: true,
//   },
//   extraHeaders: {
//     "User-Agent":
//       "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
//   },
//   headers: {
//     "User-Agent":
//       "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
//   },
// });

global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.message);
    }
  });
});
