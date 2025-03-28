import { Meteor } from 'meteor/meteor';
import { LeaderboardCollection } from './collection';

// Only run this code on the server
if (Meteor.isServer) {
  /**
   * Publishes the leaderboard items sorted by score in descending order
   * @returns {Mongo.Cursor} Cursor for leaderboard items sorted by score
   */
  Meteor.publish('leaderboard', function() {
    // Check if user is logged in
    if (!this.userId) {
      return this.ready(); // Return empty cursor if not logged in
    }
    
    return LeaderboardCollection.find({}, { 
      sort: { score: -1 },
      fields: { 
        name: 1, 
        score: 1, 
        createdAt: 1,
        createdBy: 1,
        voters: 1 // Include voters array to check if user has voted
      }
    });
  });
  
  /**
   * Publishes the user's own leaderboard items
   * @returns {Mongo.Cursor} Cursor for user's items sorted by creation date
   */
  Meteor.publish('myLeaderboardItems', function() {
    // Check if user is logged in
    if (!this.userId) {
      return this.ready(); // Return empty cursor if not logged in
    }
    
    return LeaderboardCollection.find(
      { createdBy: this.userId }, // Only items created by this user
      { 
        sort: { createdAt: -1 },
        fields: { 
          name: 1, 
          score: 1, 
          createdAt: 1,
          createdBy: 1,
          voters: 1
        }
      }
    );
  });
}
