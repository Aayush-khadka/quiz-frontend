// "use client";

// import { useState, useEffect, useRef } from "react";
// import { io } from "socket.io-client";

// import { useParams } from "next/navigation";

// export default function LobbyPage() {
//   const URL = process.env.NEXT_PUBLIC_URL;
//   const { roomCode } = useParams();
//   const storedHostName = localStorage.getItem("hostName");
//   const socketRef = useRef(null);
//   const [playerName, setPlayerName] = useState(null);
//   const [players, setPlayers] = useState([]);
//   const [status, setStatus] = useState("connecting");
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const storedUserId = localStorage.getItem("userId");
//     const storedRoomCode = localStorage.getItem("roomCode");

//     if (!storedUserId || !storedRoomCode) {
//       setError("Missing session. Please rejoin the lobby.");
//       return;
//     }

//     const socket = io(`${URL}`);
//     socketRef.current = socket;

//     socket.on("connect", () => {
//       setStatus("connected");
//       socket.emit("rejoin-room", { userId: storedUserId });
//     });

//     socket.on("rejoin-success", ({ playerName, roomCode, players }) => {
//       setPlayerName(playerName);
//       setPlayers(players);
//     });

//     socketRef.current.on("room-closed", (msg) => {
//       alert(msg);
//       router.push("/");
//     });

//     socket.on("room-players-updated", (updatedPlayers) => {
//       setPlayers(updatedPlayers);
//     });

//     socket.on("quiz-started", (questions) => {
//       localStorage.setItem("quizQuestions", JSON.stringify(questions));
//       window.location.href = `/quiz/${roomCode}`;
//     });

//     socket.on("disconnect", () => {
//       setStatus("disconnected");
//     });

//     socket.on("rejoin-failed", (msg) => {
//       console.warn("Rejoin failed:", msg);
//       setError(msg);
//       localStorage.clear();
//     });

//     return () => {
//       socket.disconnect();
//     };
//   }, []);

//   // Error fallback
//   if (error) {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-red-50 text-red-700">
//         <div className="text-center space-y-4">
//           <p className="text-lg font-semibold">{error}</p>
//           <button
//             onClick={() => (window.location.href = "/")}
//             className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
//           >
//             Go Home
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Loading state
//   if (!playerName) {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-yellow-50 text-yellow-700">
//         <div className="text-center">
//           <p className="mb-4">Rejoining lobby...</p>
//           <div className="w-6 h-6 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-100 px-4 py-8">
//       <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-xl">
//         <h1 className="text-2xl font-bold text-gray-800 mb-2">Quiz Lobby</h1>
//         <p className="text-sm text-gray-600 mb-2">
//           Room Code:{" "}
//           <span className="font-mono text-base font-medium">{roomCode}</span>
//         </p>
//         <p className="text-sm text-gray-600 mb-2">
//           Hostname:{" "}
//           <span className="font-mono text-base font-medium">
//             {storedHostName}
//           </span>
//         </p>

//         <div className="mb-4">
//           <span
//             className={`px-3 py-1 text-sm font-medium rounded-full ${
//               status === "connected"
//                 ? "bg-green-100 text-green-700"
//                 : "bg-yellow-100 text-yellow-700"
//             }`}
//           >
//             {status === "connected" ? "🟢 Connected" : "🕐 Connecting..."}
//           </span>
//         </div>

//         <h2 className="text-lg font-semibold mb-3">Players in Room:</h2>

//         {players.length === 0 ? (
//           <p className="text-gray-500">No players yet...</p>
//         ) : (
//           <div className="space-y-3">
//             {players.map((name, idx) => (
//               <div
//                 key={idx}
//                 className={`flex items-center justify-between px-4 py-3 rounded-xl border ${
//                   name === playerName
//                     ? "bg-blue-50 border-blue-300"
//                     : "bg-gray-50 border-gray-200"
//                 }`}
//               >
//                 <span className="font-medium text-gray-800">
//                   {name}
//                   {name === storedHostName && (
//                     <span className="text-sm text-yellow-600 ml-2">(host)</span>
//                   )}
//                   {name === playerName && (
//                     <span className="text-sm text-blue-600 ml-2">(You)</span>
//                   )}
//                 </span>
//               </div>
//             ))}
//           </div>
//         )}

//         <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
//           <p className="text-yellow-800 font-medium">
//             Waiting for the host to start the quiz...
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

import { useParams } from "next/navigation";

export default function LobbyPage() {
  const URL = process.env.NEXT_PUBLIC_URL;
  const { roomCode } = useParams();
  const storedHostName = localStorage.getItem("hostName");
  const socketRef = useRef(null);
  const [playerName, setPlayerName] = useState(null);
  const [players, setPlayers] = useState([]);
  const [status, setStatus] = useState("connecting");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedRoomCode = localStorage.getItem("roomCode");

    if (!storedUserId || !storedRoomCode) {
      setError("Missing session. Please rejoin the lobby.");
      return;
    }

    const socket = io(`${URL}`);
    socketRef.current = socket;

    socket.on("connect", () => {
      setStatus("connected");
      socket.emit("rejoin-room", { userId: storedUserId });
    });

    socket.on("rejoin-success", ({ playerName, roomCode, players }) => {
      setPlayerName(playerName);
      setPlayers(players);
    });

    socketRef.current.on("room-closed", (msg) => {
      alert(msg);
      router.push("/");
    });

    socket.on("room-players-updated", (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    socket.on("quiz-started", (questions) => {
      localStorage.setItem("quizQuestions", JSON.stringify(questions));
      window.location.href = `/quiz/${roomCode}`;
    });

    socket.on("disconnect", () => {
      setStatus("disconnected");
    });

    socket.on("rejoin-failed", (msg) => {
      console.warn("Rejoin failed:", msg);
      setError(msg);
      localStorage.clear();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = roomCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Error fallback
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-3">
        <div className="bg-white border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] p-6 max-w-sm mx-auto">
          <div className="text-center space-y-3">
            <div className="bg-red-400 border-2 border-black px-3 py-1 inline-block">
              <span className="text-sm font-bold text-black">❌ ERROR</span>
            </div>
            <div className="text-base font-bold text-black">{error}</div>
            <button
              onClick={() => (window.location.href = "/")}
              className="w-full border-3 border-black bg-[#B8FF9F] hover:bg-[#99fc77] hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] active:bg-[#7df752] font-bold py-2 px-4 transition-all text-sm text-black"
            >
              🏠 GO HOME
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (!playerName) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-3">
        <div className="bg-white border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] p-6">
          <div className="text-center space-y-3">
            <div className="bg-yellow-300 border-2 border-black px-3 py-1 inline-block">
              <span className="text-sm font-bold text-black">⏳ LOADING</span>
            </div>
            <div className="text-base font-bold text-black">
              Rejoining lobby...
            </div>
            <div className="flex justify-center">
              <div className="w-6 h-6 border-3 border-black border-t-transparent animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b-4 border-black px-3 py-2">
        <div className="max-w-3xl mx-auto flex items-center justify-center">
          <div className="bg-black text-white px-3 py-1 border-2 border-black">
            <h1 className="text-base font-bold">🎮 QUIZ LOBBY</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-3 py-4 space-y-4">
        {/* Status Banner */}
        <div
          className={`border-3 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] p-4 ${
            status === "connected"
              ? "bg-gradient-to-r from-[#B8FF9F] via-[#99fc77] to-[#B8FF9F]"
              : "bg-gradient-to-r from-yellow-300 via-yellow-200 to-yellow-300"
          }`}
        >
          <div className="text-center">
            <div
              className={`border-2 border-black px-3 py-1 inline-block mb-2 ${
                status === "connected" ? "bg-green-400" : "bg-yellow-400"
              }`}
            >
              <span className="text-sm font-bold text-black">
                {status === "connected" ? "🟢 CONNECTED" : "🔄 CONNECTING..."}
              </span>
            </div>
            <div className="text-lg font-black text-black">
              {status === "connected"
                ? "Ready to Quiz!"
                : "Getting you connected..."}
            </div>
          </div>
        </div>

        {/* Room Info Section */}
        <div className="bg-white border-3 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] p-4">
          <div className="bg-black text-white px-2 py-1 border-2 border-black mb-3 inline-block">
            <h2 className="text-sm font-bold">📋 ROOM DETAILS</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-gray-100 border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] p-3">
              <div className="text-xs font-bold text-black mb-1">ROOM CODE</div>
              <div className="flex items-center justify-between">
                <div className="text-lg font-black text-black font-mono">
                  {roomCode}
                </div>
                <button
                  onClick={copyRoomCode}
                  className={`border-2 border-black px-2 py-1 text-xs font-bold transition-all ${
                    copied
                      ? "bg-[#B8FF9F] shadow-[2px_2px_0px_rgba(0,0,0,1)] text-black"
                      : "bg-white hover:bg-gray-100 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] text-black"
                  }`}
                >
                  {copied ? "✓" : "📋"}
                </button>
              </div>
            </div>

            <div className="bg-gray-100 border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] p-3">
              <div className="text-xs font-bold text-black mb-1">HOST</div>
              <div className="text-base font-black text-black flex items-center">
                <span className="mr-1 text-sm">👑</span>
                <span className="truncate">{storedHostName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Players Section */}
        <div className="bg-white border-3 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-black text-white px-2 py-1 border-2 border-black">
              <h2 className="text-sm font-bold">
                👥 PLAYERS ({players.length})
              </h2>
            </div>

            <div className="bg-purple-300 border-2 border-black px-2 py-1">
              <span className="text-xs font-bold text-black">
                🎯 {players.length} READY
              </span>
            </div>
          </div>

          {players.length === 0 ? (
            <div className="bg-gray-100 border-3 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] p-6 text-center">
              <div className="text-4xl mb-2">😴</div>
              <div className="text-base font-bold text-black mb-1">
                Empty Lobby
              </div>
              <div className="text-xs font-bold text-gray-600">
                Waiting for players...
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2">
              {players.map((name, idx) => (
                <div
                  key={idx}
                  className={`border-3 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] p-3 transition-all hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] ${
                    name === playerName
                      ? "bg-[#B8FF9F]"
                      : name === storedHostName
                      ? "bg-yellow-300"
                      : "bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-black truncate flex-1">
                      {name}
                    </div>
                    <div className="flex gap-1 ml-2">
                      {name === storedHostName && (
                        <span className="bg-yellow-400 border border-black px-1 py-0.5 text-xs font-bold text-black">
                          👑
                        </span>
                      )}
                      {name === playerName && (
                        <span className="bg-blue-400 border border-black px-1 py-0.5 text-xs font-bold text-black">
                          YOU
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Waiting Message */}
        <div className="bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 border-3 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] p-4">
          <div className="text-center">
            <div className="bg-black text-white px-3 py-1 border-2 border-black inline-block mb-3">
              <span className="text-sm font-bold">⏰ STAND BY</span>
            </div>
            <div className="text-lg font-black text-black mb-1">
              Waiting for Host to Start...
            </div>
            <div className="text-xs font-bold text-black mb-3">
              The quiz will begin when {storedHostName} starts it!
            </div>

            {/* Animated dots */}
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-black border border-black animate-bounce"></div>
              <div
                className="w-2 h-2 bg-black border border-black animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-black border border-black animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-4 border-black bg-white py-3 mt-6">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="font-bold text-black text-xs">
            🎉 Get ready for an awesome quiz! 🎉
          </p>
        </div>
      </div>
    </div>
  );
}
