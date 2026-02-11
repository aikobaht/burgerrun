import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { HomePage } from './components/HomePage';
import { JoinPage } from './components/JoinPage';
import { OrderPage } from './components/OrderPage';
import { ReviewPage } from './components/ReviewPage';
import { PrintPage } from './components/PrintPage';

function App() {
  const [isDark, setIsDark] = useState(false);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setIsDark(JSON.parse(savedDarkMode));
    } else {
      // Check system preference
      setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }, []);

  // Apply dark mode to document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDark));
  }, [isDark]);

  return (
    <BrowserRouter>
      <Toaster />
      <div className={isDark ? 'dark' : ''}>
        <Routes>
          <Route path="/" element={<HomePage darkMode={isDark} onDarkModeChange={setIsDark} />} />
          <Route path="/join/:groupId" element={<JoinPage darkMode={isDark} onDarkModeChange={setIsDark} />} />
          <Route path="/group/:groupId" element={<OrderPage darkMode={isDark} onDarkModeChange={setIsDark} />} />
          <Route path="/group/:groupId/review" element={<ReviewPage darkMode={isDark} onDarkModeChange={setIsDark} />} />
          <Route path="/group/:groupId/print" element={<PrintPage darkMode={isDark} onDarkModeChange={setIsDark} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
