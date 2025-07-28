"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinRoom() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    room_code: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "room_code" ? value.toUpperCase() : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const cleanName = form.name.trim();
      const cleanRoomCode = form.room_code.trim().toUpperCase();

      if (!cleanName || !cleanRoomCode) {
        throw new Error("Both name and room code are required.");
      }

      if (cleanName.length < 2) {
        throw new Error("Name must be at least 2 characters long.");
      }

      if (cleanRoomCode.length < 4) {
        throw new Error("Room code must be at least 4 characters long.");
      }

      const res = await fetch(
        `https://quiz-app-q5tj.onrender.com/api/v1/room/join/${cleanRoomCode}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: cleanName }),
        }
      );

      const hostname = await fetch(
        `https://quiz-app-q5tj.onrender.com/room/host/${cleanRoomCode}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!hostname.ok) {
        const result = await hostname.json().catch(() => ({}));
        throw new Error(result.message || "Room not found.");
      }

      if (!res.ok) {
        const result = await res.json().catch(() => ({}));
        throw new Error(result.message || "Room not found.");
      }

      const host_validation = await hostname.json();

      if (!host_validation.statuscode || !host_validation.data) {
        throw new Error(host_validation.message || "Room validation failed.");
      }

      const data = await res.json();
      if (!data.statuscode || !data.data) {
        throw new Error(data.message || "Room validation failed.");
      }

      const { room_code, userId, playerName } = data.data;
      const { host_name } = host_validation.data;

      localStorage.setItem("playerName", playerName || cleanName);
      localStorage.setItem("hostName", host_name);
      localStorage.setItem("userId", userId);
      localStorage.setItem("roomCode", room_code);

      router.push(`/lobby/${cleanRoomCode}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <h1 className="text-2xl font-bold text-center text-gray-800">
            Join a Room
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-xl">
              <p className="text-red-600 text-center font-semibold text-sm">
                {error}
              </p>
            </div>
          )}

          <div>
            <label
              htmlFor="name"
              className="block mb-2 font-medium text-gray-700"
            >
              Your Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
              disabled={loading}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900"
            />
          </div>

          <div>
            <label
              htmlFor="room_code"
              className="block mb-2 font-medium text-gray-700"
            >
              Room Code
            </label>
            <input
              id="room_code"
              type="text"
              name="room_code"
              value={form.room_code}
              onChange={handleChange}
              placeholder="Enter room code"
              required
              disabled={loading}
              maxLength={10}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 font-mono text-lg text-center text-gray-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition duration-200"
          >
            {loading ? "Joining..." : "Join Room"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don’t have a room?{" "}
            <button
              onClick={() => router.push("/create")}
              className="text-blue-600 hover:underline font-medium"
            >
              Create one
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
