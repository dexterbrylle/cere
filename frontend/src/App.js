import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import CreateMessage from './components/CreateMessage';
import ViewMessage from './components/ViewMessage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Secure Share</h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Switch>
            <Route exact path="/" component={CreateMessage} />
            <Route path="/messages/:urlHash" component={ViewMessage} />
          </Switch>
        </main>
      </div>
    </Router>
  );
}

export default App;