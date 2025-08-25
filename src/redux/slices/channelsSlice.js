import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { channelService } from "../../api/channelService.js";
import { toast } from "react-toastify";

// Async thunks
export const fetchChannelsByTeam = createAsyncThunk(
  "channels/fetchChannelsByTeam",
  async (teamId, { rejectWithValue }) => {
    try {
      const response = await channelService.getChannelsByTeam(teamId);
      return { teamId, channels: response.channels };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch channels"
      );
    }
  }
);

export const createChannel = createAsyncThunk(
  "channels/createChannel",
  async ({ teamId, channelData }, { rejectWithValue }) => {
    try {
      const response = await channelService.createChannel(teamId, channelData);
      return { teamId, channel: response.channel };
    } catch (error) {
      if (error.response?.status === 409) {
        return rejectWithValue({
          code: "CHANNEL_NAME_TAKEN",
          message: "This channel name is already taken in this team",
        });
      }
      return rejectWithValue(
        error.response?.data?.message || "Failed to create channel"
      );
    }
  }
);

export const fetchUserChannels = createAsyncThunk(
  "channels/fetchUserChannels",
  async (_, { rejectWithValue }) => {
    try {
      const response = await channelService.getUserChannels();
      return response.channels;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user channels"
      );
    }
  }
);

export const fetchChannelsFromUserTeams = createAsyncThunk(
  "channels/fetchChannelsFromUserTeams",
  async (teamIds, { rejectWithValue }) => {
    try {
      const response = await channelService.getChannelsFromUserTeams(teamIds);
      return response.channels;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch channels from teams"
      );
    }
  }
);

export const joinChannel = createAsyncThunk(
  "channels/joinChannel",
  async (channelId, { rejectWithValue }) => {
    try {
      const response = await channelService.joinChannel(channelId);
      return response.channel;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to join channel"
      );
    }
  }
);

const initialState = {
  byTeamId: {},
  userChannels: [],
  availableChannels: [], // All channels from user's teams
  creating: false,
  createError: null,
  loading: false,
  error: null,
  userChannelsLoading: false,
  userChannelsError: null,
  availableChannelsLoading: false,
  availableChannelsError: null,
  joining: false,
  joinError: null,
};

const channelsSlice = createSlice({
  name: "channels",
  initialState,
  reducers: {
    clearCreateError: (state) => {
      state.createError = null;
    },
    addChannelToTeam: (state, action) => {
      const { teamId, channel } = action.payload;
      if (!state.byTeamId[teamId]) {
        state.byTeamId[teamId] = { items: [], loading: false, error: null };
      }

      // Check if channel already exists
      const existingIndex = state.byTeamId[teamId].items.findIndex(
        (c) => c._id === channel._id
      );

      if (existingIndex === -1) {
        state.byTeamId[teamId].items.push(channel);
        // Sort alphabetically by name
        state.byTeamId[teamId].items.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
      }
    },

    addChannelToUserChannels: (state, action) => {
      const { channel } = action.payload;

      // Check if channel already exists in user channels
      const existingIndex = state.userChannels.findIndex(
        (c) => c._id === channel._id
      );

      if (existingIndex === -1) {
        state.userChannels.unshift(channel); // Add to beginning (newest first)
      }

      // Also add channel to available channels for Dashboard real-time updates
      const availableChannelIndex = state.availableChannels.findIndex(
        (c) => c._id === channel._id
      );

      if (availableChannelIndex === -1) {
        state.availableChannels.push(channel);
        // Sort alphabetically by name
        state.availableChannels.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
      }
    },

    updateChannelInAvailableChannels: (state, action) => {
      const { channel } = action.payload;
      
      // Update channel in availableChannels list
      const availableChannelIndex = state.availableChannels.findIndex(
        (c) => c._id === channel._id
      );

      if (availableChannelIndex !== -1) {
        // Update the existing channel with new data
        state.availableChannels[availableChannelIndex] = channel;
      }
    },
    clearChannelsForTeam: (state, action) => {
      const teamId = action.payload;
      delete state.byTeamId[teamId];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch channels
      .addCase(fetchChannelsByTeam.pending, (state, action) => {
        const teamId = action.meta.arg;
        if (!state.byTeamId[teamId]) {
          state.byTeamId[teamId] = { items: [], loading: false, error: null };
        }
        state.byTeamId[teamId].loading = true;
        state.byTeamId[teamId].error = null;
      })
      .addCase(fetchChannelsByTeam.fulfilled, (state, action) => {
        const { teamId, channels } = action.payload;
        state.byTeamId[teamId] = {
          items: channels,
          loading: false,
          error: null,
        };
      })
      .addCase(fetchChannelsByTeam.rejected, (state, action) => {
        const teamId = action.meta.arg;
        if (!state.byTeamId[teamId]) {
          state.byTeamId[teamId] = { items: [], loading: false, error: null };
        }
        state.byTeamId[teamId].loading = false;
        state.byTeamId[teamId].error = action.payload;
      })

      // Create channel
      .addCase(createChannel.pending, (state) => {
        state.creating = true;
        state.createError = null;
      })
      .addCase(createChannel.fulfilled, (state, action) => {
        const { teamId, channel } = action.payload;
        state.creating = false;
        state.createError = null;

        // Add channel to team
        if (!state.byTeamId[teamId]) {
          state.byTeamId[teamId] = { items: [], loading: false, error: null };
        }

        // Check if channel already exists
        const existingIndex = state.byTeamId[teamId].items.findIndex(
          (c) => c._id === channel._id
        );

        if (existingIndex === -1) {
          state.byTeamId[teamId].items.push(channel);
          // Sort alphabetically by name
          state.byTeamId[teamId].items.sort((a, b) =>
            a.name.localeCompare(b.name)
          );
        }

        // Also add channel to user channels for immediate display
        const userChannelIndex = state.userChannels.findIndex(
          (c) => c._id === channel._id
        );

        if (userChannelIndex === -1) {
          state.userChannels.unshift(channel); // Add to beginning (newest first)
        }

        // Also add channel to available channels for Dashboard real-time updates
        const availableChannelIndex = state.availableChannels.findIndex(
          (c) => c._id === channel._id
        );

        if (availableChannelIndex === -1) {
          state.availableChannels.push(channel);
          // Sort alphabetically by name
          state.availableChannels.sort((a, b) =>
            a.name.localeCompare(b.name)
          );
        }

        toast.success("Channel created successfully!");
      })
      .addCase(createChannel.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload;

        if (action.payload?.code === "CHANNEL_NAME_TAKEN") {
          toast.error(action.payload.message);
        } else {
          toast.error(action.payload || "Failed to create channel");
        }
      })

      // Fetch user channels
      .addCase(fetchUserChannels.pending, (state) => {
        state.userChannelsLoading = true;
        state.userChannelsError = null;
      })
      .addCase(fetchUserChannels.fulfilled, (state, action) => {
        state.userChannelsLoading = false;
        state.userChannelsError = null;
        state.userChannels = action.payload;
      })
      .addCase(fetchUserChannels.rejected, (state, action) => {
        state.userChannelsLoading = false;
        state.userChannelsError = action.payload;
      })

      // Fetch channels from user teams
      .addCase(fetchChannelsFromUserTeams.pending, (state) => {
        state.availableChannelsLoading = true;
        state.availableChannelsError = null;
      })
      .addCase(fetchChannelsFromUserTeams.fulfilled, (state, action) => {
        state.availableChannelsLoading = false;
        state.availableChannelsError = null;
        state.availableChannels = action.payload;
      })
      .addCase(fetchChannelsFromUserTeams.rejected, (state, action) => {
        state.availableChannelsLoading = false;
        state.availableChannelsError = action.payload;
      })

      // Join channel
      .addCase(joinChannel.pending, (state) => {
        state.joining = true;
        state.joinError = null;
      })
      .addCase(joinChannel.fulfilled, (state, action) => {
        const channel = action.payload;
        state.joining = false;
        state.joinError = null;

        // Update the channel in availableChannels to show it as joined
        const availableChannelIndex = state.availableChannels.findIndex(
          (c) => c._id === channel._id
        );

        if (availableChannelIndex !== -1) {
          // Update the existing channel with the new data (including updated members)
          state.availableChannels[availableChannelIndex] = channel;
        }

        // Add channel to user channels
        const userChannelIndex = state.userChannels.findIndex(
          (c) => c._id === channel._id
        );

        if (userChannelIndex === -1) {
          state.userChannels.unshift(channel); // Add to beginning (newest first)
        }

        toast.success("Successfully joined channel!");
      })
      .addCase(joinChannel.rejected, (state, action) => {
        state.joining = false;
        state.joinError = action.payload;
        toast.error(action.payload || "Failed to join channel");
      });
  },
});

export const {
  clearCreateError,
  addChannelToTeam,
  addChannelToUserChannels,
  updateChannelInAvailableChannels,
  clearChannelsForTeam,
} = channelsSlice.actions;

// Selectors
export const selectChannelsByTeam = (state, teamId) =>
  state.channels.byTeamId[teamId]?.items || [];

export const selectChannelsLoading = (state, teamId) =>
  state.channels.byTeamId[teamId]?.loading || false;

export const selectChannelsError = (state, teamId) =>
  state.channels.byTeamId[teamId]?.error || null;

export const selectIsCreatingChannel = (state) => state.channels.creating;
export const selectCreateChannelError = (state) => state.channels.createError;

export const selectUserChannels = (state) => state.channels.userChannels;
export const selectUserChannelsLoading = (state) =>
  state.channels.userChannelsLoading;
export const selectUserChannelsError = (state) =>
  state.channels.userChannelsError;

export const selectAvailableChannels = (state) => state.channels.availableChannels;
export const selectAvailableChannelsLoading = (state) =>
  state.channels.availableChannelsLoading;
export const selectAvailableChannelsError = (state) =>
  state.channels.availableChannelsError;

export const selectIsJoiningChannel = (state) => state.channels.joining;
export const selectJoinChannelError = (state) => state.channels.joinError;

export default channelsSlice.reducer;
