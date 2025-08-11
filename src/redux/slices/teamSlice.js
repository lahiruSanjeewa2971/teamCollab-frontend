import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { createTeam, getTeams, updateTeam } from "../../api/teamService";
import { setError } from "./errorSlice";

const initialState = {
  teams: [],
  isLoading: false,
  isCreating: false,
  isUpdating: false,
};

// Create team async thunk
export const createTeamAsync = createAsyncThunk(
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
export const getTeamsAsync = createAsyncThunk(
  "team/getTeams",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await getTeams();
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
export const updateTeamAsync = createAsyncThunk(
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

const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {
    clearTeamError: (state) => {
      // This reducer is kept for future use if needed
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
        state.teams.unshift(action.payload.team);
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
        state.teams = action.payload.teams;
      })
      .addCase(getTeamsAsync.rejected, (state) => {
        state.isLoading = false;
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
      });
  }
});

export const { clearTeamError } = teamSlice.actions;
export default teamSlice.reducer;
