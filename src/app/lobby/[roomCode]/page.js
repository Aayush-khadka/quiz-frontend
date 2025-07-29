"use client";
import dotenv from "dotenv";
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

import { useParams } from "next/navigation";

dotenv.config();

export default function LobbyPage() {
  const URL = process.env.URL;
  const { roomCode } = useParams();
  const storedHostName = localStorage.getItem("hostName");
  const socketRef = useRef(null);
  const [playerName, setPlayerName] = useState(null);
  const [players, setPlayers] = useState([]);
  const [status, setStatus] = useState("connecting");
  const [error, setError] = useState("");

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

  // Error fallback
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-red-50 text-red-700">
        <div className="text-center space-y-4">
          <p className="text-lg font-semibold">{error}</p>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (!playerName) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-yellow-50 text-yellow-700">
        <div className="text-center">
          <p className="mb-4">Rejoining lobby...</p>
          <div className="w-6 h-6 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Quiz Lobby</h1>
        <p className="text-sm text-gray-600 mb-2">
          Room Code:{" "}
          <span className="font-mono text-base font-medium">{roomCode}</span>
        </p>
        <p className="text-sm text-gray-600 mb-2">
          Hostname:{" "}
          <span className="font-mono text-base font-medium">
            {storedHostName}
          </span>
        </p>

        <div className="mb-4">
          <span
            className={`px-3 py-1 text-sm font-medium rounded-full ${
              status === "connected"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {status === "connected" ? "🟢 Connected" : "🕐 Connecting..."}
          </span>
        </div>

        <h2 className="text-lg font-semibold mb-3">Players in Room:</h2>

        {players.length === 0 ? (
          <p className="text-gray-500">No players yet...</p>
        ) : (
          <div className="space-y-3">
            {players.map((name, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border ${
                  name === playerName
                    ? "bg-blue-50 border-blue-300"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <span className="font-medium text-gray-800">
                  {name}
                  {name === storedHostName && (
                    <span className="text-sm text-yellow-600 ml-2">(host)</span>
                  )}
                  {name === playerName && (
                    <span className="text-sm text-blue-600 ml-2">(You)</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
          <p className="text-yellow-800 font-medium">
            Waiting for the host to start the quiz...
          </p>
        </div>
      </div>
    </div>
  );
}
