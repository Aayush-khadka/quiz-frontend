"use client";

import { useRouter } from "next/navigation";
import { Github, Linkedin, Heart } from "lucide-react";

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
            <h1 className="text-xl font-bold">About InQuizzIt</h1>
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-black mb-4">
            About InQuizzIt
          </h2>
          <p className="text-sm text-gray-700 max-w-2xl mx-auto">
            The AI-powered quiz platform that makes learning fun, competitive,
            and social.
          </p>
        </div>

        {/* Main Description Card */}
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6 mb-6">
          <h3 className="text-xl font-bold text-black mb-4">
            What is InQuizzIt?
          </h3>
          <p className="text-gray-700 text-sm leading-relaxed mb-4">
            InQuizzIt is a revolutionary quiz application that uses artificial
            intelligence to generate unlimited, high-quality questions on any
            topic you can imagine. Whether you're studying for exams, hosting a
            party game, or just having fun with friends, our platform creates
            the perfect quiz experience every time.
          </p>
          <p className="text-gray-700 text-sm leading-relaxed">
            Simply choose your topic and difficulty level, and our AI will
            instantly create engaging questions tailored to your needs. No more
            searching for quiz content or spending hours creating questions
            manually.
          </p>
        </div>

        {/* Key Features */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-black mb-4 text-center">
            Key Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-4">
              <div className="flex items-center mb-2">
                <div className="text-xl mr-3">🤖</div>
                <h4 className="font-bold text-base text-black">
                  AI-Generated Questions
                </h4>
              </div>
              <p className="text-gray-600 text-xs">
                Smart algorithms create unique, relevant questions for any topic
                and difficulty level.
              </p>
            </div>

            <div className="bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-4">
              <div className="flex items-center mb-2">
                <div className="text-xl mr-3">⚡</div>
                <h4 className="font-bold text-base text-black">
                  Real-Time Multiplayer
                </h4>
              </div>
              <p className="text-gray-600 text-xs">
                Compete with friends instantly in live quiz battles with dynamic
                scoring.
              </p>
            </div>

            <div className="bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-4">
              <div className="flex items-center mb-2">
                <div className="text-xl mr-3">🎯</div>
                <h4 className="font-bold text-base text-black">
                  Customizable Experience
                </h4>
              </div>
              <p className="text-gray-600 text-xs">
                Edit, remove, or regenerate questions to perfectly match your
                preferences.
              </p>
            </div>

            <div className="bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-4">
              <div className="flex items-center mb-2">
                <div className="text-xl mr-3">📱</div>
                <h4 className="font-bold text-base text-black">Easy Access</h4>
              </div>
              <p className="text-gray-600 text-xs">
                No downloads needed. Join any quiz instantly with just a room
                code.
              </p>
            </div>
          </div>
        </div>

        {/* Perfect For */}
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6 mb-6">
          <h3 className="text-xl font-bold text-black mb-4">Perfect For</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl mb-2">🎓</div>
              <h4 className="font-bold text-sm text-black mb-1">Students</h4>
              <p className="text-gray-600 text-xs">
                Study sessions and exam prep
              </p>
            </div>

            <div className="text-center">
              <div className="text-2xl mb-2">👩‍🏫</div>
              <h4 className="font-bold text-sm text-black mb-1">Teachers</h4>
              <p className="text-gray-600 text-xs">
                Classroom activities and assessments
              </p>
            </div>

            <div className="text-center">
              <div className="text-2xl mb-2">🎉</div>
              <h4 className="font-bold text-sm text-black mb-1">Parties</h4>
              <p className="text-gray-600 text-xs">
                Fun trivia nights with friends
              </p>
            </div>

            <div className="text-center">
              <div className="text-2xl mb-2">👨‍👩‍👧‍👦</div>
              <h4 className="font-bold text-sm text-black mb-1">Families</h4>
              <p className="text-gray-600 text-xs">
                Educational entertainment for all ages
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6 mb-6">
          <h3 className="text-xl font-bold text-black mb-4">How It Works</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                1
              </div>
              <div>
                <h4 className="font-bold text-sm text-black">
                  Create or Join a Room
                </h4>
                <p className="text-gray-600 text-xs">
                  Start a new quiz room or join an existing one with a room
                  code.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                2
              </div>
              <div>
                <h4 className="font-bold text-sm text-black">
                  Choose Your Topic
                </h4>
                <p className="text-gray-600 text-xs">
                  Select any topic and difficulty level - our AI will generate
                  perfect questions.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                3
              </div>
              <div>
                <h4 className="font-bold text-sm text-black">
                  Play and Compete
                </h4>
                <p className="text-gray-600 text-xs">
                  Answer questions quickly to earn points and climb the
                  leaderboard.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6">
            <h3 className="text-xl font-bold text-black mb-4">
              Ready to Start Quizzing?
            </h3>
            <p className="text-gray-700 text-sm mb-4">
              Join thousands of users who are making learning fun and
              competitive.
            </p>
            <button
              onClick={handleBack}
              className="h-12 border-2 border-black px-6 py-3 bg-[#B8FF9F] hover:bg-[#99fc77] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:bg-[#7df752] transition-all font-medium text-sm text-black"
            >
              Start Your First Quiz
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-4 border-black bg-white py-6 mt-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-600 text-sm mb-4 md:mb-0">
              © 2025 InQuizzIt. Ready to test your knowledge?
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600 flex items-center text-sm">
                Made with{" "}
                <Heart
                  className="w-4 h-4 text-yellow-500 mx-1"
                  fill="currentColor"
                />{" "}
                by
              </span>
              <a
                href="https://aayush-khadka.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-black hover:text-blue-600 transition-colors text-sm"
              >
                Aayush Khadka
              </a>
              <div className="flex space-x-2 ml-2">
                <a
                  href="https://github.com/aayush-khadka"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-black transition-colors"
                  title="GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>
                <a
                  href="https://www.linkedin.com/in/aayush-khadka-0513931b0/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                  title="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
