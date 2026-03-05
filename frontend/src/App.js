import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar'; // Birazdan oluşturacağız

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<h1>Ana Sayfa</h1>} />
        {/* Diğer sayfaları buraya ekleyeceğiz */}
      </Routes>
    </Router>
  );
}
export default App;