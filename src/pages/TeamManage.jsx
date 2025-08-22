import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import { updateTeamAsync, removeMemberAsync, deleteTeamAsync, addMemberAsync } from "../redux/slices/teamSlice";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { isTeamOwner, getMemberName, getMemberInitials } from "../utils/safeAccess";
import { searchUsers } from "../api/teamService";

export default function TeamManage() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { teams, isRemovingMember } = useSelector((state) => state.team);
  
  // Ref to track if we've already shown an error message
  const hasShownError = useRef(false);
  
  // Get team data from location state (passed from Teams component) or find in Redux store
  const [team, setTeam] = useState(() => {
    // First try to get from location state (if navigated from Teams component)
    if (location.state?.team) {
      return location.state.team;
    }
    
    // Fallback: find team in Redux store by teamId
    const foundTeam = teams.find(t => t._id === teamId);
    if (foundTeam) {
      return foundTeam;
    }
    
    // If no team found, return null (will show loading/error state)
    return null;
  });

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedName, setEditedName] = useState(team?.name || "");
  const [editedDescription, setEditedDescription] = useState(team?.description || "");
  const [memberToRemove, setMemberToRemove] = useState(null);
  
  // Add member state
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Update edited values when team data changes
  useEffect(() => {
    console.log('team :', team)
    console.log('user :', user)
    console.log('teamId :', teamId)
    if (team) {
      setEditedName(team.name);
      setEditedDescription(team.description || "");
    }
  }, [team]);

  const isOwner = isTeamOwner(team, user);

  // Single useEffect for all navigation logic
  useEffect(() => {
    // Reset error flag when team or user changes
    hasShownError.current = false;
    
    // Check if team exists
    if (!team) {
      if (!hasShownError.current) {
        toast.error("Team not found");
        hasShownError.current = true;
      }
      navigate("/teams");
      return;
    }

    // Check if user is owner
    if (!isOwner) {
      if (!hasShownError.current) {
        toast.error("Access denied. Only team owners can manage teams.");
        hasShownError.current = true;
      }
      navigate("/teams");
    }
  }, [team, isOwner, navigate]);

  const handleNameEdit = async () => {
    if (isEditingName) {
      if (editedName.trim() && editedName !== team.name) {
        try {
          await dispatch(updateTeamAsync({
            teamId: team._id,
            updateData: { name: editedName.trim() }
          })).unwrap();
          
          setTeam(prev => ({ ...prev, name: editedName.trim() }));
          toast.success("Team name updated successfully!");
        } catch (error) {
          // Error is already handled by the thunk
          setEditedName(team.name); // Reset to original value
        }
      }
    }
    setIsEditingName(!isEditingName);
  };

  const handleDescriptionEdit = async () => {
    if (isEditingDescription) {
      if (editedDescription !== team.description) {
        try {
          await dispatch(updateTeamAsync({
            teamId: team._id,
            updateData: { description: editedDescription }
          })).unwrap();
          
          setTeam(prev => ({ ...prev, description: editedDescription }));
          toast.success("Team description updated successfully!");
        } catch (error) {
          // Error is already handled by the thunk
          setEditedDescription(team.description || ""); // Reset to original value
        }
      }
    }
    setIsEditingDescription(!isEditingDescription);
  };

  const handleCancelEdit = (type) => {
    if (type === 'name') {
      setEditedName(team.name);
      setIsEditingName(false);
    } else if (type === 'description') {
      setEditedDescription(team.description || "");
      setIsEditingDescription(false);
    }
  };

  const handleAddMember = () => {
    setShowAddMemberDialog(true);
    setSearchQuery("");
    setSearchResults([]);
    setSelectedUsers([]);
  };

  const handleSearchUsers = async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await searchUsers(query.trim(), 1, 20);
      // Filter out users who are already team members
      const availableUsers = response.users.filter(user => 
        !team.members.some(member => member._id === user._id) &&
        user._id !== team.owner._id // Also exclude team owner
      );
      setSearchResults(availableUsers);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUsers(prev => {
      const isAlreadySelected = prev.some(u => u._id === user._id);
      if (isAlreadySelected) {
        return prev.filter(u => u._id !== user._id);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleAddSelectedMembers = async () => {
    if (selectedUsers.length === 0) {
      toast.warning('Please select at least one user to add.');
      return;
    }

    setIsAddingMember(true);
    try {
      // Add each selected user to the team
      for (const user of selectedUsers) {
        const resultAction = await dispatch(addMemberAsync({
          teamId: team._id,
          memberData: { userId: user._id }
        }));

        if (addMemberAsync.fulfilled.match(resultAction)) {
          // Update local state with the response from Redux
          setTeam(resultAction.payload.team);
        } else if (addMemberAsync.rejected.match(resultAction)) {
          toast.error(`Failed to add ${user.name}: ${resultAction.payload}`);
        }
      }

      if (selectedUsers.length === 1) {
        toast.success(`${selectedUsers[0].name} added to team successfully!`);
      } else {
        toast.success(`${selectedUsers.length} members added to team successfully!`);
      }

      // Close dialog and reset state
      setShowAddMemberDialog(false);
      setSelectedUsers([]);
      setSearchQuery("");
      setSearchResults([]);
    } catch (error) {
      console.error('Error adding members:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsAddingMember(false);
    }
  };

  const closeAddMemberDialog = () => {
    setShowAddMemberDialog(false);
    setSelectedUsers([]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleRemoveMember = async (memberId, memberName) => {
    setMemberToRemove({ id: memberId, name: memberName });
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;
    
    try {
      const resultAction = await dispatch(removeMemberAsync({
        teamId: team._id,
        memberId: memberToRemove.id
      }));
      
      if (removeMemberAsync.fulfilled.match(resultAction)) {
        // Update local state with the response from Redux
        setTeam(resultAction.payload.team);
        toast.success(`${memberToRemove.name} removed from team successfully!`);
      } else if (removeMemberAsync.rejected.match(resultAction)) {
        // Error is already handled by the thunk
        toast.error(resultAction.payload || 'Failed to remove member from team');
      }
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setMemberToRemove(null);
    }
  };

  const cancelRemoveMember = () => {
    setMemberToRemove(null);
  };

  const handleDeleteTeam = async () => {
    const confirmMessage = `Are you absolutely sure you want to delete '${team.name}'? This action cannot be undone.`;
    if (window.confirm(confirmMessage)) {
      try {
        const resultAction = await dispatch(deleteTeamAsync(team._id));
        
        if (deleteTeamAsync.fulfilled.match(resultAction)) {
          toast.success("Team deleted successfully!");
          navigate("/teams");
        } else if (deleteTeamAsync.rejected.match(resultAction)) {
          // Error is already handled by the thunk
          toast.error(resultAction.payload || 'Failed to delete team');
        }
      } catch (error) {
        console.error('Error deleting team:', error);
        toast.error('An unexpected error occurred. Please try again.');
      }
    }
  };

  // Show loading state while team data is being fetched
  if (!team) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading team data...</p>
        </div>
      </div>
    );
  }

  // Show loading state while checking ownership
  if (!isOwner) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar 
        searchPlaceholder="Search team members..."
        showLogoLink={true}
        logoLinkTo="/teams"
      />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate("/teams")}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Teams
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="text-2xl font-bold text-gray-900 border-b-2 border-blue-500 focus:outline-none focus:border-blue-600"
                    autoFocus
                  />
                  <button onClick={handleNameEdit} className="text-green-600 hover:text-green-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button onClick={() => handleCancelEdit('name')} className="text-red-600 hover:text-red-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
                  <button onClick={handleNameEdit} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mb-4">
            {isEditingDescription ? (
              <div className="flex items-start gap-2">
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  rows={3}
                  className="flex-1 text-gray-600 border-b-2 border-blue-500 focus:outline-none focus:border-blue-600 resize-none"
                  autoFocus
                />
                <div className="flex flex-col gap-1">
                  <button onClick={handleDescriptionEdit} className="text-green-600 hover:text-green-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button onClick={() => handleCancelEdit('description')} className="text-red-600 hover:text-red-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <p className="text-gray-600 leading-relaxed">{team.description || "No description provided"}</p>
                <button onClick={handleDescriptionEdit} className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 mt-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
            <button
              onClick={handleAddMember}
              disabled={isAddingMember}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAddingMember ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Member
                </>
              )}
            </button>
          </div>

          <div className="space-y-3">
            {team.members && team.members.length > 0 ? (
              team.members.map((member) => (
                <div key={member._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                                         <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                       {getMemberInitials(member)}
                     </div>
                    <div>
                                             <p className="font-medium text-gray-900">{getMemberName(member)}</p>
                      <p className="text-sm text-gray-600">{member.role || "Member"}</p>
                    </div>
                  </div>
                  
                                     {team.owner && member._id !== team.owner._id && (
                     <button
                       onClick={() => handleRemoveMember(member._id, getMemberName(member))}
                       className="text-red-500 hover:text-red-700 transition-colors p-1"
                       title="Remove member"
                     >
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                       </svg>
                     </button>
                   )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No team members found</p>
              </div>
            )}
          </div>
        </div>

        {/* Team Actions section hidden for now */}
        {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Actions</h2>
          
          <button
            onClick={handleDeleteTeam}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Delete Team
          </button>
        </div> */}
      </main>

      {/* Remove Member Alert Dialog */}
      <AlertDialog open={!!memberToRemove} onOpenChange={(open) => !open && cancelRemoveMember()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <span className="font-semibold">{memberToRemove?.name}</span> from the team? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelRemoveMember} disabled={isRemovingMember}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmRemoveMember}
              disabled={isRemovingMember}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              {isRemovingMember ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Removing...
                </div>
              ) : (
                'Remove Member'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Member Dialog */}
      <AlertDialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Add Team Members</AlertDialogTitle>
            <AlertDialogDescription>
              Search for users to add to your team. Users who are already team members will not appear in search results.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  const query = e.target.value;
                  setSearchQuery(query);
                  // Debounced search
                  const timeoutId = setTimeout(() => handleSearchUsers(query), 300);
                  return () => clearTimeout(timeoutId);
                }}
                placeholder="Search users by name or email..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                <div className="p-3 bg-gray-50 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-700">
                    Found {searchResults.length} user{searchResults.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="divide-y divide-gray-200">
                  {searchResults.map((user) => {
                    const isSelected = selectedUsers.some(u => u._id === user._id);
                    return (
                      <div
                        key={user._id}
                        onClick={() => handleUserSelect(user)}
                        className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                          isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{user.name || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {isSelected && (
                              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              isSelected 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {isSelected ? 'Selected' : 'Click to select'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Selected Users Summary */}
            {selectedUsers.length > 0 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  Selected Users ({selectedUsers.length})
                </p>
                <div className="space-y-2">
                  {selectedUsers.map((user) => (
                    <div key={user._id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <span className="text-sm text-blue-900">{user.name || 'Unknown'}</span>
                      </div>
                      <button
                        onClick={() => handleUserSelect(user)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {searchQuery && searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <p>No users found matching "{searchQuery}"</p>
                <p className="text-sm">Try a different search term</p>
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeAddMemberDialog} disabled={isAddingMember}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleAddSelectedMembers}
              disabled={isAddingMember || selectedUsers.length === 0}
              className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
            >
              {isAddingMember ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </div>
              ) : (
                `Add ${selectedUsers.length} Member${selectedUsers.length !== 1 ? 's' : ''}`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
}
