import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSocket } from '../../contexts/SocketContext.jsx';
import { selectUserChannels, selectUserChannelsLoading } from '../../redux/slices/channelsSlice.js';
import { selectTeams, selectTeamsLoading } from '../../redux/slices/teamSlice.js';
import { fetchUserChannels } from '../../redux/slices/channelsSlice.js';
import { getTeamsAsync } from '../../redux/slices/teamSlice.js';
import { store } from '../../redux/store.js';
import CreateChannelDialog from '../channels/CreateChannelDialog.jsx';
import { Button } from '../ui/button.jsx';
import { Plus, Hash, Lock } from 'lucide-react';

const ChannelsSection = ({ currentTeamId = null }) => {
  const dispatch = useDispatch();
  const { socketService } = useSocket();
  const teams = useSelector(selectTeams);
  const teamsLoading = useSelector(selectTeamsLoading);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState(currentTeamId);

  // Get all user channels
  const channels = useSelector(selectUserChannels);
  const isLoading = useSelector(selectUserChannelsLoading);

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
    if (channels.length > 0 && socketService?.isConnected) {
      // Get unique team IDs from channels
      const teamIds = [...new Set(channels.map(channel => channel.teamId._id || channel.teamId))];
      
      // Join all team rooms
      teamIds.forEach(teamId => {
        socketService.joinTeamRoom(teamId);
      });
    }
  }, [channels, socketService]);

  // Cleanup team room when component unmounts or team changes
  useEffect(() => {
    return () => {
      if (selectedTeamId && socketService?.isConnected) {
        socketService.leaveTeamRoom(selectedTeamId);
      }
    };
  }, [selectedTeamId, socketService]);

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

  const getChannelIcon = (type) => {
    return type === 'private' ? <Lock className="h-4 w-4" /> : <Hash className="h-4 w-4" />;
  };

  const getChannelDisplayName = (channel) => {
    return channel.displayName || channel.name;
  };

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
            {/* <select
              value={selectedTeamId || ''}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="w-full text-xs bg-transparent border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Please select a team</option>
              {teams.map((team) => (
                <option key={team._id} value={team._id}>
                  {team.name}
                </option>
              ))}
            </select> */}
          </div>
        ) : (
          <div className="px-3 py-2">
            <div className="text-sm text-muted-foreground text-center">
              <div className="mb-2">📋 No teams available</div>
              <div className="text-xs">Join or create a team to start creating channels</div>
            </div>
          </div>
        )}

      {/* Debug info
      {process.env.NODE_ENV === 'development' && (
        <div className="px-3 py-1 text-xs text-gray-400">
          Teams count: {teams.length} | Loading: {teamsLoading ? 'Yes' : 'No'}
        </div>
      )} */}

      {/* Channels List */}
      <div className="space-y-1">
        {isLoading ? (
          <div className="px-3 py-2">
            <div className="text-sm text-muted-foreground">Loading channels...</div>
          </div>
        ) : channels.length === 0 ? (
          <div className="px-3 py-2">
            <div className="text-sm text-muted-foreground">
              No channels yet. Create one to get started!
            </div>
          </div>
        ) : (
          channels.map((channel) => (
            <div
              key={channel._id}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm hover:bg-muted rounded-md cursor-pointer group"
            >
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
          ))
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
