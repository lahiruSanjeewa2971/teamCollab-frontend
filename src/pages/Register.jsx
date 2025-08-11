import React, { useState } from "react";
import {z} from 'zod'
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { clearError } from "../redux/slices/errorSlice";
import { registerUser } from "../redux/slices/authSlice";

// create a schema describing data shape and rules.
const registerSchema = z.object({
  email: z.string().email("Invalid email address."),
  name: z.string().min(1, "Name is required."),
  password: z.string().min(6, "Password must be at least 6 characters."),
})

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoading = useSelector((state) => state.auth.isLoading);
  const errorMessage = useSelector((state) => state.error.message);

  const [showPassword, setShowPassword] = useState(false);

  const {register, handleSubmit, formState: {errors}} = useForm({resolver: zodResolver(registerSchema)});

  const onSubmit = async (data) => {
    console.log('register submit:', data);
    dispatch(clearError());
    const resultAction = await dispatch(registerUser(data));
    
    if (registerUser.fulfilled.match(resultAction)) {
      // Show success message from backend
      if (resultAction.payload?.message) {
        toast.success(resultAction.payload.message);
      } else {
        toast.success("Account created successfully!");
      }
      
      // Redirect to login after a short delay to show the toast
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } else if (registerUser.rejected.match(resultAction)) {
      // Error is already handled by the thunk and displayed via errorSlice
      toast.error(resultAction.payload || "Registration failed. Please try again.");
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-50 to-purple-100 relative overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-purple-200 rounded-full opacity-30 blur-xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-200 rounded-full opacity-30 blur-xl"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-purple-300 rounded-full opacity-20 blur-lg"></div>
        </div>
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center h-full px-12">
          {/* Logo */}
          <div className="absolute top-8 left-8 flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-bold text-gray-800">TeamCollab</span>
          </div>

          {/* Main content */}
          <div className="text-center">
            {/* User icon */}
            <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-12 h-12 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-purple-800 mb-4">
              Your Secure Collaboration Hub
            </h1>

            <p className="text-lg text-purple-600 max-w-md">
              Connect, share, and collaborate effortlessly with TeamCollab.
            </p>
          </div>

          {/* Copyright */}
          <div className="absolute bottom-8 left-8 text-sm text-gray-600">
            © 2025 TeamCollab Inc. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right section */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-md w-full">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="text-xl font-bold text-gray-800">
                TeamCollab
              </span>
            </div>
          </div>

          {/*  Navigation Tabs */}
          <div className="flex mb-8">
            <Link
              to="/"
              className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-gray-100 text-gray-600 rounded-l-lg font-medium hover:bg-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
              <span>Login</span>
            </Link>
            <button className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-purple-600 text-white rounded-r-lg font-medium">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Register</span>
            </button>
          </div>

          {/* Welcome Message */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h2>
            <p className="text-gray-600">Join TeamCollab in seconds.</p>
          </div>

          {/* Register form */}
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Name field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="name">Name</label>
              <div className="relative">
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="John Doe"
                  {...register("name")}
                  className={`
                    block w-full pl-3 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.name ? "focus:ring-red-500" : "focus:ring-purple-500"
                    } focus:border-transparent
                    ${errors.name ? "border-red-500" : "border-gray-300"}
                    `}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>
            </div>
            
            {/* Email field */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="email"
              >
                Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="john.doe@example.com"
                  {...register("email")}
                  className={`
                    block w-full pl-3 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.email
                        ? "focus:ring-red-500"
                        : "focus:ring-purple-500"
                    } focus:border-transparent
                    ${errors.email ? "border-red-500" : "border-gray-300"}
                    `}
                />
                {/* Show field-level error if validation fails */}
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            {/* Password field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="********"
                  {...register("password")}
                  className={`
                    block w-full pl-3 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.password
                        ? "focus:ring-red-500"
                        : "focus:ring-purple-500"
                    } focus:border-transparent
                    ${errors.password ? "border-red-500" : "border-gray-300"}
                    `}
                />
                {/* Show field-level error if validation fails */}
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}

                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                        clipRule="evenodd"
                      />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Register button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating account...
                </div>
              ) : (
                "Create account"
              )}
            </button>

            {/* Login link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Login
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
