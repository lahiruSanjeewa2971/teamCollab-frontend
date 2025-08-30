import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchUserChannels } from '../redux/slices/channelsSlice';
import { selectUserChannels, selectUserChannelsLoading } from '../redux/slices/channelsSlice';
import { selectTeams } from '../redux/slices/teamSlice';
import { getTeamsAsync } from '../redux/slices/teamSlice';
import { store } from '../redux/store';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Hash, Settings, ArrowLeft, Users, Filter } from 'lucide-react';

export default function Channels() {
  const dispatch = useDispatch();
  const channels = useSelector(selectUserChannels);
  const isLoading = useSelector(selectUserChannelsLoading);
  const teams = useSelector(selectTeams);
  
  // Get current user from auth state
  const currentUser = useSelector(state => state.auth.user);
  
  // Filter state
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('all');

  // Fetch user channels and teams on component mount
  useEffect(() => {
    dispatch(fetchUserChannels());
    dispatch(getTeamsAsync());
  }, [dispatch]);

  // Filter channels based on selected team
  const filteredChannels = useMemo(() => {
    if (selectedTeamFilter === 'all') {
      return channels;
    }
    return channels.filter(channel => 
      channel.teamId?._id === selectedTeamFilter || channel.teamId === selectedTeamFilter
    );
  }, [channels, selectedTeamFilter]);

  // Helper function to check if user is admin of a channel
  const isChannelAdmin = (channel) => {
    console.log('channel :', channel);
    if (!channel.members || !channel.members.length) return false;
    
    // Get current user ID from Redux state
    const currentUser = store.getState().auth.user;
    if (!currentUser) return false;
    
    // Check if current user is the channel creator
    if (channel.createdBy._id === currentUser._id) {
      return true;
    }
    
    // Check if current user has admin role in the channel
    const userMember = channel.members.find(member => 
      member.userId === currentUser._id || member.userId._id === currentUser._id
    );
    
    return userMember?.role === 'admin';
  };

  // Helper function to get channel member count
  const getChannelMemberCount = (channel) => {
    return channel.members?.length || 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your channels...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopBar />
      
      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link 
                to="/teams"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Back to Teams</span>
              </Link>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Channels</h1>
                <p className="text-gray-600 mt-2">
                  Manage and access the channels you've joined across all teams
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm text-gray-600">Joined Channels</p>
                  <p className="text-2xl font-bold text-blue-600">{filteredChannels.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Section */}
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Filter className="w-4 h-4" />
                <span>Filter by team:</span>
              </div>
              
              <select
                value={selectedTeamFilter}
                onChange={(e) => setSelectedTeamFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="all">All Teams</option>
                {teams.map((team) => (
                  <option key={team._id} value={team._id}>
                    {team.name}
                  </option>
                ))}
              </select>
              
              {selectedTeamFilter !== 'all' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTeamFilter('all')}
                  className="text-xs"
                >
                  Clear Filter
                </Button>
              )}
            </div>
            
            {/* Filter Summary */}
            {selectedTeamFilter !== 'all' && (
              <div className="mt-2 text-sm text-gray-600">
                Showing channels from: <span className="font-medium text-gray-900">
                  {teams.find(team => team._id === selectedTeamFilter)?.name || 'Unknown Team'}
                </span>
              </div>
            )}
          </div>

          {/* Channels Grid */}
          {filteredChannels.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Hash className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {selectedTeamFilter === 'all' ? 'No channels joined yet' : 'No channels in this team'}
              </h3>
              <p className="text-gray-600 mb-6">
                {selectedTeamFilter === 'all' 
                  ? "You haven't joined any channels yet. Discover and join channels from the Dashboard to get started!"
                  : "You haven't joined any channels in this team yet."
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Hash className="w-4 h-4" />
                  Discover Channels
                </Link>
                {selectedTeamFilter !== 'all' && (
                  <Button
                    variant="outline"
                    onClick={() => setSelectedTeamFilter('all')}
                  >
                    View All Channels
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredChannels.map((channel) => (
                <div
                  key={channel._id}
                  className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4 sm:p-6 flex flex-col"
                >
                  {/* Channel Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Hash className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-tight">
                          {channel.name.length > 12 ? (
                            <>
                              <span className="block">#{channel.name.substring(0, 12)}</span>
                              <span className="block text-left">{channel.name.substring(12)}</span>
                            </>
                          ) : (
                            <span>#{channel.name}</span>
                          )}
                        </h3>
                        {channel.displayName && (
                          <p className="text-xs text-gray-500 line-clamp-1 mt-1">
                            {channel.displayName}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Admin Badge */}
                    {isChannelAdmin(channel) && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex-shrink-0 ml-2">
                        Admin
                      </span>
                    )}
                  </div>

                  {/* Channel Info */}
                  <div className="space-y-2 mb-4">
                    <div className="h-12 flex items-start">
                      {channel.description ? (
                        <p className="text-sm text-gray-600 line-clamp-2 leading-tight">
                          {channel.description}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400 italic">
                          No description available
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{getChannelMemberCount(channel)} members</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                        <span className="capitalize">{channel.type}</span>
                      </div>
                    </div>
                  </div>

                  {/* Channel Actions */}
                  <div className="flex items-center gap-2 mt-auto">
                    <Link
                      to={`/channels/${channel._id}?mode=open`}
                      className="flex-1 text-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                    >
                      Open Channel
                    </Link>
                    
                    {isChannelAdmin(channel) && (
                      <Link to={`/channels/${channel._id}?mode=manage`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-3 py-2 h-auto w-full"
                        >
                          <Settings className="w-4 h-4" />
                          <span className="hidden sm:inline ml-1">Manage</span>
                        </Button>
                      </Link>
                    )}
                  </div>

                  {/* Team Info */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Team:</span>
                      <span className="font-medium text-gray-700">
                        {channel.teamId?.name || 'Unknown Team'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
