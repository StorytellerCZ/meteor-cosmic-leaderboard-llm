import { Meteor } from 'meteor/meteor';

// Export the LeaderboardCollection for use throughout the app
export { LeaderboardCollection } from './collection';

// Import methods for both client and server
import './methods';

// Publications have been moved to server/main.js
// This is in accordance with Meteor 3.2 best practices
