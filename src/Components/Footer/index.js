import { LuShirt } from "react-icons/lu";
import { TbTruckDelivery } from "react-icons/tb";
import { CiDiscount1 } from "react-icons/ci";
import { CiDollar } from "react-icons/ci";
import ggplay from "../../assets/images/ggplay.webp";
import appstore from "../../assets/images/appstore.webp";
import { MdPhone } from "react-icons/md";
import { FaInstagram } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";
const Footer = () => {
  return (
    <footer>
      <div className="container">
        <div className="topInfo row d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <span className="mr-2">
              <LuShirt />
            </span>
            <span>Everyday fresh products</span>
          </div>
          <div className="d-flex align-items-center">
            <span className="mr-2">
              <TbTruckDelivery />
            </span>
            <span>Free delivery for order over $70</span>
          </div>
          <div className="d-flex align-items-center">
            <span className="mr-2">
              <CiDiscount1 />
            </span>
            <span>Daily Mega Discounts</span>
          </div>
          <div className="d-flex align-items-center">
            <span className="mr-2">
              <CiDollar />
            </span>
            <span>Best price on the market</span>
          </div>
        </div>
        <div className="row1">
          <div className="col-12">
            <div className="product-categories d-flex justify-content-between">
              <div className="category">
                <h6 className="category-title">FRUIT & VEGETABLES</h6>
                <ul>
                  <li>Fresh Vegetables</li>
                  <li>Herbs & Seasonings</li>
                  <li>Fresh Fruits</li>
                  <li>Cuts & Sprouts</li>
                  <li>Exotic Fruits & Veggies</li>
                  <li>Packaged Produce</li>
                  <li>Party Trays</li>
                </ul>
              </div>
              <div className="category">
                <h6 className="category-title">BREAKFAST & DAIRY</h6>
                <ul>
                  <li>Milk & Flavoured Milk</li>
                  <li>Butter and Margarine</li>
                  <li>Cheese</li>
                  <li>Eggs Substitutes</li>
                  <li>Honey</li>
                  <li>Marmalades</li>
                  <li>Sour Cream and Dips</li>
                  <li>Yogurt</li>
                </ul>
              </div>
              <div className="category">
                <h6 className="category-title">MEAT & SEAFOOD</h6>
                <ul>
                  <li>Breakfast Sausage</li>
                  <li>Dinner Sausage</li>
                  <li>Beef</li>
                  <li>Chicken</li>
                  <li>Sliced Deli Meat</li>
                  <li>Shrimp</li>
                  <li>Wild Caught Filets</li>
                  <li>Crab and Shellfish</li>
                  <li>Farm Raised Filets</li>
                </ul>
              </div>
              <div className="category">
                <h6 className="category-title">BEVERAGES</h6>
                <ul>
                  <li>Water</li>
                  <li>Sparkling Water</li>
                  <li>Soda & Pop</li>
                  <li>Coffee</li>
                  <li>Milk & Plant-Based Milk</li>
                  <li>Tea & Kombucha</li>
                  <li>Drink Boxes & Pouches</li>
                  <li>Craft Beer</li>
                  <li>Wine</li>
                </ul>
              </div>
              <div className="category">
                <h6 className="category-title">BREADS & BAKERY</h6>
                <ul>
                  <li>Milk & Flavoured Milk</li>
                  <li>Butter and Margarine</li>
                  <li>Cheese</li>
                  <li>Eggs Substitutes</li>
                  <li>Honey</li>
                  <li>Marmalades</li>
                  <li>Sour Cream and Dips</li>
                  <li>Yogurt</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="coppyright mt-3 pt-3 pb-3 d-flex justify-content-between align-items-center">
          <div className="footer-left d-flex align-items-center">
            <div className="contact-info mr-4">
              <div className="phone d-flex align-items-center">
                <i className="fas fa-phone mr-2"></i>
                <MdPhone />
                <span>
                  8 800 555-55
                  <br />
                  <span>Working 8:00 - 22:00</span>
                </span>
              </div>
              <div
                className="working-hours text-muted"
                style={{ fontSize: "0.8rem" }}
              ></div>
            </div>
          </div>
          <div className="footer-right d-flex align-items-center">
            <div className="app-download mr-4">
              <span className="mr-2">
                Download App on Mobile:
                <br />
                <span>15% discount on your first purchase</span>
              </span>

              <span className="app-badges">
                <a href="/google-play" className="mr-2">
                  <img src={ggplay} alt="Google Play" height="40" />
                </a>
                <a href="/app-store">
                  <img src={appstore} alt="App Store" height="40" />
                </a>
              </span>
              <div
                className="discount-text text-muted"
                style={{ fontSize: "0.8rem" }}
              ></div>
            </div>
            <div className="social-media ml-4">
              <a href="/facebook" className="mr-2 text-dark">
                <FaFacebook />
              </a>
              <a href="/twitter" className="mr-2 text-dark">
                <FaTwitter />
              </a>
              <a href="/instagram" className="text-dark">
                <i className="fab fa-instagram"></i>
                <FaInstagram />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
