"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";

export default function CreateRoom() {
  const URL = process.env.NEXT_PUBLIC_URL;
  const router = useRouter();
  const socket = useRef(null);

  const [form, setForm] = useState({
    host_name: "",
    topic: "",
    difficulty: "easy",
    no_question: 10,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showErrorToast, setShowErrorToast] = useState(false);

  useEffect(() => {
    socket.current = io(`${URL}`, { withCredentials: true });

    socket.current.on("connect", () => {
      console.log("✅ Socket connected:", socket.current.id);
    });

    socket.current.on("connect_error", () => {
      console.error("❌ Socket connection error");
      showError("Could not connect to socket server. Please try again.");
    });

    socket.current.on("room-created", (data) => {
      console.log("📦 Room created via socket:", data);
      router.push(`/room/${data.roomCode}`);
    });

    return () => {
      socket.current.disconnect();
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "no_question" ? Number(value) : value,
    }));
    if (error) {
      setError("");
      setShowErrorToast(false);
    }
  };

  const validateForm = () => {
    const cleanHostName = form.host_name.trim();
    const cleanTopic = form.topic.trim();

    if (!cleanHostName && !cleanTopic) {
      return "Please enter both your name and a quiz topic to continue.";
    }
    if (!cleanHostName) {
      return "Please enter your name to create the room.";
    }
    if (!cleanTopic) {
      return "Please enter a topic for your quiz.";
    }
    if (cleanHostName.length < 2) {
      return "Your name must be at least 2 characters long.";
    }
    if (cleanTopic.length < 3) {
      return "Topic must be at least 3 characters long.";
    }
    return null;
  };

  const showError = (message) => {
    setError(message);
    setShowErrorToast(true);
  };

  const closeErrorToast = () => {
    setShowErrorToast(false);
    setError("");
  };

  useEffect(() => {
    if (showErrorToast) {
      const timer = setTimeout(() => {
        setShowErrorToast(false);
        setError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showErrorToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      showError(validationError);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${URL}/api/v1/room/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok || !data.statuscode) {
        throw new Error(
          data.message || "Failed to create room. Please try again."
        );
      }

      const roomCode = data.data;
      if (!roomCode) {
        throw new Error(
          "Room code missing from server response. Please try again."
        );
      }

      localStorage.setItem("hostName", form.host_name);
      localStorage.setItem("playerName", form.host_name);
      socket.current.emit("create-room", {
        roomCode,
        hostName: form.host_name,
      });
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/");
  };

  const ErrorToast = () => {
    if (!showErrorToast) return null;
    return (
      <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
        <div className="bg-red-50 border-4 border-red-500 shadow-[4px_4px_0px_rgba(239,68,68,1)] p-4 max-w-sm">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">⚠️</div>
            <div className="flex-1">
              <p className="text-red-800 font-medium">{error}</p>
            </div>
            <button
              onClick={closeErrorToast}
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

      <div className="bg-white border-b-4 border-black px-4 py-3">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="bg-black text-white px-4 py-2 border-2 border-black">
            <h1 className="text-xl font-bold">INQUIZZIT</h1>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleBack}
              className="h-10 border-2 border-black px-4 py-2 bg-[#FFA6F6] hover:bg-[#fa8cef] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:bg-[#f774ea] text-sm font-medium text-black transition-all"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-black mb-4">
            Create New Quiz Room
          </h2>
          <p className="text-sm text-gray-700 max-w-md mx-auto">
            Set up your quiz room and invite friends to join an epic knowledge
            battle!
          </p>
        </div>

        {/* Note */}

        {/* Main Form Card */}
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Host Name Input */}
            <div>
              <label className="block mb-2 font-medium text-black text-sm">
                Your Name (Host)
              </label>
              <input
                type="text"
                name="host_name"
                value={form.host_name}
                onChange={handleChange}
                placeholder="Enter your name"
                disabled={loading}
                className="w-full border-2 border-black p-2 text-sm text-black placeholder-gray-500 bg-white focus:outline-none focus:bg-[#FFA6F6] disabled:bg-gray-100 disabled:text-gray-500 transition-all"
              />
            </div>

            {/* Topic Input */}
            <div>
              <label className="block mb-2 font-medium text-black text-sm">
                Quiz Topic
              </label>
              <input
                type="text"
                name="topic"
                value={form.topic}
                onChange={handleChange}
                placeholder="e.g. Nepali Foods, Movies, Science"
                disabled={loading}
                className="w-full border-2 border-black p-2 text-sm text-black placeholder-gray-500 bg-white focus:outline-none focus:bg-[#FFA6F6] disabled:bg-gray-100 disabled:text-gray-500 transition-all"
              />
            </div>

            {/* Difficulty and Questions Row */}
            <div className="grid grid-cols-1 gap-4">
              {/* Difficulty Select */}
              <div>
                <label className="block mb-2 font-medium text-black text-sm">
                  Difficulty Level
                </label>
                <select
                  name="difficulty"
                  value={form.difficulty}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full border-2 border-black p-2 text-sm text-black bg-white focus:outline-none focus:bg-[#FFA6F6] disabled:bg-gray-100 disabled:text-gray-500 transition-all"
                >
                  <option value="easy">🟢 Easy</option>
                  <option value="medium">🟡 Intermediate</option>
                  <option value="hard">🔴 Hard</option>
                </select>
              </div>

              {/* Number of Questions Select */}
              <div>
                <label className="block mb-2 font-medium text-black text-sm">
                  Number of Questions
                </label>
                <select
                  name="no_question"
                  value={form.no_question}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full border-2 border-black p-2 text-sm text-black bg-white focus:outline-none focus:bg-[#FFA6F6] disabled:bg-gray-100 disabled:text-gray-500 transition-all"
                >
                  <option value={10}>10 Questions</option>
                  <option value={15}>15 Questions</option>
                  <option value={20}>20 Questions</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 border-2 border-black p-2 bg-[#B8FF9F] hover:bg-[#99fc77] disabled:bg-gray-300 disabled:text-gray-500 transition-all font-medium text-sm text-black"
            >
              {loading ? "Creating Room..." : "🎯 Create Quiz Room"}
            </button>
          </form>
        </div>

        {/* How It Works */}
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6">
          <h3 className="text-xl font-bold text-black mb-6 text-center">
            How It Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-purple-50 border-2 border-purple-400 p-4 text-center hover:shadow-[4px_4px_0px_rgba(147,51,234,1)] transition-all">
              <div className="bg-purple-100 border-2 border-purple-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-bold text-purple-800">1</span>
              </div>
              <h4 className="font-bold text-purple-900 text-sm mb-2">
                Setup Quiz
              </h4>
              <p className="text-purple-800 text-xs">
                Choose your topic, difficulty, and number of questions
              </p>
            </div>

            <div className="bg-green-50 border-2 border-green-400 p-4 text-center hover:shadow-[4px_4px_0px_rgba(34,197,94,1)] transition-all">
              <div className="bg-green-100 border-2 border-green-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-bold text-green-800">2</span>
              </div>
              <h4 className="font-bold text-green-900 text-sm mb-2">
                Invite Friends
              </h4>
              <p className="text-green-800 text-xs">
                Share your unique room code with friends to join
              </p>
            </div>

            <div className="bg-orange-50 border-2 border-orange-400 p-4 text-center hover:shadow-[4px_4px_0px_rgba(249,115,22,1)] transition-all">
              <div className="bg-orange-100 border-2 border-orange-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-bold text-orange-800">3</span>
              </div>
              <h4 className="font-bold text-orange-900 text-sm mb-2">
                Start Playing
              </h4>
              <p className="text-orange-800 text-xs">
                Launch the quiz and compete for the highest score!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-4 border-black bg-white py-6 mt-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-gray-600">
            © 2025 Quiz App. Ready to create some fun?
          </p>
        </div>
      </div>
    </div>
  );
}
