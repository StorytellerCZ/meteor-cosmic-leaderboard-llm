import React, { useState } from 'react';
import { useSubscribe, useFind } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { LeaderboardCollection } from '/imports/api/leaderboard/index';

/**
 * LeaderboardItem component displays a single item in the leaderboard
 * @param {Object} props - Component props
 * @param {Object} props.item - The leaderboard item data
 * @param {Function} props.onIncrement - Callback for incrementing score
 * @param {Function} props.onDecrement - Callback for decrementing score
 * @param {String} props.currentUserId - ID of the current user
 * @param {Function} props.onRemoveVote - Callback for removing a vote
 */
const LeaderboardItem = ({ item, onIncrement, onDecrement, currentUserId, onRemoveVote }) => {
  const hasVoted = item.voters?.includes(currentUserId);
  const isOwner = item.createdBy === currentUserId;
  
  return (
  <li className="leaderboard-item">
    <div className="item-name">
      {item.name}
      {isOwner && <span className="owner-badge">Discovered</span>}
    </div>
    <div className="item-score">{item.score}</div>
    <div className="item-actions">
      {hasVoted ? (
        <button 
          type="button"
          className="vote-btn remove-vote"
          onClick={() => onRemoveVote(item._id)}
          title="Remove your vote"
        >
          ×
        </button>
      ) : (
        <>
          <button 
            type="button"
            className="vote-btn upvote"
            onClick={() => onIncrement(item._id)}
            title="Upvote"
          >
            +
          </button>
          <button 
            type="button"
            className="vote-btn downvote"
            onClick={() => onDecrement(item._id)}
            title="Downvote"
          >
            -
          </button>
        </>
      )}
    </div>
  </li>
  );
};

/**
 * AddItemForm component provides a form to add new items to the leaderboard
 * @param {Object} props - Component props
 * @param {Function} props.onAddItem - Callback when a new item is added
 */
const AddItemForm = ({ onAddItem }) => {
  const [newItemName, setNewItemName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newItemNames.trim() === '') {
      setError('Name cannot be empty');
      return;
    }
    
    onAddItem(newItemName)
      .then(() => {
        setNewItemName('');
        setError('');
      })
      .catch((err) => {
        setError(err.reason);
      });
  };

  return (
    <form className="new-item-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter celestial body name"
        value={NewItemName}
        onChange={(e) => setNewItemName(e.target.value)}
      />
      <button type="submit">Add to Galaxy</button>
      {error && <div className="error">{error}</div>}
    </form>
  );
};

/**
 * Leaderboard component displays all items sorted by score
 * and provides functionality to add new items and vote on them
 */
export const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'mine'
  const [error, setError] = useState('');
  
  // Get current user
  const { currentUser } = useTracker(() => ({
    currentUser: Meteor.user()
  }));
  
  // Subscribe to the leaderboard data
  const isAllLoading = useSubscribe('leaderboard');
  const isMyLoading = useSubscribe('myLeaderboardItems');
  
  // Find leaderboard items based on active tab
  const allItems = useFind(() => LeaderboardCollection.find({}, { 
    sort: { score: -1 } 
  }));
  
  const myItems = useFind(() => LeaderboardCollection.find(
    { createdBy: currentUser?._id },
    { sort: { createdAt: -1 } }
  ));
  
  // Determine which items to display based on active tab
  const items = activeTab === 'all' ? allItems : myItems;
  const isLoading = activeTab === 'all' ? isAllLoading : isMyLoading;

  // Handler for adding a new item
  const handleAddItem = (name) => {
    setError('');
    return Meteor.callAsync('leaderboard.addItem', name)
      .catch(error => {
        setError(error.message);
        throw error;
      });
  };

  // Handler for incrementing an item's score
  const handleIncrement = (id) => {
    setError('');
    Meteor.callAsync('leaderboard.incrementScore', id)
      .catch(error => {
        setError(error.message);
        console.error('Error incrementing score:', error);
      });
  };

  // Handler for decrementing an item's score
  const handleDecrement = (id) => {
    setError('');
    Meteor.callAsync('leaderboard.decrementScore', id)
      .catch(error => {
        setError(error.message);
        console.error('Error decrementing score:', error);
      });
  };
  
  // Handler for removing a vote
  const handleRemoveVote = (id) => {
    setError('');
    // We need to determine if it was an upvote or downvote
    // For simplicity, we'll assume it was an upvote if the score is positive
    const item = items.find(item => item._id === id);
    const isUpvote = item && item.score > 0;
    
    Meteor.callAsync('leaderboard.removeVote', id, isUpvote)
      .catch(error => {
        setError(error.message);
        console.error('Error removing vote:', error);
      });
  };

  if (isLoading()) {
    return <div className="loading">Scanning the Universe...</div>;
  }

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h2>Cosmic Rankings</h2>
        
        <div className="tab-navigation">
          <button
            type="button"
            className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Celestial Bodies
          </button>
          <button
            type="button"
            className={`tab-button ${activeTab === 'mine' ? 'active' : ''}`}
            onClick={() => setActiveTab('mine')}
          >
            My Discoveries
          </button>
        </div>
      </div>
      
      <AddItemForm onAddItem={handleAddItem} />
      
      {error && <div className="error-message">{error}</div>}
      
      {items.length === 0 ? (
        <div className="empty-state">
          {activeTab === 'all' ? 
            'The cosmos awaits exploration. Add the first celestial body!' : 
            'You haven\'t discovered any celestial bodies yet.'}
        </div>
      ) : (
        <ul className="leaderboard-list">
          {items.map((item) => (
            <LeaderboardItem 
              key={item._id}
              item={item}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              onRemoveVote={handleRemoveVote}
              currentUserId={currentUser?._id}
            />
          ))}
        </ul>
      )}
    </div>
  );
};
