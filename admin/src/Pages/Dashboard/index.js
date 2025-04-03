import React from "react";
import DashboardBox from "../../Components/DashboardBox";
import ProductTable from "../../Components/ProductTable";
import RevenueChart from "../../Components/RevenueChart";
import OrdersOverview from "../../Components/OrdersOverview";
import { FaUsers, FaShoppingCart, FaBox, FaStar } from "react-icons/fa";
import "./styles.css";

const Dashboard = () => {
  const dashboardData = [
    {
      title: "Total Users",
      value: "277",
      change: 95,
      icon: <FaUsers />,
      color: "green",
    },
    {
      title: "Total Orders",
      value: "338",
      change: 30,
      icon: <FaShoppingCart />,
      color: "purple",
    },
    {
      title: "Total Products",
      value: "557",
      change: 25,
      icon: <FaBox />,
      color: "blue",
    },
    {
      title: "Total Reviews",
      value: "166",
      change: 45,
      icon: <FaStar />,
      color: "yellow",
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
      </div>

      <div className="dashboard-grid">
        {dashboardData.map((item, index) => (
          <DashboardBox
            key={index}
            title={item.title}
            value={item.value}
            change={item.change}
            icon={item.icon}
            color={item.color}
          />
        ))}
      </div>

      <ProductTable />
      <div className="dashboard-charts">
        <RevenueChart />
        <OrdersOverview />
      </div>
    </div>
  );
};

export default Dashboard;
