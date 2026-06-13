import Header, { HeaderPhone } from "./components/Header";
import Home from "./components/Home";
import Work from "./components/Work";
import Timeline from "./components/Timeline";
import Services from "./components/Services";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import BlogList from "./pages/BlogList";
import BlogDetail from "./pages/BlogDetail";
import AdminLogin from "./pages/AdminLogin";
import AdminBlogs from "./pages/AdminBlogs";
import BlogEditor from "./pages/BlogEditor";
import ProtectedRoute from "./components/ProtectedRoute";

const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

const ScrollToHash = () => {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (!hash || pathname !== "/") return;

    const animationFrame = requestAnimationFrame(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [hash, pathname]);

  return null;
};

const PortfolioHome = ({ menuOpen, setMenuOpen, ratio }) => (
  <>
    <HeaderPhone menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
    <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
    <Home ratio={ratio} />
    <Work />
    <Timeline />
    <Services />
    <Contact />
    <Footer />
  </>
);

const PublicPage = ({ children, menuOpen, setMenuOpen }) => (
  <>
    <HeaderPhone menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
    <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
    {children}
    <Footer />
  </>
);

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [ratio, setRatio] = useState(window.innerWidth / window.innerHeight);
  useEffect(() => {
    const resizeRatio = () => {
      setRatio(window.innerWidth / window.innerHeight);
    };

    window.addEventListener("resize", resizeRatio);

    return () => {
      window.removeEventListener("resize", resizeRatio);
    };
  }, [ratio]);

  return ratio < 2.2 ? (
    <BrowserRouter basename={basename}>
      <ScrollToHash />
      <Routes>
        <Route
          path="/"
          element={
            <PortfolioHome
              menuOpen={menuOpen}
              setMenuOpen={setMenuOpen}
              ratio={ratio}
            />
          }
        />
        <Route
          path="/blogs"
          element={
            <PublicPage menuOpen={menuOpen} setMenuOpen={setMenuOpen}>
              <BlogList />
            </PublicPage>
          }
        />
        <Route
          path="/blogs/:slug"
          element={
            <PublicPage menuOpen={menuOpen} setMenuOpen={setMenuOpen}>
              <BlogDetail />
            </PublicPage>
          }
        />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/admin/blogs" element={<AdminBlogs />} />
          <Route path="/admin/blogs/new" element={<BlogEditor />} />
          <Route path="/admin/blogs/edit/:id" element={<BlogEditor />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  ) : (
    <em id="customMessage">Please Change the ratio to View!</em>
  );
}

export default App;
