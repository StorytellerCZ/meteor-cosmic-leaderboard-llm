# Meteor Leaderboard Application - Implementation Instructions

This document outlines the step-by-step plan for implementing a real-time Leaderboard application using Meteor and React.

## Project Overview

We're building a one-page application that allows users to:
- View a list of items sorted by score
- Add new items to the leaderboard
- Vote on items (upvote/downvote)
- See all changes in real-time across all connected clients

## Implementation Steps

### 1. Data Model Setup

**File: `/imports/api/leaderboard.js`**

```javascript
import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

export const LeaderboardCollection = new Mongo.Collection('leaderboard');

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('leaderboard', function () {
    return LeaderboardCollection.find({}, { sort: { score: -1 } });
  });

  Meteor.methods({
    'leaderboard.addItem'(name) {
      check(name, String);
      
      if (name.trim() === '') {
        throw new Meteor.Error('name-required', 'Name is required');
      }
      
      return LeaderboardCollection.insert({
        name,
        score: 0,
        createdAt: new Date(),
      });
    },
    
    'leaderboard.incrementScore'(itemId) {
      check(itemId, String);
      
      return LeaderboardCollection.update(itemId, {
        $inc: { score: 1 }
      });
    },
    
    'leaderboard.decrementScore'(itemId) {
      check(itemId, String);
      
      return LeaderboardCollection.update(itemId, {
        $inc: { score: -1 }
      });
    }
  });
}
```

### 2. Server Configuration

**File: `/server/main.js`**

```javascript
import { Meteor } from 'meteor/meteor';
import { LinksCollection } from '/imports/api/links';
import { LeaderboardCollection } from '/imports/api/leaderboard';

Meteor.startup(async () => {
  // If the Leaderboard collection is empty, add some data.
  if (await LeaderboardCollection.find().countAsync() === 0) {
    await LeaderboardCollection.insertAsync({
      name: 'Sample Item 1',
      score: 5,
      createdAt: new Date(),
    });

    await LeaderboardCollection.insertAsync({
      name: 'Sample Item 2',
      score: 3,
      createdAt: new Date(),
    });

    await LeaderboardCollection.insertAsync({
      name: 'Sample Item 3',
      score: 7,
      createdAt: new Date(),
    });
  }

  // Publish the leaderboard collection
  Meteor.publish("leaderboard", function () {
    return LeaderboardCollection.find({}, { sort: { score: -1 } });
  });
});
```

### 3. Leaderboard Component

**File: `/imports/ui/Leaderboard.jsx`**

```jsx
import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { LeaderboardCollection } from '/imports/api/leaderboard';

export const Leaderboard = () => {
  const [newItemName, setNewItemName] = useState('');
  const [error, setError] = useState('');

  // Subscribe to the leaderboard data
  const { items, isLoading } = useTracker(() => {
    const subscription = Meteor.subscribe('leaderboard');
    const items = LeaderboardCollection.find({}, { sort: { score: -1 } }).fetch();
    return {
      items,
      isLoading: !subscription.ready(),
    };
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newItemName.trim() === '') {
      setError('Name cannot be empty');
      return;
    }
    
    Meteor.call('leaderboard.addItem', newItemName, (err) => {
      if (err) {
        setError(err.reason);
      } else {
        setNewItemName('');
        setError('');
      }
    });
  };

  const incrementScore = (id) => {
    Meteor.call('leaderboard.incrementScore', id);
  };

  const decrementScore = (id) => {
    Meteor.call('leaderboard.decrementScore', id);
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="leaderboard-container">
      <h2>Leaderboard</h2>
      
      <form className="new-item-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Add new item"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
        />
        <button type="submit">Add Item</button>
        {error && <div className="error">{error}</div>}
      </form>
      
      <ul className="leaderboard-list">
        {items.map((item) => (
          <li key={item._id} className="leaderboard-item">
            <div className="item-name">{item.name}</div>
            <div className="item-score">{item.score}</div>
            <div className="item-actions">
              <button 
                className="vote-btn upvote"
                onClick={() => incrementScore(item._id)}
              >
                +
              </button>
              <button 
                className="vote-btn downvote"
                onClick={() => decrementScore(item._id)}
              >
                -
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
```

### 4. Update App Component

**File: `/imports/ui/App.jsx`**

```jsx
import React from 'react';
import { Leaderboard } from './Leaderboard.jsx';

export const App = () => (
  <div className="app-container">
    <h1>Meteor Leaderboard</h1>
    <Leaderboard />
  </div>
);
```

### 5. Add CSS Styling

**File: `/client/main.css`**

```css
body {
  font-family: sans-serif;
  margin: 0;
  padding: 20px;
  color: #333;
  background-color: #f5f5f5;
}

.app-container {
  max-width: 800px;
  margin: 0 auto;
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  color: #2c3e50;
}

h2 {
  color: #3498db;
  border-bottom: 2px solid #ecf0f1;
  padding-bottom: 10px;
}

.leaderboard-container {
  margin-top: 20px;
}

.new-item-form {
  display: flex;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.new-item-form input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
  font-size: 16px;
}

.new-item-form button {
  padding: 10px 15px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  font-size: 16px;
}

.new-item-form button:hover {
  background-color: #2980b9;
}

.error {
  color: #e74c3c;
  margin-top: 5px;
  width: 100%;
}

.leaderboard-list {
  list-style: none;
  padding: 0;
}

.leaderboard-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #ecf0f1;
  transition: background-color 0.3s;
}

.leaderboard-item:hover {
  background-color: #f9f9f9;
}

.item-name {
  flex: 1;
  font-size: 18px;
}

.item-score {
  font-size: 20px;
  font-weight: bold;
  margin: 0 20px;
  min-width: 40px;
  text-align: center;
}

.item-actions {
  display: flex;
}

.vote-btn {
  width: 30px;
  height: 30px;
  margin: 0 5px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upvote {
  background-color: #2ecc71;
  color: white;
}

.upvote:hover {
  background-color: #27ae60;
}

.downvote {
  background-color: #e74c3c;
  color: white;
}

.downvote:hover {
  background-color: #c0392b;
}

.loading {
  text-align: center;
  padding: 20px;
  font-size: 18px;
  color: #7f8c8d;
}

@media (max-width: 600px) {
  .leaderboard-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .item-score {
    margin: 10px 0;
  }
  
  .item-actions {
    align-self: flex-end;
  }
}
```

### 6. Update Client Main File

**File: `/client/main.js`**

```javascript
import '../imports/ui/App.jsx';
import './main.css';
```

## Running the Application

After implementing all the steps above, run the application with:

```bash
meteor run
```

Access the application at `http://localhost:3000`

## Features Implemented

- Real-time leaderboard display using Meteor's publication/subscription model
- Ability to add new items to the leaderboard
- Upvoting and downvoting functionality
- Automatic sorting of items by score
- Responsive design for various screen sizes
- Initial sample data for demonstration

## Technical Implementation Details

- MongoDB collection for data storage
- Meteor methods for data manipulation
- React hooks for state management
- Meteor's useTracker hook for reactive data
- CSS for styling and responsiveness

This implementation leverages Meteor's real-time capabilities to ensure that all clients see updates immediately without requiring page refreshes or manual polling.
