import React from "react";

const CartBadge = ({ count = 1 }) => (
  <span
    style={{
      position: "absolute",
      top: "-5px",
      right: "-5px",
      backgroundColor: "#EF4444",
      color: "white",
      borderRadius: "9999px",
      width: "20px",
      height: "20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "12px",
      fontWeight: "bold",
    }}
  >
    {count}
  </span>
);

export default CartBadge;
