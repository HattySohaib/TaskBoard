import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-4xl font-bold text-gray-800 dark-mode:text-gray-100 mb-4">
        404
      </h1>
      <h2 className="text-2xl font-medium text-gray-700 dark-mode:text-gray-200 mb-6">
        Page Not Found
      </h2>
      <p className="text-gray-600 dark-mode:text-gray-400 mb-6 max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;
