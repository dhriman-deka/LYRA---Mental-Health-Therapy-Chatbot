import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react"; // ✅ Import Clerk authentication
import "./dashboardLayout.css";
import ChatList from "../../components/chatList/ChatList";

const DashboardLayout = () => {
  const { userId, isLoaded } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && !userId) {
      navigate("/sign-in"); // ✅ Redirects to sign-in if not authenticated
    }
  }, [isLoaded, userId, navigate]);

  if (!isLoaded) return <p>Loading...</p>; // ✅ Proper JSX return for loading state

  return (
    <div className="dashboardLayout">
      <div className="menu"><ChatList/></div>
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
