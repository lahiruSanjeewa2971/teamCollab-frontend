import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSocket } from '../../contexts/SocketContext.jsx';
import { 
  selectUserChannels, 
  selectUserChannelsLoading,
  selectAvailableChannels,
  selectAvailableChannelsLoading,
  selectIsJoiningChannel
} from '../../redux/slices/channelsSlice.js';
import { selectTeams, selectTeamsLoading } from '../../redux/slices/teamSlice.js';
import { fetchUserChannels, fetchChannelsFromUserTeams, joinChannel } from '../../redux/slices/channelsSlice.js';
import { getTeamsAsync } from '../../redux/slices/teamSlice.js';
import { store } from '../../redux/store.js';
import CreateChannelDialog from '../channels/CreateChannelDialog.jsx';
import { Button } from '../ui/button.jsx';
import { Plus, Hash, Lock, Users } from 'lucide-react';

const ChannelsSection = ({ currentTeamId = null }) => {
  const dispatch = useDispatch();
  const { socketService } = useSocket();
  const teams = useSelector(selectTeams);
  const teamsLoading = useSelector(selectTeamsLoading);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState(currentTeamId);
  // Add local state to track which specific channel is being joined
  const [joiningChannelId, setJoiningChannelId] = useState(null);

  // Get all user channels (joined channels)
  const userChannels = useSelector(selectUserChannels);
  const userChannelsLoading = useSelector(selectUserChannelsLoading);
  
  // Get all available channels from user's teams
  const availableChannels = useSelector(selectAvailableChannels);
  const availableChannelsLoading = useSelector(selectAvailableChannelsLoading);
  
  // Get join channel state (keep for backward compatibility but won't use for loading)
  const isJoining = useSelector(selectIsJoiningChannel);
  
  // Get current user ID
  const currentUser = useSelector(state => state.auth.user);

  // Fetch teams when component mounts
  useEffect(() => {
    console.log('ChannelsSection: Fetching teams...');
    console.log('ChannelsSection: Current auth state:', store.getState().auth);
    dispatch(getTeamsAsync());
  }, [dispatch]);

  // Set selected team when currentTeamId changes
  useEffect(() => {
    console.log('ChannelsSection: Teams changed:', teams);
    if (currentTeamId && teams.some(team => team._id === currentTeamId)) {
      setSelectedTeamId(currentTeamId);
    }
    // Don't auto-select any team by default - let user choose
  }, [currentTeamId, teams]);

  // Fetch user channels when component mounts
  useEffect(() => {
    dispatch(fetchUserChannels());
  }, [dispatch]);

  // Fetch available channels when teams are loaded
  useEffect(() => {
    if (teams.length > 0) {
      const teamIds = teams.map(team => team._id);
      dispatch(fetchChannelsFromUserTeams(teamIds));
    }
  }, [teams, dispatch]);

  // Join team rooms for real-time updates when teams are loaded
  useEffect(() => {
    if (teams.length > 0 && socketService?.isConnected) {
      // Join all team rooms for real-time updates
      teams.forEach(team => {
        socketService.joinTeamRoom(team._id);
      });
    }
  }, [teams, socketService]);

  // Also join team rooms when channels are loaded (in case teams were loaded first)
  useEffect(() => {
    if (userChannels.length > 0 && socketService?.isConnected) {
      // Get unique team IDs from channels
      const teamIds = [...new Set(userChannels.map(channel => channel.teamId._id || channel.teamId))];
      
      // Join all team rooms
      teamIds.forEach(teamId => {
        socketService.joinTeamRoom(teamId);
      });
    }
  }, [userChannels, socketService]);

  // Cleanup team room when component unmounts or team changes
  useEffect(() => {
    return () => {
      if (selectedTeamId && socketService?.isConnected) {
        socketService.leaveTeamRoom(selectedTeamId);
      }
    };
  }, [selectedTeamId, socketService]);

  // Clear local joining state when channel is successfully joined
  useEffect(() => {
    if (joiningChannelId && !isJoining) {
      // Redux joining state is false, meaning the operation completed
      // Check if the channel is now in userChannels (successfully joined)
      const isNowMember = userChannels.some(channel => channel._id === joiningChannelId);
      if (isNowMember) {
        setJoiningChannelId(null);
      }
    }
  }, [joiningChannelId, isJoining, userChannels]);

  // Check if user is a member of a channel
  const isChannelMember = (channelId) => {
    // First check if it's in userChannels (already joined)
    if (userChannels.some(userChannel => userChannel._id === channelId)) {
      return true;
    }
    
    // Then check if user is in the channel's members array from availableChannels
    const channel = availableChannels.find(c => c._id === channelId);
    if (channel && channel.members && currentUser) {
      return channel.members.some(member => 
        member.userId === currentUser._id || member.userId._id === currentUser._id
      );
    }
    
    return false;
  };

  const handleCreateChannel = () => {
    if (teams.length === 0) {
      // This shouldn't happen since the button is disabled, but adding safety check
      return;
    }
    setIsCreateDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false);
  };

  const handleJoinChannel = async (channelId) => {
    // Set local loading state for this specific channel
    setJoiningChannelId(channelId);
    
    try {
      await dispatch(joinChannel(channelId)).unwrap();
      // Success - channel joined, local state will be cleared by useEffect
    } catch (error) {
      // Error occurred, clear local loading state
      setJoiningChannelId(null);
      console.error('Failed to join channel:', error);
    }
  };

  const getChannelIcon = (type) => {
    return type === 'private' ? <Lock className="h-4 w-4" /> : <Hash className="h-4 w-4" />;
  };

  const getChannelDisplayName = (channel) => {
    return channel.displayName || channel.name;
  };

  // Show loading if either channels or teams are loading
  const isLoading = userChannelsLoading || availableChannelsLoading || teamsLoading;
  
  // Check if a specific channel is being joined using local state
  const isChannelBeingJoined = (channelId) => joiningChannelId === channelId;

  return (
    <div className="space-y-2">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between px-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Channels
        </h3>
        {teams.length === 0 ? (
          <Button
            variant="ghost"
            size="sm"
            disabled
            className="h-6 w-6 p-0 opacity-50 cursor-not-allowed"
            title="To create a channel, you need to be a team member or owner"
          >
            <Plus className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCreateChannel}
            className="h-6 w-6 p-0 hover:bg-muted"
            title="Create channel"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Team Selector */}
      {teamsLoading ? (
        <div className="px-3 py-2">
          <div className="text-sm text-muted-foreground">Loading teams...</div>
        </div>
      ) : teams.length > 0 ? (
        <div className="px-3">
          {/* Team selector removed for now - showing all channels */}
        </div>
      ) : (
        <div className="px-3 py-2">
          <div className="text-sm text-muted-foreground text-center">
            <div className="mb-2">📋 No teams available</div>
            <div className="text-xs">Join or create a team to start creating channels</div>
          </div>
        </div>
      )}

      {/* Channels List - Flat List of All Available Channels */}
      <div className="space-y-1">
        {isLoading ? (
          <div className="px-3 py-2">
            <div className="text-sm text-muted-foreground">Loading channels...</div>
          </div>
        ) : availableChannels.length === 0 ? (
          <div className="px-3 py-2">
            <div className="text-sm text-muted-foreground">
              No channels available yet. Create one to get started!
            </div>
          </div>
        ) : (
          availableChannels.map((channel) => {
            const isMember = isChannelMember(channel._id);
            
            return (
              <div
                key={channel._id}
                className="flex items-center justify-between px-3 py-1.5 text-sm hover:bg-muted rounded-md group"
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  {getChannelIcon(channel.type)}
                  <span className="truncate">
                    #{channel.name}
                  </span>
                  <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    {channel.teamId?.name}
                  </span>
                  {channel.type === 'private' && (
                    <Lock className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
                
                {/* Join/Joined Status */}
                <div className="flex items-center gap-1">
                  {isMember ? (
                    <span className="text-xs text-green-600 font-medium px-2 py-1 bg-green-50 rounded-full">
                      Joined
                    </span>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleJoinChannel(channel._id)}
                      disabled={isChannelBeingJoined(channel._id)}
                      className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isChannelBeingJoined(channel._id) ? (
                        <>
                          <div className="mr-1 h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                          Joining...
                        </>
                      ) : (
                        'Join'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Channel Dialog */}
      {teams.length > 0 && (
        <CreateChannelDialog
          isOpen={isCreateDialogOpen}
          onClose={handleCloseDialog}
          currentTeamId={selectedTeamId}
        />
      )}
    </div>
  );
};

export default ChannelsSection;
