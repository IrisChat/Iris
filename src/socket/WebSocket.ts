import express, { Router } from "express";
import { API_BASE } from "../config/config.json";
import User from "../Database/models/User";
import Room from "../Database/models/Room";
import { Warn, Error, Gateway } from "../utils";
import Axios, { AxiosError } from "axios";
import { filetransfer_key } from "../config/config.json";
let userMessageCache: any[] = [];
let onlineUsers: any = {};
const WS = Router();

// Check who all is online
WS.use(express.json());
WS.use(express.urlencoded({ extended: false }));
WS.get(`${API_BASE}users/online`, async (req, res) => {
  res.json(onlineUsers);
});

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
    let username: any = undefined;
    let roomData: any;
    let roomID: any = undefined;

    Gateway(
      // @ts-ignore
      `Client Connected with ID ${socket.id} to room ${RID}, REMOTE ADDRESS = ${ip}`
    );

    // Spec Violation
    function specViolation(error: any) {
      socket.emit("server-message", JSON.stringify(serverMsg(-1, null)));
      Warn(error);
      return Warn("[SOCKET.IO] Spec Violation: Unsupported Format!");
    }

    socket.on("disconnect", () => {
      Warn(ip + " disconnected.");
      //   Try and remove the thread
      try {
        clearInterval(saveThread);
        Gateway("KILL THREAD SAVE");
        // Bring the user offline
        // user.status = "offline";
        // user.save(); // Disabled because it doesnt restore status
        // Make the user offline
        delete onlineUsers[username];
        Gateway("REMOVED USER");
      } catch (error) {
        Warn(`No threads were ever assigned to ${ip}`);
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
        Warn(message);
        return specViolation(error);
      }
      // END DECODE

      // Initialize the user
      username ? 1 : (username = data.IAM); // @ts-ignore
      roomID = createRID(username, RID);
      auth ? 1 : (auth = data.auth);
      type ? 1 : (type = data.type);
      // END USER INIT

      // Make the user online
      onlineUsers[username] = socket.id;

      // Find the user
      let user_ = null;
      try {
        user_ =
          (await User.findOne({ UID: username })) ||
          (await User.findOne({ email: username }));
      } catch (e) {
        // @ts-ignore
        Warn(e);
        Warn("TERMINATING CONNECTION");
        return socket.disconnect();
      }

      user ? 1 : (user = user_);
      user_ = undefined; // Cleanup

      // Bring the user online
      // user.status = "online";
      // user.save(); // Disabled because it doesnt store status
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

        Gateway(
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
        Gateway(
          // @ts-ignore
          `USING Room created with RID=${roomID}; TYPE=CONVERSATION; PARTICIPANTS=[${username}, ${RID}]` // The other user is the RID
        );
        // @ts-ignore
        userMessageCache[roomID] = roomData?.messages;

        // Duplicate of above but slightly modified
        try {
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
        } catch (error: any) {
          socket.emit(
            "message",
            JSON.stringify(
              serverMsg(
                -1,
                "BAD_RECIEVING_END -- This user does not exist, has been banned, or has been deleted."
              )
            )
          );
          Gateway(`The user ${RID} does not exist.`);
          return socket.disconnect(); // Kick lol
        }
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
          Warn("Client login failed");
          return socket.emit(
            "message",
            JSON.stringify(serverMsg(-1, "BAD_AUTH"))
          );
        } else if (!LoggedIn) {
          socket.emit(
            "server-message",
            JSON.stringify(serverMsg(1, "SUCCESS", roomData?.participants))
          );
          Gateway("Client logged in");
          socket.emit("context-message", JSON.stringify(roomData?.messages));
          // Join the room
          socket.join(roomID);
          Gateway("[ROOMS]: JOIN SUCCESS");
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
        Warn(data);
        return specViolation(error);
      }
      type = data.type;
      // END reload

      if (data.length < 100) {
        console.log(data, type);
      }
      switch (type) {
        case 1: // Text Message
          Error(roomID);
          socket.to(roomID).emit("message", JSON.stringify(data));
          userMessageCache[roomID].push(data);
          break;
        case 2: // Multimedia / Attachments
          // 1. Upload data.content to the uFile server using the specification file
          // 2. Use the endpoint in the "Download File" specification to get the download link to the file
          // 3. Return that link in the format of
          // {
          // type: 2
          // content: <UPLOAD_URL>
          // ts: new Date()
          // }

          socket.emit(
            "server-message",
            JSON.stringify(serverMsg(1, "RENDERING..."))
          );
          type type2 = {
            type: number;
            content: Buffer;
            description: string;
            size: number;
            filename: string;
            mimetype: string;
            ts: number;
          };

          console.log("[FILETRANSFER.IO] STARTING FILE TRANSFER...");
          // data = JSON.parse(data); // The data is already parsed - we dont need to do this

          // The server only accepts "Uint8Array"s since it will textDecode after uploaded
          const contentBuffer = Uint8Array.from(
            [...data.content].map((ch) => ch.charCodeAt())
          ).buffer;
          const fileContent = contentBuffer;
          // break;
          let server_host: string;
          let server_protocol: string;
          // Skeleton object
          type fdata_skeleton = {
            uploadUrl: string;
            uploadToken: string;
            maxBytes: Number;
            success: Boolean;
            ownerDetailLink: string;
            state: any[];
            snippets: {
              "snippet--upload-progress": string;
              "snippet--header": string;
              "snippet--footer": string;
            };
          };
          let fdata: fdata_skeleton;
          // Create new session
          Axios({
            method: "GET",
            url: "https://filetransfer.io/start-upload",

            headers: {
              "X-Requested-With": "XMLHttpRequest",
              cookie: filetransfer_key,
            },

            withCredentials: true,
            responseType: "json",
          })
            .then((response) => {
              // console.log(response);
              // @ts-ignore
              fdata = response.data;
              console.log(fdata.uploadUrl);
              server_host = new URL(fdata.uploadUrl).hostname;
              server_protocol = new URL(fdata.uploadUrl).protocol;

              if (response.status != 200) {
                Error("[FILETRANSFER.IO] SERVER REQUEST FAILED");
                socket.emit(
                  "server-message",
                  JSON.stringify(serverMsg(1, "THIRD-PARTY REQUEST FAILED"))
                );
                return;
              }
              console.log(
                data.size,
                `filename ${Buffer.from(data.filename).toString(
                  "base64"
                )},filetype ${Buffer.from(data.mimetype).toString(
                  "base64"
                )},fileorder MQ==`
              ); // Strictly no spaces whatsoever
              // Reserve the session
              Axios({
                method: "POST",
                url: fdata.uploadUrl,
                headers: {
                  "Upload-Length": data.size,
                  "Upload-Metadata": `filename ${Buffer.from(
                    data.filename
                  ).toString("base64")},filetype ${Buffer.from(
                    data.mimetype
                  ).toString("base64")},fileorder MQ==`, // Strictly no spaces whatsoever
                  "Tus-Resumable": "1.0.0",
                },
              }).then((response) => {
                console.log("The session has been reserved.");
                // Upload the data

                if (response.status != 201) {
                  Error("[FILETRANSFER.IO] SERVER REQUEST FAILED");
                  socket.emit(
                    "server-message",
                    JSON.stringify(serverMsg(1, "COULD NOT RESERVE A SESSION"))
                  );
                  return;
                }
                // @ts-ignore
                const chunk_host = response.headers.get("Location");
                console.log(`${server_protocol}//${server_host}${chunk_host}`);
                console.log(
                  `${server_protocol}//${server_host}${chunk_host}`,
                  data.size
                );

                Axios({
                  url: `${server_protocol}//${server_host}${chunk_host}`,
                  // @ts-ignore

                  headers: {
                    "Content-Length": data.size,
                    "Content-Type": "application/offset+octet-stream",
                    "Upload-Offset": "0",
                    "Tus-Resumable": "1.0.0",
                  },
                  method: "PATCH",
                  data: fileContent,
                })
                  .then((response) => {
                    if (response.status != 200) {
                      Error("[FILETRANSFER.IO] CHUNK UPLOAD FAILED");
                      socket.emit(
                        "server-message",
                        JSON.stringify(serverMsg(1, "CHUNK UPLOAD FAILED"))
                      );
                      return;
                    }
                  })
                  .then(() => {
                    console.log(
                      `https://filetransfer.io/finish-delivery/${fdata.uploadToken}`
                    );
                    Axios({
                      method: "POST",
                      url: `https://filetransfer.io/finish-delivery/${fdata.uploadToken}`,
                      headers: {
                        "X-Requested-With": "XMLHttpRequest",
                      },
                      responseType: "json",
                    })
                      .then((res) => {
                        console.log(res.data); // @ts-ignore
                        const deliveryLink =
                          res.data.deliveryPublicLink.split("#")[0];
                        if (/image.*/.test(data.mimetype)) {
                          messageAsMe(
                            `<img src="${deliveryLink + "/download"}" />`
                          );
                        } else if (/video.*/.test(data.mimetype)) {
                          messageAsMe(`
                        <video controls>
                           <source src="${deliveryLink + "/download"}" type=${
                            data.mimetype
                          }>
                          Your browser does not support the HTML5 video element
                        </video>
                        `);
                        } else {
                          messageAsMe(
                            `<a href="${
                              deliveryLink + "/download"
                            }">${deliveryLink}</a>`
                          );
                        }

                        function messageAsMe(content: any) {
                          socket.emit(
                            "message",
                            JSON.stringify(
                              userMsg(data.IAM, content, data.description)
                            )
                          );

                          socket
                            .to(roomID)
                            .emit(
                              "message",
                              JSON.stringify(
                                userMsg(data.IAM, content, data.description)
                              )
                            );

                          // Append the message everytime
                          userMessageCache[roomID].push(
                            userMsg(data.IAM, content, data.description)
                          );
                        }
                        console.log(`Successfully uploaded ${data.filename}`);
                      })

                      .catch((error) => {
                        const err = error as AxiosError;
                        if (err.response) {
                          console.log(err.response.status);
                          console.log(err.request);
                          console.log(err.response.data);
                        } else {
                          // console.log(err);
                        }
                      });
                  });
              });
            })
            .catch((error) => {
              const err = error as AxiosError;
              if (err.response) {
                console.log(err.response.status);
                console.log(err.response.data);
              } else {
                console.log(err);
              }
            });

          break;
        case 3: // TBD
          break;
        default: // OnError
          socket.emit(
            "server-message",
            JSON.stringify(serverMsg(-1, "BAD_MESSAGE"))
          );
      }
      // console.log(data);
      Gateway("Logged IN: " + LoggedIn);
    }
  }); // END CONNECTION
}

function serverMsg(status: Number, content: any, participants?: Number[] | null) {
  return {
    // @ts-ignore
    type: 0,
    status: status,
    content: content,
    participants: participants
  };
}

function userMsg(UID: any, content: any, desc: string) {
  return {
    type: 2,
    IAM: UID,
    auth: null,
    content: content,
    description: desc,
    ts: Date.now(),
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

export { ws_main, WS };
