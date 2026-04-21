import Navbar from "./Navbar";
import Footer from "./Footer";
import MobileBottomNav from "./MobileBottomNav";

const Layout = ({ children, noPadding = false }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white selection:bg-teal-100 selection:text-teal-900">
      <Navbar />
      <main className={noPadding ? "" : "pt-28 pb-20 lg:pb-0"}>{children}</main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Layout;
