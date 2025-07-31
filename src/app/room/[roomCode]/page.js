// "use client";

// import { useState, useEffect, use } from "react";
// import { io } from "socket.io-client";

// export default function RoomPage({ params }) {
//   const URL = process.env.NEXT_PUBLIC_URL;
//   const { roomCode } = use(params);
//   const [socket, setSocket] = useState(null);
//   const [players, setPlayers] = useState([]);
//   const [isHost, setIsHost] = useState(false);
//   const [accessDenied, setAccessDenied] = useState(false);
//   const [roomData, setRoomData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [editingQuestion, setEditingQuestion] = useState(null);
//   const [editingData, setEditingData] = useState({});
//   const [updating, setUpdating] = useState(false);
//   const [generatingQuestions, setGeneratingQuestions] = useState(false);
//   const [deletingRoom, setDeletingRoom] = useState(false);

//   let QUESTION_LIMIT;

//   useEffect(() => {
//     fetchRoomData();
//   }, [roomCode]);

//   useEffect(() => {
//     if (!loading && roomData?.data?.[0]?.host_name) {
//       const currentPlayerName = localStorage.getItem("playerName");
//       const hostName = roomData.data[0].host_name;

//       if (currentPlayerName !== hostName) {
//         setAccessDenied(true);
//       } else {
//         setIsHost(true);
//       }
//     }
//   }, [loading, roomData]);

//   useEffect(() => {
//     const socketInstance = io(`${URL}`, {
//       withCredentials: true,
//     });
//     setSocket(socketInstance);

//     const playerName = localStorage.getItem("playerName") || "Unnamed";
//     const userId = localStorage.getItem("userId");

//     // socketInstance.emit("join-room", {
//     //   roomCode,
//     //   playerName,
//     //   userId,
//     // });

//     socketInstance.on("room-players-updated", (playerNames) => {
//       console.log("Players updated:", playerNames);
//       setPlayers(
//         playerNames.map((name, index) => ({
//           id: index + 1,
//           name,
//           isHost: index === 0, // First player is typically the host
//           isYou: name === playerName,
//         }))
//       );
//     });
//     socketInstance.on("room-closed", (message) => {
//       alert(message);
//       window.location.href = "/"; // Redirect to home page
//     });
//     socketInstance.on("joined-successfully", ({ roomCode, playerName }) => {
//       console.log("Successfully joined room:", roomCode);
//     });
//     socketInstance.on("quiz-started", () => {
//       console.log("✅ Quiz started, navigating to quiz page...");
//       setQuizStarted(true);
//       router.push(`/quiz/${roomCode}`);
//     });

//     socketInstance.on("quiz-start-failed", (errorMsg) => {
//       alert("Quiz start failed: " + errorMsg);
//     });

//     socketInstance.emit("get-lobby-players", { roomCode });

//     socketInstance.on("lobby-players-success", (playersList) => {
//       setPlayers(
//         playersList.map((player, index) => ({
//           id: index + 1,
//           name: player.name,
//           isHost: player.isHost,
//           status: player.status,
//           isYou: player.name === localStorage.getItem("playerName"),
//         }))
//       );
//     });

//     socketInstance.on("lobby-players-failed", (error) => {
//       console.error("❌ Failed to fetch lobby players:", error);
//     });
//     return () => {
//       socketInstance.disconnect();
//     };
//   }, [roomCode]);

//   useEffect(() => {
//     if (roomData?.data?.[0]?.host_name && players.length > 0) {
//       const currentPlayerName = localStorage.getItem("playerName");
//       const hostName = roomData.data[0].host_name;
//       setIsHost(currentPlayerName === hostName);
//     }
//   }, [roomData, players]);

//   const fetchRoomData = async () => {
//     try {
//       setLoading(true);
//       console.log("Fetching room data for code:", roomCode);

//       const response = await fetch(`${URL}/api/v1/room/lobby/${roomCode}`);

//       if (!response.ok) {
//         console.error(
//           `API endpoint failed. URL: ${URL}/api/v1/room/lobby/${roomCode}`
//         );
//         console.error(
//           `Status: ${response.status}, StatusText: ${response.statusText}`
//         );
//         throw new Error(
//           `HTTP error! status: ${response.status} - ${response.statusText}`
//         );
//       }

//       const rawText = await response.text();

//       let data;
//       try {
//         data = JSON.parse(rawText);
//       } catch (parseError) {
//         console.error("JSON parse error:", parseError);
//         throw new Error(
//           `Invalid JSON response: ${rawText.substring(0, 100)}...`
//         );
//       }

//       if (!data.statuscode) {
//         throw new Error(data.message || "Failed to fetch room data");
//       }

//       setRoomData(data);
//     } catch (err) {
//       console.error("Fetch error:", err);
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeleteRoom = async () => {
//     if (
//       window.confirm(
//         "Are you sure you want to delete this room? This will remove all players and questions."
//       )
//     ) {
//       try {
//         setDeletingRoom(true);

//         socket.emit("delete-room", { roomCode });

//         socket.on("room-deleted-successfully", () => {
//           alert("Room deleted successfully!");
//           window.location.href = "/";
//         });

//         socket.on("delete-room-failed", (errorMessage) => {
//           alert("Error deleting room: " + errorMessage);
//           setDeletingRoom(false);
//         });
//       } catch (error) {
//         console.error("Delete room error:", error);
//         alert("Error deleting room: " + error.message);
//         setDeletingRoom(false);
//       }
//     }
//   };

//   const handleDeleteQuestion = async (questionId) => {
//     if (window.confirm("Are you sure you want to delete this question?")) {
//       try {
//         const response = await fetch(
//           `${URL}/api/v1/question/delete/${questionId}`,
//           {
//             method: "DELETE",
//           }
//         );

//         if (!response.ok) {
//           const errorData = await response.json().catch(() => ({}));
//           throw new Error(
//             errorData.message || `Failed to delete question: ${response.status}`
//           );
//         }

//         const result = await response.json();

//         if (result.statuscode) {
//           console.log("Question deleted:", result.message);
//           await fetchRoomData();
//         } else {
//           throw new Error(result.message || "Failed to delete question");
//         }
//       } catch (error) {
//         console.error("Delete error:", error);
//         alert("Error deleting question: " + error.message);
//       }
//     }
//   };

//   const handleEditQuestion = (question) => {
//     setEditingQuestion(question._id);
//     setEditingData({
//       question: question.question,
//       options: [...question.options],
//       correct_option: question.correct_option,
//     });
//   };

//   const handleCancelEdit = () => {
//     setEditingQuestion(null);
//     setEditingData({});
//   };

//   const handleUpdateQuestion = async (questionId) => {
//     try {
//       setUpdating(true);

//       const response = await fetch(
//         `${URL}/api/v1/question/update/${questionId}`,
//         {
//           method: "PATCH",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             id: questionId,
//             question: editingData.question,
//             options: editingData.options,
//             correct_option: editingData.correct_option,
//           }),
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const result = await response.json();

//       if (result.statuscode) {
//         console.log("Question updated successfully:", result.message);
//         await fetchRoomData();
//         setEditingQuestion(null);
//         setEditingData({});
//       } else {
//         throw new Error(result.message || "Failed to update question");
//       }
//     } catch (error) {
//       console.error("Error updating question:", error);
//       alert("Failed to update question: " + error.message);
//     } finally {
//       setUpdating(false);
//     }
//   };

//   const handleInputChange = (field, value, index = null) => {
//     setEditingData((prev) => {
//       if (field === "options" && index !== null) {
//         const newOptions = [...prev.options];
//         newOptions[index] = value;
//         return { ...prev, options: newOptions };
//       }
//       return { ...prev, [field]: value };
//     });
//   };

//   const handleStartQuiz = () => {
//     if (socket && isHost) {
//       console.log("🟢 Emitting start-quiz for room:", roomCode);
//       socket.emit("start-quiz", { roomCode });
//     }
//   };
//   const handleGenerateMoreQuestions = async () => {
//     const quizData = roomData?.data?.[0];
//     const currentQuestions = quizData?.questions || [];

//     if (!quizData || !quizData._id) {
//       alert("Quiz ID not found. Cannot generate more questions.");
//       return;
//     }

//     QUESTION_LIMIT = quizData.no_questions;

//     if (currentQuestions.length >= QUESTION_LIMIT) {
//       alert(
//         `You have reached the maximum limit of ${QUESTION_LIMIT} questions.`
//       );
//       return;
//     }

//     try {
//       setGeneratingQuestions(true);

//       const response = await fetch(
//         `${URL}/api/v1/question/generatemorequestions/${quizData._id}`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       const result = await response.json();

//       if (result.statuscode) {
//         console.log("More questions generated successfully:", result.message);
//         await fetchRoomData();

//         const updatedQuizData = roomData?.data?.[0];
//         const updatedQuestions = updatedQuizData?.questions || [];

//         if (updatedQuestions.length >= QUESTION_LIMIT) {
//           alert(`Question limit of ${QUESTION_LIMIT} has been reached!`);
//         }
//       } else {
//         throw new Error(result.message || "Failed to generate more questions");
//       }
//     } catch (error) {
//       console.error("Error generating more questions:", error);
//       alert("Error: " + error.message);
//     } finally {
//       setGeneratingQuestions(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <div className="text-xl text-gray-600">Loading room data...</div>
//       </div>
//     );
//   }

//   if (accessDenied) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <div className="bg-white p-6 rounded-xl shadow text-red-600 text-xl font-semibold">
//           🚫 Access Denied. Only the host can access this page.
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <div className="bg-white p-6 rounded-2xl shadow-lg">
//           <div className="text-red-600 text-center font-semibold">{error}</div>
//           <button
//             onClick={fetchRoomData}
//             className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition duration-200"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const quizData = roomData?.data?.[0];
//   const questions = quizData?.questions || [];

//   const hasReachedLimit = questions.length >= QUESTION_LIMIT;

//   if (!quizData) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <div className="bg-white p-6 rounded-2xl shadow-lg">
//           <div className="text-red-600 text-center font-semibold">
//             No quiz data found for room code: {roomCode}
//           </div>
//           <button
//             onClick={fetchRoomData}
//             className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition duration-200"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-100 p-4">
//       <div className="max-w-4xl mx-auto space-y-6">
//         {/* Room Info Section */}
//         <div className="bg-white p-6 rounded-2xl shadow-lg">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-2xl font-bold text-gray-800">Room Info</h2>
//             {isHost && (
//               <button
//                 onClick={handleDeleteRoom}
//                 disabled={deletingRoom}
//                 className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-2 px-4 rounded-xl transition duration-200"
//               >
//                 {deletingRoom ? "Deleting..." : "Delete Room"}
//               </button>
//             )}
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <p className="text-gray-700">
//                 <span className="font-medium">Room Code:</span>
//                 <span className="font-mono text-blue-600 ml-2">
//                   {quizData.room_code || roomCode}
//                 </span>
//               </p>
//               <p className="text-gray-700">
//                 <span className="font-medium">Host:</span>
//                 <span className="ml-2">{quizData.host_name || "Unknown"}</span>
//               </p>
//             </div>
//             <div className="space-y-2">
//               <p className="text-gray-700">
//                 <span className="font-medium">Topic:</span>
//                 <span className="ml-2">{quizData.topic || "N/A"}</span>
//               </p>
//               <p className="text-gray-700">
//                 <span className="font-medium">Difficulty:</span>
//                 <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium">
//                   {quizData.difficulty || "N/A"}
//                 </span>
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Current Players Section */}
//         <div className="bg-white p-6 rounded-2xl shadow-lg">
//           <h2 className="text-2xl font-bold text-gray-800 mb-4">
//             Current Players in Lobby ({players.length})
//           </h2>
//           {players.length === 0 ? (
//             <div className="text-gray-500 text-center py-4">
//               No players in the lobby yet...
//             </div>
//           ) : (
//             <div className="space-y-2">
//               {players.map((player) => (
//                 <div
//                   key={player.id}
//                   className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200"
//                 >
//                   <span className="text-gray-800 font-medium">
//                     {player.name}
//                   </span>
//                   <div className="flex gap-2">
//                     {player.isHost && (
//                       <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-sm font-medium">
//                         Host
//                       </span>
//                     )}
//                     {player.isYou && (
//                       <span className="bg-green-100 text-green-800 px-2 py-1 rounded-lg text-sm font-medium">
//                         You
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Questions Section */}
//         <div className="bg-white p-6 rounded-2xl shadow-lg">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-2xl font-bold text-gray-800">
//               Questions ({questions.length})
//             </h2>
//             <div className="text-sm text-gray-600"></div>
//           </div>

//           {hasReachedLimit && (
//             <div className="mb-4 p-3 bg-orange-100 border border-orange-300 rounded-lg">
//               <p className="text-orange-800 text-sm font-medium">
//                 ⚠️ You have reached the maximum limit of {QUESTION_LIMIT}{" "}
//                 questions.
//               </p>
//             </div>
//           )}

//           <div className="space-y-4">
//             {questions.map((question, index) => (
//               <div
//                 key={question._id}
//                 className="border border-gray-200 rounded-xl p-4 bg-gray-50"
//               >
//                 <div className="mb-3">
//                   <span className="text-sm text-gray-500 font-medium">
//                     Question {index + 1}
//                   </span>

//                   {editingQuestion === question._id ? (
//                     <textarea
//                       value={editingData.question}
//                       onChange={(e) =>
//                         handleInputChange("question", e.target.value)
//                       }
//                       className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-lg font-semibold resize-none text-black"
//                       rows="2"
//                     />
//                   ) : (
//                     <h3 className="text-lg font-semibold text-gray-800 mt-1">
//                       {question.question}
//                     </h3>
//                   )}
//                 </div>

//                 <div className="mb-3">
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//                     {question.options.map((option, optionIndex) => (
//                       <div key={optionIndex} className="space-y-1">
//                         {editingQuestion === question._id ? (
//                           <input
//                             type="text"
//                             value={editingData.options[optionIndex]}
//                             onChange={(e) =>
//                               handleInputChange(
//                                 "options",
//                                 e.target.value,
//                                 optionIndex
//                               )
//                             }
//                             className="w-full p-2 border border-gray-300 rounded-lg text-sm text-black"
//                           />
//                         ) : (
//                           <div
//                             className={`p-2 rounded-lg text-sm border border-gray-200 ${
//                               option === question.correct_option
//                                 ? "bg-green-100 text-green-800 border-green-300"
//                                 : "bg-white text-gray-700"
//                             }`}
//                           >
//                             {option}
//                             {option === question.correct_option && (
//                               <span className="ml-2 text-xs font-medium">
//                                 ✓ Correct
//                               </span>
//                             )}
//                           </div>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="mb-3">
//                   <span className="text-sm text-gray-600 font-medium">
//                     Correct Answer:{" "}
//                   </span>
//                   {editingQuestion === question._id ? (
//                     <select
//                       value={editingData.correct_option}
//                       onChange={(e) =>
//                         handleInputChange("correct_option", e.target.value)
//                       }
//                       className="ml-2 p-1 border border-gray-300 rounded text-sm text-black"
//                     >
//                       {editingData.options.map((option, idx) => (
//                         <option key={idx} value={option}>
//                           {option}
//                         </option>
//                       ))}
//                     </select>
//                   ) : (
//                     <span className="text-green-700 font-medium">
//                       {question.correct_option}
//                     </span>
//                   )}
//                 </div>

//                 <div className="flex gap-2">
//                   {editingQuestion === question._id ? (
//                     <>
//                       <button
//                         onClick={() => handleUpdateQuestion(question._id)}
//                         disabled={updating}
//                         className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200"
//                       >
//                         {updating ? "Updating..." : "Save"}
//                       </button>
//                       <button
//                         onClick={handleCancelEdit}
//                         disabled={updating}
//                         className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200"
//                       >
//                         Cancel
//                       </button>
//                     </>
//                   ) : (
//                     <>
//                       <button
//                         onClick={() => handleEditQuestion(question)}
//                         className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200"
//                       >
//                         Edit
//                       </button>
//                       <button
//                         onClick={() => handleDeleteQuestion(question._id)}
//                         className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200"
//                       >
//                         Delete
//                       </button>
//                     </>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>

//           <button
//             onClick={handleGenerateMoreQuestions}
//             disabled={hasReachedLimit || generatingQuestions}
//             className={`mt-6 w-full font-semibold py-3 px-4 rounded-xl transition duration-200 ${
//               hasReachedLimit
//                 ? "bg-gray-400 text-gray-600 cursor-not-allowed"
//                 : generatingQuestions
//                 ? "bg-purple-400 text-white cursor-not-allowed"
//                 : "bg-purple-600 hover:bg-purple-700 text-white"
//             }`}
//           >
//             {generatingQuestions
//               ? "Generating Questions..."
//               : hasReachedLimit
//               ? `Question Limit Reached (${QUESTION_LIMIT})`
//               : "Generate More Questions"}
//           </button>
//           <button
//             onClick={handleStartQuiz}
//             className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl transition duration-200"
//           >
//             Start Quiz
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// "use client";

// import { useState, useEffect, use } from "react";
// import { io } from "socket.io-client";

// export default function RoomPage({ params }) {
//   const URL = process.env.NEXT_PUBLIC_URL;
//   const { roomCode } = use(params);
//   const [socket, setSocket] = useState(null);
//   const [players, setPlayers] = useState([]);
//   const [isHost, setIsHost] = useState(false);
//   const [accessDenied, setAccessDenied] = useState(false);
//   const [roomData, setRoomData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [editingQuestion, setEditingQuestion] = useState(null);
//   const [editingData, setEditingData] = useState({});
//   const [updating, setUpdating] = useState(false);
//   const [generatingQuestions, setGeneratingQuestions] = useState(false);
//   const [deletingRoom, setDeletingRoom] = useState(false);
//   const [copied, setCopied] = useState(false);

//   let QUESTION_LIMIT;

//   useEffect(() => {
//     fetchRoomData();
//   }, [roomCode]);

//   useEffect(() => {
//     if (!loading && roomData?.data?.[0]?.host_name) {
//       const currentPlayerName = localStorage.getItem("playerName");
//       const hostName = roomData.data[0].host_name;

//       if (currentPlayerName !== hostName) {
//         setAccessDenied(true);
//       } else {
//         setIsHost(true);
//       }
//     }
//   }, [loading, roomData]);

//   useEffect(() => {
//     const socketInstance = io(`${URL}`, {
//       withCredentials: true,
//     });
//     setSocket(socketInstance);

//     const playerName = localStorage.getItem("playerName") || "Unnamed";
//     const userId = localStorage.getItem("userId");

//     socketInstance.on("room-players-updated", (playerNames) => {
//       console.log("Players updated:", playerNames);
//       setPlayers(
//         playerNames.map((name, index) => ({
//           id: index + 1,
//           name,
//           isHost: index === 0,
//           isYou: name === playerName,
//         }))
//       );
//     });

//     socketInstance.on("room-closed", (message) => {
//       alert(message);
//       window.location.href = "/";
//     });

//     socketInstance.on("joined-successfully", ({ roomCode, playerName }) => {
//       console.log("Successfully joined room:", roomCode);
//     });

//     socketInstance.on("quiz-started", () => {
//       console.log("✅ Quiz started, navigating to quiz page...");
//       setQuizStarted(true);
//       router.push(`/quiz/${roomCode}`);
//     });

//     socketInstance.on("quiz-start-failed", (errorMsg) => {
//       alert("Quiz start failed: " + errorMsg);
//     });

//     socketInstance.emit("get-lobby-players", { roomCode });

//     socketInstance.on("lobby-players-success", (playersList) => {
//       setPlayers(
//         playersList.map((player, index) => ({
//           id: index + 1,
//           name: player.name,
//           isHost: player.isHost,
//           status: player.status,
//           isYou: player.name === localStorage.getItem("playerName"),
//         }))
//       );
//     });

//     socketInstance.on("lobby-players-failed", (error) => {
//       console.error("❌ Failed to fetch lobby players:", error);
//     });

//     return () => {
//       socketInstance.disconnect();
//     };
//   }, [roomCode]);

//   useEffect(() => {
//     if (roomData?.data?.[0]?.host_name && players.length > 0) {
//       const currentPlayerName = localStorage.getItem("playerName");
//       const hostName = roomData.data[0].host_name;
//       setIsHost(currentPlayerName === hostName);
//     }
//   }, [roomData, players]);

//   const fetchRoomData = async () => {
//     try {
//       setLoading(true);
//       console.log("Fetching room data for code:", roomCode);

//       const response = await fetch(`${URL}/api/v1/room/lobby/${roomCode}`);

//       if (!response.ok) {
//         console.error(
//           `API endpoint failed. URL: ${URL}/api/v1/room/lobby/${roomCode}`
//         );
//         console.error(
//           `Status: ${response.status}, StatusText: ${response.statusText}`
//         );
//         throw new Error(
//           `HTTP error! status: ${response.status} - ${response.statusText}`
//         );
//       }

//       const rawText = await response.text();

//       let data;
//       try {
//         data = JSON.parse(rawText);
//       } catch (parseError) {
//         console.error("JSON parse error:", parseError);
//         throw new Error(
//           `Invalid JSON response: ${rawText.substring(0, 100)}...`
//         );
//       }

//       if (!data.statuscode) {
//         throw new Error(data.message || "Failed to fetch room data");
//       }

//       setRoomData(data);
//     } catch (err) {
//       console.error("Fetch error:", err);
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const copyRoomCode = async () => {
//     try {
//       await navigator.clipboard.writeText(quizData.room_code || roomCode);
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     } catch (err) {
//       // Fallback for older browsers
//       const textArea = document.createElement("textarea");
//       textArea.value = quizData.room_code || roomCode;
//       document.body.appendChild(textArea);
//       textArea.select();
//       document.execCommand("copy");
//       document.body.removeChild(textArea);
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     }
//   };

//   const handleDeleteRoom = async () => {
//     if (
//       window.confirm(
//         "Are you sure you want to delete this room? This will remove all players and questions."
//       )
//     ) {
//       try {
//         setDeletingRoom(true);

//         socket.emit("delete-room", { roomCode });

//         socket.on("room-deleted-successfully", () => {
//           alert("Room deleted successfully!");
//           window.location.href = "/";
//         });

//         socket.on("delete-room-failed", (errorMessage) => {
//           alert("Error deleting room: " + errorMessage);
//           setDeletingRoom(false);
//         });
//       } catch (error) {
//         console.error("Delete room error:", error);
//         alert("Error deleting room: " + error.message);
//         setDeletingRoom(false);
//       }
//     }
//   };

//   const handleDeleteQuestion = async (questionId) => {
//     if (window.confirm("Are you sure you want to delete this question?")) {
//       try {
//         const response = await fetch(
//           `${URL}/api/v1/question/delete/${questionId}`,
//           {
//             method: "DELETE",
//           }
//         );

//         if (!response.ok) {
//           const errorData = await response.json().catch(() => ({}));
//           throw new Error(
//             errorData.message || `Failed to delete question: ${response.status}`
//           );
//         }

//         const result = await response.json();

//         if (result.statuscode) {
//           console.log("Question deleted:", result.message);
//           await fetchRoomData();
//         } else {
//           throw new Error(result.message || "Failed to delete question");
//         }
//       } catch (error) {
//         console.error("Delete error:", error);
//         alert("Error deleting question: " + error.message);
//       }
//     }
//   };

//   const handleEditQuestion = (question) => {
//     setEditingQuestion(question._id);
//     setEditingData({
//       question: question.question,
//       options: [...question.options],
//       correct_option: question.correct_option,
//     });
//   };

//   const handleCancelEdit = () => {
//     setEditingQuestion(null);
//     setEditingData({});
//   };

//   const handleUpdateQuestion = async (questionId) => {
//     try {
//       setUpdating(true);

//       const response = await fetch(
//         `${URL}/api/v1/question/update/${questionId}`,
//         {
//           method: "PATCH",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             id: questionId,
//             question: editingData.question,
//             options: editingData.options,
//             correct_option: editingData.correct_option,
//           }),
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const result = await response.json();

//       if (result.statuscode) {
//         console.log("Question updated successfully:", result.message);
//         await fetchRoomData();
//         setEditingQuestion(null);
//         setEditingData({});
//       } else {
//         throw new Error(result.message || "Failed to update question");
//       }
//     } catch (error) {
//       console.error("Error updating question:", error);
//       alert("Failed to update question: " + error.message);
//     } finally {
//       setUpdating(false);
//     }
//   };

//   const handleInputChange = (field, value, index = null) => {
//     setEditingData((prev) => {
//       if (field === "options" && index !== null) {
//         const newOptions = [...prev.options];
//         newOptions[index] = value;
//         return { ...prev, options: newOptions };
//       }
//       return { ...prev, [field]: value };
//     });
//   };

//   const handleStartQuiz = () => {
//     if (socket && isHost) {
//       console.log("🟢 Emitting start-quiz for room:", roomCode);
//       socket.emit("start-quiz", { roomCode });
//     }
//   };

//   const handleGenerateMoreQuestions = async () => {
//     const quizData = roomData?.data?.[0];
//     const currentQuestions = quizData?.questions || [];

//     if (!quizData || !quizData._id) {
//       alert("Quiz ID not found. Cannot generate more questions.");
//       return;
//     }

//     QUESTION_LIMIT = quizData.no_questions;

//     if (currentQuestions.length >= QUESTION_LIMIT) {
//       alert(
//         `You have reached the maximum limit of ${QUESTION_LIMIT} questions.`
//       );
//       return;
//     }

//     try {
//       setGeneratingQuestions(true);

//       const response = await fetch(
//         `${URL}/api/v1/question/generatemorequestions/${quizData._id}`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       const result = await response.json();

//       if (result.statuscode) {
//         console.log("More questions generated successfully:", result.message);
//         await fetchRoomData();

//         const updatedQuizData = roomData?.data?.[0];
//         const updatedQuestions = updatedQuizData?.questions || [];

//         if (updatedQuestions.length >= QUESTION_LIMIT) {
//           alert(`Question limit of ${QUESTION_LIMIT} has been reached!`);
//         }
//       } else {
//         throw new Error(result.message || "Failed to generate more questions");
//       }
//     } catch (error) {
//       console.error("Error generating more questions:", error);
//       alert("Error: " + error.message);
//     } finally {
//       setGeneratingQuestions(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6">
//           <div className="text-xl font-bold text-black">
//             Loading room data...
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (accessDenied) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6">
//           <div className="text-red-600 text-xl font-bold text-center">
//             🚫 Access Denied
//           </div>
//           <div className="text-black text-sm mt-2 text-center">
//             Only the host can access this page.
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6">
//           <div className="text-red-600 text-center font-bold text-lg mb-3">
//             {error}
//           </div>
//           <button
//             onClick={fetchRoomData}
//             className="w-full border-2 border-black bg-[#B8FF9F] hover:bg-[#99fc77] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:bg-[#7df752] font-bold py-2 px-4 transition-all"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const quizData = roomData?.data?.[0];
//   const questions = quizData?.questions || [];

//   const hasReachedLimit = questions.length >= QUESTION_LIMIT;

//   if (!quizData) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6">
//           <div className="text-red-600 text-center font-bold text-lg mb-3">
//             No quiz data found for room code: {roomCode}
//           </div>
//           <button
//             onClick={fetchRoomData}
//             className="w-full border-2 border-black bg-[#B8FF9F] hover:bg-[#99fc77] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:bg-[#7df752] font-bold py-2 px-4 transition-all"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-white border-b-4 border-black px-3 py-3">
//         <div className="max-w-5xl mx-auto flex items-center justify-between">
//           <div className="bg-black text-white px-3 py-2 border-2 border-black">
//             <h1 className="text-lg font-bold">QUIZ ADMIN</h1>
//           </div>

//           {/* Room Code with Copy Button */}
//           <div className="flex items-center space-x-2">
//             <div className="bg-[#A6FAFF] border-2 border-black px-3 py-2 font-mono text-lg font-black text-black ">
//               ROOM CODE:{quizData.room_code || roomCode}
//             </div>
//             <button
//               onClick={copyRoomCode}
//               className={` text-black border-2 border-black px-3 py-2 font-bold transition-all ${
//                 copied
//                   ? "bg-[#B8FF9F] shadow-[2px_2px_0px_rgba(0,0,0,1)]"
//                   : "bg-[#FFA6F6] hover:bg-[#fa8cef] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]"
//               }`}
//             >
//               {copied ? "✓ Copied!" : "📋 Copy"}
//             </button>
//           </div>

//           {isHost && (
//             <button
//               onClick={handleDeleteRoom}
//               disabled={deletingRoom}
//               className="border-2 border-black bg-red-400 hover:bg-red-500 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:bg-red-600 disabled:bg-gray-300 disabled:text-gray-500 font-bold py-2 px-3 transition-all text-sm"
//             >
//               {deletingRoom ? "Deleting..." : "🗑️ Delete"}
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-5xl mx-auto px-3 py-6 space-y-6">
//         {/* Start Quiz Button - Moved to Top */}
//         <div className="bg-gradient-to-r from-[#B8FF9F] to-[#99fc77] border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-4">
//           <button
//             onClick={handleStartQuiz}
//             className="w-full border-2 border-black bg-white hover:bg-[#B8FF9F] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] active:bg-[#7df752] font-black py-4 px-6 text-2xl transition-all transform hover:scale-105 text-black"
//           >
//             🚀 START QUIZ NOW!
//           </button>
//           <div className="text-center mt-2 text-sm font-bold text-black">
//             Ready to begin? Click above to launch the quiz for all players!
//           </div>
//         </div>

//         {/* Room Info Section - Compact */}
//         <div className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-4">
//           <div className="bg-black text-white px-3 py-1 border-2 border-black mb-4 inline-block">
//             <h2 className="text-lg font-bold">📋 ROOM INFO</h2>
//           </div>

//           <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
//             <div className="bg-[#FFA6F6] border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-3">
//               <div className="text-xs font-bold text-black mb-1">HOST</div>
//               <div className="text-sm font-black text-black truncate">
//                 {quizData.host_name || "Unknown"}
//               </div>
//             </div>

//             <div className="bg-[#A6FAFF] border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-3">
//               <div className="text-xs font-bold text-black mb-1">TOPIC</div>
//               <div className="text-sm font-black text-black truncate">
//                 {quizData.topic || "General"}
//               </div>
//             </div>

//             <div className="bg-[#FFC29F] border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-3">
//               <div className="text-xs font-bold text-black mb-1">
//                 DIFFICULTY
//               </div>
//               <div className="text-sm font-black text-black uppercase">
//                 {quizData.difficulty || "Medium"}
//               </div>
//             </div>

//             <div className="bg-[#B8FF9F] border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-3">
//               <div className="text-xs font-bold text-black mb-1">QUESTIONS</div>
//               <div className="text-sm font-black text-black">
//                 {questions.length}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Players and Questions in Two Columns */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Players Section - Sidebar */}
//           <div className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-4">
//             <div className="bg-black text-white px-3 py-1 border-2 border-black mb-4 inline-block">
//               <h2 className="text-sm font-bold">
//                 👥 PLAYERS ({players.length})
//               </h2>
//             </div>

//             {players.length === 0 ? (
//               <div className="bg-gray-100 border-2 border-black p-4 text-center">
//                 <div className="text-lg mb-1">😴</div>
//                 <div className="text-xs font-bold text-gray-600">
//                   Waiting for players...
//                 </div>
//               </div>
//             ) : (
//               <div className="space-y-2 max-h-96 overflow-y-auto">
//                 {players.map((player) => (
//                   <div
//                     key={player.id}
//                     className="bg-white border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] p-2 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all"
//                   >
//                     <div className="flex items-center justify-between">
//                       <div className="text-sm font-bold text-black truncate flex-1">
//                         {player.name}
//                       </div>
//                       <div className="flex gap-1 ml-2">
//                         {player.isHost && (
//                           <span className="bg-[#FFA6F6] border border-black px-1 py-0.5 text-xs font-bold text-black">
//                             👑
//                           </span>
//                         )}
//                         {player.isYou && (
//                           <span className="bg-[#B8FF9F] border border-black px-1 py-0.5 text-xs font-bold text-black">
//                             YOU
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Questions Section - Main Content */}
//           <div className="lg:col-span-2 bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-4">
//             <div className="flex items-center justify-between mb-4">
//               <div className="bg-black text-white px-3 py-1 border-2 border-black">
//                 <h2 className="text-sm font-bold">
//                   ❓ QUESTIONS ({questions.length})
//                 </h2>
//               </div>

//               <button
//                 onClick={handleGenerateMoreQuestions}
//                 disabled={hasReachedLimit || generatingQuestions}
//                 className={`font-bold py-2 px-3 border-2 border-black transition-all text-black text-sm ${
//                   hasReachedLimit
//                     ? "bg-gray-300 text-gray-600 cursor-not-allowed"
//                     : generatingQuestions
//                     ? "bg-purple-300 text-black cursor-not-allowed"
//                     : "bg-[#FFA6F6] hover:bg-[#fa8cef] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:bg-[#f774ea]"
//                 }`}
//               >
//                 {generatingQuestions
//                   ? "🔄 Generating..."
//                   : hasReachedLimit
//                   ? "❌ Limit Reached"
//                   : "🎲 Add More"}
//               </button>
//             </div>

//             {hasReachedLimit && (
//               <div className="bg-orange-200 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] p-3 mb-4">
//                 <div className="flex items-center text-sm">
//                   <span className="text-lg mr-2">⚠️</span>
//                   <span className="font-bold text-black">
//                     Maximum {QUESTION_LIMIT} questions reached
//                   </span>
//                 </div>
//               </div>
//             )}

//             <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
//               {questions.map((question, index) => (
//                 <div
//                   key={question._id}
//                   className="bg-gray-50 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] p-4"
//                 >
//                   <div className="mb-3">
//                     <div className="bg-black text-white px-2 py-1 border border-black inline-block mb-2">
//                       <span className="font-bold text-xs">Q{index + 1}</span>
//                     </div>

//                     {editingQuestion === question._id ? (
//                       <textarea
//                         value={editingData.question}
//                         onChange={(e) =>
//                           handleInputChange("question", e.target.value)
//                         }
//                         className=" text-black w-full border-2 border-black p-2 text-sm font-bold bg-white focus:outline-none focus:bg-[#FFA6F6] focus:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all"
//                         rows="2"
//                       />
//                     ) : (
//                       <div className="text-black text-sm font-bold text-black">
//                         {question.question}
//                       </div>
//                     )}
//                   </div>

//                   <div className="mb-3">
//                     <div className="text-black grid grid-cols-1 md:grid-cols-2 gap-2">
//                       {question.options.map((option, optionIndex) => (
//                         <div key={optionIndex}>
//                           {editingQuestion === question._id ? (
//                             <input
//                               type="text"
//                               value={editingData.options[optionIndex]}
//                               onChange={(e) =>
//                                 handleInputChange(
//                                   "options",
//                                   e.target.value,
//                                   optionIndex
//                                 )
//                               }
//                               className="w-full border-2 border-black p-2 text-xs bg-white focus:outline-none focus:bg-[#FFA6F6] focus:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all"
//                             />
//                           ) : (
//                             <div
//                               className={` text-black p-2 border-2 border-black text-xs font-medium ${
//                                 option === question.correct_option
//                                   ? " text-black bg-[#B8FF9F] shadow-[2px_2px_0px_rgba(0,0,0,1)] text-black"
//                                   : "bg-white text-black"
//                               }`}
//                             >
//                               {option}
//                               {option === question.correct_option && (
//                                 <span className="ml-1 font-bold text-green-800">
//                                   ✓
//                                 </span>
//                               )}
//                             </div>
//                           )}
//                         </div>
//                       ))}
//                     </div>
//                   </div>

//                   {editingQuestion === question._id && (
//                     <div className="mb-3">
//                       <label className=" text-black text-black block font-bold text-black mb-1 text-xs">
//                         CORRECT ANSWER:
//                       </label>
//                       <select
//                         value={editingData.correct_option}
//                         onChange={(e) =>
//                           handleInputChange("correct_option", e.target.value)
//                         }
//                         className=" text-black border-2 border-black p-1 bg-white focus:outline-none focus:bg-[#FFA6F6] font-medium text-xs"
//                       >
//                         {editingData.options.map((option, idx) => (
//                           <option key={idx} value={option}>
//                             {option}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                   )}

//                   <div className="flex gap-2">
//                     {editingQuestion === question._id ? (
//                       <>
//                         <button
//                           onClick={() => handleUpdateQuestion(question._id)}
//                           disabled={updating}
//                           className="border-2 border-black bg-[#B8FF9F] hover:bg-[#99fc77] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:bg-[#7df752] disabled:bg-gray-300 disabled:text-gray-500 font-bold py-1 px-2 transition-all text-xs"
//                         >
//                           {updating ? "⏳" : "💾"}
//                         </button>
//                         <button
//                           onClick={handleCancelEdit}
//                           disabled={updating}
//                           className="border-2 border-black bg-gray-300 hover:bg-gray-400 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] disabled:bg-gray-200 font-bold py-1 px-2 transition-all text-xs"
//                         >
//                           ❌
//                         </button>
//                       </>
//                     ) : (
//                       <>
//                         <button
//                           onClick={() => handleEditQuestion(question)}
//                           className=" text-black border-2 border-black bg-[#A6FAFF] hover:bg-[#79F7FF] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:bg-[#53f2fc] font-bold py-1 px-2 transition-all text-xs"
//                         >
//                           ✏️
//                         </button>
//                         <button
//                           onClick={() => handleDeleteQuestion(question._id)}
//                           className="border-2 border-black bg-red-400 hover:bg-red-500 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:bg-red-600 font-bold py-1 px-2 transition-all text-xs"
//                         >
//                           🗑️
//                         </button>
//                       </>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Footer - Compact */}
//       <div className="border-t-4 border-black bg-white py-3 mt-8">
//         <div className="max-w-5xl mx-auto px-4 text-center">
//           <p className="font-bold text-black text-sm">
//             Quiz Room Admin Panel - Ready to start your quiz?
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect, use } from "react";
import { io } from "socket.io-client";

export default function RoomPage({ params }) {
  const URL = process.env.NEXT_PUBLIC_URL;
  const { roomCode } = use(params);
  const [socket, setSocket] = useState(null);
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingData, setEditingData] = useState({});
  const [updating, setUpdating] = useState(false);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [deletingRoom, setDeletingRoom] = useState(false);
  const [copied, setCopied] = useState(false);

  let QUESTION_LIMIT;

  useEffect(() => {
    fetchRoomData();
  }, [roomCode]);

  useEffect(() => {
    if (!loading && roomData?.data?.[0]?.host_name) {
      const currentPlayerName = localStorage.getItem("playerName");
      const hostName = roomData.data[0].host_name;

      if (currentPlayerName !== hostName) {
        setAccessDenied(true);
      } else {
        setIsHost(true);
      }
    }
  }, [loading, roomData]);

  useEffect(() => {
    const socketInstance = io(`${URL}`, {
      withCredentials: true,
    });
    setSocket(socketInstance);

    const playerName = localStorage.getItem("playerName") || "Unnamed";
    const userId = localStorage.getItem("userId");

    socketInstance.on("room-players-updated", (playerNames) => {
      console.log("Players updated:", playerNames);
      setPlayers(
        playerNames.map((name, index) => ({
          id: index + 1,
          name,
          isHost: index === 0,
          isYou: name === playerName,
        }))
      );
    });

    socketInstance.on("room-closed", (message) => {
      alert(message);
      window.location.href = "/";
    });

    socketInstance.on("joined-successfully", ({ roomCode, playerName }) => {
      console.log("Successfully joined room:", roomCode);
    });

    socketInstance.on("quiz-started", () => {
      console.log("✅ Quiz started, navigating to quiz page...");
      setQuizStarted(true);
      router.push(`/quiz/${roomCode}`);
    });

    socketInstance.on("quiz-start-failed", (errorMsg) => {
      alert("Quiz start failed: " + errorMsg);
    });

    socketInstance.emit("get-lobby-players", { roomCode });

    socketInstance.on("lobby-players-success", (playersList) => {
      setPlayers(
        playersList.map((player, index) => ({
          id: index + 1,
          name: player.name,
          isHost: player.isHost,
          status: player.status,
          isYou: player.name === localStorage.getItem("playerName"),
        }))
      );
    });

    socketInstance.on("lobby-players-failed", (error) => {
      console.error("❌ Failed to fetch lobby players:", error);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [roomCode]);

  useEffect(() => {
    if (roomData?.data?.[0]?.host_name && players.length > 0) {
      const currentPlayerName = localStorage.getItem("playerName");
      const hostName = roomData.data[0].host_name;
      setIsHost(currentPlayerName === hostName);
    }
  }, [roomData, players]);

  const fetchRoomData = async () => {
    try {
      setLoading(true);
      console.log("Fetching room data for code:", roomCode);

      const response = await fetch(`${URL}/api/v1/room/lobby/${roomCode}`);

      if (!response.ok) {
        console.error(
          `API endpoint failed. URL: ${URL}/api/v1/room/lobby/${roomCode}`
        );
        console.error(
          `Status: ${response.status}, StatusText: ${response.statusText}`
        );
        throw new Error(
          `HTTP error! status: ${response.status} - ${response.statusText}`
        );
      }

      const rawText = await response.text();

      let data;
      try {
        data = JSON.parse(rawText);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        throw new Error(
          `Invalid JSON response: ${rawText.substring(0, 100)}...`
        );
      }

      if (!data.statuscode) {
        throw new Error(data.message || "Failed to fetch room data");
      }

      setRoomData(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(quizData.room_code || roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = quizData.room_code || roomCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDeleteRoom = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this room? This will remove all players and questions."
      )
    ) {
      try {
        setDeletingRoom(true);

        socket.emit("delete-room", { roomCode });

        socket.on("room-deleted-successfully", () => {
          alert("Room deleted successfully!");
          window.location.href = "/";
        });

        socket.on("delete-room-failed", (errorMessage) => {
          alert("Error deleting room: " + errorMessage);
          setDeletingRoom(false);
        });
      } catch (error) {
        console.error("Delete room error:", error);
        alert("Error deleting room: " + error.message);
        setDeletingRoom(false);
      }
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        const response = await fetch(
          `${URL}/api/v1/question/delete/${questionId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Failed to delete question: ${response.status}`
          );
        }

        const result = await response.json();

        if (result.statuscode) {
          console.log("Question deleted:", result.message);
          await fetchRoomData();
        } else {
          throw new Error(result.message || "Failed to delete question");
        }
      } catch (error) {
        console.error("Delete error:", error);
        alert("Error deleting question: " + error.message);
      }
    }
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question._id);
    setEditingData({
      question: question.question,
      options: [...question.options],
      correct_option: question.correct_option,
    });
  };

  const handleCancelEdit = () => {
    setEditingQuestion(null);
    setEditingData({});
  };

  const handleUpdateQuestion = async (questionId) => {
    try {
      setUpdating(true);

      const response = await fetch(
        `${URL}/api/v1/question/update/${questionId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: questionId,
            question: editingData.question,
            options: editingData.options,
            correct_option: editingData.correct_option,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.statuscode) {
        console.log("Question updated successfully:", result.message);
        await fetchRoomData();
        setEditingQuestion(null);
        setEditingData({});
      } else {
        throw new Error(result.message || "Failed to update question");
      }
    } catch (error) {
      console.error("Error updating question:", error);
      alert("Failed to update question: " + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleInputChange = (field, value, index = null) => {
    setEditingData((prev) => {
      if (field === "options" && index !== null) {
        const newOptions = [...prev.options];
        newOptions[index] = value;
        return { ...prev, options: newOptions };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleStartQuiz = () => {
    if (socket && isHost) {
      console.log("🟢 Emitting start-quiz for room:", roomCode);
      socket.emit("start-quiz", { roomCode });
    }
  };

  const handleGenerateMoreQuestions = async () => {
    const quizData = roomData?.data?.[0];
    const currentQuestions = quizData?.questions || [];

    if (!quizData || !quizData._id) {
      alert("Quiz ID not found. Cannot generate more questions.");
      return;
    }

    QUESTION_LIMIT = quizData.no_questions;

    if (currentQuestions.length >= QUESTION_LIMIT) {
      alert(
        `You have reached the maximum limit of ${QUESTION_LIMIT} questions.`
      );
      return;
    }

    try {
      setGeneratingQuestions(true);

      const response = await fetch(
        `${URL}/api/v1/question/generatemorequestions/${quizData._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (result.statuscode) {
        console.log("More questions generated successfully:", result.message);
        await fetchRoomData();

        const updatedQuizData = roomData?.data?.[0];
        const updatedQuestions = updatedQuizData?.questions || [];

        if (updatedQuestions.length >= QUESTION_LIMIT) {
          alert(`Question limit of ${QUESTION_LIMIT} has been reached!`);
        }
      } else {
        throw new Error(result.message || "Failed to generate more questions");
      }
    } catch (error) {
      console.error("Error generating more questions:", error);
      alert("Error: " + error.message);
    } finally {
      setGeneratingQuestions(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6">
          <div className="text-xl font-bold text-black">
            Loading room data...
          </div>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6">
          <div className="text-red-600 text-xl font-bold text-center">
            🚫 Access Denied
          </div>
          <div className="text-black text-sm mt-2 text-center">
            Only the host can access this page.
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6">
          <div className="text-red-600 text-center font-bold text-lg mb-3">
            {error}
          </div>
          <button
            onClick={fetchRoomData}
            className="w-full border-2 border-black bg-[#B8FF9F] hover:bg-[#99fc77] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:bg-[#7df752] font-bold py-2 px-4 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const quizData = roomData?.data?.[0];
  const questions = quizData?.questions || [];

  const hasReachedLimit = questions.length >= QUESTION_LIMIT;

  if (!quizData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6">
          <div className="text-red-600 text-center font-bold text-lg mb-3">
            No quiz data found for room code: {roomCode}
          </div>
          <button
            onClick={fetchRoomData}
            className="w-full border-2 border-black bg-[#B8FF9F] hover:bg-[#99fc77] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:bg-[#7df752] font-bold py-2 px-4 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b-4 border-black px-3 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="bg-black text-white px-3 py-2 border-2 border-black">
            <h1 className="text-lg font-bold">QUIZ ADMIN</h1>
          </div>

          {isHost && (
            <button
              onClick={handleDeleteRoom}
              disabled={deletingRoom}
              className="border-2 border-black bg-red-400 hover:bg-red-500 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:bg-red-600 disabled:bg-gray-300 disabled:text-gray-500 font-bold py-2 px-3 transition-all text-sm"
            >
              {deletingRoom ? "Deleting..." : "🗑️ Delete"}
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-3 py-6 space-y-6">
        {/* Start Quiz Button - Enhanced */}
        <div className="bg-gradient-to-r from-[#B8FF9F] via-[#99fc77] to-[#B8FF9F] border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6">
          <div className="text-center mb-4">
            <div className="bg-black text-white px-4 py-2 border-2 border-black inline-block mb-2">
              <span className="text-sm font-bold">🎯 READY TO START?</span>
            </div>
          </div>
          <button
            onClick={handleStartQuiz}
            className="w-full border-4 border-black bg-white hover:bg-[#B8FF9F] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_rgba(0,0,0,1)] font-black py-6 px-8 text-3xl transition-all transform hover:scale-[1.01] active:scale-[0.99] text-black"
          >
            🚀 START QUIZ NOW!
          </button>
          <div className="text-center mt-4 text-sm font-bold text-black">
            All players will automatically join the quiz when you start!
          </div>
        </div>

        {/* Room Info Section - Updated with Room Code */}
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-4">
          <div className="bg-black text-white px-3 py-1 border-2 border-black mb-4 inline-block">
            <h2 className="text-lg font-bold">📋 ROOM INFO</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-3 text-center">
              <div className="text-xs font-bold text-black mb-1">HOST</div>
              <div className="text-sm font-black text-black truncate">
                {quizData.host_name || "Unknown"}
              </div>
            </div>

            <div className="bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-3 text-center">
              <div className="text-xs font-bold text-black mb-1">ROOM CODE</div>
              <div className="flex items-center justify-center space-x-2">
                <div className="text-sm font-black text-black font-mono">
                  {quizData.room_code || roomCode}
                </div>
                <button
                  onClick={copyRoomCode}
                  className={`text-black border border-black px-2 py-1 text-xs font-bold transition-all ${
                    copied
                      ? "bg-[#B8FF9F] shadow-[1px_1px_0px_rgba(0,0,0,1)]"
                      : "bg-gray-100 hover:bg-gray-200 hover:shadow-[1px_1px_0px_rgba(0,0,0,1)]"
                  }`}
                >
                  {copied ? "✓" : "📋"}
                </button>
              </div>
            </div>

            <div className="bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-3 text-center">
              <div className="text-xs font-bold text-black mb-1">TOPIC</div>
              <div className="text-sm font-black text-black truncate">
                {quizData.topic || "General"}
              </div>
            </div>
          </div>
        </div>

        {/* Players and Questions in Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Players Section - Sidebar */}
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-4">
            <div className="bg-black text-white px-3 py-1 border-2 border-black mb-4 inline-block">
              <h2 className="text-sm font-bold">
                👥 PLAYERS ({players.length})
              </h2>
            </div>

            {players.length === 0 ? (
              <div className="bg-gray-100 border-2 border-black p-4 text-center">
                <div className="text-lg mb-1">😴</div>
                <div className="text-xs font-bold text-gray-600">
                  Waiting for players...
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="bg-white border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] p-2 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-bold text-black truncate flex-1">
                        {player.name}
                      </div>
                      <div className="flex gap-1 ml-2">
                        {player.isHost && (
                          <span className="bg-yellow-300 border border-black px-1 py-0.5 text-xs font-bold text-black">
                            👑
                          </span>
                        )}
                        {player.isYou && (
                          <span className="bg-[#B8FF9F] border border-black px-1 py-0.5 text-xs font-bold text-black">
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

          {/* Questions Section - Main Content */}
          <div className="lg:col-span-2 bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-black text-white px-3 py-1 border-2 border-black">
                <h2 className="text-sm font-bold">
                  ❓ QUESTIONS ({questions.length})
                </h2>
              </div>

              <button
                onClick={handleGenerateMoreQuestions}
                disabled={hasReachedLimit || generatingQuestions}
                className={`font-bold py-2 px-3 border-2 border-black transition-all text-black text-sm ${
                  hasReachedLimit
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : generatingQuestions
                    ? "bg-purple-300 text-black cursor-not-allowed"
                    : "bg-white hover:bg-gray-100 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                }`}
              >
                {generatingQuestions
                  ? "🔄 Generating..."
                  : hasReachedLimit
                  ? "❌ Limit Reached"
                  : "🎲 Add More"}
              </button>
            </div>

            {hasReachedLimit && (
              <div className="bg-orange-200 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] p-3 mb-4">
                <div className="flex items-center text-sm">
                  <span className="text-lg mr-2">⚠️</span>
                  <span className="font-bold text-black">
                    Maximum {QUESTION_LIMIT} questions reached
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {questions.map((question, index) => (
                <div
                  key={question._id}
                  className="bg-gray-50 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] p-4"
                >
                  <div className="mb-3">
                    <div className="bg-black text-white px-2 py-1 border border-black inline-block mb-2">
                      <span className="font-bold text-xs">Q{index + 1}</span>
                    </div>

                    {editingQuestion === question._id ? (
                      <textarea
                        value={editingData.question}
                        onChange={(e) =>
                          handleInputChange("question", e.target.value)
                        }
                        className=" text-black w-full border-2 border-black p-2 text-sm font-bold bg-white focus:outline-none focus:bg-gray-100 focus:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all"
                        rows="2"
                      />
                    ) : (
                      <div className="text-black text-sm font-bold text-black">
                        {question.question}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <div className="text-black grid grid-cols-1 md:grid-cols-2 gap-2">
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex}>
                          {editingQuestion === question._id ? (
                            <input
                              type="text"
                              value={editingData.options[optionIndex]}
                              onChange={(e) =>
                                handleInputChange(
                                  "options",
                                  e.target.value,
                                  optionIndex
                                )
                              }
                              className="w-full border-2 border-black p-2 text-xs bg-white focus:outline-none focus:bg-gray-100 focus:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all"
                            />
                          ) : (
                            <div
                              className={` text-black p-2 border-2 border-black text-xs font-medium ${
                                option === question.correct_option
                                  ? " text-black bg-[#B8FF9F] shadow-[2px_2px_0px_rgba(0,0,0,1)] text-black"
                                  : "bg-white text-black"
                              }`}
                            >
                              {option}
                              {option === question.correct_option && (
                                <span className="ml-1 font-bold text-green-800">
                                  ✓
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {editingQuestion === question._id && (
                    <div className="mb-3">
                      <label className=" text-black text-black block font-bold text-black mb-1 text-xs">
                        CORRECT ANSWER:
                      </label>
                      <select
                        value={editingData.correct_option}
                        onChange={(e) =>
                          handleInputChange("correct_option", e.target.value)
                        }
                        className=" text-black border-2 border-black p-1 bg-white focus:outline-none focus:bg-gray-100 font-medium text-xs"
                      >
                        {editingData.options.map((option, idx) => (
                          <option key={idx} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {editingQuestion === question._id ? (
                      <>
                        <button
                          onClick={() => handleUpdateQuestion(question._id)}
                          disabled={updating}
                          className="border-2 border-black bg-[#B8FF9F] hover:bg-[#99fc77] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:bg-[#7df752] disabled:bg-gray-300 disabled:text-gray-500 font-bold py-1 px-2 transition-all text-xs"
                        >
                          {updating ? "⏳" : "💾"}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={updating}
                          className="border-2 border-black bg-gray-300 hover:bg-gray-400 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] disabled:bg-gray-200 font-bold py-1 px-2 transition-all text-xs"
                        >
                          ❌
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditQuestion(question)}
                          className=" text-black border-2 border-black bg-white hover:bg-gray-100 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] font-bold py-1 px-2 transition-all text-xs"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(question._id)}
                          className="border-2 border-black bg-red-400 hover:bg-red-500 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:bg-red-600 font-bold py-1 px-2 transition-all text-xs"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Compact */}
      <div className="border-t-4 border-black bg-white py-3 mt-8">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="font-bold text-black text-sm">
            Quiz Room Admin Panel - Ready to start your quiz?
          </p>
        </div>
      </div>
    </div>
  );
}
