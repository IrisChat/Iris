import User from "../Database/models/User";
import Room from "../Database/models/Room";
import Logger from "../utils/Logger";

// Guild agnostic room server
function ws_main(io: any) {
  io.on("connection", (socket: any) => {
    const ip = socket.conn.remoteAddress;
    const RID = socket.handshake.query.RID;
    let auth: any = undefined;
    let LoggedIn: Boolean = false;
    let saveThread: any = false;
    let type: any = undefined;
    let user: any = undefined;
    let userMessageCache: any[] = [];
    let username: any = undefined;
    let roomData: any;
    let roomID: any = undefined;

    Logger.INFO(
      // @ts-ignore
      `Client Connected with ID ${socket.id} to room ${RID}, REMOTE ADDRESS = ${ip}`
    );

    // Spec Violation
    function specViolation(error: any) {
      socket.emit("server-message", JSON.stringify(serverMsg(-1, null)));
      Logger.WARN(error);
      return Logger.WARN("[SOCKET.IO] Spec Violation: Unsupported Format!");
    }

    socket.on("disconnect", () => {
      Logger.WARN(ip + " disconnected.");
      //   Try and remove the thread
      try {
        Logger.INFO("KILL THREAD SAVE");
        clearInterval(saveThread);
        Logger.INFO("REMOVED USER");
      } catch (error) {
        Logger.WARN(`No threads were ever assigned to ${ip}`);
      }
    });

    socket.on("login", async (message: any) => {
      console.log(message);
      Login(message);
      // END GLOBAL_INIT
    }); // END MESSAGE HANDLER

    socket.on("join-room", async (message: any) => {
      if (!username || !roomID || !auth || !user) {
        return Login(message);
      }
      joinRoom(roomID);
    });

    socket.on("message", (message: any) => {
      if (!username || !roomID || !auth || !user) {
        return Login(message);
      }
      roomMode(message);
    });

    // Function Login
    async function Login(message: any) {
      // Start GLOBAL_INIT
      // Decode the data
      let data: any = {};
      try {
        // @ts-ignore
        data = JSON.parse(message);
      } catch (error) {
        Logger.WARN(message);
        return specViolation(error);
      }
      // END DECODE

      // Initialize the user
      username ? 1 : (username = data.IAM); // @ts-ignore
      roomID = createRID(username, RID);
      auth ? 1 : (auth = data.auth);
      type ? 1 : (type = data.type);
      // END USER INIT

      // Find the user
      let user_ = null;
      try {
        user_ =
          (await User.findOne({ UID: username })) ||
          (await User.findOne({ email: username }));
      } catch (e) {
        // @ts-ignore
        Logger.WARN(e);
        Logger.WARN("TERMINATING CONNECTION");
        return socket.close();
      }

      user ? 1 : (user = user_);
      user_ = undefined; // Cleanup
      joinRoom(roomID); // Loop back
    }
    // END Function Login

    // Function joinRoom
    async function joinRoom(room: any) {
      // Look for room...

      // Check if this is a user, if not found, we're connecting to a guild
      let recieving_end: any = await User.findOne({
        UID: RID,
      }); // We dont undefine this because we're going to use this later
      roomData = await Room.findOne({
        id: roomID,
        participants: username,
        type: recieving_end ? "CONVERSATION" : "GUILD",
      });
      // END ROOM SEARCH

      // START GUILD_PARSE (JOINING / CREATING A DM)
      // If room doesnt exist and it's a Direct Message

      // We create an ID of it being the lowest ID first and then the highest ID
      // Example: Reciever ID: 2 and Sender ID: 1 -> 12
      // console.log(roomData, guildType ? "GUILD" : "CONVERSATION"); // DEBUG
      // console.log(!roomData && !guildType); // DEBUG
      if (!roomData && recieving_end) {
        roomData = await Room.create({
          id: roomID,
          type: "CONVERSATION", // @ts-ignore
          participants: [username, RID], // We're only using RID here to refer to the other person
          messages: [],
        });
        // TODO - SOCKET.IO CREATE CUSTOM ROOM

        Logger.INFO(
          // @ts-ignore
          `NEW Room created with RID=${roomID}; TYPE=CONVERSATION; PARTICIPANTS=[${username}, ${RID}]` // We refer to the other person using the RID
        );

        if (!recieving_end) {
          // Add to recieving end too
          return socket.emit(
            "message",
            JSON.stringify(serverMsg(-1, "BAD_RECIEVING_END"))
          );
        }
        // @ts-ignore
        user?.conversations?.push(RID); // Other person as the RID
        recieving_end?.conversations?.push(username);
        console.log(roomData);
        user?.save();
        recieving_end?.save();
        roomData.saveWithRetries();
        socket.join(roomID);
      } else {
        Logger.INFO(
          // @ts-ignore
          `USING Room created with RID=${roomID}; TYPE=CONVERSATION; PARTICIPANTS=[${username}, ${RID}]` // The other user is the RID
        );
        // @ts-ignore
        userMessageCache[roomID] = roomData?.messages;

        // Duplicate of above but slightly modified
        if (
          !user.conversations.find((e: any) => e === RID) &&
          !recieving_end.conversations.find((e: any) => e === RID)
        ) {
          user?.conversations?.push(RID); // Other person as the RID
          recieving_end?.conversations?.push(username);
          user?.save();
          recieving_end?.save();
        }
        // Clear data
        // user.conversations = []; // Other person as the RID
        // recieving_end.conversations = [];
        // user?.save();
        // recieving_end?.save();
        console.log(user.conversations, recieving_end.conversations);
      }
      // END GUILD_PARSE
      console.log(room);
      // END FIND USER
      roomLogon(); // Jump into the room
    }
    // END Function joinRoom

    // Function roomLogon
    function roomLogon() {
      // Check credentials
      if (!LoggedIn) {
        if (
          auth === undefined ||
          !auth ||
          auth != user?.token ||
          type != 0 ||
          !user
        ) {
          Logger.WARN("Client login failed");
          return socket.emit(
            "message",
            JSON.stringify(serverMsg(-1, "BAD_AUTH"))
          );
        } else if (!LoggedIn) {
          socket.emit(
            "server-message",
            JSON.stringify(serverMsg(1, "SUCCESS"))
          );
          Logger.INFO("Client logged in");
          socket.emit("context-message", JSON.stringify(roomData?.messages));
          // Join the room
          socket.join(roomID);
          Logger.INFO("[ROOMS]: JOIN SUCCESS");
          // Create a cache store if nonexistent
          if (!userMessageCache[roomID]) {
            userMessageCache[roomID] = [];
          }

          // Start the saveThread
          // Save the room every 5 seconds
          saveThread = setInterval(() => {
            // @ts-ignore
            roomData.messages = userMessageCache[roomID] || []; // Empty array in case of bad message
            // @ts-ignore
            // console.log("STORED MESSAGES", userMessageCache[roomID] || []);
            roomData?.saveWithRetries();
          }, Math.floor(Math.random() * 10000));

          return (LoggedIn = true);
        } else {
          socket.emit(
            "server-message",
            JSON.stringify(serverMsg(-1, "FAILURE"))
          );
        }
      }

      // END check credentials
    }
    // End function roomLogon

    function roomMode(data: any) {
      // We need to reload all of this again
      try {
        // @ts-ignore
        data = JSON.parse(data);
      } catch (error) {
        Logger.WARN(data);
        return specViolation(error);
      }
      type = data.type;
      // END reload

      console.log(data, type);
      switch (type) {
        case 1: // Text Message
          Logger.ERROR(roomID);
          socket.to(roomID).emit("message", JSON.stringify(data));
          userMessageCache[roomID].push(data);
          break;
        case 2: // Multimedia / Attachments
          break;
        case 3: // TBD
          break;
        default: // OnError
          socket
            .to(roomID)
            .emit("server-message", JSON.stringify(serverMsg(-1, "BAD_MESSAGE")));
      }
      // console.log(data);
      Logger.INFO("Logged IN: " + LoggedIn);
    }
  }); // END CONNECTION
}

function serverMsg(status: Number, content: any) {
  return {
    // @ts-ignore
    type: 0,
    status: status,
    content: content,
  };
}

// Create room ID
// @ts-ignore
function createRID(sender, reciever) {
  if (sender < reciever) {
    return `${sender}${reciever}`;
  } else {
    return `${reciever}${sender}`;
  }
}

export { ws_main };
