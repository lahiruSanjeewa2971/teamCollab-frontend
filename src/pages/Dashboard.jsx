import React from "react";
import { Link } from "react-router-dom";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import Notifications from "../components/Notifications";
import SocketStatus from "../components/SocketStatus";
import { useSocket } from "../contexts/SocketContext";

export default function Dashboard() {
  // Get socket status from context (no initialization needed)
  const { isConnected } = useSocket();

  const organizationName = "Acme Inc.";
  const channels = [
    { id: "general", name: "general", unread: false, active: true },
    { id: "design-sprint", name: "design-sprint", unread: true },
    { id: "marketing", name: "marketing" },
    { id: "development", name: "development" },
    { id: "random", name: "random" },
    { id: "client-meetings", name: "client-meetings" },
  ];

  const directMessages = [
    { id: 1, name: "David Lee" },
    { id: 2, name: "Sarah Brown" },
    { id: 3, name: "Chris Miller" },
  ];

  const members = [
    { id: 1, name: "You", color: "bg-blue-500" },
    { id: 2, name: "Alice Johnson", color: "bg-purple-500" },
    { id: 3, name: "Bob Williams", color: "bg-pink-500" },
    { id: 4, name: "Charlie Davis", color: "bg-yellow-500" },
    { id: 5, name: "Diana Green", color: "bg-green-500" },
    { id: 6, name: "Evan Taylor", color: "bg-indigo-500" },
    { id: 7, name: "Fiona White", color: "bg-red-500" },
    { id: 8, name: "Greg Harris", color: "bg-teal-500" },
  ];

  const messages = [
    {
      id: 1,
      author: "Alice Johnson",
      time: "10:30 AM",
      text:
        "Good morning team! Just wanted to share the updated project timeline for the Q3 marketing campaign.",
      isOwn: false,
    },
    {
      id: 2,
      author: "You",
      time: "10:32 AM",
      text:
        "Thanks, Alice! I'll review it immediately and provide feedback. Looks like a solid plan.",
      isOwn: true,
    },
    {
      id: 3,
      author: "Bob Williams",
      time: "10:36 AM",
      text:
        "Great work, Alice! The new social media strategy looks promising. Are there any new assets needed?",
      isOwn: false,
    },
    {
      id: 4,
      author: "Alice Johnson",
      time: "10:40 AM",
      text:
        "Yes, Bob. I've included a list of required assets in the document. Let's discuss it in our sync tomorrow.",
      isOwn: false,
    },
    {
      id: 5,
      author: "You",
      time: "10:45 AM",
      text: "Sounds good. Looking forward to it!",
      isOwn: true,
    },
    {
      id: 6,
      author: "Charlie Davis",
      time: "11:00 AM",
      text:
        "Hey everyone, quick question about the new client onboarding process. Where can I find the latest documentation?",
      isOwn: false,
    },
  ];

  return (
    <div className="h-screen flex flex-col bg-white">
      <TopBar />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 h-full border-r bg-gray-50 overflow-y-auto">
          {/* Organization Header */}
          <div className="p-4 border-b bg-white">
            <h1 className="text-lg font-semibold text-gray-800">{organizationName}</h1>
          </div>

          {/* Navigation */}
          <nav className="p-4">
            <ul className="space-y-1">
              <li>
                <Link
                  to="/teams"
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                >
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Teams
                </Link>
              </li>
            </ul>
          </nav>

          {/* Channels */}
          <div className="px-4 pb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700">Channels</h3>
              <button className="text-xs text-blue-600 hover:underline">+</button>
            </div>
            <ul className="space-y-1">
              {channels.map((channel) => (
                <li key={channel.id}>
                  <a
                    href="#"
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors duration-200 ${
                      channel.active
                        ? "bg-gray-100 text-gray-900 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span className="text-gray-400">#</span>
                    <span className="truncate">{channel.name}</span>
                    {channel.unread && (
                      <span className="ml-auto w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Direct Messages */}
          <div className="px-4 pb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700">Direct Messages</h3>
              <button className="text-xs text-blue-600 hover:underline">+</button>
            </div>
            <ul className="space-y-1">
              {directMessages.map((dm) => (
                <li key={dm.id}>
                  <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="truncate">{dm.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Channel Header */}
          <div className="h-14 sticky top-0 z-10 bg-white flex items-center justify-between border-b px-4">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg font-semibold text-gray-800 truncate">#general</span>
              <span className="text-sm text-gray-500 whitespace-nowrap">{members.length} members</span>
            </div>
            <button className="p-2 rounded-md hover:bg-gray-100">
              <svg className="w-5 h-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 5.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM11.5 16a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-white">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.isOwn ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xl rounded-lg px-3 py-2 shadow-sm ${
                    m.isOwn ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {!m.isOwn && (
                    <div className="text-xs font-medium text-gray-600 mb-1">
                      <span className="text-gray-700">{m.author}</span>
                      <span className="text-gray-400"> • {m.time}</span>
                    </div>
                  )}
                  {m.isOwn && (
                    <div className="text-xs font-medium text-white/80 mb-1">You • {m.time}</div>
                  )}
                  <p className="text-sm leading-relaxed">{m.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Composer */}
          <div className="border-t px-3 py-3 shrink-0">
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-md hover:bg-gray-100" title="Attach">
                <svg className="w-5 h-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 7a3 3 0 016 0v5a5 5 0 11-10 0V7a4 4 0 118 0v5a3 3 0 11-6 0V8a1 1 0 112 0v4a1 1 0 002 0V7a2 2 0 10-4 0v5a4 4 0 108 0V7a5 5 0 10-10 0v5a6 6 0 1012 0V7a7 7 0 10-14 0v5a8 8 0 1016 0V7a9 9 0 10-18 0v5a10 10 0 1020 0V7" />
                </svg>
              </button>
              <input
                type="text"
                placeholder="Message #general..."
                className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-sm">
                Send
              </button>
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-80 h-full border-l px-3 py-3 overflow-y-auto hidden xl:block">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700">Members ({members.length})</h3>
              <button className="text-xs text-blue-600 hover:underline">Invite</button>
            </div>
            <ul className="space-y-2">
              {members.map((m) => (
                <li key={m.id} className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${m.color}`}></span>
                  <span className="text-sm text-gray-700 truncate">{m.name}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Real-time Notifications */}
          <Notifications />
          
          {/* Socket Connection Status (for debugging) */}
          <div className="mt-4 p-2 bg-gray-50 rounded text-xs text-gray-500">
            Socket: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </div>
        </aside>
      </div>

      {/* Footer */}
      <Footer />
      
      {/* Socket Status Debug Component */}
      <SocketStatus />
    </div>
  );
}


