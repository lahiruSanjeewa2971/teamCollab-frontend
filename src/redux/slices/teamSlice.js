import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { createTeam, getTeams, updateTeam, removeMemberFromTeam, searchTeams, joinTeam, addMemberToTeam, deleteTeam } from "../../api/teamService";
import { setError } from "./errorSlice";

const initialState = {
  teams: [],
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isRemovingMember: false,
  isSearching: false,
  isJoining: false,
  isAddingMember: false,
  isDeleting: false,
  searchResults: [],
};

// Create team async thunk
const createTeamAsync = createAsyncThunk(
  "team/createTeam",
  async (teamData, { rejectWithValue, dispatch }) => {
    try {
      const response = await createTeam(teamData);
      return response;
    } catch (error) {
      console.log('Error in creating team:', error);
      let message = "Something went wrong.";
      if (error.response) {
        if (error.response.status === 400) message = error.response.data?.message || 'Invalid team data.';
        else if (error.response.status === 401) message = 'Unauthorized.';
        else if (error.response.status === 500) message = 'Server error';
        else message = error.response.data?.message || message;
      } else if (error.request) {
        message = 'Network error.';
      }
      // Dispatch global error here
      dispatch(setError(message));
      return rejectWithValue(message);
    }
  }
);

// Get teams async thunk
const getTeamsAsync = createAsyncThunk(
  "team/getTeams",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      console.log('getTeamsAsync: Starting to fetch teams...');
      const response = await getTeams();
      console.log('getTeamsAsync: Response received:', response);
      return response;
    } catch (error) {
      console.log('Error in getting teams:', error);
      let message = "Something went wrong.";
      if (error.response) {
        if (error.response.status === 401) message = 'Unauthorized.';
        else if (error.response.status === 500) message = 'Server error';
        else message = error.response.data?.message || message;
      } else if (error.request) {
        message = 'Network error.';
      }
      // Dispatch global error here
      dispatch(setError(message));
      return rejectWithValue(message);
    }
  }
);

// Update team async thunk
const updateTeamAsync = createAsyncThunk(
  "team/updateTeam",
  async ({ teamId, updateData }, { rejectWithValue, dispatch }) => {
    try {
      const response = await updateTeam(teamId, updateData);
      return response;
    } catch (error) {
      console.log('Error in updating team:', error);
      let message = "Something went wrong.";
      if (error.response) {
        if (error.response.status === 400) message = error.response.data?.message || 'Invalid team data.';
        else if (error.response.status === 401) message = 'Unauthorized.';
        else if (error.response.status === 403) message = 'Access denied. Only team owners can update teams.';
        else if (error.response.status === 404) message = 'Team not found.';
        else if (error.response.status === 500) message = 'Server error';
        else message = error.response.data?.message || message;
      } else if (error.request) {
        message = 'Network error.';
      }
      dispatch(setError(message));
      return rejectWithValue(message);
    }
  }
);

// Remove member async thunk
const removeMemberAsync = createAsyncThunk(
  "team/removeMember",
  async ({ teamId, memberId }, { rejectWithValue, dispatch }) => {
    try {
      const response = await removeMemberFromTeam(teamId, memberId);
      return response;
    } catch (error) {
      console.log('Error in removing member:', error);
      let message = "Something went wrong.";
      if (error.response) {
        if (error.response.status === 400) message = error.response.data?.message || 'Invalid request.';
        else if (error.response.status === 401) message = 'Unauthorized.';
        else if (error.response.status === 403) message = 'Access denied. Only team owners can remove members.';
        else if (error.response.status === 404) message = 'Team not found.';
        else if (error.response.status === 500) message = 'Server error';
        else message = error.response.data?.message || message;
      } else if (error.request) {
        message = 'Network error.';
      }
      dispatch(setError(message));
      return rejectWithValue(message);
    }
  }
);

// Search teams async thunk
const searchTeamsAsync = createAsyncThunk(
  "team/searchTeams",
  async (query, { rejectWithValue, dispatch }) => {
    try {
      const response = await searchTeams(query);
      return response;
    } catch (error) {
      console.log('Error in searching teams:', error);
      let message = "Something went wrong.";
      if (error.response) {
        if (error.response.status === 400) message = error.response.data?.message || 'Invalid search query.';
        else if (error.response.status === 401) message = 'Unauthorized.';
        else if (error.response.status === 500) message = 'Server error';
        else message = error.response.data?.message || message;
      } else if (error.request) {
        message = 'Network error.';
      }
      dispatch(setError(message));
      return rejectWithValue(message);
    }
  }
);

// Join team async thunk
const joinTeamAsync = createAsyncThunk(
  "team/joinTeam",
  async (teamId, { rejectWithValue, dispatch }) => {
    try {
      const response = await joinTeam(teamId);
      return response;
    } catch (error) {
      console.log('Error in joining team:', error);
      let message = "Something went wrong.";
      if (error.response) {
        if (error.response.status === 400) message = error.response.data?.message || 'Invalid request.';
        else if (error.response.status === 401) message = 'Unauthorized.';
        else if (error.response.status === 403) message = 'Access denied.';
        else if (error.response.status === 404) message = 'Team not found.';
        else if (error.response.status === 500) message = 'Server error';
        else message = error.response.data?.message || message;
      } else if (error.request) {
        message = 'Network error.';
      }
      dispatch(setError(message));
      return rejectWithValue(message);
    }
  }
);

// Add member async thunk
const addMemberAsync = createAsyncThunk(
  "team/addMember",
  async ({ teamId, memberData }, { rejectWithValue, dispatch }) => {
    try {
      const response = await addMemberToTeam(teamId, memberData);
      return response;
    } catch (error) {
      console.log('Error in adding member:', error);
      let message = "Something went wrong.";
      if (error.response) {
        if (error.response.status === 400) message = error.response.data?.message || 'Invalid request.';
        else if (error.response.status === 401) message = 'Unauthorized.';
        else if (error.response.status === 403) message = 'Access denied. Only team owners can add members.';
        else if (error.response.status === 404) message = 'Team not found.';
        else if (error.response.status === 500) message = 'Server error';
        else message = error.response.data?.message || message;
      } else if (error.request) {
        message = 'Network error.';
      }
      dispatch(setError(message));
      return rejectWithValue(message);
    }
  }
);

// Delete team async thunk
const deleteTeamAsync = createAsyncThunk(
  "team/deleteTeam",
  async (teamId, { rejectWithValue, dispatch }) => {
    try {
      const response = await deleteTeam(teamId);
      return response;
    } catch (error) {
      console.log('Error in deleting team:', error);
      let message = "Something went wrong.";
      if (error.response) {
        if (error.response.status === 400) message = error.response.data?.message || 'Invalid request.';
        else if (error.response.status === 401) message = 'Unauthorized.';
        else if (error.response.status === 403) message = 'Access denied. Only team owners can delete teams.';
        else if (error.response.status === 404) message = 'Team not found.';
        else if (error.response.status === 500) message = 'Server error';
        else message = error.response.data?.message || message;
      } else if (error.request) {
        message = 'Network error.';
      }
      dispatch(setError(message));
      return rejectWithValue(message);
    }
  }
);

const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {
    clearTeamError: (state) => {
      // This reducer is kept for future use if needed
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    // Remove team when user is kicked out
    removeTeamFromList: (state, action) => {
      const teamId = action.payload;
      state.teams = state.teams.filter(team => team._id !== teamId);
    },
  },
  extraReducers: (builder) => {
    builder
      // Create team cases
      .addCase(createTeamAsync.pending, (state) => {
        state.isCreating = true;
      })
      .addCase(createTeamAsync.fulfilled, (state, action) => {
        state.isCreating = false;
        // Ensure the new team has valid data before adding
        if (action.payload.team && action.payload.team._id && action.payload.team.name && action.payload.team.owner) {
          state.teams.unshift(action.payload.team);
        }
      })
      .addCase(createTeamAsync.rejected, (state) => {
        state.isCreating = false;
      })
      // Get teams cases
      .addCase(getTeamsAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTeamsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        console.log('getTeamsAsync.fulfilled: Payload received:', action.payload);
        // Ensure we only store valid teams with required properties
        state.teams = (action.payload.teams || []).filter(team => 
          team && 
          team._id && 
          team.name && 
          team.owner && 
          Array.isArray(team.members)
        );
        console.log('getTeamsAsync.fulfilled: Filtered teams stored:', state.teams);
      })
      .addCase(getTeamsAsync.rejected, (state) => {
        state.isLoading = false;
        console.log('getTeamsAsync.rejected: Error occurred');
      })
      // Update team cases
      .addCase(updateTeamAsync.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(updateTeamAsync.fulfilled, (state, action) => {
        state.isUpdating = false;
        // Update the team in the teams array
        const index = state.teams.findIndex(team => team._id === action.payload.team._id);
        if (index !== -1) {
          state.teams[index] = action.payload.team;
        }
      })
      .addCase(updateTeamAsync.rejected, (state) => {
        state.isUpdating = false;
      })
      // Remove member cases
      .addCase(removeMemberAsync.pending, (state) => {
        state.isRemovingMember = true;
      })
      .addCase(removeMemberAsync.fulfilled, (state, action) => {
        state.isRemovingMember = false;
        // Update the team in the teams array
        const index = state.teams.findIndex(team => team._id === action.payload.team._id);
        if (index !== -1) {
          state.teams[index] = action.payload.team;
        }
      })
      .addCase(removeMemberAsync.rejected, (state) => {
        state.isRemovingMember = false;
      })
      // Search teams cases
      .addCase(searchTeamsAsync.pending, (state) => {
        state.isSearching = true;
      })
      .addCase(searchTeamsAsync.fulfilled, (state, action) => {
        state.isSearching = false;
        // Ensure search results have valid data
        state.searchResults = (action.payload.teams || []).filter(team => 
          team && 
          team._id && 
          team.name && 
          team.owner && 
          Array.isArray(team.members)
        );
      })
      .addCase(searchTeamsAsync.rejected, (state) => {
        state.isSearching = false;
        state.searchResults = [];
      })
      // Join team cases
      .addCase(joinTeamAsync.pending, (state) => {
        state.isJoining = true;
      })
      .addCase(joinTeamAsync.fulfilled, (state, action) => {
        state.isJoining = false;
        // Add the joined team to the teams array if it has valid data
        // Backend returns 'updatedTeam', not 'team'
        const joinedTeam = action.payload.updatedTeam || action.payload.team;
        if (joinedTeam && joinedTeam._id && joinedTeam.name && joinedTeam.owner) {
          // Check if team already exists in the array (avoid duplicates)
          const existingTeamIndex = state.teams.findIndex(team => team._id === joinedTeam._id);
          if (existingTeamIndex === -1) {
            state.teams.push(joinedTeam);
          } else {
            // Update existing team with new data
            state.teams[existingTeamIndex] = joinedTeam;
          }
        }
        // Clear search results after joining
        state.searchResults = [];
      })
      .addCase(joinTeamAsync.rejected, (state) => {
        state.isJoining = false;
      })
      // Add member cases
      .addCase(addMemberAsync.pending, (state) => {
        state.isAddingMember = true;
      })
      .addCase(addMemberAsync.fulfilled, (state, action) => {
        state.isAddingMember = false;
        // Update the team in the teams array
        const index = state.teams.findIndex(team => team._id === action.payload.team._id);
        if (index !== -1) {
          state.teams[index] = action.payload.team;
        }
      })
      .addCase(addMemberAsync.rejected, (state) => {
        state.isAddingMember = false;
      })
      // Delete team cases
      .addCase(deleteTeamAsync.pending, (state) => {
        state.isDeleting = true;
      })
      .addCase(deleteTeamAsync.fulfilled, (state, action) => {
        state.isDeleting = false;
        // Remove the deleted team from the teams array
        state.teams = state.teams.filter(team => team._id !== action.payload.team._id);
      })
      .addCase(deleteTeamAsync.rejected, (state) => {
        state.isDeleting = false;
      });
  }
});

export const { clearTeamError, clearSearchResults, removeTeamFromList } = teamSlice.actions;
export default teamSlice.reducer;

// Selectors
export const selectTeams = (state) => state.team.teams;
export const selectTeamsLoading = (state) => state.team.isLoading;
export const selectTeamsError = (state) => state.team.error;
export const selectSearchResults = (state) => state.team.searchResults;
export const selectIsSearching = (state) => state.team.isSearching;

// Export all async thunks for use in components
export {
  createTeamAsync,
  getTeamsAsync,
  updateTeamAsync,
  removeMemberAsync,
  searchTeamsAsync,
  joinTeamAsync,
  addMemberAsync,
  deleteTeamAsync,
};
