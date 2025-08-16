import axios from "axios";
import {createResultInput} from "@/lib/types";
const API_URL =
  process.env.NEXT_PUBLIC_API_URL_RESULT || "http://localhost:3000/api";

const getUserResults = (token: string) => {
  return axios.get(API_URL + "/getResults", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const submitResult = (result: createResultInput, token: string) => {
  const myFunction = async () => {
    try {
      const response = await axios.post(API_URL + "/submit", result, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error submitting result:", error);
      throw error;
    }
  };
  return myFunction();
};

const resultService = {
  getUserResults,
  submitResult,
};
export default resultService;
