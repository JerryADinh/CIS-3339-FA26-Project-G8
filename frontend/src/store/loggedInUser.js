
import { defineStore } from 'pinia';
import { useToast } from 'vue-toastification';
import {
  loginUser,
  logoutUser,
  restoreAuthHeader
} from '../api/api';
import jwt_decode from 'jwt-decode';

// Notifications
const toast = useToast();

// Pinia store for authentication state
export const useLoggedInUserStore = defineStore({
  id: 'loggedInUser',
  state: () => {
    return {
      name: "",
      role: "",
      isLoggedIn: false
    };
  },

  actions: {
    // Restore a previously saved login session
    restoreSession() {
      const token = localStorage.getItem("authToken");

      // No saved token means the user is logged out
      if (!token) {
        logoutUser();
        this.$patch({
          name: "",
          role: "",
          isLoggedIn: false
        });
        return false;
      }
      try {
        const decodedToken = jwt_decode(token);

        // Validate the required JWT fields
        if (!decodedToken) {
          throw new Error("Missing decoded token");
        }

        // Only accept recognized user roles.
        if (!["viewer", "editor"].includes(decodedToken.role)) {
          throw new Error("JWT role is missing or invalid");
        }

        // Ensure the token contains an expiration timestamp.
        if (typeof decodedToken.exp !== "number") {
          throw new Error("JWT expiration is missing or invalid");
        }

        // JWT expiration uses seconds
        const currentTime = Math.floor(Date.now() / 1000);
        if (decodedToken.exp <= currentTime) {
          throw new Error("Token expired");
        }

        // Restore Axios authorization header
        restoreAuthHeader(token);

        // Restore Pinia authentication state
        this.$patch({
          // Use an empty name if the JWT doesn't contain one.
          name: typeof decodedToken.name === "string"
            ? decodedToken.name
            : "",
          role: decodedToken.role,
          isLoggedIn: true
        });
        return true;
      } catch (error) {
        console.warn("Session restoration failed:", error.message);
        // Clear expired or malformed sessions
        logoutUser();
        this.$patch({
          name: "",
          role: "",
          isLoggedIn: false
        });
        return false;
      }
    },

    // Log in using the backend API
    async login(username, password) {
      try {
        await loginUser(username, password);

        // Reuse the JWT validation and restoration logic
        const restored = this.restoreSession();
        if (!restored) {
          throw new Error("Invalid or expired session token.");
        }
        this.$router.push("/");
        toast.success("Login Successful!");
      } catch (error) {
        toast.error(error.message);
      }
    },

    // Log out and clear authentication state
    logout() {
      logoutUser();
      this.$patch({
        name: "",
        role: "",
        isLoggedIn: false
      });
      this.$router.push("/");
      toast.info("You have been logged out!");
    }
  }
});
