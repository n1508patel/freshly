
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Listing from "./pages/Home/Listing";
import Header from "./components/Header";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Footer from "./components/Footer";
import SearchResults from "./pages/SearchResults";
import ProductDetail from "./pages/ProductDetail";
import RiderApp from "./pages/RiderApp";
import Profile from "./components/Profile";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminProducts from "./pages/admin/AdminProducts";
import "./styles/App.css";
function App() {
  const location = useLocation();
  const isRider = location.pathname === "/rider";
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <>
      {!isRider && !isAdmin && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Listing />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/rider" element={<RiderApp />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
        </Route>
      </Routes>
      {!isRider && !isAdmin && <Footer />}
    </>
  );
}

export default App;