"use client";

import { useState, useEffect, use } from "react";
import { io } from "socket.io-client";

export default function RoomPage({ params }) {
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
    const socketInstance = io("https://quiz-app-q5tj.onrender.com/", {
      withCredentials: true,
    });
    setSocket(socketInstance);

    const playerName = localStorage.getItem("playerName") || "Unnamed";
    const userId = localStorage.getItem("userId");

    // socketInstance.emit("join-room", {
    //   roomCode,
    //   playerName,
    //   userId,
    // });

    socketInstance.on("room-players-updated", (playerNames) => {
      console.log("Players updated:", playerNames);
      setPlayers(
        playerNames.map((name, index) => ({
          id: index + 1,
          name,
          isHost: index === 0, // First player is typically the host
          isYou: name === playerName,
        }))
      );
    });
    socketInstance.on("room-closed", (message) => {
      alert(message);
      window.location.href = "/"; // Redirect to home page
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

      const response = await fetch(
        `https://quiz-app-q5tj.onrender.com/api/v1/room/lobby/${roomCode}`
      );

      if (!response.ok) {
        console.error(
          `API endpoint failed. URL: https://quiz-app-q5tj.onrender.com/api/v1/room/lobby/${roomCode}`
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
          `https://quiz-app-q5tj.onrender.com/api/v1/question/delete/${questionId}`,
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
        `https://quiz-app-q5tj.onrender.com/api/v1/question/update/${questionId}`,
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
        `https://quiz-app-q5tj.onrender.com/api/v1/question/generatemorequestions/${quizData._id}`,
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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-600">Loading room data...</div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-xl shadow text-red-600 text-xl font-semibold">
          🚫 Access Denied. Only the host can access this page.
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="text-red-600 text-center font-semibold">{error}</div>
          <button
            onClick={fetchRoomData}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition duration-200"
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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="text-red-600 text-center font-semibold">
            No quiz data found for room code: {roomCode}
          </div>
          <button
            onClick={fetchRoomData}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Room Info Section */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Room Info</h2>
            {isHost && (
              <button
                onClick={handleDeleteRoom}
                disabled={deletingRoom}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-2 px-4 rounded-xl transition duration-200"
              >
                {deletingRoom ? "Deleting..." : "Delete Room"}
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-gray-700">
                <span className="font-medium">Room Code:</span>
                <span className="font-mono text-blue-600 ml-2">
                  {quizData.room_code || roomCode}
                </span>
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Host:</span>
                <span className="ml-2">{quizData.host_name || "Unknown"}</span>
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-gray-700">
                <span className="font-medium">Topic:</span>
                <span className="ml-2">{quizData.topic || "N/A"}</span>
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Difficulty:</span>
                <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium">
                  {quizData.difficulty || "N/A"}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Current Players Section */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Current Players in Lobby ({players.length})
          </h2>
          {players.length === 0 ? (
            <div className="text-gray-500 text-center py-4">
              No players in the lobby yet...
            </div>
          ) : (
            <div className="space-y-2">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200"
                >
                  <span className="text-gray-800 font-medium">
                    {player.name}
                  </span>
                  <div className="flex gap-2">
                    {player.isHost && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-sm font-medium">
                        Host
                      </span>
                    )}
                    {player.isYou && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-lg text-sm font-medium">
                        You
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Questions Section */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Questions ({questions.length})
            </h2>
            <div className="text-sm text-gray-600"></div>
          </div>

          {hasReachedLimit && (
            <div className="mb-4 p-3 bg-orange-100 border border-orange-300 rounded-lg">
              <p className="text-orange-800 text-sm font-medium">
                ⚠️ You have reached the maximum limit of {QUESTION_LIMIT}{" "}
                questions.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {questions.map((question, index) => (
              <div
                key={question._id}
                className="border border-gray-200 rounded-xl p-4 bg-gray-50"
              >
                <div className="mb-3">
                  <span className="text-sm text-gray-500 font-medium">
                    Question {index + 1}
                  </span>

                  {editingQuestion === question._id ? (
                    <textarea
                      value={editingData.question}
                      onChange={(e) =>
                        handleInputChange("question", e.target.value)
                      }
                      className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-lg font-semibold resize-none text-black"
                      rows="2"
                    />
                  ) : (
                    <h3 className="text-lg font-semibold text-gray-800 mt-1">
                      {question.question}
                    </h3>
                  )}
                </div>

                <div className="mb-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="space-y-1">
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
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm text-black"
                          />
                        ) : (
                          <div
                            className={`p-2 rounded-lg text-sm border border-gray-200 ${
                              option === question.correct_option
                                ? "bg-green-100 text-green-800 border-green-300"
                                : "bg-white text-gray-700"
                            }`}
                          >
                            {option}
                            {option === question.correct_option && (
                              <span className="ml-2 text-xs font-medium">
                                ✓ Correct
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <span className="text-sm text-gray-600 font-medium">
                    Correct Answer:{" "}
                  </span>
                  {editingQuestion === question._id ? (
                    <select
                      value={editingData.correct_option}
                      onChange={(e) =>
                        handleInputChange("correct_option", e.target.value)
                      }
                      className="ml-2 p-1 border border-gray-300 rounded text-sm text-black"
                    >
                      {editingData.options.map((option, idx) => (
                        <option key={idx} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-green-700 font-medium">
                      {question.correct_option}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  {editingQuestion === question._id ? (
                    <>
                      <button
                        onClick={() => handleUpdateQuestion(question._id)}
                        disabled={updating}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200"
                      >
                        {updating ? "Updating..." : "Save"}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={updating}
                        className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditQuestion(question)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleGenerateMoreQuestions}
            disabled={hasReachedLimit || generatingQuestions}
            className={`mt-6 w-full font-semibold py-3 px-4 rounded-xl transition duration-200 ${
              hasReachedLimit
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : generatingQuestions
                ? "bg-purple-400 text-white cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700 text-white"
            }`}
          >
            {generatingQuestions
              ? "Generating Questions..."
              : hasReachedLimit
              ? `Question Limit Reached (${QUESTION_LIMIT})`
              : "Generate More Questions"}
          </button>
          <button
            onClick={handleStartQuiz}
            className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl transition duration-200"
          >
            Start Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
