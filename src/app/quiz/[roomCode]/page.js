// "use client";
// import { useParams } from "next/navigation";
// import { useState, useEffect, useCallback } from "react";

// export default function QuizPage() {
//   const { roomCode } = useParams();
//   const [questions, setQuestions] = useState([]);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [selectedOption, setSelectedOption] = useState("");
//   const [timeLeft, setTimeLeft] = useState(25);
//   const [isAnswerLocked, setIsAnswerLocked] = useState(false);
//   const [score, setScore] = useState(0);
//   const [answerResult, setAnswerResult] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [quizCompleted, setQuizCompleted] = useState(false);
//   const [answerTime, setAnswerTime] = useState(null);

//   // Fetch questions on component mount
//   useEffect(() => {
//     const fetchQuestions = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch(
//           `http://localhost:5000/api/v1/quiz/questions/${roomCode}`
//         );
//         const data = await response.json();

//         if (data.statuscode && data.data) {
//           setQuestions(data.data);
//         } else {
//           setError("Failed to load questions");
//         }
//       } catch (err) {
//         setError("Error connecting to server");
//         console.error("Error fetching questions:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (roomCode) {
//       fetchQuestions();
//     }
//   }, [roomCode]);

//   // Format time as MM:SS
//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins.toString().padStart(2, "0")}:${secs
//       .toString()
//       .padStart(2, "0")}`;
//   };

//   // Timer countdown effect with auto-advance
//   useEffect(() => {
//     if (timeLeft > 0 && questions.length > 0) {
//       const timer = setTimeout(() => {
//         setTimeLeft(timeLeft - 1);
//       }, 1000);
//       return () => clearTimeout(timer);
//     } else if (timeLeft === 0 && questions.length > 0) {
//       // Time's up - automatically move to next question
//       handleTimeUp();
//       // Auto-advance to next question after a brief delay to show result
//       const autoAdvanceTimer = setTimeout(() => {
//         moveToNextQuestion();
//       }, 2000); // 2 second delay to show the result
//       return () => clearTimeout(autoAdvanceTimer);
//     }
//   }, [timeLeft, questions.length]);

//   const calculateScore = useCallback((responseTime) => {
//     // Maximum points for answering within first 5 seconds
//     // Minimum points for answering at 25 seconds
//     const maxPoints = 1000;
//     const minPoints = 100;
//     const maxTime = 25;
//     const fastResponseTime = 5;

//     if (responseTime <= fastResponseTime) {
//       return maxPoints;
//     } else {
//       // Linear decrease from maxPoints to minPoints
//       const timeRatio = (maxTime - responseTime) / (maxTime - fastResponseTime);
//       return Math.round(minPoints + (maxPoints - minPoints) * timeRatio);
//     }
//   }, []);

//   const submitAnswer = async (questionId, option, responseTime) => {
//     try {
//       const response = await fetch("http://localhost:5000/api/v1/quiz/submit", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           questionId: questionId,
//           selectedOption: option,
//         }),
//       });

//       const result = await response.json();

//       if (result.statuscode) {
//         const isCorrect = result.data.correct;
//         let pointsEarned = 0;

//         if (isCorrect) {
//           pointsEarned = calculateScore(responseTime);
//           setScore((prevScore) => prevScore + pointsEarned);
//         }

//         setAnswerResult({
//           correct: isCorrect,
//           points: pointsEarned,
//           responseTime: responseTime,
//         });
//       }
//     } catch (err) {
//       console.error("Error submitting answer:", err);
//       setError("Failed to submit answer");
//     }
//   };

//   const handleOptionSelect = (option) => {
//     if (timeLeft > 0) {
//       setSelectedOption(option);
//       // Don't lock answers or submit immediately - allow changing selection
//       if (!answerTime) {
//         // Record the time of first selection for scoring purposes
//         setAnswerTime(25 - timeLeft);
//       }
//     }
//   };

//   const handleTimeUp = () => {
//     setIsAnswerLocked(true);

//     // Submit the final selected answer (if any)
//     if (selectedOption && questions[currentQuestionIndex]) {
//       const finalResponseTime = answerTime || 25; // Use recorded time or full 25 seconds
//       submitAnswer(
//         questions[currentQuestionIndex]._id,
//         selectedOption,
//         finalResponseTime
//       );
//     } else {
//       // No answer selected
//       setAnswerResult({
//         correct: false,
//         points: 0,
//         responseTime: 25,
//       });
//     }
//   };

//   const moveToNextQuestion = () => {
//     if (currentQuestionIndex < questions.length - 1) {
//       setCurrentQuestionIndex(currentQuestionIndex + 1);
//       setSelectedOption("");
//       setIsAnswerLocked(false);
//       setTimeLeft(25);
//       setAnswerResult(null);
//       setAnswerTime(null);
//     } else {
//       setQuizCompleted(true);
//     }
//   };

//   const restartQuiz = () => {
//     setCurrentQuestionIndex(0);
//     setSelectedOption("");
//     setIsAnswerLocked(false);
//     setTimeLeft(25);
//     setAnswerResult(null);
//     setScore(0);
//     setQuizCompleted(false);
//     setAnswerTime(null);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <div className="bg-white p-8 rounded-xl shadow-xl text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading quiz questions...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
//         <div className="bg-white p-8 rounded-xl shadow-xl text-center max-w-md">
//           <div className="text-red-500 text-5xl mb-4">⚠️</div>
//           <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
//           <p className="text-gray-600 mb-4">{error}</p>
//           <button
//             onClick={() => window.location.reload()}
//             className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (questions.length === 0) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
//         <div className="bg-white p-8 rounded-xl shadow-xl text-center">
//           <h2 className="text-xl font-bold text-gray-800">
//             No questions available
//           </h2>
//           <p className="text-gray-600">Room: {roomCode}</p>
//         </div>
//       </div>
//     );
//   }

//   if (quizCompleted) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
//         <div className="bg-white p-8 rounded-xl shadow-xl text-center max-w-md">
//           <div className="text-green-500 text-6xl mb-4">🎉</div>
//           <h2 className="text-2xl font-bold text-gray-800 mb-4">
//             Quiz Completed!
//           </h2>
//           <div className="bg-blue-50 p-4 rounded-lg mb-6">
//             <p className="text-3xl font-bold text-blue-600">{score}</p>
//             <p className="text-gray-600">Total Points</p>
//           </div>
//           <p className="text-gray-600 mb-6">
//             You answered {questions.length} questions in room:{" "}
//             <span className="font-semibold text-blue-600">{roomCode}</span>
//           </p>
//           <button
//             onClick={restartQuiz}
//             className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
//           >
//             Restart Quiz
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const currentQuestion = questions[currentQuestionIndex];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
//       <div className="max-w-4xl mx-auto">
//         {/* Header */}
//         <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
//           <div className="flex justify-between items-center">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-800">
//                 Quiz Room: <span className="text-blue-600">{roomCode}</span>
//               </h1>
//               <p className="text-gray-600">
//                 Question {currentQuestionIndex + 1} of {questions.length}
//               </p>
//             </div>
//             <div className="text-right">
//               <div className="text-2xl font-bold text-green-600">{score}</div>
//               <div className="text-sm text-gray-600">Points</div>
//             </div>
//           </div>
//         </div>

//         {/* Timer Clock */}
//         <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
//           <div className="flex items-center justify-center">
//             <div className="relative">
//               {/* Clock Circle */}
//               <div
//                 className={`w-32 h-32 rounded-full border-8 flex items-center justify-center ${
//                   timeLeft <= 5
//                     ? "border-red-500 animate-pulse"
//                     : "border-blue-600"
//                 }`}
//               >
//                 <div
//                   className={`text-4xl font-bold ${
//                     timeLeft <= 5 ? "text-red-500" : "text-blue-600"
//                   }`}
//                 >
//                   {formatTime(timeLeft)}
//                 </div>
//               </div>

//               {/* Clock Hand (visual indicator) */}
//               <div
//                 className={`absolute top-1/2 left-1/2 w-1 origin-bottom transform -translate-x-1/2 -translate-y-full transition-transform duration-1000 ${
//                   timeLeft <= 5 ? "bg-red-500" : "bg-blue-600"
//                 }`}
//                 style={{
//                   height: "60px",
//                   transform: `translate(-50%, -100%) rotate(${
//                     (25 - timeLeft) * 14.4
//                   }deg)`, // 360/25 = 14.4 degrees per second
//                 }}
//               ></div>
//             </div>

//             <div className="ml-6 text-gray-600">
//               <div className="text-lg font-semibold">Time Remaining</div>
//               {answerTime && !isAnswerLocked && (
//                 <div className="text-sm">
//                   First selection at {formatTime(25 - answerTime)}
//                 </div>
//               )}
//               {answerTime && isAnswerLocked && (
//                 <div className="text-sm">
//                   You answered in {formatTime(answerTime)}
//                 </div>
//               )}
//               {timeLeft === 0 && (
//                 <div className="text-sm text-red-600 font-semibold">
//                   Time's Up! Moving to next question...
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Question */}
//         <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
//           <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
//             {currentQuestion.question}
//           </h2>

//           {/* Options */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {currentQuestion.options.map((option, index) => {
//               const isSelected = selectedOption === option;
//               const optionLetter = String.fromCharCode(65 + index); // A, B, C, D

//               return (
//                 <button
//                   key={index}
//                   onClick={() => handleOptionSelect(option)}
//                   disabled={timeLeft === 0}
//                   className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
//                     isSelected
//                       ? "border-blue-500 bg-blue-50 text-blue-700"
//                       : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
//                   } ${
//                     timeLeft === 0
//                       ? "cursor-not-allowed opacity-75"
//                       : "cursor-pointer"
//                   }`}
//                 >
//                   <div className="flex items-center">
//                     <span
//                       className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold mr-3 ${
//                         isSelected
//                           ? "bg-blue-500 text-white"
//                           : "bg-gray-200 text-gray-600"
//                       }`}
//                     >
//                       {optionLetter}
//                     </span>
//                     <span className="font-medium">{option}</span>
//                   </div>
//                 </button>
//               );
//             })}
//           </div>

//           {/* Answer Result */}
//           {answerResult && (
//             <div
//               className={`mt-6 p-4 rounded-lg ${
//                 answerResult.correct
//                   ? "bg-green-50 border border-green-200"
//                   : "bg-red-50 border border-red-200"
//               }`}
//             >
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center">
//                   <span
//                     className={`text-2xl mr-2 ${
//                       answerResult.correct ? "text-green-500" : "text-red-500"
//                     }`}
//                   >
//                     {answerResult.correct ? "✅" : "❌"}
//                   </span>
//                   <span
//                     className={`font-semibold ${
//                       answerResult.correct ? "text-green-700" : "text-red-700"
//                     }`}
//                   >
//                     {answerResult.correct ? "Correct!" : "Incorrect"}
//                   </span>
//                 </div>
//                 {answerResult.correct && (
//                   <div className="text-green-700 font-bold">
//                     +{answerResult.points} points
//                   </div>
//                 )}
//               </div>
//               {answerResult.correct && (
//                 <div className="text-sm text-green-600 mt-1">
//                   Response time: {formatTime(answerResult.responseTime)}
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";

export default function QuizPage() {
  const { roomCode } = useParams();
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

  // Initialize socket connection
  useEffect(() => {
    const socketInstance = io("https://quiz-app-q5tj.onrender.com/", {
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
          `https://quiz-app-q5tj.onrender.com/api/v1/quiz/questions/${roomCode}`
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
      const response = await fetch(
        "https://quiz-app-q5tj.onrender.com/api/v1/quiz/submit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            questionId: questionId,
            selectedOption: option,
          }),
        }
      );

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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-xl text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white p-8 rounded-xl shadow-xl text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white p-8 rounded-xl shadow-xl text-center">
          <h2 className="text-xl font-bold text-gray-800">
            No questions available
          </h2>
          <p className="text-gray-600">Room: {roomCode}</p>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white p-8 rounded-xl shadow-xl text-center max-w-md">
          <div className="text-green-500 text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Quiz Completed!
          </h2>
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="text-3xl font-bold text-blue-600">{score}</p>
            <p className="text-gray-600">Total Points</p>
          </div>
          <p className="text-gray-600 mb-6">Redirecting to results page...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Quiz Area */}
          <div className="lg:col-span-3">
            {/* Header */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 mb-8 border border-white/20">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Quiz Room:{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                      {roomCode}
                    </span>
                  </h1>
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full">
                      <p className="text-gray-700 font-medium">
                        Question {currentQuestionIndex + 1} of{" "}
                        {questions.length}
                      </p>
                    </div>
                    <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                        style={{
                          width: `${
                            ((currentQuestionIndex + 1) / questions.length) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-3 rounded-2xl shadow-lg">
                    <div className="text-3xl font-bold">{score}</div>
                    <div className="text-sm opacity-90">Points</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timer Clock */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 mb-8 border border-white/20">
              <div className="flex items-center justify-center">
                <div className="relative">
                  {/* Outer glow ring */}
                  <div
                    className={`absolute inset-0 w-40 h-40 rounded-full ${
                      timeLeft <= 5
                        ? "bg-red-500/20 animate-pulse"
                        : "bg-blue-500/20"
                    } blur-xl`}
                  ></div>

                  {/* Clock Circle */}
                  <div
                    className={`relative w-40 h-40 rounded-full border-8 flex items-center justify-center shadow-2xl ${
                      timeLeft <= 5
                        ? "border-red-500 bg-red-50 animate-pulse"
                        : "border-blue-500 bg-blue-50"
                    } transition-all duration-300`}
                  >
                    <div
                      className={`text-4xl font-bold ${
                        timeLeft <= 5 ? "text-red-600" : "text-blue-600"
                      } transition-colors duration-300`}
                    >
                      {formatTime(timeLeft)}
                    </div>
                  </div>

                  {/* Clock Hand */}
                  <div
                    className={`absolute top-1/2 left-1/2 w-2 origin-bottom transform -translate-x-1/2 -translate-y-full transition-all duration-1000 rounded-full ${
                      timeLeft <= 5
                        ? "bg-red-500 shadow-red-500/50"
                        : "bg-blue-500 shadow-blue-500/50"
                    } shadow-lg`}
                    style={{
                      height: "70px",
                      transform: `translate(-50%, -100%) rotate(${
                        (25 - timeLeft) * 14.4
                      }deg)`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Question */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-10 mb-8 border border-white/20">
              <div className="text-center mb-10">
                <div className="inline-block bg-gradient-to-r from-purple-100 to-pink-100 px-6 py-2 rounded-full mb-6">
                  <span className="text-purple-700 font-semibold">
                    Question {currentQuestionIndex + 1}
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 leading-relaxed">
                  {currentQuestion.question}
                </h2>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedOption === option;
                  const optionLetter = String.fromCharCode(65 + index);

                  return (
                    <button
                      key={index}
                      onClick={() => handleOptionSelect(option)}
                      disabled={timeLeft === 0}
                      className={`group relative p-6 rounded-2xl border-2 text-left transition-all duration-300 transform hover:scale-105 ${
                        isSelected
                          ? "border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-xl shadow-blue-500/25"
                          : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10"
                      } ${
                        timeLeft === 0
                          ? "cursor-not-allowed opacity-75 transform-none"
                          : "cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center">
                        <span
                          className={`inline-flex items-center justify-center w-12 h-12 rounded-full text-lg font-bold mr-4 transition-all duration-300 ${
                            isSelected
                              ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                              : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                          }`}
                        >
                          {optionLetter}
                        </span>
                        <span className="font-medium text-lg leading-relaxed">
                          {option}
                        </span>
                      </div>

                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="absolute top-3 right-3">
                          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Answer Result */}
              {answerResult && (
                <div
                  className={`mt-8 p-6 rounded-2xl shadow-lg ${
                    answerResult.correct
                      ? "bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200"
                      : "bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span
                        className={`text-4xl mr-4 ${
                          answerResult.correct
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {answerResult.correct ? "🎉" : "😔"}
                      </span>
                      <div>
                        <span
                          className={`font-bold text-xl ${
                            answerResult.correct
                              ? "text-green-700"
                              : "text-red-700"
                          }`}
                        >
                          {answerResult.correct
                            ? "Excellent!"
                            : "Not quite right"}
                        </span>
                        <div className="text-sm text-gray-600 mt-1">
                          Response time: {formatTime(answerResult.responseTime)}{" "}
                          seconds
                        </div>
                        {!answerResult.correct && (
                          <div className="text-sm text-gray-600 mt-1">
                            Correct answer:{" "}
                            <span className="font-semibold">
                              {answerResult.correctAnswer}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {answerResult.correct && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-700">
                          +{answerResult.points}
                        </div>
                        <div className="text-sm text-green-600">
                          points earned
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Leaderboard Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-white/20 sticky top-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                🏆 Leaderboard
              </h3>
              <div className="space-y-3">
                {leaderboard.length > 0 ? (
                  leaderboard.map((player, index) => (
                    <div
                      key={player.name}
                      className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
                        player.name === playerName
                          ? "bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-300"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold mr-3 ${
                            index === 0
                              ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"
                              : index === 1
                              ? "bg-gradient-to-r from-gray-400 to-gray-600 text-white"
                              : index === 2
                              ? "bg-gradient-to-r from-amber-600 to-amber-800 text-white"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {index + 1}
                        </span>
                        <span className="font-medium text-gray-800 truncate">
                          {player.name === playerName ? "You" : player.name}
                        </span>
                      </div>
                      <span className="font-bold text-blue-600">
                        {player.score}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <div className="text-4xl mb-2">👥</div>
                    <p>Waiting for players...</p>
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
