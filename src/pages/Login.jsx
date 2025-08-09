import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {z} from 'zod';
import { clearError } from "../redux/slices/errorSlice";
import { loginUser } from "../redux/slices/authSlice";

// create a schema describing data shape and rules.
const loginSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
})

function Login() {
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const isLoading = useSelector((state) => state.auth.isLoading);
  const errorMessage = useSelector((state) => state.error.message);
  // const [isLoading, setIsLoading] = useState(false);

  const {
    register, handleSubmit, formState: {errors}
  } = useForm({resolver: zodResolver(loginSchema)});

  const onSubmit = async (data) => {
    dispatch(clearError());
    console.log('onSubmit:', data)
    dispatch(loginUser(data));
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
              <span className="text-white font-bold text-lg">X</span>
            </div>
            <span className="text-xl font-bold text-gray-800">TeamCollab</span>
          </div>

          {/* Main content */}
          <div className="text-center">
            {/* Lock icon */}
            <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-12 h-12 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
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
                <span className="text-white font-bold text-lg">X</span>
              </div>
              <span className="text-xl font-bold text-gray-800">TeamCollab</span>
            </div>
          </div>

          {/*  Navigation Tabs */}
          <div className="flex mb-8">
            <button className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-purple-600 text-white rounded-l-lg font-medium">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <span>Login</span>
            </button>
            <Link
              to="/register"
              // to="#"
              className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-gray-100 text-gray-600 rounded-r-lg font-medium hover:bg-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
              <span>Register</span>
            </Link>
          </div>

          {/* Welcome Message */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome Back!
            </h2>
            <p className="text-gray-600">
              Login to your TeamCollab account.
            </p>
          </div>

          {/* Login form */}
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Email field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">Email</label>
              <div className="relative">
                <input id="email" type="email" autoComplete="email" placeholder="john.doe@example.com" 
                  {...register("email")}
                  className={`
                    block w-full pl-3 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 ${errors.email ? "focus:ring-red-500" : "focus:ring-purple-500"} focus:border-transparent
                    ${errors.email ? "border-red-500" : "border-gray-300"}
                    `}
                />
                {/* Show field-level error if validation fails */}
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="********"
                  {...register("password")}
                  className={`
                    block w-full pl-3 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 ${errors.password ? "focus:ring-red-500" : "focus:ring-purple-500"} focus:border-transparent
                    ${errors.password ? "border-red-500" : "border-gray-300"}
                    `}
                />
                {/* Show field-level error if validation fails */}
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
                
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember me and forgot passoword */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">Remember me</label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">Forgot password</a>
              </div>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                'Login'
              )}
            </button>

            {/* Create an account link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link to='/register' className="font-medium text-blue-600 hover:text-blue-500">Create an account</Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Social Media Icons - Bottom Right */}
      <div className="fixed bottom-4 right-4 flex space-x-3">
        <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
        </a>
        <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        </a>
        <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        </a>
      </div>
    </div>
  );
}

export default Login;
