import { useSelector } from "react-redux";
import { Link, Navigate, Outlet } from "react-router-dom";
// import NavBar from "../components/appbar";
import Bar from "../components/Bar";


const AppLayout = () => {
  const token = localStorage.getItem('sessionToken');
  if (!token) {
    return <Navigate to="/login" replace />;
}
  return (
    <>
    <Bar/>
    <Outlet/>
    </>
  )
}

export default AppLayout