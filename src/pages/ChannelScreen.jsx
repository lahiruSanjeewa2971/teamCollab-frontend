import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  ArrowLeft,
  Hash,
  Lock,
  Users,
  Settings,
  Plus,
  MessageSquare,
  Search,
  X,
  Trash2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
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
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import { store } from "../redux/store";
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

// Clean Architecture: Separate concerns into logical sections
const ChannelHeader = ({ channel, isAdmin, onBack }) => (
  <div className="flex items-center justify-between p-6 bg-white border-b border-gray-200">
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="p-2 hover:bg-gray-100"
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>

      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
          {channel.type === "private" ? (
            <Lock className="w-6 h-6 text-white" />
          ) : (
            <Hash className="w-6 h-6 text-white" />
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">#{channel.name}</h1>
          {channel.displayName && (
            <p className="text-gray-600 text-lg">{channel.displayName}</p>
          )}
          {channel.description && (
            <p className="text-gray-500 text-sm mt-1">{channel.description}</p>
          )}
        </div>
      </div>
    </div>

    <div className="flex items-center gap-3">
      {isAdmin && (
        <Badge
          variant="secondary"
          className="bg-green-100 text-green-800 border-green-200"
        >
          <Settings className="w-4 h-4 mr-1" />
          Admin
        </Badge>
      )}

      <Badge
        variant="outline"
        className="bg-blue-50 text-blue-700 border-blue-200"
      >
        <Users className="w-4 h-4 mr-1" />
        {channel.members?.length || 0} members
      </Badge>
    </div>
  </div>
);

const MessagesSection = ({ channel, isAdmin }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-blue-600" />
        Messages
      </h3>
      <span className="text-sm text-gray-500">Coming soon...</span>
    </div>

    <Card className="border-dashed border-2 border-gray-200 bg-gray-50">
      <CardContent className="p-8 text-center">
        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h4 className="text-lg font-medium text-gray-900 mb-2">
          Messages Coming Soon
        </h4>
        <p className="text-gray-600 mb-4">
          The messaging system is under development. You'll be able to send and
          receive messages here.
        </p>
        <Button variant="outline" disabled>
          <MessageSquare className="w-4 h-4 mr-2" />
          Start Messaging
        </Button>
      </CardContent>
    </Card>
  </div>
);

const MembersSection = ({ channel, isAdmin, onAddMember, onRemoveMember }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <Users className="w-5 h-5 text-green-600" />
        Members ({channel.members?.length || 0})
      </h3>
      {isAdmin && (
        <Button
          onClick={onAddMember}
          size="sm"
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Member
        </Button>
      )}
    </div>

    <div className="grid gap-3">
      {channel.members?.map((member) => (
        <Card
          key={member._id || member.userId}
          className="hover:shadow-sm transition-shadow"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={member.userId?.avatarUrl} />
                  <AvatarFallback>
                    {getMemberInitials(member.userId)}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <p className="font-medium text-gray-900">
                    {member.userId?.name || "Unknown User"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {member.userId?.email || "No email"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant={member.role === "admin" ? "default" : "secondary"}
                  className={
                    member.role === "admin"
                      ? "bg-blue-100 text-blue-800 border-blue-200"
                      : "bg-gray-100 text-gray-700 border-gray-200"
                  }
                >
                  {member.role === "admin" ? "Admin" : "Member"}
                </Badge>

                {isAdmin && member.role !== "admin" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Remove member"
                    onClick={() => onRemoveMember(member)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-2 text-xs text-gray-500">
              Joined {new Date(member.joinedAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

const SettingsSection = ({ channel, isAdmin }) => {
  if (!isAdmin) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <Settings className="w-5 h-5 text-purple-600" />
        Channel Settings
      </h3>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Channel Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Channel Name
              </label>
              <input
                type="text"
                value={channel.name}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={channel.displayName || ""}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={channel.description || ""}
                disabled
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
            <Button variant="outline" disabled>
              <Settings className="w-4 h-4 mr-2" />
              Edit Channel
            </Button>
            <Button variant="outline" disabled>
              <Lock className="w-4 h-4 mr-2" />
              Privacy Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Add Member Dialog Component
const AddMemberDialog = ({
  isOpen,
  onClose,
  channel,
  onAddMembers,
  isAdding,
  teamMembers,
  teamMembersLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const handleSearchUsers = async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Filter team members based on search query
      const matchingTeamMembers = (teamMembers?.members || []).filter(
        (member) => {
          const memberName = member.name || "";
          const memberEmail = member.email || "";
          const searchTerm = query.toLowerCase();

          return (
            memberName.toLowerCase().includes(searchTerm) ||
            memberEmail.toLowerCase().includes(searchTerm)
          );
        }
      );

      // Filter out users who are already channel members
      const availableUsers = matchingTeamMembers.filter(
        (teamMember) =>
          !channel.members.some(
            (channelMember) =>
              channelMember.userId === teamMember._id ||
              channelMember.userId._id === teamMember._id
          )
      );

      setSearchResults(availableUsers);
    } catch (error) {
      console.error("Error searching team members:", error);
      toast.error("Failed to search team members. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUsers((prev) => {
      const isAlreadySelected = prev.some((u) => u._id === user._id);
      if (isAlreadySelected) {
        return prev.filter((u) => u._id !== user._id);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleAddSelectedMembers = async () => {
    if (selectedUsers.length === 0) {
      toast.warning("Please select at least one user to add.");
      return;
    }

    try {
      await onAddMembers(selectedUsers);

      // Reset state
      setSelectedUsers([]);
      setSearchQuery("");
      setSearchResults([]);
      onClose();
    } catch (error) {
      console.error("Error adding members:", error);
    }
  };

  const closeDialog = () => {
    setSelectedUsers([]);
    setSearchQuery("");
    setSearchResults([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Add Channel Members
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Search within team members to add to #{channel.name}. Only team
              members who aren't already in the channel will appear in search
              results.
            </p>
          </div>
          <button
            onClick={closeDialog}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Show loading state when fetching team members */}
          {teamMembersLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading team members...</p>
            </div>
          )}

          {/* Show search interface when team members are loaded */}
          {!teamMembersLoading && teamMembers && (
            <>
              {/* Search Input */}
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      const query = e.target.value;
                      setSearchQuery(query);
                      // Debounced search
                      const timeoutId = setTimeout(
                        () => handleSearchUsers(query),
                        300
                      );
                      return () => clearTimeout(timeoutId);
                    }}
                    placeholder="Search within team members by name or email..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="border border-gray-200 rounded-md">
                  <div className="p-3 bg-gray-50 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-700">
                      Found {searchResults.length} user
                      {searchResults.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {searchResults.map((user) => {
                      const isSelected = selectedUsers.some(
                        (u) => u._id === user._id
                      );
                      return (
                        <div
                          key={user._id}
                          onClick={() => handleUserSelect(user)}
                          className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                            isSelected
                              ? "bg-blue-50 border-l-4 border-l-blue-500"
                              : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {user.name
                                ? user.name.charAt(0).toUpperCase()
                                : "?"}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {user.name || "Unknown"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {user.email}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {isSelected && (
                                <svg
                                  className="w-5 h-5 text-blue-600"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  isSelected
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {isSelected ? "Selected" : "Click to select"}
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
                      <div
                        key={user._id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                            {user.name
                              ? user.name.charAt(0).toUpperCase()
                              : "?"}
                          </div>
                          <span className="text-sm text-blue-900">
                            {user.name || "Unknown"}
                          </span>
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
              {searchQuery &&
                searchQuery.length >= 2 &&
                !isSearching &&
                searchResults.length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    <p>
                      No available team members found matching "{searchQuery}"
                    </p>
                    <p className="text-sm">
                      All matching team members may already be in the channel
                    </p>
                  </div>
                )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button variant="outline" onClick={closeDialog} disabled={isAdding}>
            Cancel
          </Button>
          <Button
            onClick={handleAddSelectedMembers}
            disabled={isAdding || selectedUsers.length === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isAdding ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Adding...
              </div>
            ) : (
              `Add ${selectedUsers.length} Member${
                selectedUsers.length !== 1 ? "s" : ""
              }`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Remove Member Dialog Component
const RemoveMemberDialog = ({
  isOpen,
  onClose,
  channel,
  memberToRemove,
  isRemoving,
  onRemoveMember,
}) => {
  if (!isOpen) return null;

  const memberName = memberToRemove?.userId?.name || memberToRemove?.userId?.email || "this user";

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you absolutely sure you want to remove{" "}
            <span className="font-semibold">{memberName}</span>{" "}
            from the channel?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently remove{" "}
            {memberName} from the channel. The user will remain a member of the team.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} disabled={isRemoving}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onRemoveMember}
            disabled={isRemoving}
            className="bg-red-600 hover:bg-red-700"
          >
            {isRemoving ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Removing...
              </div>
            ) : (
              "Remove Member"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Helper function to get member initials
const getMemberInitials = (user) => {
  if (!user) return "U";
  const name = user.name || "";
  const firstChar = name.charAt(0);
  const lastChar = name.charAt(name.length - 1);
  return `${firstChar}${lastChar}`;
};

// Main Channel Screen Component
export default function ChannelScreen() {
  const { channelId } = useParams();
  const navigate = useNavigate();
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

  // Clean Architecture: Separate business logic
  const isChannelAdmin = useMemo(() => {
    if (!channel || !currentUser) return false;

    // Check if user is the channel creator
    if (channel.createdBy._id === currentUser._id) {
      return true;
    }

    // Check if user has admin role in the channel
    const userMember = channel.members?.find(
      (member) =>
        member.userId === currentUser._id ||
        member.userId._id === currentUser._id
    );

    return userMember?.role === "admin";
  }, [channel, currentUser]);

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
                disabled={!isChannelAdmin}
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
                onAddMember={handleAddMember}
                onRemoveMember={handleRemoveMemberClick}
              />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6 min-h-[400px]">
              <SettingsSection channel={channel} isAdmin={isChannelAdmin} />
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
