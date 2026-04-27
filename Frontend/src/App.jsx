import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dumbbells" element={<Home />} />
        <Route path="/balls" element={<Home />} />
        <Route path="/accessories" element={<Home />} />
        <Route path="/cart" element={<Home />} />
        <Route path="/account" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
