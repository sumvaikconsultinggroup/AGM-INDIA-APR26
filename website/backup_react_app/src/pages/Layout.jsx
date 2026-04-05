import Navbar from "../components/Navbar/Navbar";
import { Outlet } from "react-router-dom";
import Footer from "../components/Footer/Footer";

const Layout = () => {
  return (
    <>
      <Navbar />
      <div className=" overflow-x-hidden">
        <Outlet />
      </div>
      <Footer />
    </>
  );
};

export default Layout;
