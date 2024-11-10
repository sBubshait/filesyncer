import 'tailwindcss/tailwind.css';

export default function Main() {
  return (
    <header className="min-h-screen bg-gray-900 text-white p-4">
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <h1 className="text-4xl font-bold text-white mb-4">
          Welcome to FileSyncer
        </h1>

        <p className="text-gray-300 text-lg max-w-2xl mb-12">
          Sync your folders across your devices through S3 buckets! Access your
          files anywhere, anytime with secure cloud storage.
        </p>

        <button
          type="button"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-xl rounded-lg transition-colors"
          onClick={() => console.log('Sign in clicked')}
        >
          Sign In
        </button>
      </div>
    </header>
  );
}