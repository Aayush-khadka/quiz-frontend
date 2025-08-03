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
//     }
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

//     if (cleanName.length < 2) {
//       return "Your name must be at least 2 characters long.";
//     }

//     if (cleanRoomCode.length < 4) {
//       return "Room code must be at least 4 characters long.";
//     }

//     if (!/^[A-Z0-9]+$/.test(cleanRoomCode)) {
//       return "Room code can only contain letters and numbers.";
//     }

//     return null;
//   };

//   const showError = (message) => {
//     setError(message);
//     setShowErrorDialog(true);
//   };

//   // Auto-dismiss toast after 5 seconds
//   useEffect(() => {
//     if (showErrorDialog) {
//       const timer = setTimeout(() => {
//         setShowErrorDialog(false);
//         setError("");
//       }, 5000);

//       return () => clearTimeout(timer);
//     }
//   }, [showErrorDialog]);

//   const closeErrorDialog = () => {
//     setShowErrorDialog(false);
//     setError("");
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Client-side validation
//     const validationError = validateForm();
//     if (validationError) {
//       showError(validationError);
//       return;
//     }

//     setLoading(true);

//     try {
//       const cleanName = form.name.trim();
//       const cleanRoomCode = form.room_code.trim().toUpperCase();

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

//   // Error Toast Component
//   const ErrorToast = () => {
//     if (!showErrorDialog) return null;

//     return (
//       <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
//         <div className="bg-red-50 border-4 border-red-500 shadow-[4px_4px_0px_rgba(239,68,68,1)] p-4 max-w-sm">
//           <div className="flex items-start space-x-3">
//             <div className="text-2xl">⚠️</div>
//             <div className="flex-1">
//               <p className="text-red-800 font-medium">{error}</p>
//             </div>
//             <button
//               onClick={closeErrorDialog}
//               className="text-red-600 hover:text-red-800 font-bold text-xl leading-none"
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
//           <div className="bg-black text-white px-4 py-2 border-2 border-black">
//             <h1 className="text-xl font-bold">INQUIZZIT</h1>
//           </div>

//           <div className="flex space-x-3">
//             <button
//               className="h-8 border-2 border-black px-4 py-2 bg-[#A6FAFF] hover:bg-[#79F7FF] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:bg-[#00E1EF] text-sm font-medium text-black transition-all flex items-center justify-center"
//               onClick={handleHowToPlayPage}
//             >
//               How to Play
//             </button>
//             <button
//               className="h-8 border-2 border-black px-4 py-2 bg-[#B8FF9F] hover:bg-[#99fc77] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:bg-[#7df752] text-sm font-medium text-black transition-all flex items-center justify-center"
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
//         <div className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6 mb-6">
//           <div className="space-y-4">
//             {/* Name Input */}
//             <div>
//               <label className="block mb-2 font-medium text-black text-sm">
//                 Your Name
//               </label>
//               <input
//                 type="text"
//                 name="name"
//                 value={form.name}
//                 onChange={handleChange}
//                 placeholder="Enter your name"
//                 disabled={loading}
//                 className="w-full border-2 border-black p-2 text-sm text-black placeholder-gray-500 bg-white focus:outline-none focus:bg-[#FFA6F6] active:shadow-[2px_2px_0px_rgba(0,0,0,1)] disabled:bg-gray-100 disabled:text-gray-500 transition-all"
//               />
//             </div>

//             {/* Room Code Input */}
//             <div>
//               <label className="block mb-2 font-medium text-black text-sm">
//                 Room Code
//               </label>
//               <input
//                 type="text"
//                 name="room_code"
//                 value={form.room_code}
//                 onChange={handleChange}
//                 placeholder="ABCD1234"
//                 disabled={loading}
//                 maxLength={10}
//                 className="w-full border-2 border-black p-2 text-sm font-mono text-center tracking-widest text-black placeholder-gray-400 bg-white focus:outline-none focus:bg-[#FFA6F6] active:shadow-[2px_2px_0px_rgba(0,0,0,1)] disabled:bg-gray-100 disabled:text-gray-500 transition-all"
//               />
//             </div>

//             {/* Submit Button */}
//             <button
//               onClick={handleSubmit}
//               disabled={loading}
//               className="w-full h-12 border-2 border-black p-2 bg-[#B8FF9F] hover:bg-[#99fc77] disabled:bg-gray-300 disabled:text-gray-500 transition-all font-medium text-sm text-black"
//             >
//               {loading ? "Joining Room..." : "Join Room"}
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
//         <div className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6">
//           <div className="text-center">
//             <h3 className="text-xl font-bold text-black mb-4">
//               Create New Room
//             </h3>
//             <p className="text-gray-700 mb-4">
//               Start your own quiz and invite friends to join
//             </p>

//             <button
//               onClick={handleCreateRoom}
//               className="h-12 border-2 border-black px-6 py-3 bg-[#FFA6F6] hover:bg-[#fa8cef] active:bg-[#f774ea] transition-all font-medium text-sm text-black"
//             >
//               Create New Room
//             </button>
//           </div>
//         </div>
//         {/* Features Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
//           <div className="bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-4 text-center hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all">
//             <div className="text-2xl mb-2">🧠</div>
//             <h4 className="font-bold text-base mb-2 text-black">
//               AI-Generated Questions
//             </h4>
//             <p className="text-gray-600 text-xs">
//               Get fresh, dynamic questions instantly created by AI tailored to
//               your topic and difficulty
//             </p>
//           </div>

//           <div className="bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-4 text-center hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all">
//             <div className="text-2xl mb-2">⏱️</div>
//             <h4 className="font-bold text-base mb-2 text-black">
//               Timed Challenges
//             </h4>
//             <p className="text-gray-600 text-xs">
//               Race against the clock to answer correctly before time runs out
//             </p>
//           </div>

//           <div className="bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-4 text-center hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all">
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
    }
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

    if (cleanName.length < 2) {
      return "Your name must be at least 2 characters long.";
    }

    if (cleanRoomCode.length < 4) {
      return "Room code must be at least 4 characters long.";
    }

    if (!/^[A-Z0-9]+$/.test(cleanRoomCode)) {
      return "Room code can only contain letters and numbers.";
    }

    return null;
  };

  const checkQuizStatus = async (roomCode) => {
    try {
      const statusRes = await fetch(`${URL}/api/v1/room/status/${roomCode}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!statusRes.ok) {
        const result = await statusRes.json().catch(() => ({}));
        throw new Error(result.message || "Failed to check quiz status.");
      }

      const statusData = await statusRes.json();

      if (!statusData.statuscode) {
        throw new Error(statusData.message || "Failed to check quiz status.");
      }

      // If data is true, quiz has started
      if (statusData.data === true) {
        throw new Error("Quiz in this room has already started!");
      }

      return true; // Quiz has not started, safe to join
    } catch (err) {
      throw err;
    }
  };

  const showError = (message) => {
    setError(message);
    setShowErrorDialog(true);
  };

  // Auto-dismiss toast after 5 seconds
  useEffect(() => {
    if (showErrorDialog) {
      const timer = setTimeout(() => {
        setShowErrorDialog(false);
        setError("");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showErrorDialog]);

  const closeErrorDialog = () => {
    setShowErrorDialog(false);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    const validationError = validateForm();
    if (validationError) {
      showError(validationError);
      return;
    }

    setLoading(true);

    try {
      const cleanName = form.name.trim();
      const cleanRoomCode = form.room_code.trim().toUpperCase();

      // Check quiz status before proceeding
      await checkQuizStatus(cleanRoomCode);

      // Real API calls
      const res = await fetch(`${URL}/api/v1/room/join/${cleanRoomCode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: cleanName }),
      });

      const hostname = await fetch(`${URL}/api/v1/room/host/${cleanRoomCode}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!hostname.ok) {
        const result = await hostname.json().catch(() => ({}));
        throw new Error(
          result.message ||
            "Room not found. Please check your room code and try again."
        );
      }

      if (!res.ok) {
        const result = await res.json().catch(() => ({}));
        throw new Error(
          result.message || "Failed to join room. Please try again."
        );
      }

      const host_validation = await hostname.json();

      if (!host_validation.statuscode || !host_validation.data) {
        throw new Error(
          host_validation.message || "Room validation failed. Please try again."
        );
      }

      const data = await res.json();
      if (!data.statuscode || !data.data) {
        throw new Error(
          data.message || "Failed to join room. Please try again."
        );
      }

      const { room_code, userId, playerName } = data.data;
      const { host_name } = host_validation.data;

      // Store in localStorage
      localStorage.setItem("playerName", playerName || cleanName);
      localStorage.setItem("hostName", host_name);
      localStorage.setItem("userId", userId);
      localStorage.setItem("roomCode", room_code);

      // Navigate to room lobby
      router.push(`/lobby/${cleanRoomCode}`);
    } catch (err) {
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

  // Error Toast Component
  const ErrorToast = () => {
    if (!showErrorDialog) return null;

    return (
      <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
        <div className="bg-red-50 border-4 border-red-500 shadow-[4px_4px_0px_rgba(239,68,68,1)] p-4 max-w-sm">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">⚠️</div>
            <div className="flex-1">
              <p className="text-red-800 font-medium">{error}</p>
            </div>
            <button
              onClick={closeErrorDialog}
              className="text-red-600 hover:text-red-800 font-bold text-xl leading-none"
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
          <div className="bg-black text-white px-4 py-2 border-2 border-black">
            <h1 className="text-xl font-bold">INQUIZZIT</h1>
          </div>

          <div className="flex space-x-3">
            <button
              className="h-8 border-2 border-black px-4 py-2 bg-[#A6FAFF] hover:bg-[#79F7FF] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:bg-[#00E1EF] text-sm font-medium text-black transition-all flex items-center justify-center"
              onClick={handleHowToPlayPage}
            >
              How to Play
            </button>
            <button
              className="h-8 border-2 border-black px-4 py-2 bg-[#B8FF9F] hover:bg-[#99fc77] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:bg-[#7df752] text-sm font-medium text-black transition-all flex items-center justify-center"
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
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6 mb-6">
          <div className="space-y-4">
            {/* Name Input */}
            <div>
              <label className="block mb-2 font-medium text-black text-sm">
                Your Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
                disabled={loading}
                className="w-full border-2 border-black p-2 text-sm text-black placeholder-gray-500 bg-white focus:outline-none focus:bg-[#FFA6F6] active:shadow-[2px_2px_0px_rgba(0,0,0,1)] disabled:bg-gray-100 disabled:text-gray-500 transition-all"
              />
            </div>

            {/* Room Code Input */}
            <div>
              <label className="block mb-2 font-medium text-black text-sm">
                Room Code
              </label>
              <input
                type="text"
                name="room_code"
                value={form.room_code}
                onChange={handleChange}
                placeholder="ABCD1234"
                disabled={loading}
                maxLength={10}
                className="w-full border-2 border-black p-2 text-sm font-mono text-center tracking-widest text-black placeholder-gray-400 bg-white focus:outline-none focus:bg-[#FFA6F6] active:shadow-[2px_2px_0px_rgba(0,0,0,1)] disabled:bg-gray-100 disabled:text-gray-500 transition-all"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full h-12 border-2 border-black p-2 bg-[#B8FF9F] hover:bg-[#99fc77] disabled:bg-gray-300 disabled:text-gray-500 transition-all font-medium text-sm text-black"
            >
              {loading ? "Joining Room..." : "Join Room"}
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
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-black mb-4">
              Create New Room
            </h3>
            <p className="text-gray-700 mb-4">
              Start your own quiz and invite friends to join
            </p>

            <button
              onClick={handleCreateRoom}
              className="h-12 border-2 border-black px-6 py-3 bg-[#FFA6F6] hover:bg-[#fa8cef] active:bg-[#f774ea] transition-all font-medium text-sm text-black"
            >
              Create New Room
            </button>
          </div>
        </div>
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-4 text-center hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all">
            <div className="text-2xl mb-2">🧠</div>
            <h4 className="font-bold text-base mb-2 text-black">
              AI-Generated Questions
            </h4>
            <p className="text-gray-600 text-xs">
              Get fresh, dynamic questions instantly created by AI tailored to
              your topic and difficulty
            </p>
          </div>

          <div className="bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-4 text-center hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all">
            <div className="text-2xl mb-2">⏱️</div>
            <h4 className="font-bold text-base mb-2 text-black">
              Timed Challenges
            </h4>
            <p className="text-gray-600 text-xs">
              Race against the clock to answer correctly before time runs out
            </p>
          </div>

          <div className="bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-4 text-center hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all">
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
