import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { searchTeamsAsync, joinTeamAsync, clearSearchResults } from '../redux/slices/teamSlice';
import { getTeamOwnerName, getTeamMemberCount, getMemberName, getMemberInitials } from '../utils/safeAccess';

export default function TeamSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const dispatch = useDispatch();
  const { searchResults, isSearching, isJoining } = useSelector((state) => state.team);

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId;
      return (query) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (query.trim().length >= 2) {
            performSearch(query.trim());
          } else {
            // Clear search results when query is too short
            dispatch(clearSearchResults());
          }
        }, 300);
      };
    })(),
    [dispatch]
  );

  // Perform search
  const performSearch = async (query) => {
    if (!query || query.trim().length < 2) return;
    
    try {
      await dispatch(searchTeamsAsync(query));
      // Redux automatically handles the state updates
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('An unexpected error occurred. Please try again.');
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  // Handle team join
  const handleJoinTeam = async (teamId) => {
    try {
      const resultAction = await dispatch(joinTeamAsync(teamId));
      
      if (joinTeamAsync.fulfilled.match(resultAction)) {
        toast.success('Successfully joined the team!');
        console.log('Team joined successfully:', resultAction.payload);
        
        // Clear search query - Redux automatically clears search results
        setSearchQuery('');
      } else if (joinTeamAsync.rejected.match(resultAction)) {
        // Error is already handled by the thunk
        toast.error(resultAction.payload || 'Failed to join team. Please try again.');
      }
    } catch (error) {
      console.error('Join team failed:', error);
      toast.error('An unexpected error occurred. Please try again.');
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    dispatch(clearSearchResults());
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          id="team-search-input"
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search teams by name..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Loading State */}
      {isSearching && (
        <div className="flex items-center justify-center py-4">
          <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-2 text-sm text-gray-600">Searching...</span>
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">
              Found {searchResults.length} team{searchResults.length !== 1 ? 's' : ''}
            </h4>
            <button
              onClick={clearSearch}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          </div>
          
          {searchResults.map((team) => (
            <div key={team._id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 mb-1">{team.name}</h5>
                  <p className="text-sm text-gray-600 mb-2">
                    {team.description || "No description"}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                                         <span>Owner: {getTeamOwnerName(team)}</span>
                     <span>{getTeamMemberCount(team)} members</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1">
                    {team.members?.slice(0, 3).map((member, index) => (
                      <div 
                        key={member._id || index} 
                        className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-xs text-white font-medium"
                        title={member.name}
                      >
                                                 {getMemberInitials(member)}
                      </div>
                    ))}
                    {team.members?.length > 3 && (
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs text-gray-600 font-medium">
                        +{team.members.length - 3}
                      </div>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => handleJoinTeam(team._id)}
                  disabled={isJoining}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isJoining ? 'Joining...' : 'Join Team'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {searchQuery && searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
        <div className="text-center py-6">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
            </svg>
          </div>
          <h4 className="text-sm font-medium text-gray-900 mb-1">No teams found</h4>
          <p className="text-sm text-gray-500">
            No teams match "{searchQuery}". Try a different search term.
          </p>
        </div>
      )}

      {/* Search Hint */}
      {!searchQuery && searchResults.length === 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">
            Type at least 2 characters to search for teams
          </p>
        </div>
      )}
    </div>
  );
}
