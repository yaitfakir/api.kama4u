require("dotenv").config();
const { API_PORT } = process.env;
const app = require("./app");
const { Server } = require("socket.io");
const myCache = require("./utils/cache");
const authSocketMiddleware = require("./middleware/authSocket");
const port = process.env.PORT || API_PORT;

var expressServer = app.listen(port, () =>
  console.log(`Server running on port ${port}`)
);

const io = new Server(expressServer, {
  cors: {
    origin: ["http://localhost:4200", "http://192.168.1.100:4200"],
  },
});

io.use((socket, next) => {
  authSocketMiddleware(socket, next);
});

// state
const UsersState = {
  users: [],
  setUsers: function (newUsersArray) {
    this.users = newUsersArray;
    myCache.set("ConnectedUser", newUsersArray);
  },
};

io.on("connection", (socket) => {
  console.log(`User ${socket.id} connected`);
  const user = socket.user;
  activateUser(socket.id, user);

  console.log(UsersState.users);

  // Listening for a message event
  socket.on("message", (data) => {
    console.log(data);
    io.emit("message", `${socket.id.substring(0, 5)}: ${data}`);
  });

  // When user disconnects - to all others
  socket.on("disconnect", () => {
    const user = getUser(socket.id);
    console.log(`User ${user.id} disconnected`);
    userLeavesApp(user.id);
  });
});

app.set("socketio", io); //here you export my socket.io to a global

function getUser(id) {
  return UsersState.users.find((user) => user.id === id);
}
function userLeavesApp(id) {
  UsersState.setUsers(UsersState.users.filter((user) => user.id !== id));
}
function activateUser(id, user) {
  const _user = { id, user };
  UsersState.setUsers([
    ...UsersState.users.filter((user) => user.id !== id),
    _user,
  ]);
  return user;
}
