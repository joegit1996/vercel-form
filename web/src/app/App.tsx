import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LocalizationProvider } from '../application/i18n/LocalizationProvider';
import { Dashboard } from '../pages/Dashboard';
import { FormBuilder } from '../pages/FormBuilder';
import { PublicForm } from '../pages/PublicForm';

function App() {
  return (
    <LocalizationProvider>
      <Router>
        <div className="App min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/builder" element={<FormBuilder />} />
            <Route path="/form/:formId" element={<PublicForm />} />
          </Routes>
        </div>
      </Router>
    </LocalizationProvider>
  );
}

export default App;