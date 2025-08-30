import React, { useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "react-toastify";

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
                      <div className="animate-spin rounded-full h-4 h-4 border-b-2 border-blue-600"></div>
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
                <div className="animate-spin rounded-full h-4 h-4 border-b-2 border-white"></div>
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

export default AddMemberDialog;
