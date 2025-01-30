"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type UserData = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  contactNumber: string;
  profilePicture: string | null; // Include profile picture type
};

export default function EditProfilePage() {
  const [userType, setUserType] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState("");
  const [isEditPopupVisible, setEditPopupVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!userType || !email || !password) {
      setError("All fields are required.");
      return;
    }

    try {
      const response = await fetch("/api/editprofile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userType, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Something went wrong.");
        return;
      }

      setUserData(data.user as UserData);
      setEditPopupVisible(true);
      setError("");
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  const handleUpdate = async () => {
    if (
      !userData ||
      !userData.firstName ||
      !userData.lastName ||
      !userData.password ||
      !userData.contactNumber
    ) {
      setError("Please fill all fields before submitting.");
      return;
    }
    try {
      const response = await fetch("/api/editprofile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: userData.id,
          email: userData.email,
          userType,
          firstName: userData.firstName,
          lastName: userData.lastName,
          password: userData.password,
          contactNumber: userData.contactNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to update user details.");
        return;
      }

      if (data.message === "No changes were made") {
        setError("No updates detected.");
      } else {
        setEditPopupVisible(false);
        setSuccess(true);
        setError("");
      }
    } catch (err) {
      console.error("Error in handleUpdate:", err);
      setError("An error occurred while updating data.");
    }
  };

  const isFieldEmpty = (field: string) => !field.trim();

  useEffect(() => {
    const fetchProfilePicture = async () => {
      if (!userData) return;
      try {
        const response = await fetch("/api/editprofile", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userData.email, userType }),
        });
        const data = await response.json();
        if (response.ok) {
          setProfilePicture(data.profilePicture);
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error("Error fetching profile picture:", error);
      }
    };
    fetchProfilePicture();
  }, [userData]);
  const handleProfilePictureUpdate = async (newPicture: string) => {
    const response = await fetch("/api/editprofile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: userData?.id,
        userType,
        profilePicture: newPicture,
      }),
    });
    const data = await response.json();
    if (response.ok) {
      setProfilePicture(newPicture);
      setSuccess(true);
    } else {
      setError(data.message || "Failed to update profile picture.");
    }
  };

  const handleProfilePictureRemove = async () => {
    const response = await fetch("/api/editprofile", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: userData?.id,
        userType,
      }),
    });
    const data = await response.json();
    if (response.ok) {
      setProfilePicture(null);
      setSuccess(true);
    } else {
      setError(data.message || "Failed to remove profile picture.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#e0f7fa] to-[#e0f2f1]">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-xl w-full">
        <h1 className="text-3xl font-bold text-[#00695c] text-center mb-8">
          Confirm Your Identity
        </h1>
        {error && (
          <p className="text-red-500 text-center bg-red-50 border border-red-400 p-2 rounded-lg mb-4">
            {error}
          </p>
        )}
        {profilePicture && (
          <div className="mb-4">
            <img src={profilePicture} alt="Profile" className="profile-picture" />
            <div className="flex space-x-2 mt-2">
              <button
                className="bg-[#004d40] text-white font-semibold py-2 px-4 rounded-lg"
                onClick={() => handleProfilePictureUpdate("new_picture_data")} // Replace with actual file upload logic
              >
                Update Profile Picture
              </button>
              <button
                className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg"
                onClick={handleProfilePictureRemove}
              >
                Remove Profile Picture
              </button>
            </div>
          </div>
        )}
        <div className="space-y-6">
          <div>
            <label className="block text-lg font-medium mb-2 text-[#004d40]">
              Select Type
            </label>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className={`w-full border-gray-300 rounded-lg shadow-sm p-3 focus:ring-[#004d40] focus:border-[#004d40] ${
                isFieldEmpty(userType) && error ? "border-red-500" : ""
              }`}
            >
              <option value="">-- Select --</option>
              <option value="Admin">Admin</option>
              <option value="Teacher">Teacher</option>
            </select>
          </div>
          <div>
            <label className="block text-lg font-medium mb-2 text-[#004d40]">
              Enter Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className={`w-full border-gray-300 rounded-lg shadow-sm p-3 focus:ring-[#004d40] focus:border-[#004d40] ${
                isFieldEmpty(email) && error ? "border-red-500" : ""
              }`}
            />
          </div>
          <div>
            <label className="block text-lg font-medium mb-2 text-[#004d40]">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className={`w-full border-gray-300 rounded-lg shadow-sm p-3 focus:ring-[#004d40] focus:border-[#004d40] ${
                isFieldEmpty(password) && error ? "border-red-500" : ""
              }`}
            />
          </div>
        </div>
        <div className="flex justify-end mt-8 space-x-4">
          <button
            className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition duration-200 shadow-md"
            onClick={() => router.push("/Profile")}
          >
            Cancel
          </button>
          <button
            className="bg-[#004d40] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#00332e] transition duration-200 shadow-md"
            onClick={handleSubmit}
          >
            Edit
          </button>
        </div>
      </div>

      {isEditPopupVisible && userData && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl w-full">
            <h2 className="text-xl font-bold text-center text-[#00695c] mb-6">
              Edit User Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-lg font-medium mb-2 text-[#004d40]">
                  {userType === "Admin" ? "Admin Code" : "Employee ID"}
                </label>
                <p className="border p-3 rounded-lg bg-gray-100 text-gray-700">
                  {userData?.id || "Not Available"}
                </p>
              </div>
              <div>
                <label className="block text-lg font-medium mb-2 text-[#004d40]">
                  Email
                </label>
                <p className="border p-3 rounded-lg bg-gray-100 text-gray-700">
                  {userData.email}
                </p>
              </div>
              <div>
                <label className="block text-lg font-medium mb-2 text-[#004d40]">
                  First Name
                </label>
                <input
                  type="text"
                  value={userData.firstName}
                  onChange={(e) =>
                    setUserData({ ...userData, firstName: e.target.value })
                  }
                  className="w-full border-gray-300 rounded-lg shadow-sm p-3 focus:ring-[#004d40] focus:border-[#004d40]"
                />
              </div>
              <div>
                <label className="block text-lg font-medium mb-2 text-[#004d40]">
                  Last Name
                </label>
                <input
                  type="text"
                  value={userData.lastName}
                  onChange={(e) =>
                    setUserData({ ...userData, lastName: e.target.value })
                  }
                  className="w-full border-gray-300 rounded-lg shadow-sm p-3 focus:ring-[#004d40] focus:border-[#004d40]"
                />
              </div>
              <div>
                <label className="block text-lg font-medium mb-2 text-[#004d40]">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={userData.password}
                    onChange={(e) =>
                      setUserData({ ...userData, password: e.target.value })
                    }
                    className="w-full border-gray-300 rounded-lg shadow-sm p-3 focus:ring-[#004d40] focus:border-[#004d40]"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-[#004d40] font-semibold"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-lg font-medium mb-2 text-[#004d40]">
                  Contact Number
                </label>
                <input
                  type="text"
                  value={userData.contactNumber}
                  onChange={(e) =>
                    setUserData({ ...userData, contactNumber: e.target.value })
                  }
                  className="w-full border-gray-300 rounded-lg shadow-sm p-3 focus:ring-[#004d40] focus:border-[#004d40]"
                />
              </div>
            </div>
            <div className="flex justify-end mt-6 space-x-4">
              <button
                className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition duration-200 shadow-md"
                onClick={() => setEditPopupVisible(false)}
              >
                Cancel
              </button>
              <button
                className="bg-[#004d40] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#00332e] transition duration-200 shadow-md"
                onClick={() => {
                  if (confirm("Are you sure you want to make changes?"))
                    handleUpdate();
                }}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              Update Successful!
            </h2>
            <p className="text-gray-700 mb-6">
              Your profile has been updated successfully.
            </p>
            <button
              className="bg-[#004d40] text-white font-semibold py-2 px-6 rounded-lg hover:bg-[#00332e] transition duration-200"
              onClick={() => router.push("/Login")}
            >
              Go to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}