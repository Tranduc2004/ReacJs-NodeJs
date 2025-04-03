import { Link } from "react-router-dom";
import Rating from "@mui/material/Rating";
import QuantityBox from "../../Components/QuantityBox";
import { IoIosClose } from "react-icons/io";
import Button from "@mui/material/Button";
import { IoCartSharp } from "react-icons/io5";

const Cart = () => {
  return (
    <>
      <section className="section cartPage">
        <div className="container">
          <h2 className="hd mb-2">Your Cart</h2>
          <p>
            There are <b className="text-red">3</b> products in your cart
          </p>

          <div className="row">
            {/* Bảng sản phẩm giỏ hàng */}
            <div className="col-lg-9 col-12 mb-4">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th width="35%">Product</th>
                      <th width="20%">Unit Price</th>
                      <th width="20%">Quantity</th>
                      <th width="15%">Subtotal</th>
                      <th width="10%">Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3].map((item) => (
                      <tr key={item}>
                        <td>
                          <Link to="/product/1">
                            <div className="d-flex align-items-center cartItemimgWrapper">
                              <div className="imgWrapper">
                                <img
                                  src="https://klbtheme.com/bacola/wp-content/uploads/2021/04/product-image-59-600x600.jpg"
                                  alt="Product"
                                  className="w-100"
                                  style={{ maxWidth: "80px" }}
                                />
                              </div>
                              <div className="info px-3">
                                <h6 className="product-name">
                                  Blue Diamond Almonds
                                </h6>
                                <Rating
                                  name="read-only"
                                  value={4.5}
                                  readOnly
                                  precision={0.5}
                                  size="small"
                                />
                              </div>
                            </div>
                          </Link>
                        </td>
                        <td>$10.00</td>
                        <td>
                          <QuantityBox />
                        </td>
                        <td>$10.00</td>
                        <td>
                          <span className="remove">
                            <IoIosClose />
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tổng thanh toán */}
            <div className="col-lg-3 col-12">
              <div className="card border p-3 cartDetails">
                <h4>CART TOTAL</h4>
                <div className="d-flex justify-content-between mb-3">
                  <span>Subtotal:</span>
                  <b className="text-red">$150.00</b>
                </div>

                <div className="d-flex justify-content-between mb-3">
                  <span>Shipping:</span>
                  <b>Free</b>
                </div>

                <div className="d-flex justify-content-between mb-3">
                  <span>Estimate for:</span>
                  <b>United Kingdom</b>
                </div>

                <div className="d-flex justify-content-between mb-3">
                  <span>Total:</span>
                  <b className="text-red">$150.00</b>
                </div>

                <Button
                  className="btn-lg btn-big w-100"
                  sx={{
                    backgroundColor: "#00aaff",
                    color: "white",
                    "&:hover": { backgroundColor: "#0088cc" },
                  }}
                >
                  <IoCartSharp /> &nbsp; Checkout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Cart;
