export default function ProfileTestPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Profile Test Page
        </h1>
        <p className="text-gray-600 mb-4">
          If you can see this, the profile routing is working.
        </p>
        <a 
          href="/profile" 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Go to Full Profile Page
        </a>
      </div>
    </div>
  );
}
