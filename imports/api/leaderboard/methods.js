  import { Meteor } from 'meteor/meteor';
  import { check } from 'meteor/check';
  import { LeaderboardCollection } from './collection';

  // Define methods - these are available on both client and server,
  // but the actual implementation runs on the server
  Meteor.methods({
    /**
     * Add a new item to the leaderboard
     * @param {String} name - The name of the item to add
     * @returns {Promise<string>} The ID of the newly created item
     */
    async 'leaderboard.addItem'(name) {
      check(name, String);
      
      // Must be logged in to add items
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to add items');
      }
      
      if (name.trim() === '') {
        throw new Meteor.Error('name-required', 'Name is required');
      }
      
      return await LeaderboardCollection.insertAsync({
        name,
        score: 0,
        createdAt: new Date(),
        createdBy: this.userId,
        voters: [] // Initialize empty voters array
      });
    },
    
    /**
     * Increment the score of an item by 1
     * @param {String} itemId - The ID of the item to increment
     * @returns {Promise<number>} The number of affected documents
     */
    async 'leaderboard.incrementScore'(itemId) {
      check(itemId, String);
      
      // Must be logged in to vote
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to vote');
      }
      
      // Check if user has already voted on this item
      const item = await LeaderboardCollection.findOneAsync(itemId);
      if (!item) {
        throw new Meteor.Error('not-found', 'Item not found');
      }
      
      if (item.voters?.includes(this.userId)) {
        throw new Meteor.Error('already-voted', 'You have already voted on this item');
      }
      
      // Add user to voters and increment score
      return await LeaderboardCollection.updateAsync(itemId, {
        $inc: { score: 1 },
        $addToSet: { voters: this.userId }
      });
    },
    
    /**
     * Decrement the score of an item by 1
     * @param {String} itemId - The ID of the item to decrement
     * @returns {Promise<number>} The number of affected documents
     */
    async 'leaderboard.decrementScore'(itemId) {
      check(itemId, String);
      
      // Must be logged in to vote
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to vote');
      }
      
      // Check if user has already voted on this item
      const item = await LeaderboardCollection.findOneAsync(itemId);
      if (!item) {
        throw new Meteor.Error('not-found', 'Item not found');
      }
      
      if (item.voters?.includes(this.userId)) {
        throw new Meteor.Error('already-voted', 'You have already voted on this item');
      }
      
      // Add user to voters and decrement score
      return await LeaderboardCollection.updateAsync(itemId, {
        $inc: { score: -1 },
        $addToSet: { voters: this.userId }
      });
    },
    
    /**
     * Remove a vote from an item (user can remove their own vote)
     * @param {String} itemId - The ID of the item to remove vote from
     * @param {Boolean} isUpvote - Whether the vote was an upvote or downvote
     * @returns {Promise<number>} The number of affected documents
     */
    async 'leaderboard.removeVote'(itemId, isUpvote) {
      check(itemId, String);
      check(isUpvote, Boolean);
      
      // Must be logged in to remove vote
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to remove your vote');
      }
      
      // Check if user has voted on this item
      const item = await LeaderboardCollection.findOneAsync(itemId);
      if (!item) {
        throw new Meteor.Error('not-found', 'Item not found');
      }
      
      if (!item.voters || !item.voters.includes(this.userId)) {
        throw new Meteor.Error('no-vote', 'You have not voted on this item');
      }
      
      // Remove user from voters and adjust score
      return await LeaderboardCollection.updateAsync(itemId, {
        $inc: { score: isUpvote ? -1 : 1 }, // Reverse the vote effect
        $pull: { voters: this.userId }
      });
    },

    /** NEW ADDITION 
    /**
     * Calculate the total score of all items in the leaderboard
     * @returns {Promise<number>} The total score
     */
    async 'leaderboard.getTotalScore'() {
      const result = await LeaderboardCollection.aggregate([
        {
          $group: {
            _id: null, // Group all documents together in a single group
            totalScore: { $sum: '$score' }
          }
        }
      ]).toArray(); // Convert to array to get the result which is a single item

      if (result.length > 0) {
        return result[0].totalScore;
      } else {
        return 0; // Return 0 if the collection is empty
      }
    }
  });
