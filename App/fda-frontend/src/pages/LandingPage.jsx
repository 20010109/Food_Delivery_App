import { useNavigate } from "react-router-dom";

const AuthChoice = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded-2xl shadow-md text-center w-[350px]">
        
        <h1 className="text-3xl font-bold mb-4">Welcome</h1>
        <p className="text-gray-500 mb-6">
          Choose how you want to continue
        </p>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate("/login")}
            className="w-full py-3 rounded-full bg-red-600 text-white font-bold hover:bg-red-800"
          >
            Login
          </button>

          <button
            onClick={() => navigate("/signup")}
            className="w-full py-3 rounded-full border border-gray-300 font-bold hover:bg-gray-100"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthChoice;