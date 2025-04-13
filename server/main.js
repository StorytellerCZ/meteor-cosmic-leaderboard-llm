import { Meteor } from 'meteor/meteor';

// Import our leaderboard modules to ensure they're loaded
import '/imports/api/leaderboard/index';

Meteor.startup(async () => {
  console.log('Meteor server starting...');
  
  console.log('Meteor server started successfully!');
});
