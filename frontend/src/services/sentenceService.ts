import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL_TEXT || "http://localhost:3000/api";

const getRandomSentence = (token: string, category: number) => {
  const category_enum =
    category == 15
      ? "FIFTEEN"
      : category == 25
      ? "TWENTY_FIVE"
      : category == 50
      ? "FIFTY"
      : 15;

  return axios.get(API_URL + "/random", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {category: category_enum},
  });
};

const sentenceService = {
  getRandomSentence,
};

export default sentenceService;
