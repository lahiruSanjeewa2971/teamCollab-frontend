import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { createTeamAsync, getTeamsAsync, clearTeamError } from "../redux/slices/teamSlice";
import { clearError } from "../redux/slices/errorSlice";
import { createTeamSchema } from "../lib/teamSchemas";
import { isTeamOwner, getTeamMemberCount, getMemberName, getMemberInitials } from "../utils/safeAccess";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import TeamSearch from "../components/TeamSearch";
import SocketStatus from "../components/SocketStatus";
import { useTeamSocket } from "../hooks/useTeamSocket";

export default function Teams() {
  // Add custom scrollbar styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: #f1f5f9;
        border-radius: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
      }
      .scroll-smooth {
        scroll-behavior: smooth;
      }
      .teams-container {
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
        scrollbar-width: thin;
        scrollbar-color: #cbd5e1 #f1f5f9;
        will-change: scroll-position;
        transform: translateZ(0);
        backface-visibility: hidden;
      }
      .teams-container::-webkit-scrollbar {
        width: 8px;
      }
      .teams-container::-webkit-scrollbar-track {
        background: #f1f5f9;
        border-radius: 4px;
      }
      .teams-container::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 4px;
      }
      .teams-container::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
      }
      .line-clamp-3 {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  const dispatch = useDispatch();
  const { teams, isLoading, isCreating } = useSelector((state) => state.team);
  const { user } = useSelector((state) => state.auth);
  const errorMessage = useSelector((state) => state.error.message);
  const navigate = useNavigate();

  // Team creation form
  const createTeamForm = useForm({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: "",
      description: "",
      members: [],
    },
  });

  // Fetch teams on component mount
  useEffect(() => {
    dispatch(getTeamsAsync());
  }, [dispatch]);

  // Initialize Socket.IO for real-time team updates
  const { isConnected } = useTeamSocket();
  
  // Improve scroll performance
  useEffect(() => {
    const mainContent = document.querySelector('.teams-container');
    if (mainContent) {
      // Enable smooth scrolling
      mainContent.style.scrollBehavior = 'smooth';
      
      // Improve scroll performance on mobile
      mainContent.style.webkitOverflowScrolling = 'touch';
      
      // Prevent scroll chaining
      mainContent.style.overscrollBehavior = 'contain';
    }
  }, []);

  // Handle team creation
  const handleCreateTeam = async (data) => {
    
    try {
      const resultAction = await dispatch(createTeamAsync(data));
      
      if (createTeamAsync.fulfilled.match(resultAction)) {
        toast.success("Team created successfully!");
        createTeamForm.reset();
        // Refresh teams list
        dispatch(getTeamsAsync());
      } else if (createTeamAsync.rejected.match(resultAction)) {
        toast.error(resultAction.payload || "Team creation failed. Please try again.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    }
  };



  // No mock teams needed - we're using real backend data
  const displayTeams = teams;

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-hidden">
      <TopBar 
        showLogoLink={true}
        logoLinkTo="/dashboard"
      />

      <div className="flex flex-1 min-h-0">
        {/* Left Sidebar */}
        <aside className="w-64 flex-shrink-0 border-r px-3 py-3 overflow-y-auto hidden lg:block custom-scrollbar">
          <div className="mb-4">
            <button className="w-full flex items-center justify-between border rounded-md px-3 py-2 text-sm">
              <span className="truncate">Projects</span>
              <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.064l3.71-3.834a.75.75 0 111.08 1.04l-4.24 4.384a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <nav className="space-y-1">
            <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100">
              Archive
            </a>
          </nav>

          <div className="mt-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Main</h3>
            <nav className="space-y-1">
              <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Dashboard
              </Link>
              <div className="flex items-center gap-2 px-3 py-2 rounded-md text-sm bg-blue-600 text-white">
                Team
              </div>
              <Link 
                to="/channels" 
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100"
              >
                Channels
              </Link>
              <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100">
                Help
              </a>
              <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100">
                Contact Us
              </a>
              <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100">
                Roadmap
              </a>
            </nav>
          </div>

          <div className="mt-auto pt-6">
            <p className="text-xs text-gray-500 text-center">© 2025 TeamCollab Inc.</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth relative custom-scrollbar teams-container">
          {/* Getting Started Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Create New Team Card - Enhanced with Redux and Zod */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Create New Team</h3>
              <p className="text-gray-600 mb-4">Start a new collaboration space for your projects. You'll be the owner of this team.</p>
              
              <Form {...createTeamForm}>
                <form onSubmit={createTeamForm.handleSubmit(handleCreateTeam)} className="space-y-4">
                  <FormField
                    control={createTeamForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Team Name *</FormLabel>
                        <FormControl>
                          <Input 
                            id="team-name"
                            placeholder="E.g., Marketing Team Q3" 
                            {...field} 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </FormControl>
                        {createTeamForm.formState.errors.name && (
                          <FormMessage className="text-red-500 text-xs">
                            {createTeamForm.formState.errors.name.message}
                          </FormMessage>
                        )}
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createTeamForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Team Description (Optional)</FormLabel>
                        <FormControl>
                          <textarea
                            {...field}
                            placeholder="Briefly describe the team's purpose or goals..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          />
                        </FormControl>
                        {createTeamForm.formState.errors.description && (
                          <FormMessage className="text-red-500 text-xs">
                            {createTeamForm.formState.errors.description.message}
                          </FormMessage>
                        )}
                      </FormItem>
                    )}
                  />
                  
                  <Button
                    type="submit"
                    disabled={!createTeamForm.formState.isValid || isCreating}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreating ? (
                      <div className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
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
                        Creating...
                      </div>
                    ) : (
                      'Create Team'
                    )}
                  </Button>

                  {/* Error Display */}
                  {errorMessage && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{errorMessage}</p>
                    </div>
                  )}
                </form>
              </Form>
            </div>

                         {/* Search & Join Teams Card */}
             <div className="bg-white border border-gray-200 rounded-lg p-6">
               <h3 className="text-lg font-semibold text-gray-900 mb-2">Search & Join Teams</h3>
               <p className="text-gray-600 mb-4">Search for teams by name to join them.</p>
               
               <TeamSearch />
               
               
             </div>
          </div>

          {/* Team Details Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Team Details */}
            {/* <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Details: Marketing Campaigns</h3>
              
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700">Members (7)</h4>
                </div>
                <p className="text-gray-600 text-sm mb-4">Full list of all members in Marketing Campaigns.</p>
                
                <div className="space-y-3">
                  {mockTeams[0].members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">
                          {member.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded-full">
                          {member.role}
                        </span>
                        <button className="p-1 hover:bg-gray-200 rounded">
                          <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button className="w-full mt-4 bg-white text-blue-600 border border-blue-600 py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  Invite New Member
                </button>
              </div>
            </div> */}
          </div>

          {/* Your Teams Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Teams</h3>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <svg
                  className="animate-spin h-8 w-8 text-blue-600"
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
              </div>
            ) : displayTeams.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No teams yet</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  You haven't joined or created any teams yet. Create your first team to start collaborating with others, or join an existing team to get started.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button 
                    onClick={() => document.getElementById('team-name')?.focus()}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Your First Team
                  </button>
                                     <button 
                     onClick={() => document.getElementById('team-search-input')?.focus()}
                     className="inline-flex items-center px-4 py-2 bg-white text-blue-600 border border-blue-600 text-sm font-medium rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                   >
                     <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                     </svg>
                     Search Teams
                   </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {displayTeams.filter(team => team && team._id).map((team, index) => (
                  <div key={team._id || team.id || index} className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col h-64">
                    {/* Header Section */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-lg mb-2">{team.name || 'Unnamed Team'}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          isTeamOwner(team, user) 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {isTeamOwner(team, user) ? 'Owner' : 'Member'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Description Section - Fixed Height */}
                    <div className="flex-1 mb-4">
                      <p className="text-sm text-gray-600 line-clamp-3 h-16 overflow-hidden">
                        {team?.description || "No description provided for this team."}
                      </p>
                    </div>
                    
                    {/* Footer Section - Always at Bottom */}
                    <div className="mt-auto">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-1">
                            {Array.isArray(team.members) && team.members.length > 0 ? (
                              <>
                                {team.members.slice(0, 3).map((member, memberIndex) => (
                                  <div 
                                    key={member._id || member.id || memberIndex} 
                                    className="w-7 h-7 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-xs text-white font-medium border-2 border-white shadow-sm"
                                  >
                                    {getMemberInitials(member)}
                                  </div>
                                ))}
                                {team.members.length > 3 && (
                                  <div className="w-7 h-7 bg-gray-300 rounded-full flex items-center justify-center text-xs text-gray-600 font-medium border-2 border-white shadow-sm">
                                    +{team.members.length - 3}
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="w-7 h-7 bg-gray-300 rounded-full flex items-center justify-center text-xs text-gray-600 font-medium border-2 border-white shadow-sm">
                                {typeof team.members === 'number' ? team.members : (Array.isArray(team.members) ? team.members.length : 0)}
                              </div>
                            )}
                          </div>
                          <span className="text-sm text-gray-500 font-medium">
                            {getTeamMemberCount(team)} member{getTeamMemberCount(team) !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      
                      {/* Action Button - Always at Bottom */}
                      {isTeamOwner(team, user) && (
                        <button 
                          onClick={() => navigate(`/teams/${team._id || team.id}/manage`, { 
                            state: { team: team } 
                          })}
                          className="w-full text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 font-medium"
                        >
                          Manage Team
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={() => {
          const mainContent = document.querySelector('.teams-container');
          if (mainContent) {
            mainContent.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-50"
        title="Scroll to top"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>

      {/* Footer */}
      <Footer />
      
      {/* Socket Status Debug Component */}
      <SocketStatus />
    </div>
  );
}
