import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import { updateTeamAsync } from "../redux/slices/teamSlice";

export default function TeamManage() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { teams } = useSelector((state) => state.team);
  
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

  const isOwner = team && user?._id === team.owner._id;

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
    toast.info("Add Member functionality will be implemented next");
  };

  const handleRemoveMember = (memberId, memberName) => {
    if (window.confirm(`Are you sure you want to remove ${memberName} from the team?`)) {
      setTeam(prev => ({
        ...prev,
        members: prev.members.filter(member => member._id !== memberId)
      }));
      toast.success(`${memberName} removed from team`);
      // TODO: Make API call to remove member
    }
  };

  const handleDeleteTeam = () => {
    const confirmMessage = `Are you absolutely sure you want to delete '${team.name}'? This action cannot be undone.`;
    if (window.confirm(confirmMessage)) {
      toast.success("Team deleted successfully!");
      navigate("/teams");
      // TODO: Make API call to delete team
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
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Member
            </button>
          </div>

          <div className="space-y-3">
            {team.members && team.members.length > 0 ? (
              team.members.map((member) => (
                <div key={member._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                      {member.name ? member.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.name || "Unknown User"}</p>
                      <p className="text-sm text-gray-600">{member.role || "Member"}</p>
                    </div>
                  </div>
                  
                  {member._id !== team.owner._id && (
                    <button
                      onClick={() => handleRemoveMember(member._id, member.name || "Unknown User")}
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

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Actions</h2>
          
          <button
            onClick={handleDeleteTeam}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Delete Team
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
