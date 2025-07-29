"use client";

import { useRouter } from "next/navigation";

export default function HowToPlay() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b-4 border-black px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="bg-black text-white px-4 py-2 border-2 border-black">
            <h1 className="text-xl font-bold">How to Play Quiz</h1>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleBack}
              className="h-8 border-2 border-black px-4 py-2 bg-[#A6FAFF] hover:bg-[#79F7FF] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:bg-[#00E1EF] text-sm font-medium text-black transition-all flex items-center justify-center"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* YouTube Video */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-black mb-6">
            Watch the tutorial to get started!
          </h2>
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ" // Replace with actual tutorial video link
              title="How to Play Quiz Tutorial"
              frameBorder="0"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>

        {/* Text Description */}
        <div className="mb-12 text-center">
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Welcome to the Quiz App! Here’s how you can start playing and enjoy
            the game with your friends:
          </p>
        </div>

        {/* Step-by-Step Image Guide */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {/* Step 1 */}
          <div className="bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-4 text-center hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all">
            <div className="text-2xl mb-3">📲</div>
            <h4 className="font-bold text-base mb-2 text-black">
              Step 1: Join a Room
            </h4>
            <p className="text-gray-600 text-sm">
              Enter your name and room code to join an existing quiz room.
            </p>
            <img
              src="https://via.placeholder.com/400x250"
              alt="Join a Room"
              className="mt-4 w-full h-auto rounded-md"
            />
          </div>

          {/* Step 2 */}
          <div className="bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-4 text-center hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all">
            <div className="text-2xl mb-3">👥</div>
            <h4 className="font-bold text-base mb-2 text-black">
              Step 2: Wait for Players
            </h4>
            <p className="text-gray-600 text-sm">
              Wait for other players to join the room and be ready for the quiz.
            </p>
            <img
              src="https://via.placeholder.com/400x250"
              alt="Wait for Players"
              className="mt-4 w-full h-auto rounded-md"
            />
          </div>

          {/* Step 3 */}
          <div className="bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-4 text-center hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all">
            <div className="text-2xl mb-3">⏳</div>
            <h4 className="font-bold text-base mb-2 text-black">
              Step 3: Start the Quiz
            </h4>
            <p className="text-gray-600 text-sm">
              Once everyone is ready, the quiz will start automatically, and
              questions will be sent to your screen.
            </p>
            <img
              src="https://via.placeholder.com/400x250"
              alt="Start the Quiz"
              className="mt-4 w-full h-auto rounded-md"
            />
          </div>

          {/* Step 4 */}
          <div className="bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-4 text-center hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all">
            <div className="text-2xl mb-3">🏆</div>
            <h4 className="font-bold text-base mb-2 text-black">
              Step 4: Compete and Win
            </h4>
            <p className="text-gray-600 text-sm">
              Answer questions correctly and compete with others to get the
              highest score!
            </p>
            <img
              src="https://via.placeholder.com/400x250"
              alt="Compete and Win"
              className="mt-4 w-full h-auto rounded-md"
            />
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
