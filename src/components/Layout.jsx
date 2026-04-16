import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = ({ children, noPadding = false }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white selection:bg-teal-100 selection:text-teal-900">
      <Navbar />
      <main className={noPadding ? "" : "pt-28"}>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
