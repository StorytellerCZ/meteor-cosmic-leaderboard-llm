import { Meteor } from 'meteor/meteor';

// Export the LeaderboardCollection for use throughout the app
export { LeaderboardCollection } from './collection';

// Import methods for both client and server
import './methods';

// Import publications - the file itself has server-side guards
import './publications';
