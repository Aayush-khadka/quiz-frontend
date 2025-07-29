"use client";

import { useRouter } from "next/navigation";

export default function About() {
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
            <h1 className="text-xl font-bold">About Us</h1>
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
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-black mb-4">
            About the Quiz App
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Welcome to the Quiz App! Our app allows you to create and join
            real-time quizzes with friends and other players. Whether you're
            looking to test your knowledge or just have some fun, this app is
            perfect for you!
          </p>
        </div>

        {/* Our Mission Section */}
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-6 mb-8">
          <h3 className="text-2xl font-bold text-center text-black mb-4">
            Our Mission
          </h3>
          <p className="text-gray-600 text-base">
            Our mission is simple: to bring people together through knowledge
            and fun! We aim to create a platform where users can enjoy quizzes,
            challenge their friends, and compete in a friendly environment.
            Whether it's a casual game or a competitive tournament, we want to
            make learning fun for everyone!
          </p>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <div className="bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-6 text-center hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all">
            <div className="text-2xl mb-3">🎮</div>
            <h4 className="font-bold text-base mb-2 text-black">
              Engaging Quizzes
            </h4>
            <p className="text-gray-600 text-sm">
              Participate in exciting quizzes on a variety of topics and
              showcase your knowledge.
            </p>
          </div>

          <div className="bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-6 text-center hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all">
            <div className="text-2xl mb-3">👥</div>
            <h4 className="font-bold text-base mb-2 text-black">
              Multiplayer Mode
            </h4>
            <p className="text-gray-600 text-sm">
              Join with your friends or other players in real-time multiplayer
              quiz battles.
            </p>
          </div>

          <div className="bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-6 text-center hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all">
            <div className="text-2xl mb-3">🏆</div>
            <h4 className="font-bold text-base mb-2 text-black">
              Leaderboards
            </h4>
            <p className="text-gray-600 text-sm">
              Compete against others and track your progress on the leaderboard.
            </p>
          </div>

          <div className="bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-6 text-center hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all">
            <div className="text-2xl mb-3">🔒</div>
            <h4 className="font-bold text-base mb-2 text-black">
              Secure and Safe
            </h4>
            <p className="text-gray-600 text-sm">
              We prioritize your privacy and safety, making sure your data is
              secure at all times.
            </p>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-6 mt-12">
          <h3 className="text-2xl font-bold text-center text-black mb-4">
            Contact Us
          </h3>
          <p className="text-gray-600 text-center">
            Have questions or feedback? Reach out to us at{" "}
            <a
              href="mailto:support@quizapp.com"
              className="text-blue-500 hover:underline"
            >
              support@quizapp.com
            </a>
            .
          </p>
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
