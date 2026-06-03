import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import FeedbackPopup from "../components/common/FeedbackPopup";
import { Outlet } from "react-router-dom";

const PublicLayout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 pt-20">
        <Outlet />
      </main>

      <Footer />
      <FeedbackPopup />
    </div>
  );
};

export default PublicLayout;
