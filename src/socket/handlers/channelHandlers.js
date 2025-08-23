import { store } from '../../redux/store.js';
import { addChannelToUserChannels } from '../../redux/slices/channelsSlice.js';

/**
 * Channel Socket Event Handlers
 */

/**
 * Handle channel created event
 * @param {Object} payload - Event payload
 * @param {string} payload.teamId - Team ID
 * @param {Object} payload.channel - Channel data
 */
export const handleChannelCreated = (payload) => {
  try {
    const { teamId, channel } = payload;

    console.log('📡 Channel created event received:', { teamId, channelName: channel.name, channelId: channel._id });

    // Dispatch action to add channel to user channels
    store.dispatch(addChannelToUserChannels({ channel }));

    console.log('✅ Channel created event handled:', { teamId, channelName: channel.name });
  } catch (error) {
    console.error('❌ Error handling channel:created event:', error);
  }
};

/**
 * Handle channel updated event
 * @param {Object} payload - Event payload
 * @param {string} payload.teamId - Team ID
 * @param {Object} payload.channel - Updated channel data
 */
export const handleChannelUpdated = (payload) => {
  try {
    const { teamId, channel } = payload;
    
    // TODO: Implement channel update logic
    console.log('✅ Channel updated event handled:', { teamId, channelName: channel.name });
  } catch (error) {
    console.error('❌ Error handling channel:updated event:', error);
  }
};

/**
 * Handle channel deleted event
 * @param {Object} payload - Event payload
 * @param {string} payload.teamId - Team ID
 * @param {string} payload.channelId - Deleted channel ID
 */
export const handleChannelDeleted = (payload) => {
  try {
    const { teamId, channelId } = payload;
    
    // TODO: Implement channel deletion logic
    console.log('✅ Channel deleted event handled:', { teamId, channelId });
  } catch (error) {
    console.error('❌ Error handling channel:deleted event:', error);
  }
};
