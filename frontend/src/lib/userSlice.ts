import {createSlice, createAsyncThunk} from "@reduxjs/toolkit";
import authService from "@/services/authService";
import {RegisterUserData, LoginUserData} from "./types";

const token =
  typeof window != "undefined" ? localStorage.getItem("token") : null;
const user =
  typeof window != "undefined"
    ? JSON.parse(localStorage.getItem("user") || "null")
    : null;

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData: RegisterUserData, thunkApi) => {
    try {
      const response = await authService.register(userData);
      return response.data;
    } catch (error: any) {
      // console.error("Registration error:", error);
      const errorMessage =
        error.response?.data?.message || "Registration failed";
      return thunkApi.rejectWithValue(errorMessage);
    }
  }
);
export const loginUser = createAsyncThunk(
  "auth/login",
  async (userData: LoginUserData, thunkApi) => {
    try {
      const response = await authService.login(userData);
      console.log("Login response:", response.data);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        let user = {
          name: response.data.name,
          userId: response.data.userId,
          email: response.data.email,
        };
        localStorage.setItem("user", JSON.stringify(user));
      }
      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: unknown) {
      return thunkApi.rejectWithValue("Login failed");
    }
  }
);
export const logoutUser = createAsyncThunk("auth/logout", async () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
});

interface AuthState {
  user: {name: string; userId: string} | null;
  token: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: AuthState = {
  user: user,
  token: token,
  status: "idle",
  error: null,
};

export const userSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.status = "succeeded"; // User needs to login after registering
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = {name: action.payload.name, userId: action.payload.userId};
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.status = "idle";
      });
  },
});
export default userSlice.reducer;
