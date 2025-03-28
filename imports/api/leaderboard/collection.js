import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

/**
 * LeaderboardCollection stores all items in the leaderboard
 * with their names and scores
 * @type {Mongo.Collection}
 */
export const LeaderboardCollection = new Mongo.Collection('leaderboard');

// Collection is defined on both client and server, but the following code runs only on the server
if (Meteor.isServer) {
  // Run this code when the server starts
  Meteor.startup(async () => {
    // Create index for faster sorting by score
    await LeaderboardCollection.createIndexAsync({ score: -1 });
    console.log('Leaderboard score index created');
    
    // Add sample data if the collection is empty
    if (await LeaderboardCollection.find().countAsync() === 0) {
      console.log('Adding sample leaderboard data...');
      
      await LeaderboardCollection.insertAsync({
        name: 'Sample Item 1',
        score: 5,
        createdAt: new Date(),
        createdBy: null, // No user for sample data
        voters: [] // Array to track who has voted
      });

      await LeaderboardCollection.insertAsync({
        name: 'Sample Item 2',
        score: 3,
        createdAt: new Date(),
        createdBy: null, // No user for sample data
        voters: [] // Array to track who has voted
      });

      await LeaderboardCollection.insertAsync({
        name: 'Sample Item 3',
        score: 7,
        createdAt: new Date(),
        createdBy: null, // No user for sample data
        voters: [] // Array to track who has voted
      });
      
      console.log('Sample leaderboard data added successfully!');
    }
  });
}
