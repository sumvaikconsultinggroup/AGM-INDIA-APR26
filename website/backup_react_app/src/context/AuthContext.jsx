import { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../config/firebase.js";
import { signOut, onAuthStateChanged, getRedirectResult } from "firebase/auth";
import { toast } from "react-hot-toast";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
        };

        setUser(userData);
        setIsAuthenticated(true);

        saveUserData(userData);

      } else {
        // User is signed out
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem("user");
      }
      setLoading(false);
    });

    // Check for redirect result on app load
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          toast.success("Successfully signed in!");
        }
      } catch (error) {
        console.error("Redirect sign-in error:", error);
        handleAuthError(error);
      }
    };

    handleRedirectResult();

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const generateUsername = (email, displayName, uid) => {
    if (email) {
      // Extract username from email (before @)
      return email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    }
    if (displayName) {
      // Convert display name to username format
      return displayName.toLowerCase().replace(/[^a-z0-9]/g, '');
    }
    // Fallback to uid-based username - now using the uid parameter
    return `user_${uid.substring(0, 8)}`;
  };

  const saveUserData = async (userData) => {
    try {
      // Create FormData for the API call
      const formData = new FormData();
      formData.append("authMethod", "oauth");
      formData.append("uid", userData.uid);

      // Pass userData.uid as the third parameter
      const username = generateUsername(userData.email, userData.displayName, userData.uid);

      formData.append("name", userData.displayName || userData.email || "Anonymous");
      formData.append("email", userData.email);
      formData.append("username", username); // Add username field
      formData.append("picture", userData.photoURL || "");

      console.log("Saving user data to backend:", {
        authMethod: "oauth",
        uid: userData.uid,
        name: userData.displayName || userData.email || "Anonymous",
        email: userData.email,
        username: username,
        picture: userData.photoURL || ""
      });

      const response = await axios.post(import.meta.env.VITE_APP_API_URL + "/api/users", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        // Merge backend data with userData
        const dbUser = response.data.data;
        const mergedUser = {
          ...userData,
          ...dbUser,
          username: dbUser.username || username,
          picture: dbUser.profile?.profileImage || userData.photoURL,
          profile: dbUser.profile || {},
          role: dbUser.role || "user",
        };

        setUser(mergedUser);
        setIsAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(mergedUser));
        return mergedUser;
      }

      return userData;
    } catch (error) {
      console.error("Error saving user data:", error);

      // Handle duplicate username error specifically
      if (error.response?.data?.message?.includes("E11000") && error.response?.data?.message?.includes("username")) {
        console.log("Username already exists, trying with a unique suffix...");

        // Retry with a unique username - also pass userData.uid here
        try {
          const uniqueUsername = `${generateUsername(userData.email, userData.displayName, userData.uid)}_${Date.now()}`;
          const retryFormData = new FormData();
          retryFormData.append("authMethod", "oauth");
          retryFormData.append("uid", userData.uid);
          retryFormData.append("name", userData.displayName || userData.email || "Anonymous");
          retryFormData.append("email", userData.email);
          retryFormData.append("username", uniqueUsername);
          retryFormData.append("picture", userData.photoURL || "");

          const retryResponse = await axios.post(import.meta.env.VITE_APP_API_URL + "/api/users", retryFormData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          if (retryResponse.data.success) {
            const dbUser = retryResponse.data.data;
            const mergedUser = {
              ...userData,
              ...dbUser,
              username: dbUser.username || uniqueUsername,
              picture: dbUser.profile?.profileImage || userData.photoURL,
              profile: dbUser.profile || {},
              role: dbUser.role || "user",
            };

            setUser(mergedUser);
            setIsAuthenticated(true);
            localStorage.setItem("user", JSON.stringify(mergedUser));
            return mergedUser;
          }
        } catch (retryError) {
          console.error("Retry failed:", retryError);
        }
      }

      // Still set the user in context even if backend call fails
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem("user", JSON.stringify(userData));
      return userData;
    }
  };

  // Handle authentication errors
  const handleAuthError = (error) => {
    console.error("Auth error:", error);

    switch (error.code) {
      case "auth/popup-closed-by-user":
        toast.error("Sign-in cancelled");
        break;
      case "auth/popup-blocked":
        toast.error("Popup blocked. Please enable popups and try again");
        break;
      case "auth/cancelled-popup-request":
        // Multiple popup requests, ignore
        break;
      case "auth/account-exists-with-different-credential":
        toast.error("Account exists with different sign-in method");
        break;
      case "auth/network-request-failed":
        toast.error("Network error. Please check your connection");
        break;
      case "auth/too-many-requests":
        toast.error("Too many requests. Please try again later");
        break;
      default:
        toast.error(error.message || "Authentication failed");
    }
  };

  // Sign out
  const logout = async () => {
    try {
      await signOut(auth);
      toast.success("Signed out successfully");
      return { success: true };
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
      return { success: false, error: error.message };
    }
  };

  // Get current user's ID token (useful for backend authentication)
  const getIdToken = async (forceRefresh = false) => {
    if (!auth.currentUser) {
      throw new Error("No authenticated user");
    }

    try {
      const token = await auth.currentUser.getIdToken(forceRefresh);
      return token;
    } catch (error) {
      console.error("Error getting ID token:", error);
      throw error;
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      const updatedUser = {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        displayName: auth.currentUser.displayName,
        photoURL: auth.currentUser.photoURL,
        emailVerified: auth.currentUser.emailVerified,
      };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  // Login User with email and password
  const loginUser = async (email, password) => {
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return { success: false, error: "Please fill in all fields" };
    }

    setLoading(true);

    try {
      const response = await axios.post(
        import.meta.env.VITE_APP_LOGIN_API,
        { email, password },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" }
        }
      );

      const { message, user: userData } = response.data;

      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(userData));
        toast.success(message || "Login successful!");
        return { success: true, user: userData };
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);
      console.error("Login error:", error);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = () => {
    return !!auth.currentUser;
  };

  // Context value
  const value = {
    user,
    loading,
    isAuthenticated,
    loginUser,
    logout,
    getIdToken,
    refreshUser,
    checkAuth,
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
