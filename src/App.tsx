import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './components/HomePage';
import { JoinPage } from './components/JoinPage';
import { OrderPage } from './components/OrderPage';
import { ReviewPage } from './components/ReviewPage';
import { PrintPage } from './components/PrintPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/join/:groupId" element={<JoinPage />} />
        <Route path="/group/:groupId" element={<OrderPage />} />
        <Route path="/group/:groupId/review" element={<ReviewPage />} />
        <Route path="/group/:groupId/print" element={<PrintPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
