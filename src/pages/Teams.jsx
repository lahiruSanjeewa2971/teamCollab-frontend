import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { createTeamAsync, getTeamsAsync, clearTeamError } from "../redux/slices/teamSlice";
import { clearError } from "../redux/slices/errorSlice";
import { createTeamSchema } from "../lib/teamSchemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";

export default function Teams() {
  const dispatch = useDispatch();
  const { teams, isLoading, isCreating } = useSelector((state) => state.team);
  const errorMessage = useSelector((state) => state.error.message);
  const [teamCode, setTeamCode] = useState("");
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

  // Handle team creation
  const handleCreateTeam = async (data) => {
    console.log("Creating team:", data);
    
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

  const handleJoinTeam = () => {
    if (teamCode.trim()) {
      console.log("Joining team with code:", teamCode);
      setTeamCode("");
      // TODO: Implement team joining logic
    }
  };

  // Mock teams data for display (will be replaced by Redux state)
  const mockTeams = [
    {
      id: 1,
      name: "Marketing Campaigns",
      role: "Owner",
      description: "Collaborate on marketing strategies and campaign execution",
      members: [
        { id: 1, name: "Alice Johnson", email: "alice@teamcollab.com", role: "Owner", avatar: "AJ" },
        { id: 2, name: "Bob Williams", email: "bob@teamcollab.com", role: "Editor", avatar: "BW" },
        { id: 3, name: "Charlie Davis", email: "charlie@teamcollab.com", role: "Member", avatar: "CD" },
        { id: 4, name: "Diana Green", email: "diana@teamcollab.com", role: "Member", avatar: "DG" },
        { id: 5, name: "Evan Taylor", email: "evan@teamcollab.com", role: "Member", avatar: "ET" },
        { id: 6, name: "Fiona White", email: "fiona@teamcollab.com", role: "Guest", avatar: "FW" },
        { id: 7, name: "Greg Harris", email: "greg@teamcollab.com", role: "Member", avatar: "GH" },
      ]
    },
    {
      id: 2,
      name: "Product Development",
      role: "Member",
      description: "Build and iterate on product features and improvements",
      members: 12
    },
    {
      id: 3,
      name: "Customer Success",
      role: "Guest",
      description: "Ensure customer satisfaction and support",
      members: 5
    },
    {
      id: 4,
      name: "Human Resources",
      role: "Member",
      description: "Manage team culture and organizational development",
      members: 4
    }
  ];

  // Use Redux teams if available, otherwise fall back to mock data
  const displayTeams = teams.length > 0 ? teams : mockTeams;

  return (
    <div className="h-screen flex flex-col bg-white">
      <TopBar 
        searchPlaceholder="Search teams or members..."
        showLogoLink={true}
        logoLinkTo="/dashboard"
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 h-full border-r px-3 py-3 overflow-y-auto hidden lg:block">
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
              <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100">
                Templates
              </a>
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
        <main className="flex-1 overflow-y-auto p-6">
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

            {/* Join a Team Card - Keep existing functionality */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Join a Team</h3>
              <p className="text-gray-600 mb-4">Enter a team code or invite link to join an existing team.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Team Code or Invite Link</label>
                  <input
                    type="text"
                    value={teamCode}
                    onChange={(e) => setTeamCode(e.target.value)}
                    placeholder="Enter code or paste link"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <button
                  onClick={handleJoinTeam}
                  disabled={!teamCode.trim()}
                  className="w-full bg-white text-blue-600 border border-blue-600 py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Join Team
                </button>
              </div>
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
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayTeams.map((team, index) => (
                  <div key={team._id || team.id || index} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{team.name}</h4>
                        <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded-full">
                          {team.isOwner ? 'Owner' : team.role || 'Member'}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{team?.description || "No description"}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <div className="flex -space-x-1">
                          {Array.isArray(team.members) && team.members.length > 0 ? (
                            <>
                              {team.members.slice(0, 3).map((member, memberIndex) => (
                                <div 
                                  key={member._id || member.id || memberIndex} 
                                  className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-xs text-white font-medium"
                                >
                                  {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                                </div>
                              ))}
                              {team.members.length > 3 && (
                                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs text-gray-600 font-medium">
                                  +{team.members.length - 3}
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs text-gray-600 font-medium">
                              {typeof team.members === 'number' ? team.members : (Array.isArray(team.members) ? team.members.length : 0)}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {Array.isArray(team.members) ? team.members.length : (typeof team.members === 'number' ? team.members : 0)} members
                        </span>
                      </div>
                      
                      {(team.isOwner || team.role === 'Owner') && (
                        <button 
                          onClick={() => navigate(`/teams/${team._id || team.id}/manage`, { 
                            state: { team: team } 
                          })}
                          className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      {/* Footer */}
      <Footer />
    </div>
  );
}
