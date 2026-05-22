import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API = "http://localhost:5000";

export default function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const [authData, setAuthData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [workouts, setWorkouts] = useState([]);

  const [formData, setFormData] = useState({
    workout: "",
    duration: "",
    date: "",
  });

  const [waterAmount, setWaterAmount] = useState("");
  const [waterIntake, setWaterIntake] = useState(0);
  const [waterList, setWaterList] = useState([]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchWorkouts();
      fetchWater();
    }
  }, [isLoggedIn]);

  // FETCH WORKOUTS
  const fetchWorkouts = async () => {
    try {
      const response = await axios.get(`${API}/workouts`);
      setWorkouts(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  // FETCH WATER
  const fetchWater = async () => {
    try {
      const response = await axios.get(`${API}/water`);
      setWaterIntake(response.data.total || 0);
      
      const listResponse = await axios.get(`${API}/water/all`);
      setWaterList(listResponse.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  // AUTH INPUTS
  const handleAuthChange = (e) => {
    setAuthData({
      ...authData,
      [e.target.name]: e.target.value,
    });
  };

  // WORKOUT INPUTS
  const handleWorkoutChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // REGISTER
  const handleRegister = async (e) => {
    e.preventDefault();

    try {

      await axios.post(
        `${API}/register`,
        authData
      );

      alert("Registration Successful");

      setIsRegister(false);

    } catch (error) {

      alert("Registration Failed");
    }
  };

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();

    try {

      await axios.post(
        `${API}/login`,
        authData
      );

      setIsLoggedIn(true);

    } catch (error) {

      alert("Invalid Credentials");
    }
  };

  // ADD WORKOUT
  const handleWorkoutSubmit = async (e) => {

    e.preventDefault();

    try {

      if (
        !formData.workout ||
        !formData.duration ||
        !formData.date
      ) {
        toast.error("Please fill all fields");
        return;
      }

      await axios.post(
        `${API}/workouts`,
        formData
      );

      fetchWorkouts();

      setFormData({
        workout: "",
        duration: "",
        date: "",
      });

      toast.success("Workout added successfully");

    } catch (error) {

      console.log(error);

      alert("Failed to add workout");
    }
  };

  // WATER SUBMIT
  const handleWaterSubmit = async () => {

    try {

      await axios.post(`${API}/water`, {
        amount: waterAmount,
      });

      fetchWater();

      setWaterAmount("");

      alert("Water intake saved");

    } catch (error) {

      console.log(error);

      alert("Failed to save water intake");
    }
  };

  // DELETE WATER
  const handleDeleteWater = async (id) => {
    try {
      await axios.delete(`${API}/water/${id}`);
      fetchWater();
      toast.success("Water deleted successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete water");
    }
  };

  // TOTAL CALORIES
  // Removed - calories tracking no longer needed

  // LOGIN PAGE
  if (!isLoggedIn) {

    return (

      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">

        <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-md">

          <h1 className="text-3xl font-bold text-center mb-2">
            Cloud Fitness Tracker
          </h1>

          <p className="text-gray-500 text-center mb-8">
            {isRegister
              ? "Create your account"
              : "Login to continue"}
          </p>

          <form
            onSubmit={
              isRegister
                ? handleRegister
                : handleLogin
            }
            className="space-y-4"
          >

            {isRegister && (

              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={authData.name}
                onChange={handleAuthChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3"
              />

            )}

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={authData.email}
              onChange={handleAuthChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-3"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={authData.password}
              onChange={handleAuthChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-3"
            />

            <button className="w-full bg-black text-white py-3 rounded-2xl font-semibold">
              {isRegister
                ? "Register"
                : "Login"}
            </button>

          </form>

          <p className="text-center mt-6 text-gray-500">

            {isRegister
              ? "Already have an account?"
              : "Don't have an account?"}

          </p>

          <button
            onClick={() =>
              setIsRegister(!isRegister)
            }
            className="w-full mt-3 border border-black py-3 rounded-2xl font-semibold"
          >
            {isRegister
              ? "Back to Login"
              : "Create Account"}
          </button>

        </div>
      </div>
    );
  }

  // DASHBOARD
  return (

    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="flex justify-between mb-8">

          <div>

            <h1 className="text-4xl font-bold">
              Fitness Dashboard
            </h1>

            <p className="text-gray-500 mt-2">
              Monitor your health and progress.
            </p>

          </div>

          <button
            onClick={() => setIsLoggedIn(false)}
            className="bg-black text-white px-5 py-3 rounded-2xl"
          >
            Logout
          </button>

        </div>

        {/* STATS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

          <div className="bg-white p-6 rounded-3xl shadow-lg">

            <h2 className="text-gray-500">
              Total Workouts
            </h2>

            <p className="text-4xl font-bold mt-4">
              {workouts.length}
            </p>

          </div>

          <div className="bg-white p-6 rounded-3xl shadow-lg">

            <h2 className="text-gray-500">
              Water Intake
            </h2>

            <p className="text-4xl font-bold mt-4">
              {waterIntake}L
            </p>

          </div>

        </div>

        {/* IMAGE GALLERY */}

        <div className="mb-10">

          <h2 className="text-2xl font-bold mb-6">Fitness Inspiration</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow">

              <img src="/image1.jpg" alt="Fitness Inspiration 1" className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300" />

              <div className="p-4">

                <h3 className="font-bold text-lg">Get Fit</h3>

                <p className="text-gray-600 text-sm">Stay motivated and reach your fitness goals</p>

              </div>

            </div>

            <div className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow">

              <img src="/image2.jpg" alt="Fitness Inspiration 2" className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300" />

              <div className="p-4">

                <h3 className="font-bold text-lg">Stay Healthy</h3>

                <p className="text-gray-600 text-sm">Track your progress and celebrate your wins</p>

              </div>

            </div>

          </div>

        </div>

        {/* MAIN SECTION */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ADD WORKOUT */}

          <div className="bg-white rounded-3xl shadow-lg p-6">

            <h2 className="text-2xl font-bold mb-6">
              Add Workout
            </h2>

            <form
              onSubmit={handleWorkoutSubmit}
              className="space-y-4"
            >

              <input
                type="text"
                name="workout"
                placeholder="Workout Name"
                value={formData.workout}
                onChange={handleWorkoutChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3"
              />

              <input
                type="number"
                name="duration"
                placeholder="Duration"
                value={formData.duration}
                onChange={handleWorkoutChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3"
              />

              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleWorkoutChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3"
              />

              <button className="w-full bg-black text-white py-3 rounded-2xl">
                Add Workout
              </button>

            </form>

          </div>

          {/* WORKOUT TABLE */}

          <div className="lg:col-span-2 bg-white rounded-3xl shadow-lg p-6">

            <h2 className="text-2xl font-bold mb-6">
              Workout History
            </h2>

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="border-b border-gray-200 text-left">

                    <th className="pb-4">Workout</th>
                    <th className="pb-4">Duration</th>
                    <th className="pb-4">Date</th>

                  </tr>

                </thead>

                <tbody>

                  {workouts.map((workout) => (

                    <tr
                      key={workout.id}
                      className="border-b border-gray-100"
                    >

                      <td className="py-4">
                        {workout.workout}
                      </td>

                      <td>
                        {workout.duration} mins
                      </td>

                      <td>
                        {workout.date}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

        </div>

        {/* WATER SECTION */}

        <div className="mt-10 bg-white rounded-3xl shadow-lg p-6">

          <h3 className="text-lg font-bold mb-4">Water Intake</h3>

          <div className="flex gap-4 mb-6">

            <input
              type="number"
              placeholder="Enter water intake"
              value={waterAmount}
              onChange={(e) =>
                setWaterAmount(e.target.value)
              }
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3"
            />

            <button
              onClick={handleWaterSubmit}
              className="bg-black text-white px-6 py-3 rounded-2xl hover:bg-gray-800"
            >
              Save Water
            </button>

            <ToastContainer
              position="top-right"
                autoClose={3000}
                theme="colored"
            />

          </div>

          {/* WATER LIST */}

          <div className="border-t pt-4">

            <h4 className="font-semibold mb-3">Recent Water Intake</h4>

            <div className="space-y-2 max-h-64 overflow-y-auto">

              {waterList.length > 0 ? (

                waterList.map((record) => (

                  <div key={record.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl hover:bg-gray-100">

                    <div className="flex-1">

                      <p className="font-semibold">{record.amount}L</p>

                      <p className="text-sm text-gray-500">{new Date(record.date).toLocaleDateString()}</p>

                    </div>

                    <div className="flex gap-2">

                      <button
                        onClick={() => handleDeleteWater(record.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                ))

              ) : (

                <p className="text-gray-500 text-center py-4">No water records yet</p>

              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}