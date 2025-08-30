import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { MessageSquare, Users, Settings } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import ChannelHeader from "../components/channel/ChannelHeader";
import MessagesSection from "../components/channel/MessagesSection";
import MembersSection from "../components/channel/MembersSection";
import SettingsSection from "../components/channel/SettingsSection";
import AddMemberDialog from "../components/channel/AddMemberDialog";
import RemoveMemberDialog from "../components/channel/RemoveMemberDialog";
import {
  selectCurrentChannel,
  selectCurrentChannelLoading,
  selectCurrentChannelError,
  fetchChannelById,
  addMembersToChannel,
  selectIsAddingMembers,
  getChannelTeamMembers,
  selectTeamMembers,
  selectTeamMembersLoading,
  removeMemberFromChannel,
  selectIsRemovingMember,
} from "../redux/slices/channelsSlice";

import { toast } from "react-toastify";

// Main Channel Screen Component
export default function ChannelScreen() {
  const { channelId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // State management
  const [activeTab, setActiveTab] = useState("messages");
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [showRemoveMemberDialog, setShowRemoveMemberDialog] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);

  // Get data from Redux
  const currentUser = useSelector((state) => state.auth.user);
  const channel = useSelector(selectCurrentChannel);
  const isLoading = useSelector(selectCurrentChannelLoading);
  const error = useSelector(selectCurrentChannelError);
  const isAddingMembers = useSelector(selectIsAddingMembers);
  const isRemovingMember = useSelector(selectIsRemovingMember);
  const teamMembers = useSelector(selectTeamMembers);
  const teamMembersLoading = useSelector(selectTeamMembersLoading);

  // Check if user is channel admin
  const isChannelAdmin = useMemo(() => {
    if (!channel || !currentUser) return false;
    
    // Check if user is the channel creator
    if (channel.createdBy._id === currentUser._id) {
      return true;
    }
    
    // Check if user has admin role in the channel
    const userMember = channel.members?.find(member => 
      member.userId === currentUser._id || member.userId._id === currentUser._id
    );
    
    return userMember?.role === 'admin';
  }, [channel, currentUser]);

  // Determine mode from URL parameters - MODE IS LOCKED, NO SWITCHING
  const isManageMode = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    const mode = searchParams.get('mode');
    
    // Default to open mode if no mode specified
    if (!mode) return false;
    
    // Only allow manage mode if user is admin
    if (mode === 'manage' && !isChannelAdmin) {
      return false;
    }
    
    return mode === 'manage';
  }, [location.search, isChannelAdmin]);

  // Fetch channel data
  useEffect(() => {
    if (channelId) {
      dispatch(fetchChannelById(channelId));
    }
  }, [channelId, dispatch]);

  // Navigation handlers
  const handleBack = () => navigate("/channels");
  const handleAddMember = async () => {
    try {
      // Fetch team members when opening the dialog
      await dispatch(getChannelTeamMembers(channel._id)).unwrap();
      setShowAddMemberDialog(true);
    } catch (error) {
      console.error("Error fetching team members:", error);
      // Error handling is done in the Redux slice
    }
  };

  const handleAddMembers = async (selectedUsers) => {
    if (selectedUsers.length === 0) {
      toast.warning("Please select at least one user to add.");
      return;
    }

    try {
      const userIds = selectedUsers.map((user) => user._id);
      await dispatch(
        addMembersToChannel({ channelId: channel._id, userIds })
      ).unwrap();

      // Close dialog
      setShowAddMemberDialog(false);
    } catch (error) {
      console.error("Error adding members:", error);
      // Error handling is done in the Redux slice
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    console.log('memberToRemove :', memberToRemove);

    try {
      await dispatch(
        removeMemberFromChannel({ channelId: channel._id, memberId: memberToRemove.userId._id })
      ).unwrap();
      setShowRemoveMemberDialog(false);
      setMemberToRemove(null);
    } catch (error) {
      console.error("Error removing member:", error);
      // Error handling is done in the Redux slice
    }
  };

  const handleRemoveMemberClick = (member) => {
    setMemberToRemove(member);
    setShowRemoveMemberDialog(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading channel...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Error Loading Channel
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => navigate("/channels")} variant="outline">
              Back to Channels
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // No channel data
  if (!channel) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-600 text-2xl">📭</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Channel Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              The channel you're looking for doesn't exist or you don't have
              access to it.
            </p>
            <Button onClick={() => navigate("/channels")} variant="outline">
              Back to Channels
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopBar />

      {/* Channel Header */}
      <ChannelHeader
        channel={channel}
        isAdmin={isChannelAdmin}
        isManageMode={isManageMode}
        onBack={handleBack}
      />

      {/* Main Content */}
      <main className="flex-1 p-6 min-h-0">
        <div className="max-w-5xl mx-auto">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200">
              <TabsTrigger
                value="messages"
                className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Messages
              </TabsTrigger>
              <TabsTrigger
                value="members"
                className="data-[state=active]:bg-green-50 data-[state=active]:text-blue-700"
              >
                <Users className="w-4 h-4 mr-2" />
                Members
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700"
                disabled={!isChannelAdmin || !isManageMode}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="messages" className="space-y-6 min-h-[400px]">
              <MessagesSection channel={channel} isAdmin={isChannelAdmin} />
            </TabsContent>

            <TabsContent value="members" className="space-y-6 min-h-[400px]">
              <MembersSection
                channel={channel}
                isAdmin={isChannelAdmin}
                isManageMode={isManageMode}
                onAddMember={handleAddMember}
                onRemoveMember={handleRemoveMemberClick}
              />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6 min-h-[400px]">
              <SettingsSection channel={channel} isAdmin={isChannelAdmin} isManageMode={isManageMode} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />

      {/* Add Member Dialog */}
      <AddMemberDialog
        isOpen={showAddMemberDialog}
        onClose={() => setShowAddMemberDialog(false)}
        channel={channel}
        onAddMembers={handleAddMembers}
        isAdding={isAddingMembers}
        teamMembers={teamMembers}
        teamMembersLoading={teamMembersLoading}
      />

      {/* Remove Member Dialog */}
      <RemoveMemberDialog
        isOpen={showRemoveMemberDialog}
        onClose={() => setShowRemoveMemberDialog(false)}
        channel={channel}
        memberToRemove={memberToRemove}
        isRemoving={isRemovingMember}
        onRemoveMember={handleRemoveMember}
      />
    </div>
  );
}
