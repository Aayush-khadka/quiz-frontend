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
  const [fieldErrors, setFieldErrors] = useState({});
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    socket.current = io(`${URL}`, { withCredentials: true });

    socket.current.on("connect", () => {
      console.log("✅ Socket connected:", socket.current.id);
      setSocketConnected(true);
    });

    socket.current.on("connect_error", () => {
      console.error("❌ Socket connection error");
      setSocketConnected(false);
      showError("Connection failed. Please check your internet and try again.");
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

    // Clear errors when user starts typing
    if (error) {
      setError("");
      setShowErrorToast(false);
    }
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const cleanHostName = form.host_name.trim();
    const cleanTopic = form.topic.trim();
    const errors = {};

    if (!cleanHostName) {
      errors.host_name = "Name is required";
    } else if (cleanHostName.length < 2) {
      errors.host_name = "Name must be at least 2 characters";
    }

    if (!cleanTopic) {
      errors.topic = "Topic is required";
    } else if (cleanTopic.length < 3) {
      errors.topic = "Topic must be at least 3 characters";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
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
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [showErrorToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showError("Please fix the errors below and try again.");
      return;
    }

    if (!socketConnected) {
      showError("Connection lost. Please refresh the page and try again.");
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

      if (!res.ok) {
        if (res.status === 429) {
          throw new Error(
            "Too many requests. Please wait a moment and try again."
          );
        } else if (res.status >= 500) {
          throw new Error("Server error. Please try again in a few moments.");
        } else {
          throw new Error(
            data.message || "Failed to create room. Please try again."
          );
        }
      }

      if (!data.statuscode) {
        throw new Error(
          data.message || "Failed to create room. Please try again."
        );
      }

      const roomCode = data.data;
      if (!roomCode) {
        throw new Error("Room creation failed. Please try again.");
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
        <div className="bg-red-50 border-2 border-red-500 shadow-[6px_6px_0px_rgba(239,68,68,1)] p-4 max-w-sm rounded-none">
          <div className="flex items-start space-x-3">
            <div className="text-xl flex-shrink-0">❌</div>
            <div className="flex-1 min-w-0">
              <p className="text-red-900 font-medium text-sm leading-tight break-words">
                {error}
              </p>
            </div>
            <button
              onClick={closeErrorToast}
              className="text-red-600 hover:text-red-800 font-bold text-lg leading-none flex-shrink-0 ml-2"
              aria-label="Close error"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ConnectionStatus = () => {
    if (socketConnected) return null;
    return (
      <div className="bg-yellow-50 border-2 border-yellow-400 p-3 mb-4 text-center">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
          <span className="text-yellow-800 text-sm font-medium">
            Connecting...
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ErrorToast />

      {/* Header */}
      <div className="bg-white border-b-4 border-black px-4 py-3 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="bg-black text-white px-4 py-2 border-2 border-black">
            <h1 className="text-xl font-bold">INQUIZZIT</h1>
          </div>

          <button
            onClick={handleBack}
            disabled={loading}
            className="h-10 border-2 border-black px-4 py-2 bg-[#FFA6F6] hover:bg-[#fa8cef] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:bg-[#f774ea] disabled:bg-gray-300 disabled:text-gray-500 text-sm font-medium text-black transition-all"
          >
            ← Back to Home
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-xl mx-auto px-4 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-black mb-3 sm:mb-4">
            Create New Quiz Room
          </h2>
          <p className="text-sm text-gray-700 max-w-md mx-auto leading-relaxed">
            Set up your quiz room and invite friends to join an epic knowledge
            battle!
          </p>
        </div>

        <ConnectionStatus />

        {/* Main Form Card */}
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-4 sm:p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Host Name Input */}
            <div>
              <label className="block mb-2 font-medium text-black text-sm">
                Your Name (Host) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="host_name"
                value={form.host_name}
                onChange={handleChange}
                placeholder="Enter your name"
                disabled={loading}
                className={`w-full border-2 ${
                  fieldErrors.host_name
                    ? "border-red-500 bg-red-50"
                    : "border-black"
                } p-3 text-sm text-black placeholder-gray-500 bg-white focus:outline-none focus:bg-[#FFA6F6] disabled:bg-gray-100 disabled:text-gray-500 transition-all`}
              />
              {fieldErrors.host_name && (
                <p className="text-red-600 text-xs mt-1 font-medium">
                  {fieldErrors.host_name}
                </p>
              )}
            </div>

            {/* Topic Input */}
            <div>
              <label className="block mb-2 font-medium text-black text-sm">
                Quiz Topic <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="topic"
                value={form.topic}
                onChange={handleChange}
                placeholder="e.g. Nepali Foods, Movies, Science"
                disabled={loading}
                className={`w-full border-2 ${
                  fieldErrors.topic
                    ? "border-red-500 bg-red-50"
                    : "border-black"
                } p-3 text-sm text-black placeholder-gray-500 bg-white focus:outline-none focus:bg-[#FFA6F6] disabled:bg-gray-100 disabled:text-gray-500 transition-all`}
              />
              {fieldErrors.topic && (
                <p className="text-red-600 text-xs mt-1 font-medium">
                  {fieldErrors.topic}
                </p>
              )}
            </div>

            {/* Difficulty and Questions Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  className="w-full border-2 border-black p-3 text-sm text-black bg-white focus:outline-none focus:bg-[#FFA6F6] disabled:bg-gray-100 disabled:text-gray-500 transition-all"
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
                  className="w-full border-2 border-black p-3 text-sm text-black bg-white focus:outline-none focus:bg-[#FFA6F6] disabled:bg-gray-100 disabled:text-gray-500 transition-all"
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
              disabled={loading || !socketConnected}
              className="w-full h-12 border-2 border-black p-2 bg-[#B8FF9F] hover:bg-[#99fc77] disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-all font-medium text-sm text-black relative overflow-hidden"
            >
              <span
                className={`transition-opacity duration-200 ${
                  loading ? "opacity-0" : "opacity-100"
                }`}
              >
                🎯 Create Quiz Room
              </span>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Room...</span>
                  </div>
                </div>
              )}
            </button>
          </form>
        </div>

        {/* How It Works */}
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-black mb-4 sm:mb-6 text-center">
            How It Works
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-purple-50 border-2 border-purple-400 p-4 text-center hover:shadow-[4px_4px_0px_rgba(147,51,234,1)] transition-all">
              <div className="bg-purple-100 border-2 border-purple-400 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-base sm:text-lg font-bold text-purple-800">
                  1
                </span>
              </div>
              <h4 className="font-bold text-purple-900 text-sm mb-2">
                Setup Quiz
              </h4>
              <p className="text-purple-800 text-xs leading-relaxed">
                Choose your topic, difficulty, and number of questions
              </p>
            </div>

            <div className="bg-green-50 border-2 border-green-400 p-4 text-center hover:shadow-[4px_4px_0px_rgba(34,197,94,1)] transition-all">
              <div className="bg-green-100 border-2 border-green-400 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-base sm:text-lg font-bold text-green-800">
                  2
                </span>
              </div>
              <h4 className="font-bold text-green-900 text-sm mb-2">
                Invite Friends
              </h4>
              <p className="text-green-800 text-xs leading-relaxed">
                Share your unique room code with friends to join
              </p>
            </div>

            <div className="bg-orange-50 border-2 border-orange-400 p-4 text-center hover:shadow-[4px_4px_0px_rgba(249,115,22,1)] transition-all">
              <div className="bg-orange-100 border-2 border-orange-400 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-base sm:text-lg font-bold text-orange-800">
                  3
                </span>
              </div>
              <h4 className="font-bold text-orange-900 text-sm mb-2">
                Start Playing
              </h4>
              <p className="text-orange-800 text-xs leading-relaxed">
                Launch the quiz and compete for the highest score!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-4 border-black bg-white py-4 sm:py-6 mt-8 sm:mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-gray-600 text-sm">
            © 2025 Quiz App. Ready to create some fun?
          </p>
        </div>
      </div>
    </div>
  );
}
