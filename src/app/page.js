// // "use client";

// // import { useState, useEffect } from "react";
// // import { useRouter } from "next/navigation";

// // export default function Home() {
// //   const router = useRouter();
// //   const URL = process.env.NEXT_PUBLIC_URL || process.env.URL;
// //   const [form, setForm] = useState({
// //     name: "",
// //     room_code: "",
// //   });
// //   const [error, setError] = useState("");
// //   const [loading, setLoading] = useState(false);
// //   const [showErrorDialog, setShowErrorDialog] = useState(false);
// //   const [focusedInput, setFocusedInput] = useState("");

// //   const handleChange = (e) => {
// //     const { name, value } = e.target;
// //     setForm((prev) => ({
// //       ...prev,
// //       [name]: name === "room_code" ? value.toUpperCase() : value,
// //     }));
// //     // Clear error when user starts typing
// //     if (error) {
// //       setError("");
// //       setShowErrorDialog(false);
// //     }
// //   };

// //   const handleInputFocus = (inputName) => {
// //     setFocusedInput(inputName);
// //   };

// //   const handleInputBlur = () => {
// //     setFocusedInput("");
// //   };

// //   const validateForm = () => {
// //     const cleanName = form.name.trim();
// //     const cleanRoomCode = form.room_code.trim().toUpperCase();

// //     if (!cleanName && !cleanRoomCode) {
// //       return "Please enter both your name and room code to continue.";
// //     }

// //     if (!cleanName) {
// //       return "Please enter your name to join the room.";
// //     }

// //     if (!cleanRoomCode) {
// //       return "Please enter a room code to join.";
// //     }

// //     if (cleanName.length < 5) {
// //       return "Your name must be at least 5 characters long.";
// //     }

// //     if (cleanRoomCode.length !== 6) {
// //       return "Room code must be exactly 6 characters long.";
// //     }

// //     if (!/^[A-Z0-9]+$/.test(cleanRoomCode)) {
// //       return "Room code can only contain letters and numbers.";
// //     }

// //     return null;
// //   };

// //   const checkQuizStatus = async (roomCode) => {
// //     try {
// //       const statusRes = await fetch(`${URL}/api/v1/room/status/${roomCode}`, {
// //         method: "GET",
// //         headers: {
// //           "Content-Type": "application/json",
// //         },
// //       });

// //       if (!statusRes.ok) {
// //         const result = await statusRes.json().catch(() => ({}));
// //         throw new Error(result.message || "Failed to check quiz status.");
// //       }

// //       const statusData = await statusRes.json();

// //       if (!statusData.statuscode) {
// //         throw new Error(statusData.message || "Failed to check quiz status.");
// //       }

// //       // If data is true, quiz has started
// //       if (statusData.data === true) {
// //         throw new Error("Quiz in this room has already started!");
// //       }

// //       return true; // Quiz has not started, safe to join
// //     } catch (err) {
// //       throw err;
// //     }
// //   };

// //   const showError = (message) => {
// //     setError(message);
// //     setShowErrorDialog(true);
// //   };

// //   // Auto-dismiss toast after 5 seconds
// //   useEffect(() => {
// //     if (showErrorDialog) {
// //       const timer = setTimeout(() => {
// //         setShowErrorDialog(false);
// //         setError("");
// //       }, 5000);

// //       return () => clearTimeout(timer);
// //     }
// //   }, [showErrorDialog]);

// //   const closeErrorDialog = () => {
// //     setShowErrorDialog(false);
// //     setError("");
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();

// //     // Client-side validation
// //     const validationError = validateForm();
// //     if (validationError) {
// //       showError(validationError);
// //       return;
// //     }

// //     setLoading(true);

// //     try {
// //       const cleanName = form.name.trim();
// //       const cleanRoomCode = form.room_code.trim().toUpperCase();

// //       // Check quiz status before proceeding
// //       await checkQuizStatus(cleanRoomCode);

// //       // Real API calls
// //       const res = await fetch(`${URL}/api/v1/room/join/${cleanRoomCode}`, {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //         },
// //         body: JSON.stringify({ name: cleanName }),
// //       });

// //       const hostname = await fetch(`${URL}/api/v1/room/host/${cleanRoomCode}`, {
// //         method: "GET",
// //         headers: {
// //           "Content-Type": "application/json",
// //         },
// //       });

// //       if (!hostname.ok) {
// //         const result = await hostname.json().catch(() => ({}));
// //         throw new Error(
// //           result.message ||
// //             "Room not found. Please check your room code and try again."
// //         );
// //       }

// //       if (!res.ok) {
// //         const result = await res.json().catch(() => ({}));
// //         throw new Error(
// //           result.message || "Failed to join room. Please try again."
// //         );
// //       }

// //       const host_validation = await hostname.json();

// //       if (!host_validation.statuscode || !host_validation.data) {
// //         throw new Error(
// //           host_validation.message || "Room validation failed. Please try again."
// //         );
// //       }

// //       const data = await res.json();
// //       if (!data.statuscode || !data.data) {
// //         throw new Error(
// //           data.message || "Failed to join room. Please try again."
// //         );
// //       }

// //       const { room_code, userId, playerName } = data.data;
// //       const { host_name } = host_validation.data;

// //       // Store in localStorage
// //       localStorage.setItem("playerName", playerName || cleanName);
// //       localStorage.setItem("hostName", host_name);
// //       localStorage.setItem("userId", userId);
// //       localStorage.setItem("roomCode", room_code);

// //       // Navigate to room lobby
// //       router.push(`/lobby/${cleanRoomCode}`);
// //     } catch (err) {
// //       showError(err.message);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleCreateRoom = () => {
// //     router.push("/room/create");
// //   };

// //   const handleHowToPlayPage = () => {
// //     router.push("/how-to-play");
// //   };

// //   const handleAbout = () => {
// //     router.push("/about");
// //   };

// //   // Enhanced Error Toast Component
// //   const ErrorToast = () => {
// //     if (!showErrorDialog) return null;

// //     return (
// //       <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
// //         <div className="bg-red-50 border-4 border-red-500 shadow-[4px_4px_0px_rgba(239,68,68,1)] p-4 max-w-sm">
// //           <div className="flex items-start space-x-3">
// //             <div className="text-2xl">⚠️</div>
// //             <div className="flex-1">
// //               <p className="text-red-800 font-medium">{error}</p>
// //             </div>
// //             <button
// //               onClick={closeErrorDialog}
// //               className="text-red-600 hover:text-red-800 font-bold text-xl leading-none transition-colors duration-200 hover:bg-red-100 rounded p-1"
// //             >
// //               ×
// //             </button>
// //           </div>
// //         </div>
// //       </div>
// //     );
// //   };

// //   return (
// //     <div className="min-h-screen bg-gray-50">
// //       {/* Error Toast */}
// //       <ErrorToast />

// //       {/* Header */}
// //       <div className="bg-white border-b-4 border-black px-4 py-3">
// //         <div className="max-w-4xl mx-auto flex items-center justify-between">
// //           <div className="bg-black text-white px-4 py-2 border-2 border-black transform hover:scale-105 transition-transform duration-200">
// //             <h1 className="text-xl font-bold">INQUIZZIT</h1>
// //           </div>

// //           <div className="flex space-x-3">
// //             <button
// //               className="h-8 border-2 border-black px-4 py-2 bg-[#A6FAFF] hover:bg-[#79F7FF] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:shadow-[1px_1px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] text-sm font-medium text-black transition-all duration-150 flex items-center justify-center"
// //               onClick={handleHowToPlayPage}
// //             >
// //               How to Play
// //             </button>
// //             <button
// //               className="h-8 border-2 border-black px-4 py-2 bg-[#B8FF9F] hover:bg-[#99fc77] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:shadow-[1px_1px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] text-sm font-medium text-black transition-all duration-150 flex items-center justify-center"
// //               onClick={handleAbout}
// //             >
// //               About
// //             </button>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Main Content */}
// //       <div className="max-w-lg mx-auto px-4 py-8">
// //         {/* Welcome Section */}
// //         <div className="text-center mb-8">
// //           <h2 className="text-3xl font-bold text-black mb-4">
// //             Join a Quiz Room
// //           </h2>
// //           <p className="text-sm text-gray-700 max-w-md mx-auto">
// //             Enter your name and room code to join an existing quiz, or create a
// //             new room to play with friends.
// //           </p>
// //         </div>

// //         {/* Main Form Card */}
// //         <div className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6 mb-6 transform hover:shadow-[10px_10px_0px_rgba(0,0,0,1)] transition-shadow duration-300">
// //           <div className="space-y-4">
// //             {/* Name Input */}
// //             <div>
// //               <label className="block mb-2 font-medium text-black text-sm">
// //                 Your Name
// //                 {form.name.trim().length >= 5 && (
// //                   <span className="text-green-500 text-xs ml-2">✓ Valid</span>
// //                 )}
// //               </label>
// //               <div className="relative">
// //                 <input
// //                   type="text"
// //                   name="name"
// //                   value={form.name}
// //                   onChange={handleChange}
// //                   onFocus={() => handleInputFocus("name")}
// //                   onBlur={handleInputBlur}
// //                   placeholder="Enter your name"
// //                   disabled={loading}
// //                   className={`w-full border-2 border-black p-2 text-sm text-black placeholder-gray-500 bg-white focus:outline-none disabled:bg-gray-100 disabled:text-gray-500 transition-all duration-200
// //                     ${
// //                       focusedInput === "name"
// //                         ? "bg-[#FFA6F6] shadow-[3px_3px_0px_rgba(0,0,0,1)]"
// //                         : "hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]"
// //                     }
// //                     ${form.name.trim().length >= 5 ? "border-green-500" : ""}`}
// //                 />
// //                 {form.name.trim().length >= 5 && (
// //                   <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 font-bold">
// //                     ✓
// //                   </div>
// //                 )}
// //               </div>
// //             </div>

// //             {/* Room Code Input */}
// //             <div>
// //               <label className="block mb-2 font-medium text-black text-sm">
// //                 Room Code
// //               </label>
// //               <div className="relative">
// //                 <input
// //                   type="text"
// //                   name="room_code"
// //                   value={form.room_code}
// //                   onChange={handleChange}
// //                   onFocus={() => handleInputFocus("room_code")}
// //                   onBlur={handleInputBlur}
// //                   placeholder="ABC123"
// //                   disabled={loading}
// //                   maxLength={6}
// //                   className={`w-full border-2 border-black p-2 text-sm font-mono text-center tracking-[0.3em] text-black placeholder-gray-400 bg-white focus:outline-none disabled:bg-gray-100 disabled:text-gray-500 transition-all duration-200 uppercase
// //                     ${
// //                       focusedInput === "room_code"
// //                         ? "bg-[#FFA6F6] shadow-[3px_3px_0px_rgba(0,0,0,1)]"
// //                         : "hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]"
// //                     }
// //                     ${form.room_code.length === 6 ? "border-green-500" : ""}`}
// //                 />
// //                 {form.room_code.length === 6 && (
// //                   <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 font-bold">
// //                     ✓
// //                   </div>
// //                 )}
// //               </div>
// //             </div>

// //             {/* Submit Button */}
// //             <button
// //               onClick={handleSubmit}
// //               disabled={
// //                 loading ||
// //                 !form.name.trim() ||
// //                 form.room_code.trim().length !== 6
// //               }
// //               className={`w-full h-12 border-2 border-black p-2 font-medium text-sm text-black transition-all duration-200
// //                 ${
// //                   loading ||
// //                   !form.name.trim() ||
// //                   form.room_code.trim().length !== 6
// //                     ? "bg-gray-300 text-gray-500 cursor-not-allowed"
// //                     : "bg-[#B8FF9F] hover:bg-[#99fc77] hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] active:shadow-[1px_1px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] transform hover:scale-[1.01]"
// //                 }`}
// //             >
// //               {loading ? (
// //                 <div className="flex items-center justify-center space-x-2">
// //                   <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
// //                   <span>Joining Room...</span>
// //                 </div>
// //               ) : (
// //                 "Join Room"
// //               )}
// //             </button>
// //           </div>
// //         </div>

// //         {/* Divider */}
// //         <div className="flex items-center my-6">
// //           <div className="flex-1 border-t-2 border-black border-dashed"></div>
// //           <span className="px-4 text-sm font-medium text-gray-600">OR</span>
// //           <div className="flex-1 border-t-2 border-black border-dashed"></div>
// //         </div>

// //         {/* Create Room Section */}
// //         <div className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6 transform hover:shadow-[10px_10px_0px_rgba(0,0,0,1)] transition-shadow duration-300">
// //           <div className="text-center">
// //             <h3 className="text-xl font-bold text-black mb-4">
// //               Create New Room
// //             </h3>
// //             <p className="text-gray-700 mb-4">
// //               Start your own quiz and invite friends to join
// //             </p>

// //             <button
// //               onClick={handleCreateRoom}
// //               className="h-12 border-2 border-black px-6 py-3 bg-[#FFA6F6] hover:bg-[#fa8cef] hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] active:shadow-[1px_1px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] transition-all duration-200 font-medium text-sm text-black transform hover:scale-[1.02]"
// //             >
// //               Create New Room
// //             </button>
// //           </div>
// //         </div>

// //         {/* Features Grid */}
// //         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
// //           <div className="bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-4 text-center hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:transform hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-300">
// //             <div className="text-2xl mb-2">🧠</div>
// //             <h4 className="font-bold text-base mb-2 text-black">
// //               AI-Generated Questions
// //             </h4>
// //             <p className="text-gray-600 text-xs">
// //               Get fresh, dynamic questions instantly created by AI tailored to
// //               your topic and difficulty
// //             </p>
// //           </div>

// //           <div className="bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-4 text-center hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:transform hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-300">
// //             <div className="text-2xl mb-2">⏱️</div>
// //             <h4 className="font-bold text-base mb-2 text-black">
// //               Timed Challenges
// //             </h4>
// //             <p className="text-gray-600 text-xs">
// //               Race against the clock to answer correctly before time runs out
// //             </p>
// //           </div>

// //           <div className="bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-4 text-center hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:transform hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-300">
// //             <div className="text-2xl mb-2">📊</div>
// //             <h4 className="font-bold text-base mb-2 text-black">
// //               Smart Analytics
// //             </h4>
// //             <p className="text-gray-600 text-xs">
// //               Get instant feedback, performance insights, and personalized
// //               learning tips
// //             </p>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Footer */}
// //       <div className="border-t-4 border-black bg-white py-6 mt-12">
// //         <div className="max-w-4xl mx-auto px-6 text-center">
// //           <p className="text-gray-600">
// //             © 2025 Quiz App. Ready to test your knowledge?
// //           </p>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";

// export default function Home() {
//   const router = useRouter();
//   const URL = process.env.NEXT_PUBLIC_URL || process.env.URL;
//   const [form, setForm] = useState({
//     name: "",
//     room_code: "",
//   });
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [showErrorDialog, setShowErrorDialog] = useState(false);
//   const [focusedInput, setFocusedInput] = useState("");
//   const [errorType, setErrorType] = useState("error"); // 'error', 'warning', 'info'

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({
//       ...prev,
//       [name]: name === "room_code" ? value.toUpperCase() : value,
//     }));
//     // Clear error when user starts typing
//     if (error) {
//       setError("");
//       setShowErrorDialog(false);
//       setErrorType("error");
//     }
//   };

//   const handleInputFocus = (inputName) => {
//     setFocusedInput(inputName);
//   };

//   const handleInputBlur = () => {
//     setFocusedInput("");
//   };

//   const validateForm = () => {
//     const cleanName = form.name.trim();
//     const cleanRoomCode = form.room_code.trim().toUpperCase();

//     if (!cleanName && !cleanRoomCode) {
//       return "Please enter both your name and room code to continue.";
//     }

//     if (!cleanName) {
//       return "Please enter your name to join the room.";
//     }

//     if (!cleanRoomCode) {
//       return "Please enter a room code to join.";
//     }

//     if (cleanName.length < 5) {
//       return "Your name must be at least 5 characters long.";
//     }

//     if (cleanRoomCode.length !== 6) {
//       return "Room code must be exactly 6 characters long.";
//     }

//     if (!/^[A-Z0-9]+$/.test(cleanRoomCode)) {
//       return "Room code can only contain letters and numbers.";
//     }

//     return null;
//   };

//   const checkQuizStatus = async (roomCode) => {
//     try {
//       const statusRes = await fetch(`${URL}/api/v1/room/status/${roomCode}`, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });

//       if (!statusRes.ok) {
//         const result = await statusRes.json().catch(() => ({}));
//         throw new Error(result.message || "Failed to check quiz status.");
//       }

//       const statusData = await statusRes.json();

//       if (!statusData.statuscode) {
//         throw new Error(statusData.message || "Failed to check quiz status.");
//       }

//       // If data is true, quiz has started
//       if (statusData.data === true) {
//         throw new Error("Quiz in this room has already started!");
//       }

//       return true; // Quiz has not started, safe to join
//     } catch (err) {
//       throw err;
//     }
//   };

//   const parseErrorMessage = (errorMessage) => {
//     const message = errorMessage.toLowerCase();

//     // Specific error handling based on backend responses
//     if (message.includes("player with this name is already in lobby")) {
//       return {
//         type: "warning",
//         title: "Name Already Taken",
//         message:
//           "Someone with this name is already in the room. Please try a different name.",
//         suggestion:
//           "Try adding numbers or characters to make your name unique.",
//       };
//     }

//     if (
//       message.includes("quiz already started") ||
//       message.includes("quiz in this room has already started")
//     ) {
//       return {
//         type: "info",
//         title: "Quiz In Progress",
//         message:
//           "This quiz has already started. You'll need to wait for the next game.",
//         suggestion:
//           "Ask the host to start a new game, or try creating your own room.",
//       };
//     }

//     if (
//       message.includes("room with that code not found") ||
//       message.includes("room not found")
//     ) {
//       return {
//         type: "error",
//         title: "Room Not Found",
//         message: "No room exists with this code. Please double-check the code.",
//         suggestion:
//           "Make sure you've entered the correct 6-character room code.",
//       };
//     }

//     if (
//       message.includes("failed to join") ||
//       message.includes("failed to join the lobby")
//     ) {
//       return {
//         type: "error",
//         title: "Connection Error",
//         message: "Unable to join the room right now. Please try again.",
//         suggestion: "Check your internet connection and try again in a moment.",
//       };
//     }

//     if (message.includes("room code or the player's name is missing")) {
//       return {
//         type: "error",
//         title: "Missing Information",
//         message: "Please make sure both name and room code are filled out.",
//         suggestion:
//           "Double-check that you've entered both your name and the room code.",
//       };
//     }

//     // Default error handling
//     return {
//       type: "error",
//       title: "Something Went Wrong",
//       message: errorMessage,
//       suggestion:
//         "Please try again or contact support if the problem persists.",
//     };
//   };

//   const showError = (message, type = "error") => {
//     const parsedError = parseErrorMessage(message);
//     setError(parsedError);
//     setErrorType(parsedError.type);
//     setShowErrorDialog(true);
//   };

//   // Auto-dismiss toast after 7 seconds (increased for more detailed messages)
//   useEffect(() => {
//     if (showErrorDialog) {
//       const timer = setTimeout(() => {
//         setShowErrorDialog(false);
//         setError("");
//         setErrorType("error");
//       }, 7000);

//       return () => clearTimeout(timer);
//     }
//   }, [showErrorDialog]);

//   const closeErrorDialog = () => {
//     setShowErrorDialog(false);
//     setError("");
//     setErrorType("error");
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Client-side validation
//     const validationError = validateForm();
//     if (validationError) {
//       showError(validationError, "error");
//       return;
//     }

//     setLoading(true);

//     try {
//       const cleanName = form.name.trim();
//       const cleanRoomCode = form.room_code.trim().toUpperCase();

//       // Check quiz status before proceeding
//       await checkQuizStatus(cleanRoomCode);

//       // Real API calls
//       const res = await fetch(`${URL}/api/v1/room/join/${cleanRoomCode}`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ name: cleanName }),
//       });

//       const hostname = await fetch(`${URL}/api/v1/room/host/${cleanRoomCode}`, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });

//       if (!hostname.ok) {
//         const result = await hostname.json().catch(() => ({}));
//         throw new Error(
//           result.message ||
//             "Room not found. Please check your room code and try again."
//         );
//       }

//       if (!res.ok) {
//         const result = await res.json().catch(() => ({}));
//         throw new Error(
//           result.message || "Failed to join room. Please try again."
//         );
//       }

//       const host_validation = await hostname.json();

//       if (!host_validation.statuscode || !host_validation.data) {
//         throw new Error(
//           host_validation.message || "Room validation failed. Please try again."
//         );
//       }

//       const data = await res.json();
//       if (!data.statuscode || !data.data) {
//         throw new Error(
//           data.message || "Failed to join room. Please try again."
//         );
//       }

//       const { room_code, userId, playerName } = data.data;
//       const { host_name } = host_validation.data;

//       // Store in localStorage
//       localStorage.setItem("playerName", playerName || cleanName);
//       localStorage.setItem("hostName", host_name);
//       localStorage.setItem("userId", userId);
//       localStorage.setItem("roomCode", room_code);

//       // Navigate to room lobby
//       router.push(`/lobby/${cleanRoomCode}`);
//     } catch (err) {
//       showError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCreateRoom = () => {
//     router.push("/room/create");
//   };

//   const handleHowToPlayPage = () => {
//     router.push("/how-to-play");
//   };

//   const handleAbout = () => {
//     router.push("/about");
//   };

//   // Enhanced Error Toast Component with better styling and messaging
//   const ErrorToast = () => {
//     if (!showErrorDialog || !error) return null;

//     const getToastStyles = () => {
//       switch (errorType) {
//         case "warning":
//           return {
//             bg: "bg-yellow-50",
//             border: "border-yellow-500",
//             shadow: "shadow-[4px_4px_0px_rgba(234,179,8,1)]",
//             icon: "⚠️",
//             titleColor: "text-yellow-800",
//             textColor: "text-yellow-700",
//             buttonColor:
//               "text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100",
//           };
//         case "info":
//           return {
//             bg: "bg-blue-50",
//             border: "border-blue-500",
//             shadow: "shadow-[4px_4px_0px_rgba(59,130,246,1)]",
//             icon: "ℹ️",
//             titleColor: "text-blue-800",
//             textColor: "text-blue-700",
//             buttonColor: "text-blue-600 hover:text-blue-800 hover:bg-blue-100",
//           };
//         default:
//           return {
//             bg: "bg-red-50",
//             border: "border-red-500",
//             shadow: "shadow-[4px_4px_0px_rgba(239,68,68,1)]",
//             icon: "❌",
//             titleColor: "text-red-800",
//             textColor: "text-red-700",
//             buttonColor: "text-red-600 hover:text-red-800 hover:bg-red-100",
//           };
//       }
//     };

//     const styles = getToastStyles();

//     return (
//       <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
//         <div
//           className={`${styles.bg} border-4 ${styles.border} ${styles.shadow} p-4 max-w-sm`}
//         >
//           <div className="flex items-start space-x-3">
//             <div className="text-2xl flex-shrink-0">{styles.icon}</div>
//             <div className="flex-1 min-w-0">
//               <h4 className={`${styles.titleColor} font-bold text-sm mb-1`}>
//                 {error.title}
//               </h4>
//               <p className={`${styles.textColor} text-xs mb-2 leading-relaxed`}>
//                 {error.message}
//               </p>
//               {error.suggestion && (
//                 <p className={`${styles.textColor} text-xs italic opacity-80`}>
//                   💡 {error.suggestion}
//                 </p>
//               )}
//             </div>
//             <button
//               onClick={closeErrorDialog}
//               className={`${styles.buttonColor} font-bold text-xl leading-none transition-colors duration-200 rounded p-1 flex-shrink-0`}
//             >
//               ×
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Error Toast */}
//       <ErrorToast />

//       {/* Header */}
//       <div className="bg-white border-b-4 border-black px-4 py-3">
//         <div className="max-w-4xl mx-auto flex items-center justify-between">
//           <div className="bg-black text-white px-4 py-2 border-2 border-black transform hover:scale-105 transition-transform duration-200">
//             <h1 className="text-xl font-bold">INQUIZZIT</h1>
//           </div>

//           <div className="flex space-x-3">
//             <button
//               className="h-8 border-2 border-black px-4 py-2 bg-[#A6FAFF] hover:bg-[#79F7FF] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:shadow-[1px_1px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] text-sm font-medium text-black transition-all duration-150 flex items-center justify-center"
//               onClick={handleHowToPlayPage}
//             >
//               How to Play
//             </button>
//             <button
//               className="h-8 border-2 border-black px-4 py-2 bg-[#B8FF9F] hover:bg-[#99fc77] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:shadow-[1px_1px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] text-sm font-medium text-black transition-all duration-150 flex items-center justify-center"
//               onClick={handleAbout}
//             >
//               About
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-lg mx-auto px-4 py-8">
//         {/* Welcome Section */}
//         <div className="text-center mb-8">
//           <h2 className="text-3xl font-bold text-black mb-4">
//             Join a Quiz Room
//           </h2>
//           <p className="text-sm text-gray-700 max-w-md mx-auto">
//             Enter your name and room code to join an existing quiz, or create a
//             new room to play with friends.
//           </p>
//         </div>

//         {/* Main Form Card */}
//         <div className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6 mb-6 transform hover:shadow-[10px_10px_0px_rgba(0,0,0,1)] transition-shadow duration-300">
//           <div className="space-y-4">
//             {/* Name Input */}
//             <div>
//               <label className="block mb-2 font-medium text-black text-sm">
//                 Your Name
//                 {form.name.trim().length >= 5 && (
//                   <span className="text-green-500 text-xs ml-2">✓ Valid</span>
//                 )}
//               </label>
//               <div className="relative">
//                 <input
//                   type="text"
//                   name="name"
//                   value={form.name}
//                   onChange={handleChange}
//                   onFocus={() => handleInputFocus("name")}
//                   onBlur={handleInputBlur}
//                   placeholder="Enter your name"
//                   disabled={loading}
//                   className={`w-full border-2 border-black p-2 text-sm text-black placeholder-gray-500 bg-white focus:outline-none disabled:bg-gray-100 disabled:text-gray-500 transition-all duration-200
//                     ${
//                       focusedInput === "name"
//                         ? "bg-[#FFA6F6] shadow-[3px_3px_0px_rgba(0,0,0,1)]"
//                         : "hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]"
//                     }
//                     ${form.name.trim().length >= 5 ? "border-green-500" : ""}`}
//                 />
//                 {form.name.trim().length >= 5 && (
//                   <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 font-bold">
//                     ✓
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Room Code Input */}
//             <div>
//               <label className="block mb-2 font-medium text-black text-sm">
//                 Room Code
//               </label>
//               <div className="relative">
//                 <input
//                   type="text"
//                   name="room_code"
//                   value={form.room_code}
//                   onChange={handleChange}
//                   onFocus={() => handleInputFocus("room_code")}
//                   onBlur={handleInputBlur}
//                   placeholder="ABC123"
//                   disabled={loading}
//                   maxLength={6}
//                   className={`w-full border-2 border-black p-2 text-sm font-mono text-center tracking-[0.3em] text-black placeholder-gray-400 bg-white focus:outline-none disabled:bg-gray-100 disabled:text-gray-500 transition-all duration-200 uppercase
//                     ${
//                       focusedInput === "room_code"
//                         ? "bg-[#FFA6F6] shadow-[3px_3px_0px_rgba(0,0,0,1)]"
//                         : "hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]"
//                     }
//                     ${form.room_code.length === 6 ? "border-green-500" : ""}`}
//                 />
//                 {form.room_code.length === 6 && (
//                   <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 font-bold">
//                     ✓
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Submit Button */}
//             <button
//               onClick={handleSubmit}
//               disabled={
//                 loading ||
//                 !form.name.trim() ||
//                 form.room_code.trim().length !== 6
//               }
//               className={`w-full h-12 border-2 border-black p-2 font-medium text-sm text-black transition-all duration-200
//                 ${
//                   loading ||
//                   !form.name.trim() ||
//                   form.room_code.trim().length !== 6
//                     ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//                     : "bg-[#B8FF9F] hover:bg-[#99fc77] hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] active:shadow-[1px_1px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] transform hover:scale-[1.01]"
//                 }`}
//             >
//               {loading ? (
//                 <div className="flex items-center justify-center space-x-2">
//                   <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
//                   <span>Joining Room...</span>
//                 </div>
//               ) : (
//                 "Join Room"
//               )}
//             </button>
//           </div>
//         </div>

//         {/* Divider */}
//         <div className="flex items-center my-6">
//           <div className="flex-1 border-t-2 border-black border-dashed"></div>
//           <span className="px-4 text-sm font-medium text-gray-600">OR</span>
//           <div className="flex-1 border-t-2 border-black border-dashed"></div>
//         </div>

//         {/* Create Room Section */}
//         <div className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6 transform hover:shadow-[10px_10px_0px_rgba(0,0,0,1)] transition-shadow duration-300">
//           <div className="text-center">
//             <h3 className="text-xl font-bold text-black mb-4">
//               Create New Room
//             </h3>
//             <p className="text-gray-700 mb-4">
//               Start your own quiz and invite friends to join
//             </p>

//             <button
//               onClick={handleCreateRoom}
//               className="h-12 border-2 border-black px-6 py-3 bg-[#FFA6F6] hover:bg-[#fa8cef] hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] active:shadow-[1px_1px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] transition-all duration-200 font-medium text-sm text-black transform hover:scale-[1.02]"
//             >
//               Create New Room
//             </button>
//           </div>
//         </div>

//         {/* Features Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
//           <div className="bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-4 text-center hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:transform hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-300">
//             <div className="text-2xl mb-2">🧠</div>
//             <h4 className="font-bold text-base mb-2 text-black">
//               AI-Generated Questions
//             </h4>
//             <p className="text-gray-600 text-xs">
//               Get fresh, dynamic questions instantly created by AI tailored to
//               your topic and difficulty
//             </p>
//           </div>

//           <div className="bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-4 text-center hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:transform hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-300">
//             <div className="text-2xl mb-2">⏱️</div>
//             <h4 className="font-bold text-base mb-2 text-black">
//               Timed Challenges
//             </h4>
//             <p className="text-gray-600 text-xs">
//               Race against the clock to answer correctly before time runs out
//             </p>
//           </div>

//           <div className="bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-4 text-center hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:transform hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-300">
//             <div className="text-2xl mb-2">📊</div>
//             <h4 className="font-bold text-base mb-2 text-black">
//               Smart Analytics
//             </h4>
//             <p className="text-gray-600 text-xs">
//               Get instant feedback, performance insights, and personalized
//               learning tips
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Footer */}
//       <div className="border-t-4 border-black bg-white py-6 mt-12">
//         <div className="max-w-4xl mx-auto px-6 text-center">
//           <p className="text-gray-600">
//             © 2025 Quiz App. Ready to test your knowledge?
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const URL = process.env.NEXT_PUBLIC_URL || process.env.URL;
  const [form, setForm] = useState({
    name: "",
    room_code: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [focusedInput, setFocusedInput] = useState("");
  const [errorType, setErrorType] = useState("error"); // 'error', 'warning', 'info'

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "room_code" ? value.toUpperCase() : value,
    }));
    // Clear error when user starts typing
    if (error) {
      setError("");
      setShowErrorDialog(false);
      setErrorType("error");
    }
  };

  const handleInputFocus = (inputName) => {
    setFocusedInput(inputName);
  };

  const handleInputBlur = () => {
    setFocusedInput("");
  };

  const validateForm = () => {
    const cleanName = form.name.trim();
    const cleanRoomCode = form.room_code.trim().toUpperCase();

    if (!cleanName && !cleanRoomCode) {
      return "Please enter both your name and room code to continue.";
    }

    if (!cleanName) {
      return "Please enter your name to join the room.";
    }

    if (!cleanRoomCode) {
      return "Please enter a room code to join.";
    }

    if (cleanName.length < 5) {
      return "Your name must be at least 5 characters long.";
    }

    if (cleanRoomCode.length !== 6) {
      return "Room code must be exactly 6 characters long.";
    }

    if (!/^[A-Z0-9]+$/.test(cleanRoomCode)) {
      return "Room code can only contain letters and numbers.";
    }

    return null;
  };

  // FIXED: Removed the separate checkQuizStatus function that was masking errors
  // Now we'll handle quiz status checking directly in the main API call

  const parseErrorMessage = (errorMessage) => {
    console.log("Parsing error message:", errorMessage);
    const message = errorMessage.toLowerCase();

    // Match EXACT backend error messages from your joinLobby function
    if (
      message.includes("player with this name is already in lobby") ||
      message.includes("player with this name is already in lobby!!!")
    ) {
      return {
        type: "warning",
        title: "Name Already Taken",
        message:
          "Someone with this name is already in the room. Please try a different name.",
        suggestion:
          "Try adding numbers or characters to make your name unique.",
      };
    }

    if (
      message.includes(
        "the quiz already started wait for host to start a new game"
      ) ||
      message.includes("quiz already started") ||
      message.includes("the quiz already started") ||
      message.includes("wait for host to start a new game")
    ) {
      return {
        type: "info",
        title: "Quiz In Progress",
        message:
          "This quiz has already started. You'll need to wait for the next game.",
        suggestion:
          "Ask the host to start a new game, or try creating your own room.",
      };
    }

    if (
      message.includes("room with that code not found") ||
      message.includes("room with that code not found!!")
    ) {
      return {
        type: "error",
        title: "Room Not Found",
        message: "No room exists with this code. Please double-check the code.",
        suggestion:
          "Make sure you've entered the correct 6-character room code.",
      };
    }

    if (
      message.includes("failed to join the lobby") ||
      message.includes("failed to join the lobby!!")
    ) {
      return {
        type: "error",
        title: "Connection Error",
        message: "Unable to join the room right now. Please try again.",
        suggestion: "Check your internet connection and try again in a moment.",
      };
    }

    if (
      message.includes("room code or the player's name is missing") ||
      message.includes("room code or the player's name is missing!!!")
    ) {
      return {
        type: "error",
        title: "Missing Information",
        message: "Please make sure both name and room code are filled out.",
        suggestion:
          "Double-check that you've entered both your name and the room code.",
      };
    }

    // Default error handling - will show the raw error message for debugging
    console.log(
      "No specific match found, using default handler for:",
      errorMessage
    );
    return {
      type: "error",
      title: "Error",
      message: errorMessage, // Show the exact error message
      suggestion:
        "The room code might be wrong or the username already exists, try another username!",
    };
  };

  const showError = (message, type = "error") => {
    const parsedError = parseErrorMessage(message);
    setError(parsedError);
    setErrorType(parsedError.type);
    setShowErrorDialog(true);
  };

  // Auto-dismiss toast after 7 seconds (increased for more detailed messages)
  useEffect(() => {
    if (showErrorDialog) {
      const timer = setTimeout(() => {
        setShowErrorDialog(false);
        setError("");
        setErrorType("error");
      }, 7000);

      return () => clearTimeout(timer);
    }
  }, [showErrorDialog]);

  const closeErrorDialog = () => {
    setShowErrorDialog(false);
    setError("");
    setErrorType("error");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    const validationError = validateForm();
    if (validationError) {
      showError(validationError, "error");
      return;
    }

    setLoading(true);

    try {
      const cleanName = form.name.trim();
      const cleanRoomCode = form.room_code.trim().toUpperCase();

      console.log("Attempting to join room:", { cleanName, cleanRoomCode });

      const res = await fetch(`${URL}/api/v1/room/join/${cleanRoomCode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: cleanName }),
      });

      console.log("Join room response status:", res.status);

      if (!res.ok) {
        let result;
        try {
          result = await res.json();
          console.log("Join room error response:", result);
        } catch (parseError) {
          console.log("Failed to parse error response:", parseError);
          result = {};
        }

        const errorMessage = result.message || `Failed to join room `;
        console.log("Throwing error:", errorMessage);
        throw new Error(errorMessage);
      }

      // Only get host info AFTER successfully joining
      const hostname = await fetch(`${URL}/api/v1/room/host/${cleanRoomCode}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Host info response status:", hostname.status);

      if (!hostname.ok) {
        const result = await hostname.json().catch(() => ({}));
        throw new Error(
          result.message ||
            "Successfully joined room but failed to get host info."
        );
      }

      // Parse successful responses
      const data = await res.json();
      const host_validation = await hostname.json();

      console.log("Join room success data:", data);
      console.log("Host validation data:", host_validation);

      // Validate response structure
      if (!data.statuscode || !data.data) {
        throw new Error(data.message || "Invalid response from server.");
      }

      if (!host_validation.statuscode || !host_validation.data) {
        throw new Error(
          host_validation.message || "Invalid host validation response."
        );
      }

      const { room_code, userId, playerName } = data.data;
      const { host_name } = host_validation.data;

      // Store in localStorage
      localStorage.setItem("playerName", playerName || cleanName);
      localStorage.setItem("hostName", host_name);
      localStorage.setItem("userId", userId);
      localStorage.setItem("roomCode", room_code);

      console.log("Successfully stored data, navigating to lobby");

      // Navigate to room lobby
      router.push(`/lobby/${cleanRoomCode}`);
    } catch (err) {
      console.error("Join room error:", err.message);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = () => {
    router.push("/room/create");
  };

  const handleHowToPlayPage = () => {
    router.push("/how-to-play");
  };

  const handleAbout = () => {
    router.push("/about");
  };

  // Enhanced Error Toast Component with better styling and messaging
  const ErrorToast = () => {
    if (!showErrorDialog || !error) return null;

    const getToastStyles = () => {
      switch (errorType) {
        case "warning":
          return {
            bg: "bg-yellow-50",
            border: "border-yellow-500",
            shadow: "shadow-[4px_4px_0px_rgba(234,179,8,1)]",
            icon: "⚠️",
            titleColor: "text-yellow-800",
            textColor: "text-yellow-700",
            buttonColor:
              "text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100",
          };
        case "info":
          return {
            bg: "bg-blue-50",
            border: "border-blue-500",
            shadow: "shadow-[4px_4px_0px_rgba(59,130,246,1)]",
            icon: "ℹ️",
            titleColor: "text-blue-800",
            textColor: "text-blue-700",
            buttonColor: "text-blue-600 hover:text-blue-800 hover:bg-blue-100",
          };
        default:
          return {
            bg: "bg-red-50",
            border: "border-red-500",
            shadow: "shadow-[4px_4px_0px_rgba(239,68,68,1)]",
            icon: "❌",
            titleColor: "text-red-800",
            textColor: "text-red-700",
            buttonColor: "text-red-600 hover:text-red-800 hover:bg-red-100",
          };
      }
    };

    const styles = getToastStyles();

    return (
      <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
        <div
          className={`${styles.bg} border-4 ${styles.border} ${styles.shadow} p-4 max-w-sm`}
        >
          <div className="flex items-start space-x-3">
            <div className="text-2xl flex-shrink-0">{styles.icon}</div>
            <div className="flex-1 min-w-0">
              <h4 className={`${styles.titleColor} font-bold text-sm mb-1`}>
                {error.title}
              </h4>
              <p className={`${styles.textColor} text-xs mb-2 leading-relaxed`}>
                {error.message}
              </p>
              {error.suggestion && (
                <p className={`${styles.textColor} text-xs italic opacity-80`}>
                  💡 {error.suggestion}
                </p>
              )}
            </div>
            <button
              onClick={closeErrorDialog}
              className={`${styles.buttonColor} font-bold text-xl leading-none transition-colors duration-200 rounded p-1 flex-shrink-0`}
            >
              ×
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Error Toast */}
      <ErrorToast />

      {/* Header */}
      <div className="bg-white border-b-4 border-black px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="bg-black text-white px-4 py-2 border-2 border-black transform hover:scale-105 transition-transform duration-200">
            <h1 className="text-xl font-bold">INQUIZZIT</h1>
          </div>

          <div className="flex space-x-3">
            <button
              className="h-8 border-2 border-black px-4 py-2 bg-[#A6FAFF] hover:bg-[#79F7FF] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:shadow-[1px_1px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] text-sm font-medium text-black transition-all duration-150 flex items-center justify-center"
              onClick={handleHowToPlayPage}
            >
              How to Play
            </button>
            <button
              className="h-8 border-2 border-black px-4 py-2 bg-[#B8FF9F] hover:bg-[#99fc77] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:shadow-[1px_1px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] text-sm font-medium text-black transition-all duration-150 flex items-center justify-center"
              onClick={handleAbout}
            >
              About
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-black mb-4">
            Join a Quiz Room
          </h2>
          <p className="text-sm text-gray-700 max-w-md mx-auto">
            Enter your name and room code to join an existing quiz, or create a
            new room to play with friends.
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6 mb-6 transform hover:shadow-[10px_10px_0px_rgba(0,0,0,1)] transition-shadow duration-300">
          <div className="space-y-4">
            {/* Name Input */}
            <div>
              <label className="block mb-2 font-medium text-black text-sm">
                Your Name
                {form.name.trim().length >= 5 && (
                  <span className="text-green-500 text-xs ml-2">✓ Valid</span>
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  onFocus={() => handleInputFocus("name")}
                  onBlur={handleInputBlur}
                  placeholder="Enter your name"
                  disabled={loading}
                  className={`w-full border-2 border-black p-2 text-sm text-black placeholder-gray-500 bg-white focus:outline-none disabled:bg-gray-100 disabled:text-gray-500 transition-all duration-200
                    ${
                      focusedInput === "name"
                        ? "bg-[#FFA6F6] shadow-[3px_3px_0px_rgba(0,0,0,1)]"
                        : "hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                    }
                    ${form.name.trim().length >= 5 ? "border-green-500" : ""}`}
                />
                {form.name.trim().length >= 5 && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 font-bold">
                    ✓
                  </div>
                )}
              </div>
            </div>

            {/* Room Code Input */}
            <div>
              <label className="block mb-2 font-medium text-black text-sm">
                Room Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="room_code"
                  value={form.room_code}
                  onChange={handleChange}
                  onFocus={() => handleInputFocus("room_code")}
                  onBlur={handleInputBlur}
                  placeholder="ABC123"
                  disabled={loading}
                  maxLength={6}
                  className={`w-full border-2 border-black p-2 text-sm font-mono text-center tracking-[0.3em] text-black placeholder-gray-400 bg-white focus:outline-none disabled:bg-gray-100 disabled:text-gray-500 transition-all duration-200 uppercase
                    ${
                      focusedInput === "room_code"
                        ? "bg-[#FFA6F6] shadow-[3px_3px_0px_rgba(0,0,0,1)]"
                        : "hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                    }
                    ${form.room_code.length === 6 ? "border-green-500" : ""}`}
                />
                {form.room_code.length === 6 && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 font-bold">
                    ✓
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={
                loading ||
                !form.name.trim() ||
                form.room_code.trim().length !== 6
              }
              className={`w-full h-12 border-2 border-black p-2 font-medium text-sm text-black transition-all duration-200
                ${
                  loading ||
                  !form.name.trim() ||
                  form.room_code.trim().length !== 6
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#B8FF9F] hover:bg-[#99fc77] hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] active:shadow-[1px_1px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] transform hover:scale-[1.01]"
                }`}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
                  <span>Joining Room...</span>
                </div>
              ) : (
                "Join Room"
              )}
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t-2 border-black border-dashed"></div>
          <span className="px-4 text-sm font-medium text-gray-600">OR</span>
          <div className="flex-1 border-t-2 border-black border-dashed"></div>
        </div>

        {/* Create Room Section */}
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6 transform hover:shadow-[10px_10px_0px_rgba(0,0,0,1)] transition-shadow duration-300">
          <div className="text-center">
            <h3 className="text-xl font-bold text-black mb-4">
              Create New Room
            </h3>
            <p className="text-gray-700 mb-4">
              Start your own quiz and invite friends to join
            </p>

            <button
              onClick={handleCreateRoom}
              className="h-12 border-2 border-black px-6 py-3 bg-[#FFA6F6] hover:bg-[#fa8cef] hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] active:shadow-[1px_1px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] transition-all duration-200 font-medium text-sm text-black transform hover:scale-[1.02]"
            >
              Create New Room
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-4 text-center hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:transform hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-300">
            <div className="text-2xl mb-2">🧠</div>
            <h4 className="font-bold text-base mb-2 text-black">
              AI-Generated Questions
            </h4>
            <p className="text-gray-600 text-xs">
              Get fresh, dynamic questions instantly created by AI tailored to
              your topic and difficulty
            </p>
          </div>

          <div className="bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-4 text-center hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:transform hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-300">
            <div className="text-2xl mb-2">⏱️</div>
            <h4 className="font-bold text-base mb-2 text-black">
              Timed Challenges
            </h4>
            <p className="text-gray-600 text-xs">
              Race against the clock to answer correctly before time runs out
            </p>
          </div>

          <div className="bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-4 text-center hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:transform hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-300">
            <div className="text-2xl mb-2">📊</div>
            <h4 className="font-bold text-base mb-2 text-black">
              Smart Analytics
            </h4>
            <p className="text-gray-600 text-xs">
              Get instant feedback, performance insights, and personalized
              learning tips
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-4 border-black bg-white py-6 mt-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-gray-600">
            © 2025 Quiz App. Ready to test your knowledge?
          </p>
        </div>
      </div>
    </div>
  );
}
