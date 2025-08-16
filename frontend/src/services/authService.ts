import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface RegisterUserData {
  name: string;
  email?: string;
  password: string;
}
interface LoginUserData {
  email: string;
  password: string;
}

const register = (userData: RegisterUserData) => {
  //console.log("Registering user with data:", userData);
  // console.log("API URL:", API_URL);
  return axios.post(API_URL + "/register", userData);
};
const login = (userData: LoginUserData) => {
  return axios.post(API_URL + "/login", userData);
};
const authService = {
  register,
  login,
};
export default authService;
