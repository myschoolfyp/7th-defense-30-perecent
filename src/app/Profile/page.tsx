"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function Profile() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [userType, setUserType] = useState<string | null>(null);
  const [userData, setUserData] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    contactNumber: string;
    profilePicture: string;
    userType: string;
  } | null>(null);
  
  const [studentsData, setStudentsData] = useState<any[]>([]);
  const [teachersData, setTeachersData] = useState<any[]>([]);
  const [adminsData, setAdminsData] = useState<any[]>([]);

 
  
  const [isFormVisible, setIsFormVisible] = useState(false);

// State for managing the delete pop-up, search term, and filtered users
const [isDeletePopupVisible, setIsDeletePopupVisible] = useState(false);
const [deleteSearchTerm, setDeleteSearchTerm] = useState("");
const [filteredDeleteUsers, setFilteredDeleteUsers] = useState(studentsData);  // Assuming studentsData is your user data


  const [newStudent, setNewStudent] = useState({
    id: "",
    name: "",
    class: "",
    contact: "",
    subjects: "",
  });

const [showPasswordPopup, setShowPasswordPopup] = useState(false);
const [password, setPassword] = useState("");


const [isUpdatePopupVisible, setIsUpdatePopupVisible] = useState(false);
const [updateSearchTerm, setUpdateSearchTerm] = useState("");
const [studentToUpdate, setStudentToUpdate] = useState<any>(null);

const handleUpdateSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
  const searchValue = event.target.value.toLowerCase();
  setUpdateSearchTerm(searchValue);

  if (searchValue === "") {
    setStudentToUpdate(null); // Clear details if the search is empty
  } else {
    const foundStudent = studentsData.find(
      (student) => String(student.id).toLowerCase() === searchValue
    );
    setStudentToUpdate(foundStudent || null); // Update state with found student
  }
};




  const [error, setError] = useState("");
  const [activeData, setActiveData] = useState<"students" | "teachers" | "admins" | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showProfile, setShowProfile] = useState(false);

  const [isTableVisible, setIsTableVisible] = useState<{ [key: string]: boolean }>({
    students: false,
    teachers: false,
    admins: false,
  });
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  useEffect(() => {
    const userTypeParam = searchParams.get("userType");
    const email = localStorage.getItem("email");

    if (userTypeParam && email) {
      setUserType(userTypeParam);
      fetchUserData(email, userTypeParam);
      fetchStudentsData();
     
    } else {
      setError("Login First to Enter Profile Dashboard");
    }
  }, [searchParams]);

  const fetchUserData = async (email: string, userType: string) => {
    try {
      const response = await fetch("/api/profile", {
        headers: { email, userType },
      });
      const data = await response.json();
      if (data.message) {
        setError(data.message);
      } else {
        setUserData(data);
      }
    } catch (err) {
      console.error("Error fetching user details:", err);
      setError("Failed to fetch user details");
    }
  };
  
  const fetchStudentsData = async () => {
    try {
      const response = await fetch("/api/students");
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to fetch students data");
      setStudentsData(data);
    } catch (err) {
      console.error(err);
      setError("An unknown error occurred");
    }
  };

 

 
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleAddStudent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newStudent),
      });
  
      const data = await response.json();
  
      // Check if the student already exists based on the flag sent from the backend
      const errorElement = document.getElementById("student-error");
      if (data.exists && errorElement) {  // Add null check for errorElement
        errorElement.innerText = "Student ID already exists";  // Inject error message into a specific div
        return;
      }
  
      // Clear any previous error
      if (errorElement) {  // Add null check for errorElement
        errorElement.innerText = "";  // Clear the error message if successful
      }
  
      // Proceed with adding the student to the list
      setStudentsData((prevStudents) => [...prevStudents, data.student]);
  
      alert("Student added successfully!");
      setNewStudent({ id: "", name: "", class: "", contact: "", subjects: "" });
      setIsFormVisible(false);
    } catch (err) {
      // Handle unexpected errors
      const errorElement = document.getElementById("student-error");
      if (errorElement) {
        errorElement.innerText = "An unknown error occurred while adding the student.";
      }
    }
  };

  const handleUpdateStudent = async () => {
    if (!studentToUpdate) return;
  
    try {
      const response = await fetch("/api/students", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: studentToUpdate.id, // Pass the primary key
          name: studentToUpdate.name,
          class: studentToUpdate.class,
          contact: studentToUpdate.contact,
          subjects: studentToUpdate.subjects.join(", "),
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        alert(data.message || "Failed to update the student.");
        return;
      }
  
      alert("Student updated successfully!");
  
      // Update the local state
      setStudentsData((prevStudents) =>
        prevStudents.map((student) =>
          student.id === studentToUpdate.id ? studentToUpdate : student
        )
      );
  
      // Close the popup and clear search
      setIsUpdatePopupVisible(false);
      setUpdateSearchTerm("");
      setStudentToUpdate(null);
    } catch (err) {
      console.error("Error updating student:", err);
      alert("An error occurred while updating the student.");
    }
  };
  
  
  
  
  

// Function to handle search in the delete pop-up by ID only
const handleDeleteSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
  const searchValue = event.target.value.toLowerCase();
  setDeleteSearchTerm(searchValue);

  // If searchValue is empty, clear the filtered users list
  if (searchValue === "") {
    setFilteredDeleteUsers([]); // Don't show any users when the search bar is empty
  } else {
    // Filter the users by 'id' only when search term is provided
    const filtered = studentsData.filter((student) =>
      student.id && String(student.id).toLowerCase().includes(searchValue)  // Ensure the 'id' matches the search
    );
    setFilteredDeleteUsers(filtered);  // Update the filtered user list
  }
};


// Function to open the delete pop-up
const handleDeleteAll = () => {
  setIsDeletePopupVisible(true);  // Show the delete pop-up
};
// Function to confirm the deletion
const confirmDelete = async () => {
  if (!deleteSearchTerm) {
    alert("Please enter a roll number to delete.");
    return;
  }

  // Find the student by roll number
  const studentToDelete = studentsData.find(
    (student) => String(student.id) === deleteSearchTerm
  );

  if (!studentToDelete) {
    alert("Student not found with this roll number.");
    return;
  }

  // Confirm deletion with full details
  const confirmMessage = `Are you sure you want to delete this student?` 
   
  
  if (!confirm(confirmMessage)) {
    return;
  }

  // Call the DELETE API
  try {
    const response = await fetch("/api/students", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: studentToDelete._id }),
    });

    const data = await response.json();

    if (response.ok) {
      alert(data.message || "Student deleted successfully!");
      setStudentsData((prev) =>
        prev.filter((student) => student._id !== studentToDelete._id)
      ); // Update the local state
      setDeleteSearchTerm(""); // Clear the search term
      setFilteredDeleteUsers([]); // Clear the filtered users
    } else {
      alert(data.message || "Failed to delete student.");
    }
  } catch (err) {
    console.error("Error deleting student:", err);
    alert("An error occurred while deleting the student.");
  }
};




const deleteStudent = async (id: string) => {
  if (!confirm("Are you sure you want to delete this student?")) {
    return;
  }

  try {
    const response = await fetch("/api/students", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    const data = await response.json();

    if (response.ok) {
      alert(data.message || "Student deleted successfully!");
      setStudentsData((prevStudents) =>
        prevStudents.filter((student) => student._id !== id)
      ); // Update the state to remove the deleted student
    } else {
      alert(data.message || "Failed to delete student.");
    }
  } catch (err) {
    console.error("Error deleting student:", err);
    alert("An error occurred while deleting the student.");
  }
};

  
  

  
  

    

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewStudent((prev) => ({ ...prev, [name]: value }));
  };
 
  

  const toggleTableVisibility = (type: "students" | "teachers" | "admins") => {
    setIsTableVisible((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const handleMenuClick = (dataType: "students" | "teachers" | "admins") => {
    setActiveData(dataType);
    setIsTableVisible({ students: false, teachers: false, admins: false });
    toggleTableVisibility(dataType);
  };

  const filteredStudents = studentsData.filter(
    (student) =>
      student && // Ensure student is not null or undefined
      student.id && // Ensure the student has an ID
      String(student.id).toLowerCase().includes(searchTerm.toLowerCase())  // Convert ID to a string before matching
  );
  



  const handleLogout = () => {
    localStorage.removeItem("email");
    router.push("/Login");
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!userData) {
    return <div>Loading...</div>;
  }

  

  return (
    <div className="flex bg-gray-50">
      {/* Navbar Menu */}
      
      {isMenuVisible && (
  <nav className="fixed left-0 top-0 h-full bg-white text-[#0F6466] shadow-lg w-64 flex flex-col justify-between">
    <div>
      {/* Menu Header */}
      <div className="p-4 text-center font-bold text-lg uppercase">
        Menu
        <hr className="border-t-2 border-[#0F6466] mt-2" />
      </div>

      {/* Menu Items */}
      <div className="flex flex-col mt-6 space-y-4 px-4">
        <button
          className="btn bg-[#0F6466] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#0D4B4C] transition duration-200 shadow-md"
          onClick={() => handleMenuClick("students")}
        >
          Students
        </button>
      </div>
    </div>

    {/* Logout Button */}
    <div className="p-4">
      <button
        className="btn bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition duration-200 shadow-md w-full"
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  </nav>
)}


      {/* Main Content */}
      <main className={`flex-grow p-6 ${isMenuVisible ? "ml-64" : "ml-0"}`}>
  <header className="flex justify-between items-center mb-6">
    <div className="flex items-center space-x-4">
      {/* Sidebar Toggle Button */}
      <button
        className={`bg-[#0F6466] text-white font-bold rounded-full shadow-md transition-all duration-200 ${
          isMenuVisible ? "text-sm p-1 ml-4" : "text-lg p-2"
        }`}
        onClick={() => setIsMenuVisible(!isMenuVisible)}
      >
        {isMenuVisible ? "←" : "➤"}
      </button>

      {/* Welcome Message */}
      <div className="text-left text-4xl font-bold uppercase text-[#0F6466]">
        Welcome, {userData.firstName} {userData.lastName}
      </div>
    </div>

  {/* Profile Buttons */}
  <div className="flex space-x-4">
    <button className="btn bg-[#0F6466] text-white font-semibold py-2 px-4 rounded hover:bg-[#0D4B4C] transition duration-200 shadow-lg" onClick={() => setShowProfile(prev => !prev)}>
      {showProfile ? "Hide Profile" : "Show Profile"}
    </button>
    <button 
  className="btn bg-[#0F6466] text-white font-semibold py-2 px-4 rounded hover:bg-[#0D4B4C] transition duration-200 shadow-lg" 
  onClick={() => router.push("/Editprofile")}>
  Edit Profile
</button>

  
  </div>

</header>

  
{showProfile && (
  <div className="mt-6 p-6 rounded-lg shadow-lg bg-gradient-to-br from-white to-[#e0f7fa]">
    <div className="flex flex-col items-center">
      {/* Profile Picture */}
      {userData?.profilePicture && (
        <img
          src={userData.profilePicture}
          alt="Profile"
          className="w-32 h-32 rounded-full shadow-md border-4 border-[#0F6466]"
        />
      )}
      <h2 className="text-3xl font-bold text-[#0F6466] mt-4">{userData?.firstName} {userData?.lastName}</h2>
      <p className="text-lg text-gray-700 mt-2">{userData?.email}</p>
    </div>

    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-4 bg-white rounded-lg shadow-md">
        <p className="text-gray-600">
          <span className="font-semibold text-[#0F6466]">Contact Number:</span> {userData?.contactNumber}
        </p>
      </div>
      <div className="p-4 bg-white rounded-lg shadow-md">
        <p className="text-gray-600">
          <span className="font-semibold text-[#0F6466]">User Type:</span> {userData?.userType}
        </p>
      </div>
    </div>
  </div>
)}




        {/* Dashboard Title */}
        {activeData === null && (
          <h1 className="text-center text-6xl font-bold mt-20 text-[#0F6466]">
            School Management Dashboard
          </h1>
        )}
  



 {/* Students List */}
{activeData === "students" && (
  <div className="mt-8">
    <h2 className="text-2xl font-semibold inline-block">
      Students List 
      <button onClick={() => toggleTableVisibility("students")} className="ml-2 text-xl float-right">
        {isTableVisible.students ? "▼" : "▲"}
      </button>
    </h2>
    {isTableVisible.students && (
      <>
        <div className="flex justify-between items-center mt-2">
          {/* Left side: Search and Add New Button */}
          <div className="flex items-center">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}  // This is your existing handler for the search
              placeholder="Search by ID..."
              className="border p-2 rounded transition-all duration-300 focus:w-64 w-32"
            />
            {/* Conditionally render Add New button */}
            {userType !== "Teacher" && (
              <button
                className="btn bg-[#0F6466] text-white font-semibold py-2 px-4 rounded hover:bg-[#0D4B4C] transition duration-200 shadow-lg ml-4"
                onClick={() => setIsFormVisible(true)}
              >
                Add New
              </button>
            )}
          </div>
          <div className="flex space-x-4 items-center justify-end">
            {/* Conditionally render Update button */}
            {userType !== "Teacher" && (
              <button
                className="btn bg-[#0F6466] text-white font-semibold py-2 px-6 rounded hover:bg-[#0D4B4C] transition duration-200 shadow-lg"
                onClick={() => setIsUpdatePopupVisible(true)}
              >
                Update
              </button>
            )}
            {/* Conditionally render Delete button */}
            {userType !== "Teacher" && (
              <button
                className="btn bg-red-600 text-white font-semibold py-2 px-6 rounded hover:bg-red-700 transition duration-200 shadow-lg"
                onClick={handleDeleteAll}
              >
                Delete
              </button>
            )}
          </div>
        </div>

                <table className="min-w-full mt-4 border-collapse">
                  <thead>
                    <tr className="bg-[#0F6466] text-white">
                      <th className="p-2 border text-center">ID</th>
                      <th className="p-2 border text-center">Name</th>
                      <th className="p-2 border text-center">Class</th>
                      <th className="p-2 border text-center">Contact</th>
                      <th className="p-2 border text-center">Subjects</th>
                   
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student._id} className="bg-white border-b hover:bg-gray-100">
                        <td className="p-2 border text-center">{student.id}</td>
                        <td className="p-2 border text-center">{student.name}</td>
                        <td className="p-2 border text-center">{student.class}</td>
                        <td className="p-2 border text-center">{student.contact}</td>
                        <td className="p-2 border text-center">{student.subjects.join(", ")}</td>
                       
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}
  {isUpdatePopupVisible && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-8 rounded-lg shadow-2xl w-[600px]">
      <h2 className="text-2xl font-bold text-center text-[#0F6466] mb-6">Update Student</h2>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          value={updateSearchTerm}
          onChange={handleUpdateSearch}
          placeholder="Search by ID..."
          className="border border-gray-300 rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-[#0F6466]"
        />
      </div>

      {/* Display Student Details for Update */}
      {studentToUpdate ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdateStudent();
            alert("Student updated successfully!");
            setIsUpdatePopupVisible(false); // Close the popup
          }}
        >
          <div className="grid grid-cols-1 gap-4">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Name</label>
              <input
                type="text"
                value={studentToUpdate.name}
                onChange={(e) =>
                  setStudentToUpdate((prev: any) => ({ ...prev, name: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#0F6466]"
              />
            </div>

            {/* Class Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Class</label>
              <input
                type="text"
                value={studentToUpdate.class}
                onChange={(e) =>
                  setStudentToUpdate((prev: any) => ({ ...prev, class: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#0F6466]"
              />
            </div>

            {/* Contact Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Contact</label>
              <input
                type="text"
                value={studentToUpdate.contact}
                onChange={(e) =>
                  setStudentToUpdate((prev: any) => ({ ...prev, contact: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#0F6466]"
              />
            </div>

            {/* Subjects Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Subjects</label>
              <input
                type="text"
                value={studentToUpdate.subjects.join(", ")}
                onChange={(e) =>
                  setStudentToUpdate((prev: any) => ({
                    ...prev,
                    subjects: e.target.value.split(",").map((s) => s.trim()),
                  }))
                }
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#0F6466]"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              className="btn bg-red-500 text-white py-2 px-6 rounded-md hover:bg-red-600 transition-all duration-200"
              onClick={() => setIsUpdatePopupVisible(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn bg-[#0F6466] text-white py-2 px-6 rounded-md hover:bg-[#0D4B4C] transition-all duration-200"
            >
              Confirm
            </button>
          </div>
        </form>
      ) : (
        <p className="text-center text-gray-500">No student found with this ID.</p>
      )}
    </div>
  </div>
)}


        


  {isFormVisible && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white w-96 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-[#0F6466]">Add New Student</h2>

      {/* Display the error message inside this div */}
      <div id="student-error" className="text-red-500 mb-4"></div>
      <form className="space-y-4" onSubmit={handleAddStudent}>
       
     

        <div>
          <label className="block text-gray-700 font-medium mb-1">ID</label>
          <input
            type="text"
            name="id"
            value={newStudent.id}
            onChange={handleChange}  // Bind input field to newStudent state
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#0F6466]"
            placeholder="Enter ID"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={newStudent.name}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#0F6466]"
            placeholder="Enter Name"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Class</label>
          <input
            type="text"
            name="class"
            value={newStudent.class}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#0F6466]"
            placeholder="Enter Class"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Contact</label>
          <input
            type="text"
            name="contact"
            value={newStudent.contact}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#0F6466]"
            placeholder="Enter Contact"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Subjects</label>
          <input
            type="text"
            name="subjects"
            value={newStudent.subjects}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#0F6466]"
            placeholder="Enter Subjects"
            required
          />
        </div>
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="btn bg-red-500 text-white font-semibold py-2 px-4 rounded hover:bg-red-600 transition duration-200"
            onClick={() => setIsFormVisible(false)} // Cancel button to close the form
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn bg-[#0F6466] text-white font-semibold py-2 px-4 rounded hover:bg-[#0D4B4C] transition duration-200"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  </div>
)}



    
  

{isDeletePopupVisible && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-2/3">
      <h2 className="text-2xl font-bold mb-4 text-[#0F6466]">Search User to Delete</h2>
      
      {/* Search Bar */}
      <input
        type="text"
        value={deleteSearchTerm}
        onChange={handleDeleteSearch}  // Filters by roll number
        placeholder="Search by ID..."  // Updated placeholder
        className="border p-2 rounded mb-4 w-full"
      />

      {/* Display filtered users */}
      <div className="space-y-2">
  {filteredDeleteUsers.length > 0 ? (
    filteredDeleteUsers.map((user, index) => (
      <div key={index} className="border-b border-gray-300 pb-2">
        <p className="font-semibold text-lg text-[#0F6466]">Roll Number: {user.id}</p>
        <p className="text-gray-600">Name: {user.name}</p>
        <p className="text-gray-600">Class: {user.class}</p>
        <p className="text-gray-600">Contact: {user.contact}</p>
        <p className="text-gray-600">Subjects: {user.subjects.join(", ")}</p>
      </div>
    ))
  ) : (
    <p className="text-gray-500">No users found with this roll number.</p>
  )}
</div>


      {/* Cancel and Confirm Buttons */}
      <div className="flex justify-end mt-4 space-x-4">
        <button
          className="btn bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition duration-200"
          onClick={() => setIsDeletePopupVisible(false)}  // Close the pop-up
        >
          Cancel
        </button>
        <button
          className="btn bg-[#0F6466] text-white py-2 px-4 rounded hover:bg-[#0D4B4C] transition duration-200"
          onClick={confirmDelete}  // Trigger the delete function
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
)}






      </main>
    </div>
  );
  
}