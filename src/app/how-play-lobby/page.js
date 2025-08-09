"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function HowToPlay() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("host");
  const [storedRoomCode, setStoredRoomCode] = useState(null);

  useEffect(() => {
    const code = localStorage.getItem("roomCode");
    setStoredRoomCode(code);
  }, []);

  const handleBack = () => {
    if (storedRoomCode) {
      router.push(`/lobby/${storedRoomCode}`);
    } else {
      // fallback if no roomCode found
      router.push("/lobby");
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b-4 border-black px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="bg-black text-white px-4 py-2 border-2 border-black">
            <h1 className="text-xl font-bold">How to Play</h1>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleBack}
              className="h-8 border-2 border-black px-4 py-2 bg-[#A6FAFF] hover:bg-[#79F7FF] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:bg-[#00E1EF] text-sm font-medium text-black transition-all flex items-center justify-center"
            >
              Back to Lobby
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-black mb-4">
            Ready to Quiz? Here's How! 🎯
          </h2>
          <p className="text-sm text-black max-w-2xl mx-auto mb-6">
            Learn how to create engaging quizzes as a host or join the fun as a
            player. It's simple, fast, and incredibly fun!
          </p>

          {/* Video Section */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-4 rounded-lg">
              <h3 className="text-xl font-bold text-black mb-3">
                📺 Watch How It Works
              </h3>
              <div className="relative w-full h-0 pb-[56.25%] bg-black border-2 border-gray-300 rounded-lg overflow-hidden shadow-[4px_4px_0px_rgba(0,0,0,0.3)]">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="How to Play Quiz App - Complete Guide"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
              <p className="text-black mt-3 text-xs">
                🎬 This quick video shows you everything you need to know to get
                started!
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-6">
          <div className="bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] inline-flex">
            <button
              onClick={() => setActiveTab("host")}
              className={`px-6 py-3 font-bold text-sm border-r-2 border-black transition-all ${
                activeTab === "host"
                  ? "bg-[#FFE066] text-black"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              🏠 FOR HOSTS
            </button>
            <button
              onClick={() => setActiveTab("player")}
              className={`px-6 py-3 font-bold text-sm transition-all ${
                activeTab === "player"
                  ? "bg-[#A6FAFF] text-black"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              🎮 FOR PLAYERS
            </button>
          </div>
        </div>

        {/* Host Instructions */}
        {activeTab === "host" && (
          <div className="space-y-6">
            <div className="bg-[#FFE066] border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-6 mb-6">
              <h3 className="text-xl font-bold text-center text-black mb-3">
                🎯 Creating Your Quiz Room
              </h3>
              <p className="text-center text-gray-800 text-sm">
                As a host, you have full control over your quiz experience. Set
                it up exactly how you want!
              </p>
            </div>

            {/* Step-by-step for hosts */}
            <div className="grid gap-4">
              {/* Step 1 */}
              <div className="bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] overflow-hidden">
                <div className="bg-[#FFE066] border-b-2 border-black px-4 py-3">
                  <h4 className="text-base font-bold text-black flex items-center">
                    <span className="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">
                      1
                    </span>
                    Click "Create New Room"
                  </h4>
                </div>
                <div className="p-4">
                  <p className="text-gray-700 mb-3 text-sm">
                    Start your quiz journey by clicking the "Create New Room"
                    button on the main page.
                  </p>
                  <div className="bg-gray-50 border-2 border-gray-200 p-3 rounded">
                    <h5 className="font-bold text-black mb-2 text-sm">
                      You'll need to provide:
                    </h5>
                    <ul className="space-y-1 text-gray-700 text-xs">
                      <li>
                        • <strong>Host Name:</strong> Your display name for the
                        quiz
                      </li>
                      <li>
                        • <strong>Quiz Topic:</strong> The subject area (e.g.,
                        Science, History, Sports)
                      </li>
                      <li>
                        • <strong>Difficulty:</strong> Choose between Easy,
                        Medium, or Hard
                      </li>
                      <li>
                        • <strong>Number of Questions:</strong> Select 10, 15,
                        or 20 questions
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] overflow-hidden">
                <div className="bg-[#FFE066] border-b-2 border-black px-4 py-3">
                  <h4 className="text-base font-bold text-black flex items-center">
                    <span className="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">
                      2
                    </span>
                    Review & Customize Questions
                  </h4>
                </div>
                <div className="p-4">
                  <p className="text-gray-700 mb-3 text-sm">
                    After creating your room, you'll see the room page with your
                    unique room code and generated questions.
                  </p>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="bg-blue-50 border-2 border-blue-200 p-3 rounded">
                      <h5 className="font-bold text-blue-800 mb-1 text-sm">
                        ✏️ Edit Questions
                      </h5>
                      <p className="text-blue-700 text-xs">
                        Modify questions that don't meet your standards or fit
                        your theme.
                      </p>
                    </div>
                    <div className="bg-red-50 border-2 border-red-200 p-3 rounded">
                      <h5 className="font-bold text-red-800 mb-1 text-sm">
                        🗑️ Remove Questions
                      </h5>
                      <p className="text-red-700 text-xs">
                        Delete questions with wrong answers or that are out of
                        syllabus.
                      </p>
                    </div>
                    <div className="bg-green-50 border-2 border-green-200 p-3 rounded">
                      <h5 className="font-bold text-green-800 mb-1 text-sm">
                        ➕ Generate More
                      </h5>
                      <p className="text-green-700 text-xs">
                        Need more questions? Generate additional ones instantly.
                      </p>
                    </div>
                    <div className="bg-purple-50 border-2 border-purple-200 p-3 rounded">
                      <h5 className="font-bold text-purple-800 mb-1 text-sm">
                        👀 Preview Mode
                      </h5>
                      <p className="text-purple-700 text-xs">
                        Check how questions will appear to players.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] overflow-hidden">
                <div className="bg-[#FFE066] border-b-2 border-black px-4 py-3">
                  <h4 className="text-base font-bold text-black flex items-center">
                    <span className="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">
                      3
                    </span>
                    Start the Quiz!
                  </h4>
                </div>
                <div className="p-4">
                  <p className="text-gray-700 mb-3 text-sm">
                    Once you're satisfied with your questions and players have
                    joined, hit the big green "Start Quiz" button!
                  </p>
                  <div className="bg-green-100 border-2 border-green-300 p-3 rounded text-center">
                    <div className="bg-green-500 text-white px-6 py-2 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] inline-block font-bold text-sm">
                      🚀 START QUIZ
                    </div>
                    <p className="text-green-700 mt-2 text-xs">
                      This button will be your moment of glory!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Player Instructions */}
        {activeTab === "player" && (
          <div className="space-y-6">
            <div className="bg-[#A6FAFF] border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-6 mb-6">
              <h3 className="text-xl font-bold text-center text-black mb-3">
                🎮 Joining the Quiz Fun
              </h3>
              <p className="text-center text-gray-800 text-sm">
                Jump into any quiz with just a room code. It's that simple!
              </p>
            </div>

            {/* Step-by-step for players */}
            <div className="grid gap-4">
              {/* Step 1 */}
              <div className="bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] overflow-hidden">
                <div className="bg-[#A6FAFF] border-b-2 border-black px-4 py-3">
                  <h4 className="text-base font-bold text-black flex items-center">
                    <span className="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">
                      1
                    </span>
                    Enter Room Code
                  </h4>
                </div>
                <div className="p-4">
                  <p className="text-gray-700 mb-3 text-sm">
                    Get the room code from your host and enter it on the join
                    page. That's your ticket to the quiz!
                  </p>
                  <div className="bg-gray-50 border-2 border-gray-200 p-3 rounded text-center">
                    <div className="text-black bg-white border-2 border-black px-4 py-2 inline-block font-mono text-lg font-bold">
                      ABC123
                    </div>
                    <p className="text-gray-600 mt-2 text-xs">
                      Example room code format
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] overflow-hidden">
                <div className="bg-[#A6FAFF] border-b-2 border-black px-4 py-3">
                  <h4 className="text-base font-bold text-black flex items-center">
                    <span className="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">
                      2
                    </span>
                    Wait in the Lobby
                  </h4>
                </div>
                <div className="p-4">
                  <p className="text-gray-700 mb-3 text-sm">
                    Once you join, you'll enter the lobby with other players.
                    Chat, get excited, and wait for the host to start!
                  </p>
                  <div className="bg-blue-50 border-2 border-blue-200 p-3 rounded">
                    <h5 className="font-bold text-blue-800 mb-2 text-sm">
                      👥 In the Lobby:
                    </h5>
                    <ul className="space-y-1 text-blue-700 text-xs">
                      <li>• See other players who joined</li>
                      <li>• View quiz topic and difficulty</li>
                      <li>• Get ready for the challenge!</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] overflow-hidden">
                <div className="bg-[#A6FAFF] border-b-2 border-black px-4 py-3">
                  <h4 className="text-base font-bold text-black flex items-center">
                    <span className="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">
                      3
                    </span>
                    Play & Answer Questions
                  </h4>
                </div>
                <div className="p-4">
                  <p className="text-gray-700 mb-3 text-sm">
                    When the quiz starts, you'll see questions one by one.
                    Choose your answer and lock it in!
                  </p>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="bg-yellow-50 border-2 border-yellow-200 p-3 rounded">
                      <h5 className="font-bold text-yellow-800 mb-1 text-sm">
                        ⚡ Speed Matters!
                      </h5>
                      <p className="text-yellow-700 text-xs">
                        Answer quickly to earn more points. The faster you are,
                        the higher your score!
                      </p>
                    </div>
                    <div className="bg-green-50 border-2 border-green-200 p-3 rounded">
                      <h5 className="font-bold text-green-800 mb-1 text-sm">
                        🎯 Lock In Your Answer
                      </h5>
                      <p className="text-green-700 text-xs">
                        Once you select an answer, confirm it to secure your
                        points.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] overflow-hidden">
                <div className="bg-[#A6FAFF] border-b-2 border-black px-4 py-3">
                  <h4 className="text-base font-bold text-black flex items-center">
                    <span className="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">
                      4
                    </span>
                    See Final Results
                  </h4>
                </div>
                <div className="p-4">
                  <p className="text-gray-700 mb-3 text-sm">
                    After all questions are answered, view the podium to see how
                    you ranked against other players!
                  </p>
                  <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-300 p-3 rounded">
                    <h5 className="font-bold text-yellow-800 mb-1 text-sm">
                      🏆 Final Podium
                    </h5>
                    <p className="text-yellow-700 text-xs">
                      See your position, total score, and how many questions you
                      got right!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scoring System */}
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-6 mt-8">
          <h3 className="text-xl font-bold text-center text-black mb-4">
            🏆 How Scoring Works
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="bg-[#FFE066] border-2 border-black w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-lg">
                ⚡
              </div>
              <h4 className=" text-black font-bold text-sm mb-2">
                Speed Bonus
              </h4>
              <p className="text-gray-600 text-xs">
                The faster you answer, the more points you earn. Maximum 1000
                points per question!
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#A6FAFF] border-2 border-black w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-lg">
                📊
              </div>
              <h4 className=" text-black font-bold text-sm mb-2">
                Running Total
              </h4>
              <p className="text-gray-600 text-xs">
                Your score accumulates after each question, so you can track
                your progress!
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#FFB6C1] border-2 border-black w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-lg">
                🥇
              </div>
              <h4 className="font-bold text-sm mb-2 text-black">
                Final Ranking
              </h4>
              <p className="text-gray-600 text-xs">
                Player with the highest total score wins, with 2nd, 3rd, and 4th
                place following!
              </p>
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-6 mt-6">
          <h3 className="text-xl font-bold text-center text-black mb-4">
            💡 Pro Tips for Success
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="bg-white border border-gray-300 p-3 rounded">
              <h4 className="font-bold text-purple-800 mb-2 text-sm">
                🎯 For Hosts:
              </h4>
              <ul className="space-y-1 text-gray-700 text-xs">
                <li>• Review questions before starting</li>
                <li>• Choose topics your players know</li>
                <li>• Mix difficulty levels for engagement</li>
                <li>• Share your room code clearly</li>
              </ul>
            </div>
            <div className="bg-white border border-gray-300 p-3 rounded">
              <h4 className="font-bold text-pink-800 mb-2 text-sm">
                🚀 For Players:
              </h4>
              <ul className="space-y-1 text-gray-700 text-xs">
                <li>• Read questions carefully</li>
                <li>• Balance speed with accuracy</li>
                <li>• Don't overthink your answers</li>
                <li>• Have fun and learn something new!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-4 border-black bg-white py-4 mt-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-600 text-sm">
            © 2025 Quiz App. Ready to test your knowledge? Let's get quizzing!
            🎉
          </p>
        </div>
      </div>
    </div>
  );
}
