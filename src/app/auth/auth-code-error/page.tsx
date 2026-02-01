export default function AuthCodeError() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <h1 className="text-4xl font-bold text-red-500 mb-4">Authentication Error</h1>
            <p className="text-lg text-gray-700">There was an error authenticating your request.</p>
            <a href="/login" className="mt-4 text-blue-500 hover:underline">
                Go back to Login
            </a>
        </div>
    )
}
