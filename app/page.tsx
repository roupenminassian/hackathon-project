import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-green-50">
      {/* Header */}
      <header className="bg-green-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">EdTech Co.</h1>
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
        <h2 className="text-4xl font-bold mb-12 text-green-800 text-center">
          Elevate Your Learning Experience
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-2xl font-semibold mb-4 text-green-600">Chat</h3>
            <p className="text-gray-700">
              Connect with tutors and fellow students in real-time discussions.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-2xl font-semibold mb-4 text-green-600">
              Examination
            </h3>
            <p className="text-gray-700">
              Test your knowledge with our adaptive examination system.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-2xl font-semibold mb-4 text-green-600">
              Review
            </h3>
            <p className="text-gray-700">
              Analyze your performance and track your progress over time.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-green-800 text-white p-4 mt-8">
        <div className="container mx-auto text-center">
          <p>&copy; 2024 EdTech Co. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
