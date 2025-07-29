// import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LocalizationProvider } from '../application/i18n/LocalizationProvider';
import { Dashboard } from '../pages/Dashboard';
import { FormBuilder } from '../pages/FormBuilder';
import { PublicForm } from '../pages/PublicForm';
import { LanguageSelection } from '../pages/LanguageSelection';
import { ResponsesPage } from '../pages/ResponsesPage';

function App() {
  return (
    <LocalizationProvider>
      <Router>
        <div className="App min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/form-builder" element={<FormBuilder />} />
            <Route path="/form-builder/:formId" element={<FormBuilder />} />
            <Route path="/form/:formId" element={<LanguageSelection />} />
            <Route path="/form/:formId/:language" element={<PublicForm />} />
            <Route path="/responses/:formId" element={<ResponsesPage />} />
          </Routes>
        </div>
      </Router>
    </LocalizationProvider>
  );
}

export default App;