import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-green-50">
      {/* Header */}
      <header className="bg-green-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <span className="mr-2">🌱</span> Ella.io
          </h1>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link
                  href="/chat"
                  className="hover:text-green-200 transition-colors"
                >
                  Chat
                </Link>
              </li>
              <li>
                <Link
                  href="/examination"
                  className="hover:text-green-200 transition-colors"
                >
                  Examination
                </Link>
              </li>
              <li>
                <Link
                  href="/review"
                  className="hover:text-green-200 transition-colors"
                >
                  Review
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto p-8 max-w-5xl">
        <h2 className="text-4xl font-bold mb-6 text-green-800 text-center">
          Grow Your Understanding with Ella.io
        </h2>
        <p className="text-xl text-center mb-12 text-gray-700">
          Ella.io revolutionizes learning by challenging students to explain
          concepts, fostering deeper understanding and critical thinking skills.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-2xl font-semibold mb-4 text-green-600">Chat</h3>
            <p className="text-gray-700">
              Engage in conversations where you explain concepts to our AI,
              enhancing your comprehension and communication skills.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-2xl font-semibold mb-4 text-green-600">
              Examination
            </h3>
            <p className="text-gray-700">
              Test your ability to articulate your knowledge clearly and
              effectively through our innovative assessment system.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-2xl font-semibold mb-4 text-green-600">
              Review
            </h3>
            <p className="text-gray-700">
              Analyze your explanations, track your progress, and identify areas
              for improvement in your understanding and expression.
            </p>
          </div>
        </div>

        <div className="mt-12 bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-2xl font-semibold mb-4 text-green-600">
            Why Ella.io?
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>
              Focus on explaining concepts rather than just reciting information
            </li>
            <li>Develop deeper understanding through active engagement</li>
            <li>Improve critical thinking and communication skills</li>
            <li>AI-powered assessment of your explanations</li>
            <li>Advanced plagiarism detection to ensure originality</li>
          </ul>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-green-800 text-white p-4 mt-8">
        <div className="container mx-auto text-center">
          <p>&copy; 2024 Ella.io. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
