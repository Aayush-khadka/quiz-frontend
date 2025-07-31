// "use client";
// import { useParams, useRouter } from "next/navigation";
// import { useState, useEffect } from "react";
// import { io } from "socket.io-client";

// export default function ResultsPage() {
//   const URL = process.env.NEXT_PUBLIC_URL;
//   const { roomCode } = useParams();
//   const router = useRouter();
//   const [leaderboard, setLeaderboard] = useState([]);
//   const [playerName, setPlayerName] = useState("");
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const socketInstance = io(`${URL}`, {
//       transports: ["websocket"],
//       upgrade: false,
//     });

//     // Get player name from localStorage
//     const storedPlayerName =
//       localStorage.getItem("playerName") || `Player${Date.now()}`;
//     setPlayerName(storedPlayerName);

//     socketInstance.on("connect", () => {
//       console.log("Connected to server for results");
//       // Join the room and request leaderboard
//       socketInstance.emit("join-room", {
//         roomCode,
//         playerName: storedPlayerName,
//       });
//       socketInstance.emit("get-leaderboard", roomCode);
//     });

//     // Listen for final leaderboard
//     socketInstance.on("update-leaderboard", (updatedLeaderboard) => {
//       console.log("Results leaderboard received:", updatedLeaderboard);
//       setLeaderboard(updatedLeaderboard);
//       setLoading(false);
//     });

//     return () => {
//       socketInstance.disconnect();
//     };
//   }, [roomCode]);

//   const handlePlayAgain = () => {
//     router.push(`/quiz/${roomCode}`);
//   };

//   const handleBackToHome = () => {
//     router.push("/");
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
//         <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading final results...</p>
//         </div>
//       </div>
//     );
//   }

//   const playerRank =
//     leaderboard.findIndex((player) => player.name === playerName) + 1;
//   const playerScore =
//     leaderboard.find((player) => player.name === playerName)?.score || 0;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 px-4 py-8">
//       <div className="max-w-4xl mx-auto">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <h1 className="text-5xl font-bold text-white mb-4">
//             🎉 Quiz Complete! 🎉
//           </h1>
//           <p className="text-xl text-purple-200">
//             Room: <span className="font-semibold text-white">{roomCode}</span>
//           </p>
//         </div>

//         {/* Player Stats */}
//         <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8 border border-white/20">
//           <div className="text-center">
//             <h2 className="text-2xl font-bold text-white mb-4">
//               Your Performance
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-6">
//                 <div className="text-4xl font-bold text-white mb-2">
//                   {playerScore}
//                 </div>
//                 <div className="text-blue-200">Total Points</div>
//               </div>
//               <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-6">
//                 <div className="text-4xl font-bold text-white mb-2">
//                   #{playerRank}
//                 </div>
//                 <div className="text-green-200">Final Rank</div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Final Leaderboard */}
//         <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8 border border-white/20">
//           <h2 className="text-3xl font-bold text-white text-center mb-8">
//             🏆 Final Leaderboard
//           </h2>
//           <div className="space-y-4">
//             {leaderboard.map((player, index) => (
//               <div
//                 key={player.name}
//                 className={`flex items-center justify-between p-6 rounded-xl transition-all duration-300 ${
//                   player.name === playerName
//                     ? "bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-2 border-yellow-400/50 shadow-lg shadow-yellow-500/20"
//                     : "bg-white/5 hover:bg-white/10"
//                 } ${index < 3 ? "border border-white/30" : ""}`}
//               >
//                 <div className="flex items-center">
//                   <div
//                     className={`flex items-center justify-center w-12 h-12 rounded-full text-lg font-bold mr-4 ${
//                       index === 0
//                         ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg"
//                         : index === 1
//                         ? "bg-gradient-to-r from-gray-300 to-gray-500 text-white shadow-lg"
//                         : index === 2
//                         ? "bg-gradient-to-r from-amber-600 to-amber-800 text-white shadow-lg"
//                         : "bg-white/20 text-white"
//                     }`}
//                   >
//                     {index === 0
//                       ? "🥇"
//                       : index === 1
//                       ? "🥈"
//                       : index === 2
//                       ? "🥉"
//                       : index + 1}
//                   </div>
//                   <div>
//                     <div className="font-bold text-white text-lg">
//                       {player.name === playerName ? "You" : player.name}
//                     </div>
//                     {index < 3 && (
//                       <div className="text-sm text-gray-300">
//                         {index === 0
//                           ? "Champion!"
//                           : index === 1
//                           ? "Runner-up"
//                           : "Third Place"}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//                 <div className="text-right">
//                   <div className="text-2xl font-bold text-white">
//                     {player.score}
//                   </div>
//                   <div className="text-sm text-gray-300">points</div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex flex-col sm:flex-row gap-4 justify-center">
//           <button
//             onClick={handlePlayAgain}
//             className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
//           >
//             🔄 Play Again
//           </button>
//           <button
//             onClick={handleBackToHome}
//             className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
//           >
//             🏠 Back to Home
//           </button>
//         </div>

//         {/* Fun Stats */}
//         {leaderboard.length > 1 && (
//           <div className="mt-12 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
//             <h3 className="text-xl font-bold text-white text-center mb-4">
//               📊 Quiz Stats
//             </h3>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
//               <div className="bg-white/5 rounded-lg p-4">
//                 <div className="text-lg font-bold text-white">
//                   {leaderboard.length}
//                 </div>
//                 <div className="text-sm text-gray-300">Total Players</div>
//               </div>
//               <div className="bg-white/5 rounded-lg p-4">
//                 <div className="text-lg font-bold text-white">
//                   {Math.max(...leaderboard.map((p) => p.score))}
//                 </div>
//                 <div className="text-sm text-gray-300">Highest Score</div>
//               </div>
//               <div className="bg-white/5 rounded-lg p-4">
//                 <div className="text-lg font-bold text-white">
//                   {Math.round(
//                     leaderboard.reduce((sum, p) => sum + p.score, 0) /
//                       leaderboard.length
//                   )}
//                 </div>
//                 <div className="text-sm text-gray-300">Average Score</div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";

export default function ResultsPage() {
  const URL = process.env.NEXT_PUBLIC_URL;
  const { roomCode } = useParams();
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState([]);
  const [playerName, setPlayerName] = useState("");
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

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

      // Trigger animations after data loads
      setTimeout(() => {
        setAnimateIn(true);
        setShowConfetti(true);
      }, 500);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [roomCode]);

  const handlePlayAgain = () => {
    // Clear the room and redirect to home/lobby
    router.push("/");
  };

  const handleBackToHome = () => {
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-8 text-center max-w-md">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-black mb-2">
            Calculating Results
          </h2>
          <p className="text-gray-600">Preparing the final leaderboard...</p>
        </div>
      </div>
    );
  }

  const playerRank =
    leaderboard.findIndex((player) => player.name === playerName) + 1;
  const topThree = leaderboard.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Animated Confetti */}
      {showConfetti && (
        <>
          {/* Left side confetti */}
          <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-10">
            {[...Array(15)].map((_, i) => (
              <div
                key={`left-${i}`}
                className="absolute animate-bounce"
                style={{
                  left: `${Math.random() * 30}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              >
                <div
                  className={`w-3 h-3 rotate-45 ${
                    [
                      "bg-[#A6FAFF]",
                      "bg-[#B8FF9F]",
                      "bg-[#FFA6F6]",
                      "bg-[#FFFF9F]",
                    ][Math.floor(Math.random() * 4)]
                  }`}
                ></div>
              </div>
            ))}
          </div>

          {/* Right side confetti */}
          <div className="fixed top-0 right-0 w-full h-full pointer-events-none z-10">
            {[...Array(15)].map((_, i) => (
              <div
                key={`right-${i}`}
                className="absolute animate-bounce"
                style={{
                  right: `${Math.random() * 30}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              >
                <div
                  className={`w-3 h-3 rotate-45 ${
                    [
                      "bg-[#A6FAFF]",
                      "bg-[#B8FF9F]",
                      "bg-[#FFA6F6]",
                      "bg-[#FFFF9F]",
                    ][Math.floor(Math.random() * 4)]
                  }`}
                ></div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Header */}
      <div className="bg-white border-b-4 border-black px-4 py-3 relative z-20">
        <div className="max-w-6xl mx-auto text-center">
          <div className="bg-black text-white px-6 py-3 inline-block mb-2">
            <h1 className="text-2xl font-bold">🎉 QUIZ COMPLETE! 🎉</h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 relative z-20">
        {/* Winners Podium */}
        {topThree.length > 0 && (
          <div
            className={`bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-8 mb-8 transition-all duration-1000 delay-300 ${
              animateIn
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <div className="bg-black text-white px-4 py-2 text-center mb-8">
              <h2 className="text-xl font-bold">🏆 WINNERS PODIUM</h2>
            </div>

            {/* Podium Display */}
            <div className="flex items-end justify-center gap-4 mb-8">
              {/* 2nd Place */}
              {topThree[1] && (
                <div
                  className={`text-center transition-all duration-1000 delay-500 ${
                    animateIn
                      ? "translate-y-0 opacity-100"
                      : "translate-y-20 opacity-0"
                  }`}
                >
                  <div className="bg-[#A6FAFF] border-4 border-black p-4 mb-2">
                    <div className="text-3xl mb-2">🥈</div>
                    <div className="font-bold text-black text-lg">
                      {topThree[1].name === playerName
                        ? "YOU"
                        : topThree[1].name}
                    </div>
                    <div className="text-2xl font-bold text-black">
                      {topThree[1].score}
                    </div>
                  </div>
                  <div className="bg-gray-400 border-2 border-black h-20 flex items-center justify-center">
                    <span className="font-bold text-white">2ND</span>
                  </div>
                </div>
              )}

              {/* 1st Place */}
              <div
                className={`text-center transition-all duration-1000 delay-700 ${
                  animateIn
                    ? "translate-y-0 opacity-100 scale-100"
                    : "translate-y-20 opacity-0 scale-75"
                }`}
              >
                <div className="bg-[#FFFF9F] border-4 border-black p-6 mb-2 relative">
                  <div className="text-5xl mb-3 animate-bounce">🥇</div>
                  <div className="font-bold text-black text-xl mb-1">
                    {topThree[0].name === playerName ? "YOU" : topThree[0].name}
                  </div>
                  <div className="text-3xl font-bold text-black">
                    {topThree[0].score}
                  </div>
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rotate-12">
                    WINNER!
                  </div>
                </div>
                <div className="bg-yellow-500 border-2 border-black h-28 flex items-center justify-center">
                  <span className="font-bold text-black text-lg">1ST</span>
                </div>
              </div>

              {/* 3rd Place */}
              {topThree[2] && (
                <div
                  className={`text-center transition-all duration-1000 delay-600 ${
                    animateIn
                      ? "translate-y-0 opacity-100"
                      : "translate-y-20 opacity-0"
                  }`}
                >
                  <div className="bg-[#FFA6F6] border-4 border-black p-4 mb-2">
                    <div className="text-3xl mb-2">🥉</div>
                    <div className="font-bold text-black text-lg">
                      {topThree[2].name === playerName
                        ? "YOU"
                        : topThree[2].name}
                    </div>
                    <div className="text-2xl font-bold text-black">
                      {topThree[2].score}
                    </div>
                  </div>
                  <div className="bg-amber-600 border-2 border-black h-16 flex items-center justify-center">
                    <span className="font-bold text-white">3RD</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div
          className={`bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6 mb-8 transition-all duration-1000 delay-500 ${
            animateIn ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="bg-black text-white px-4 py-2 text-center mb-6">
            <h2 className="text-xl font-bold">📊 FULL LEADERBOARD</h2>
          </div>

          <div className="space-y-3">
            {leaderboard.map((player, index) => (
              <div
                key={player.name}
                className={`flex items-center justify-between p-4 border-2 border-black transition-all duration-300 ${
                  player.name === playerName
                    ? "bg-[#FFA6F6] shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                    : index < 3
                    ? "bg-[#FFFF9F]"
                    : "bg-gray-50 hover:bg-[#A6FAFF]"
                }`}
                style={{
                  animationDelay: `${600 + index * 100}ms`,
                }}
              >
                <div className="flex items-center">
                  <div
                    className={`w-12 h-12 border-2 border-black flex items-center justify-center text-lg font-bold mr-4 ${
                      index === 0
                        ? "bg-yellow-400"
                        : index === 1
                        ? "bg-gray-400 text-white"
                        : index === 2
                        ? "bg-amber-600 text-white"
                        : "bg-white"
                    }`}
                  >
                    {index < 3
                      ? index === 0
                        ? "🥇"
                        : index === 1
                        ? "🥈"
                        : "🥉"
                      : index + 1}
                  </div>
                  <div>
                    <div className="font-bold text-black text-lg">
                      {player.name === playerName ? "YOU" : player.name}
                    </div>
                    {index < 3 && (
                      <div className="text-sm text-gray-600">
                        {index === 0
                          ? "🏆 Champion!"
                          : index === 1
                          ? "🥈 Runner-up"
                          : "🥉 Third Place"}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-black">
                    {player.score}
                  </div>
                  <div className="text-sm text-gray-600">points</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 delay-900 ${
            animateIn ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          {/* <button
            onClick={handlePlayAgain}
            className="border-4 border-black px-8 py-4 bg-[#B8FF9F] hover:bg-[#99fc77] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 transition-all font-bold text-black text-lg"
          >
            🔄 PLAY AGAIN
          </button> */}
          <button
            onClick={handleBackToHome}
            className="border-4 border-black px-8 py-4 bg-[#A6FAFF] hover:bg-[#79F7FF] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 transition-all font-bold text-black text-lg"
          >
            🏠 BACK TO HOME
          </button>
        </div>
      </div>
    </div>
  );
}
