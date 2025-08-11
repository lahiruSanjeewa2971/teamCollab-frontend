import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export async function login({ email, password }) {
  const response = await axios.post(`${API_URL}/api/auth/login`, {email, password,});
  return {
    user: response?.data?.user,
    accessToken: response?.data?.accessToken,
    refreshToken: response?.data?.refreshToken,
  };
}

export async function register({name, email, password}) {
  const response = await axios.post(`${API_URL}/api/auth/register`, {name, email, password});
  return{
    user: response?.data?.user,
    message: response?.data?.message,
  }
}