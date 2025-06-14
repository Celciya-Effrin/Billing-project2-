import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Billing from "./Component/Billing";
import LoginPage from './Component/Login';
import RegisterPage from './Component/Reg';
import Product from './Component/Product';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Billing />}/>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/Product" element={<Product />} />
      </Routes>
    </Router>
  );
}

export default App;
