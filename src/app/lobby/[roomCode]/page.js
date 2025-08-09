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
  const [roomInfo, setRoomInfo] = useState(null);

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
      fetchRoomInfo(roomCode);
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

  const fetchRoomInfo = async (code) => {
    try {
      const response = await fetch(`${URL}/api/v1/room/info/${code}`);
      const data = await response.json();
      if (data.statuscode) {
        setRoomInfo(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch room info:", error);
    }
  };

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6 max-w-sm mx-auto">
          <div className="text-center space-y-4">
            <div className="bg-red-500 border-2 border-black px-3 py-1 inline-block">
              <span className="text-sm font-bold text-white">❌ ERROR</span>
            </div>
            <div className="text-lg font-bold text-black">{error}</div>
            <button
              onClick={() => (window.location.href = "/")}
              className="w-full border-2 border-black bg-[#B8FF9F] hover:bg-[#99fc77] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] font-bold py-2 px-4 transition-all text-sm text-black"
            >
              🏠 Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (!playerName) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6">
          <div className="text-center space-y-4">
            <div className="bg-yellow-400 border-2 border-black px-3 py-1 inline-block">
              <span className="text-sm font-bold text-black">⏳ LOADING</span>
            </div>
            <div className="text-lg font-bold text-black">
              Rejoining lobby...
            </div>
            <div className="flex justify-center">
              <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b-4 border-black px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="bg-black text-white px-4 py-2 border-2 border-black">
            <h1 className="text-xl font-bold">INQUIZZIT</h1>
          </div>

          <button
            onClick={() => (window.location.href = "/how-to-play")}
            className="border-2 border-black bg-[#FFA6F6] hover:bg-[#fa8cef] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] px-4 py-2 font-medium text-black transition-all text-sm"
          >
            📖 How to Play
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Status Banner */}
        <div
          className={`border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6 ${
            status === "connected" ? "bg-[#B8FF9F]" : "bg-yellow-300"
          }`}
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-black mb-2">
              {status === "connected"
                ? "🟢 Ready to Quiz!"
                : "🔄 Connecting..."}
            </div>
            <div className="text-sm text-black">
              {status === "connected"
                ? "All systems go!"
                : "Getting you connected..."}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Room Information - Takes 2 columns on xl screens */}
          <div className="xl:col-span-2 bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6">
            <h2 className="text-xl font-bold text-black mb-6">
              Room Information
            </h2>

            {/* Room Code - Prominent */}
            <div className="mb-8 text-center">
              <label className="block text-sm font-medium text-black mb-3">
                Room Code
              </label>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="border-2 border-black px-6 py-3 font-mono text-2xl font-bold text-black bg-white">
                  {roomCode}
                </div>
                <button
                  onClick={copyRoomCode}
                  className={`border-2 border-black px-4 py-3 text-sm font-medium transition-all ${
                    copied
                      ? "bg-[#B8FF9F] text-black"
                      : "bg-white hover:bg-gray-100 text-black hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                  }`}
                >
                  {copied ? "✓ Copied" : "📋 Copy"}
                </button>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Host */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Host
                </label>
                <div className="border-2 border-black px-3 py-2 bg-white text-center">
                  <span className="font-bold text-black">
                    👑 {storedHostName}
                  </span>
                </div>
              </div>

              {/* Topic */}
              {roomInfo ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Topic
                    </label>
                    <div className="border-2 border-black px-3 py-2 bg-white text-center">
                      <span className="font-bold text-black capitalize">
                        📚 {roomInfo.topic}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Difficulty
                    </label>
                    <div className="border-2 border-black px-3 py-2 bg-white text-center">
                      <span className="font-bold text-black capitalize">
                        {roomInfo.difficulty === "easy"
                          ? "🟢 Easy"
                          : roomInfo.difficulty === "medium"
                          ? "🟡 Medium"
                          : "🔴 Hard"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Questions
                    </label>
                    <div className="border-2 border-black px-3 py-2 bg-white text-center">
                      <span className="font-bold text-black">
                        {roomInfo.no_questions}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="md:col-span-3 border-2 border-black p-4 text-center bg-white">
                  <div className="text-sm text-gray-600">
                    Loading quiz details...
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Players */}
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
              <h2 className="text-xl font-bold text-black">
                Players (
                {players.filter((player) => player !== storedHostName).length})
              </h2>
              <div className="bg-purple-200 border-2 border-black px-3 py-1 self-start sm:self-auto">
                <span className="text-sm font-medium text-black">
                  {players.filter((player) => player !== storedHostName).length}{" "}
                  Ready
                </span>
              </div>
            </div>

            {players.filter((player) => player !== storedHostName).length ===
            0 ? (
              <div className="bg-gray-100 border-2 border-black p-8 text-center">
                <div className="text-4xl mb-2">😴</div>
                <div className="text-lg font-bold text-black mb-1">
                  No players yet
                </div>
                <div className="text-sm text-gray-600">
                  Share the room code to invite friends!
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {players
                  .filter((player) => player !== storedHostName)
                  .map((name, idx) => (
                    <div
                      key={idx}
                      className={`border-2 border-black p-3 flex items-center justify-between ${
                        name === playerName ? "bg-[#B8FF9F]" : "bg-white"
                      }`}
                    >
                      <div className="font-medium text-black truncate mr-2">
                        {name}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {name === playerName && (
                          <span className="bg-blue-400 border border-black px-2 py-1 text-xs font-bold text-black">
                            YOU
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Waiting Message */}
        <div className="bg-purple-200 border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6 sm:p-8">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-black mb-2">
              ⏰ Waiting for Host
            </div>
            <div className="text-base sm:text-lg text-black mb-4">
              {storedHostName} will start the quiz when ready
            </div>
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-black rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-black rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-black rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-4 border-black bg-white py-4 mt-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-black font-medium">
            Ready for an awesome quiz? 🎉
          </p>
        </div>
      </div>
    </div>
  );
}
