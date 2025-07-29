"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import dotenv from "dotenv";
dotenv.config();

export default function CreateRoom() {
  const URL = process.env.URL;
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

  // Setup socket
  useEffect(() => {
    socket.current = io(`${URL}`, {
      withCredentials: true,
    });

    socket.current.on("connect", () => {
      console.log("✅ Socket connected:", socket.current.id);
    });

    socket.current.on("connect_error", () => {
      console.error("❌ Socket connection error");
      setError("Could not connect to socket server");
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
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
        throw new Error(data.message || "Failed to create room");
      }

      const roomCode = data.data;
      if (!roomCode) {
        throw new Error("Room code missing from API response.");
      }

      localStorage.setItem("hostName", form.host_name);
      localStorage.setItem("playerName", form.host_name);

      socket.current.emit("create-room", {
        roomCode,
        hostName: form.host_name,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md space-y-6"
      >
        <h1 className="text-2xl font-bold text-center text-gray-800">
          Create a Room
        </h1>

        {error && (
          <p className="text-red-600 text-center font-semibold">{error}</p>
        )}

        <input
          name="host_name"
          placeholder="Your Name"
          value={form.host_name}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-xl px-4 py-2 text-gray-900"
        />

        <input
          name="topic"
          placeholder="Topic (e.g. Nepali Foods)"
          value={form.topic}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-xl px-4 py-2 text-gray-900"
        />

        <select
          name="difficulty"
          value={form.difficulty}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-xl px-4 py-2 text-gray-900"
        >
          <option value="easy">Easy</option>
          <option value="medium">Intermediate</option>
          <option value="hard">Hard</option>
        </select>

        <select
          name="no_question"
          value={form.no_question}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-xl px-4 py-2 text-gray-900"
        >
          <option value={10}>10 Questions</option>
          <option value={15}>15 Questions</option>
          <option value={20}>20 Questions</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition duration-200 disabled:opacity-50"
        >
          {loading ? "Creating Room..." : "Create Room"}
        </button>
      </form>
    </div>
  );
}
