"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";

export default function QuizPage() {
  const { roomCode } = useParams();
  const URL = process.env.NEXT_PUBLIC_URL;
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [timeLeft, setTimeLeft] = useState(25);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [score, setScore] = useState(0);
  const [answerResult, setAnswerResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [answerTime, setAnswerTime] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [socket, setSocket] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    const socketInstance = io(`${URL}`, {
      transports: ["websocket"],
      upgrade: false,
    });
    setSocket(socketInstance);

    // Get player name from localStorage or prompt
    const storedPlayerName =
      localStorage.getItem("playerName") ||
      prompt("Enter your name:") ||
      `Player${Date.now()}`;
    localStorage.setItem("playerName", storedPlayerName);
    setPlayerName(storedPlayerName);

    // Socket event listeners
    socketInstance.on("connect", () => {
      console.log("Connected to server:", socketInstance.id);
      if (roomCode) {
        // Join the room when connected
        socketInstance.emit("join-room", {
          roomCode,
          playerName: storedPlayerName,
        });
      }
    });

    socketInstance.on("update-leaderboard", (updatedLeaderboard) => {
      console.log("Leaderboard updated:", updatedLeaderboard);
      setLeaderboard(updatedLeaderboard);
    });

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [roomCode]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${URL}/api/v1/quiz/questions/${roomCode}`
        );
        const data = await response.json();

        if (data.statuscode && data.data) {
          setQuestions(data.data);
        } else {
          setError("Failed to load questions");
        }
      } catch (err) {
        setError("Error connecting to server");
        console.error("Error fetching questions:", err);
      } finally {
        setLoading(false);
      }
    };

    if (roomCode) {
      fetchQuestions();
    }
  }, [roomCode]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Timer countdown effect with auto-advance
  useEffect(() => {
    if (timeLeft > 0 && questions.length > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && questions.length > 0) {
      // Time's up - automatically move to next question
      handleTimeUp();
      // Auto-advance to next question after a brief delay to show result
      const autoAdvanceTimer = setTimeout(() => {
        moveToNextQuestion();
      }, 3000); // 3 second delay to show the result
      return () => clearTimeout(autoAdvanceTimer);
    }
  }, [timeLeft, questions.length]);

  const calculateScore = useCallback((responseTime) => {
    // Maximum points for answering within first 5 seconds
    // Minimum points for answering at 25 seconds
    const maxPoints = 1000;
    const minPoints = 100;
    const maxTime = 25;
    const fastResponseTime = 5;

    if (responseTime <= fastResponseTime) {
      return maxPoints;
    } else {
      // Linear decrease from maxPoints to minPoints
      const timeRatio = (maxTime - responseTime) / (maxTime - fastResponseTime);
      return Math.round(minPoints + (maxPoints - minPoints) * timeRatio);
    }
  }, []);

  const submitAnswer = async (questionId, option, responseTime) => {
    try {
      const response = await fetch(`${URL}/api/v1/quiz/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionId: questionId,
          selectedOption: option,
        }),
      });

      const result = await response.json();

      if (result.statuscode) {
        const isCorrect = result.data.correct;
        const correctAnswer = result.data.correctAnswer;
        let pointsEarned = 0;

        if (isCorrect) {
          pointsEarned = calculateScore(responseTime);
          setScore((prevScore) => {
            const newScore = prevScore + pointsEarned;

            // Submit score to socket for leaderboard update with delay
            setTimeout(() => {
              if (socket && socket.connected) {
                console.log("Submitting score:", {
                  roomCode,
                  playerName,
                  score: newScore,
                });
                socket.emit("submit-score", {
                  roomCode,
                  playerName,
                  score: newScore,
                });
              }
            }, 100);

            return newScore;
          });
        } else {
          // Still submit current score even if answer is wrong
          setTimeout(() => {
            if (socket && socket.connected) {
              console.log("Submitting score (wrong answer):", {
                roomCode,
                playerName,
                score,
              });
              socket.emit("submit-score", {
                roomCode,
                playerName,
                score,
              });
            }
          }, 100);
        }

        setAnswerResult({
          correct: isCorrect,
          correctAnswer: correctAnswer,
          points: pointsEarned,
          responseTime: responseTime,
        });
      }
    } catch (err) {
      console.error("Error submitting answer:", err);
      setError("Failed to submit answer");
    }
  };

  const handleOptionSelect = (option) => {
    if (timeLeft > 0) {
      setSelectedOption(option);
      // Always update the answer time to the latest selection
      setAnswerTime(25 - timeLeft);
    }
  };

  const handleTimeUp = () => {
    setIsAnswerLocked(true);

    // Submit the final selected answer (if any)
    if (selectedOption && questions[currentQuestionIndex]) {
      const finalResponseTime = answerTime || 25; // Use recorded time or full 25 seconds
      submitAnswer(
        questions[currentQuestionIndex]._id,
        selectedOption,
        finalResponseTime
      );
    } else {
      // No answer selected
      setAnswerResult({
        correct: false,
        correctAnswer:
          questions[currentQuestionIndex]?.correctAnswer ||
          "No answer provided",
        points: 0,
        responseTime: 25,
      });

      // Still submit current score to socket
      setTimeout(() => {
        if (socket && socket.connected) {
          console.log("Submitting score (no answer):", {
            roomCode,
            playerName,
            score,
          });
          socket.emit("submit-score", {
            roomCode,
            playerName,
            score,
          });
        }
      }, 100);
    }
  };

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption("");
      setIsAnswerLocked(false);
      setTimeLeft(25);
      setAnswerResult(null);
      setAnswerTime(null);
    } else {
      setQuizCompleted(true);
      // Redirect to results page after a short delay
      setTimeout(() => {
        router.push(`/result/${roomCode}`);
      }, 2000);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption("");
    setIsAnswerLocked(false);
    setTimeLeft(25);
    setAnswerResult(null);
    setScore(0);
    setQuizCompleted(false);
    setAnswerTime(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-8 text-center max-w-md">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-black mb-2">Loading Quiz</h2>
          <p className="text-gray-600">Getting questions ready...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-8 text-center max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-black mb-4">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="border-2 border-black px-6 py-2 bg-[#FFA6F6] hover:bg-[#fa8cef] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all font-medium text-black"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-8 text-center max-w-md">
          <div className="text-4xl mb-4">📝</div>
          <h2 className="text-xl font-bold text-black mb-2">
            No Questions Available
          </h2>
          <p className="text-gray-600">
            Room: <span className="font-mono font-bold">{roomCode}</span>
          </p>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-8 text-center max-w-md">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-black mb-4">Quiz Complete!</h2>
          <div className="bg-[#B8FF9F] border-2 border-black p-4 mb-6">
            <div className="text-3xl font-bold text-black">{score}</div>
            <div className="text-sm font-medium text-black">Total Points</div>
          </div>
          <p className="text-gray-600 mb-4">Redirecting to results...</p>
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Top Header */}
      <div className="bg-white border-b-4 border-black px-4 py-3 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-black text-white px-4 py-2 border-2 border-black">
              <h1 className="text-lg font-bold">QUIZ: {roomCode}</h1>
            </div>
            {/* <div className="hidden sm:flex items-center space-x-3">
              <span className="text-sm font-medium text-black">Question:</span>
              <div className="bg-[#A6FAFF] border-2 border-black px-3 py-1">
                <span className="font-bold text-black">
                  {currentQuestionIndex + 1} / {questions.length}
                </span>
              </div>
            </div> */}
          </div>

          <div className="flex items-center space-x-3">
            {/* Mobile Leaderboard Toggle */}
            <button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className="lg:hidden border-2 border-black px-3 py-2 bg-[#FFFF9F] hover:bg-[#fff066] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all font-medium text-black text-sm"
            >
              🏆 Rankings
            </button>

            {/* Score Display */}
            <div className="bg-[#B8FF9F] border-2 border-black px-4 py-2">
              <div className="text-xl font-bold text-black">{score}</div>
              <div className="text-xs font-medium text-black">POINTS</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Leaderboard Overlay */}
      {showLeaderboard && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowLeaderboard(false)}
        >
          <div className="absolute top-20 right-4 bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-4 max-w-sm w-full">
            <div className="bg-black text-white px-3 py-2 text-center mb-4">
              <h3 className="font-bold">🏆 LEADERBOARD</h3>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {leaderboard.length > 0 ? (
                leaderboard.map((player, index) => (
                  <div
                    key={player.name}
                    className={`flex items-center justify-between p-2 border-2 border-black text-sm ${
                      player.name === playerName
                        ? "bg-[#FFA6F6]"
                        : index === 0
                        ? "bg-[#FFFF9F]"
                        : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="bg-black text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mr-2">
                        {index + 1}
                      </span>
                      <span className="font-medium text-black truncate">
                        {player.name === playerName ? "YOU" : player.name}
                      </span>
                    </div>
                    <span className="font-bold text-black">{player.score}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <div className="text-xl mb-1">👥</div>
                  <p className="text-gray-500 text-xs">
                    Waiting for players...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Main Quiz Area */}
          <div className="lg:col-span-4">
            {/* Timer and Progress Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Timer */}
              <div className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6">
                <div className="text-center">
                  <div className="text-sm font-bold text-black mb-3">
                    ⏰ TIME LEFT
                  </div>
                  <div
                    className={`text-5xl font-bold border-4 border-black px-6 py-3 inline-block ${
                      timeLeft <= 5
                        ? "bg-red-400 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                        : timeLeft <= 10
                        ? "bg-[#FFFF9F] text-black"
                        : "bg-[#A6FAFF] text-black"
                    }`}
                  >
                    {formatTime(timeLeft)}
                  </div>
                  {timeLeft <= 5 && (
                    <div className="text-red-600 font-bold text-sm mt-2 animate-pulse">
                      ⚠️ HURRY UP!
                    </div>
                  )}
                </div>
              </div>

              {/* Progress */}
              <div className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6">
                <div className="text-center">
                  <div className="text-sm font-bold text-black mb-2">
                    📊 PROGRESS
                  </div>
                  <div className="mb-3">
                    <div className="text-2xl font-bold text-black mb-1">
                      {currentQuestionIndex + 1} / {questions.length}
                    </div>
                    <div className="text-sm text-gray-600">
                      Questions Completed
                    </div>
                  </div>
                  <div className="w-full h-4 border-2 border-black bg-white">
                    <div
                      className="h-full bg-[#B8FF9F] transition-all duration-500"
                      style={{
                        width: `${
                          ((currentQuestionIndex + 1) / questions.length) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] mb-6">
              {/* Question Header */}
              <div className="bg-black text-white p-4 text-center">
                <h2 className="text-xl font-bold">
                  QUESTION {currentQuestionIndex + 1}
                </h2>
              </div>

              {/* Question Content */}
              <div className="p-8">
                <h3 className="text-2xl md:text-3xl font-bold text-black text-center mb-10 leading-relaxed px-4">
                  {currentQuestion.question}
                </h3>

                {/* Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedOption === option;
                    const isCorrect =
                      answerResult && option === answerResult.correctAnswer;
                    const isWrongSelection =
                      answerResult && isSelected && !answerResult.correct;
                    const optionLetter = String.fromCharCode(65 + index);

                    // Determine button styling based on answer state
                    let buttonClass =
                      "bg-white hover:bg-[#A6FAFF] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]";
                    let iconElement = null;

                    if (answerResult) {
                      if (isCorrect) {
                        buttonClass =
                          "bg-green-400 shadow-[4px_4px_0px_rgba(0,0,0,1)] transform translate-x-1 translate-y-1";
                        iconElement = (
                          <span className="text-white text-xl ml-2">✓</span>
                        );
                      } else if (isWrongSelection) {
                        buttonClass =
                          "bg-red-400 shadow-[4px_4px_0px_rgba(0,0,0,1)] transform translate-x-1 translate-y-1";
                        iconElement = (
                          <span className="text-white text-xl ml-2">✗</span>
                        );
                      } else {
                        buttonClass = "bg-gray-200 opacity-75";
                      }
                    } else if (isSelected) {
                      buttonClass =
                        "bg-[#FFA6F6] shadow-[4px_4px_0px_rgba(0,0,0,1)] transform translate-x-1 translate-y-1";
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => handleOptionSelect(option)}
                        disabled={timeLeft === 0 || answerResult}
                        className={`group p-5 text-left transition-all border-4 border-black text-lg min-h-[80px] flex items-center ${buttonClass} ${
                          timeLeft === 0 || answerResult
                            ? "cursor-not-allowed"
                            : "cursor-pointer active:translate-x-1 active:translate-y-1 hover:scale-[1.02]"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center">
                            <span
                              className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mr-4 flex-shrink-0 ${
                                answerResult && (isCorrect || isWrongSelection)
                                  ? "bg-white text-black"
                                  : "bg-black text-white"
                              }`}
                            >
                              {optionLetter}
                            </span>
                            <span
                              className={`font-medium leading-relaxed ${
                                answerResult && (isCorrect || isWrongSelection)
                                  ? "text-white font-semibold"
                                  : "text-black"
                              }`}
                            >
                              {option}
                            </span>
                          </div>
                          {iconElement}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Answer Result */}
            {answerResult && (
              <div className="mb-6">
                <div
                  className={`border-4 border-black p-6 ${
                    answerResult.correct
                      ? "bg-green-100 border-green-600"
                      : "bg-red-100 border-red-600"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center mb-4 md:mb-0">
                      <span className="text-5xl mr-4">
                        {answerResult.correct ? "🎉" : "💔"}
                      </span>
                      <div>
                        <div
                          className={`font-bold text-2xl mb-1 ${
                            answerResult.correct
                              ? "text-green-800"
                              : "text-red-800"
                          }`}
                        >
                          {answerResult.correct
                            ? "Perfect!"
                            : "Oops! Better luck next time"}
                        </div>
                        <div className="text-sm text-gray-700">
                          Response time:{" "}
                          <span className="font-bold">
                            {formatTime(answerResult.responseTime)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {answerResult.correct
                            ? "🎯 You nailed it! Check the highlighted answer above."
                            : "❌ Don't worry! The correct answer is highlighted in green above."}
                        </div>
                      </div>
                    </div>
                    {answerResult.correct && (
                      <div className="bg-green-600 text-white px-6 py-4 text-center border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                        <div className="text-3xl font-bold">
                          +{answerResult.points}
                        </div>
                        <div className="text-sm">POINTS EARNED</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Leaderboard */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-4 sticky top-24">
              <div className="bg-black text-white px-3 py-2 text-center mb-4">
                <h3 className="font-bold text-sm">🏆 LEADERBOARD</h3>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {leaderboard.length > 0 ? (
                  leaderboard.map((player, index) => (
                    <div
                      key={player.name}
                      className={`flex items-center justify-between p-3 border-2 border-black text-sm ${
                        player.name === playerName
                          ? "bg-[#FFA6F6]"
                          : index === 0
                          ? "bg-[#FFFF9F]"
                          : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-2">
                          {index + 1}
                        </span>
                        <span className="font-medium text-black truncate">
                          {player.name === playerName ? "YOU" : player.name}
                        </span>
                      </div>
                      <span className="font-bold text-black">
                        {player.score}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <div className="text-2xl mb-2">👥</div>
                    <p className="text-gray-500 text-xs">
                      Waiting for players...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
