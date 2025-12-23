import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white selection:bg-teal-100 selection:text-teal-900">
      <Navbar />
      {/* pt-32 ensures the main content starts AFTER the floating navbar.
          The navbar itself is py-6 (top/bottom) + internal padding.
      */}
      <main className="flex-grow pt-32 lg:pt-36">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;