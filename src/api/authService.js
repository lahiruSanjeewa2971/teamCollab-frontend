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

export async function refreshToken(refreshToken) {
  try {
    const response = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken });
    return {
      accessToken: response?.data?.accessToken,
      refreshToken: response?.data?.refreshToken,
    };
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
}

export async function logout(refreshToken) {
  try {
    await axios.post(`${API_URL}/api/auth/logout`, { refreshToken });
    return { success: true };
  } catch (error) {
    console.error('Error logging out:', error);
    // Even if logout fails on backend, we should still clear local state
    return { success: true };
  }
}