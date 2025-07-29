"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import dotenv from "dotenv";
dotenv.config();

export default function ResultsPage() {
  const URL = process.env.URL;
  const { roomCode } = useParams();
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState([]);
  const [playerName, setPlayerName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const socketInstance = io(`${URL}`, {
      transports: ["websocket"],
      upgrade: false,
    });

    // Get player name from localStorage
    const storedPlayerName =
      localStorage.getItem("playerName") || `Player${Date.now()}`;
    setPlayerName(storedPlayerName);

    socketInstance.on("connect", () => {
      console.log("Connected to server for results");
      // Join the room and request leaderboard
      socketInstance.emit("join-room", {
        roomCode,
        playerName: storedPlayerName,
      });
      socketInstance.emit("get-leaderboard", roomCode);
    });

    // Listen for final leaderboard
    socketInstance.on("update-leaderboard", (updatedLeaderboard) => {
      console.log("Results leaderboard received:", updatedLeaderboard);
      setLeaderboard(updatedLeaderboard);
      setLoading(false);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [roomCode]);

  const handlePlayAgain = () => {
    router.push(`/quiz/${roomCode}`);
  };

  const handleBackToHome = () => {
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading final results...</p>
        </div>
      </div>
    );
  }

  const playerRank =
    leaderboard.findIndex((player) => player.name === playerName) + 1;
  const playerScore =
    leaderboard.find((player) => player.name === playerName)?.score || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">
            🎉 Quiz Complete! 🎉
          </h1>
          <p className="text-xl text-purple-200">
            Room: <span className="font-semibold text-white">{roomCode}</span>
          </p>
        </div>

        {/* Player Stats */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8 border border-white/20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Your Performance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-6">
                <div className="text-4xl font-bold text-white mb-2">
                  {playerScore}
                </div>
                <div className="text-blue-200">Total Points</div>
              </div>
              <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-6">
                <div className="text-4xl font-bold text-white mb-2">
                  #{playerRank}
                </div>
                <div className="text-green-200">Final Rank</div>
              </div>
            </div>
          </div>
        </div>

        {/* Final Leaderboard */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8 border border-white/20">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            🏆 Final Leaderboard
          </h2>
          <div className="space-y-4">
            {leaderboard.map((player, index) => (
              <div
                key={player.name}
                className={`flex items-center justify-between p-6 rounded-xl transition-all duration-300 ${
                  player.name === playerName
                    ? "bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-2 border-yellow-400/50 shadow-lg shadow-yellow-500/20"
                    : "bg-white/5 hover:bg-white/10"
                } ${index < 3 ? "border border-white/30" : ""}`}
              >
                <div className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full text-lg font-bold mr-4 ${
                      index === 0
                        ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg"
                        : index === 1
                        ? "bg-gradient-to-r from-gray-300 to-gray-500 text-white shadow-lg"
                        : index === 2
                        ? "bg-gradient-to-r from-amber-600 to-amber-800 text-white shadow-lg"
                        : "bg-white/20 text-white"
                    }`}
                  >
                    {index === 0
                      ? "🥇"
                      : index === 1
                      ? "🥈"
                      : index === 2
                      ? "🥉"
                      : index + 1}
                  </div>
                  <div>
                    <div className="font-bold text-white text-lg">
                      {player.name === playerName ? "You" : player.name}
                    </div>
                    {index < 3 && (
                      <div className="text-sm text-gray-300">
                        {index === 0
                          ? "Champion!"
                          : index === 1
                          ? "Runner-up"
                          : "Third Place"}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {player.score}
                  </div>
                  <div className="text-sm text-gray-300">points</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handlePlayAgain}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            🔄 Play Again
          </button>
          <button
            onClick={handleBackToHome}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            🏠 Back to Home
          </button>
        </div>

        {/* Fun Stats */}
        {leaderboard.length > 1 && (
          <div className="mt-12 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white text-center mb-4">
              📊 Quiz Stats
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-lg font-bold text-white">
                  {leaderboard.length}
                </div>
                <div className="text-sm text-gray-300">Total Players</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-lg font-bold text-white">
                  {Math.max(...leaderboard.map((p) => p.score))}
                </div>
                <div className="text-sm text-gray-300">Highest Score</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-lg font-bold text-white">
                  {Math.round(
                    leaderboard.reduce((sum, p) => sum + p.score, 0) /
                      leaderboard.length
                  )}
                </div>
                <div className="text-sm text-gray-300">Average Score</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
