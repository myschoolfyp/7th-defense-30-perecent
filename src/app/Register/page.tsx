"use client";
import { useState } from "react";
import { UserCircle } from "lucide-react";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [userType, setUserType] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);

  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicture(reader.result as string);
      setProfilePicturePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Profile picture:", profilePicture); // Debug log
    console.log("Sending contactNumber:", contactNumber);


    if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
    }

    setError(null);

    try {
        const formData = {
            firstName,
            lastName,
            email,
            password,
            userType,
            contactNumber,
            employeeCode,
            adminCode,
            profilePicture, // ✅ Ensure profile picture is included
        };

        console.log("Sending data:", formData); // Debug log before sending request

        const response = await fetch("/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        });

        console.log("Server response:", response); // Debug log after request

        if (!response.ok) {
            const errorData = await response.json(); // Try to get error message
            throw new Error(errorData.message || "Failed to register user.");
        }

        alert("Registration successful!");

        // ✅ Reset form fields after successful registration
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setUserType("");
        setContactNumber("");
        setEmployeeCode("");
        setAdminCode("");
        setProfilePicture(null);
        setProfilePicturePreview(null);

    } catch (error) {
        console.error("Registration error:", error);
        setError("User Already Exists or another issue occurred.");
    }
};


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // Get the selected file
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setProfilePicture(reader.result as string); // Convert to Base64 and store
        };
        reader.readAsDataURL(file);
    }
};



return (
  <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
    <div className="bg-white p-5 rounded-lg shadow-lg w-full max-w-[550px] border-2 border-[#0F6466]">
      <h2 className="text-2xl font-bold text-center text-[#0F6466] mb-3">Register</h2>

      <div className="flex flex-col items-center mb-3">
        <label htmlFor="profilePicture" className="cursor-pointer">
          {profilePicturePreview ? (
            <img
              src={profilePicturePreview}
              alt="Profile Preview"
              className="w-20 h-20 object-cover rounded-full border-2 border-gray-300"
            />
          ) : (
            <UserCircle size={70} className="text-gray-400" />
          )}
        </label>
        <input
          type="file"
          id="profilePicture"
          accept="image/*"
          onChange={handleProfilePictureUpload}
          className="hidden"
        />
      </div>

      {error && <p className="text-red-500 text-center text-sm mb-3">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            id="firstName"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-base"
          />
          <input
            type="text"
            id="lastName"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-base"
          />
        </div>

        <input
          type="email"
          id="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-base"
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            type="password"
            id="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-base"
          />
          <input
            type="password"
            id="confirmPassword"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-base"
          />
        </div>

        <select
          id="userType"
          value={userType}
          onChange={(e) => setUserType(e.target.value)}
          className="block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-base"
          required
        >
          <option value="" disabled>Select User Type</option>
          <option value="Teacher">Teacher</option>
          <option value="Admin">Admin</option>
        </select>

        <input
          type="text"
          id="contactNumber"
          placeholder="Contact Number"
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
          required
          className="block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-base"
        />

        {userType === "Teacher" && (
          <input
            type="text"
            id="employeeCode"
            placeholder="Employee Code"
            value={employeeCode}
            onChange={(e) => setEmployeeCode(e.target.value)}
            required
            className="block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-base"
          />
        )}

        {userType === "Admin" && (
          <input
            type="text"
            id="adminCode"
            placeholder="Admin Code"
            value={adminCode}
            onChange={(e) => setAdminCode(e.target.value)}
            required
            className="block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-base"
          />
        )}

        <button
          type="submit"
          className="w-full py-2 bg-[#0F6466] text-white rounded-md shadow hover:bg-[#2C3532] transition-colors duration-200 text-base font-semibold"
        >
          Register
        </button>

        <div className="text-center mt-3 text-base">
          Already have an account?{" "}
          <a href="Login#" className="text-[#0F6466]">Login</a>
        </div>
      </form>
    </div>
  </div>
);


}
