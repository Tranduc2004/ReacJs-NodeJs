import ProductZoom from "../../Components/ProductZoom";
import Rating from "@mui/material/Rating";
import QuantityBox from "../../Components/QuantityBox";
import Button from "@mui/material/Button";
import { BsFillCartFill } from "react-icons/bs";
import { useState } from "react";
import { FaRegHeart } from "react-icons/fa6";
import { MdCompareArrows } from "react-icons/md";
import Tooltip from "@mui/material/Tooltip";
import RelatedProducts from "../../Components/ProductDetails/RelatedProducts";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
} from "@mui/material";
import { styled } from "@mui/material/styles";
// Styled components
const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: "#00aaff10",
  borderRadius: 40,
  padding: 8,
  marginBottom: 30,
  "& .MuiTab-root": {
    borderRadius: 40,
    minHeight: 56,
    fontSize: "1rem",
    fontWeight: 500,
    padding: "12px 24px",
    "&.Mui-selected": {
      backgroundColor: "#00aaff",
      color: "white",
    },
  },
  "& .MuiTabs-indicator": {
    display: "none",
  },
}));

const ContentBox = styled(Box)(({ theme }) => ({
  backgroundColor: "#00aaff10",
  borderRadius: 16,
  padding: 30,
  fontSize: "1.05rem",
}));

const ReviewItem = styled(Box)(({ theme }) => ({
  marginBottom: 24,
  borderBottom: "1px solid #e0e0e0",
  paddingBottom: 24,
}));

const ReviewTextField = styled(TextField)(({ theme }) => ({
  backgroundColor: "white",
  borderRadius: 10,
  marginBottom: 20,
  width: "100%",
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#e0e0e0",
    },
    "&:hover fieldset": {
      borderColor: "#00aaff",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#00aaff",
    },
  },
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#00aaff",
  color: "white",
  borderRadius: 30,
  padding: "10px 30px",
  fontWeight: 500,
  fontSize: "1rem",
  textTransform: "none",
  "&:hover": {
    backgroundColor: "#0195df",
  },
}));
const ProductDetails = () => {
  const [activeSize, setActiveSize] = useState(null);
  const isActive = (index) => {
    setActiveSize(index);
  };

  const [tabValue, setTabValue] = useState(0);
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(1);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  const handleReviewChange = (event) => {
    setReview(event.target.value);
  };

  const handleRatingChange = (event, newValue) => {
    setRating(newValue);
  };

  const handleSubmitReview = () => {
    console.log("Review submitted:", { review, rating });
    // Here you would typically send the review to your API
    // After successful submission, you could:
    setReview("");
    setRating(1);
    // And possibly add the new review to your reviews list
  };
  const productSpecs = [
    { name: "Stand Up", value: '35"L x 24"W x 37-45"H(front to back wheel)' },
    { name: "Folded (w/o wheels)", value: '32.5"L x 18.5"W x 16.5"H' },
    { name: "Folded (w/ wheels)", value: '32.5"L x 24"W x 18.5"H' },
    { name: "Door Pass Through", value: '24"' },
    { name: "Frame", value: "Aluminum" },
    { name: "Weight (w/o wheels)", value: "20 LBS" },
    { name: "Weight Capacity", value: "60 LBS" },
    { name: "Width", value: '24"' },
    { name: "Handle height (ground to handle)", value: '37-45"' },
    { name: "Wheels", value: '12" air / wide track slick tread' },
    { name: "Seat back height", value: '21.5"' },
    { name: "Head room (inside canopy)", value: '25"' },
    { name: "Color", value: "Black, Blue, Red, White" },
    { name: "Size", value: "M, S" },
  ];

  const reviews = [
    { user: "Thai", date: "2025-03-19", rating: 5, comment: "<3" },
    {
      user: "Thai",
      date: "2025-03-19",
      rating: 1,
      comment:
        "How to make rating of products (because I see rating of product just is html css) change to list rating :(",
    },
    { user: "Thai", date: "2025-03-19", rating: 5, comment: "Hay Thật Chứ" },
    { user: "Mohd shadav", date: "2025-03-18", rating: 1, comment: "" },
  ];

  return (
    <>
      <section className="productDetails section">
        <div className="container">
          <div className="row">
            <div className="col-md-4 pl-5">
              <ProductZoom />
            </div>
            <div className="col-md-7 pl-5">
              <h2 className="hd text-capitalize">
                Blue Diamond Almonds Lightly Salted
              </h2>
              <ul className="list list-inline">
                <li className="list-inline-item">
                  <div className="d-flex align-items-center">
                    <span className="text-light1 mr-2">Brands : </span>
                    <span>Welch's</span>
                  </div>
                </li>
                <li className="list-inline-item d-flex align-items-center">
                  <div className="d-flex align-items-center">
                    <Rating
                      name="read-only"
                      value={4.5}
                      size="small"
                      readOnly
                      precision={0.5}
                    />
                    <span className="text-light1 cursor ml-2">1 Review</span>
                  </div>
                </li>
              </ul>
              <div className="d-flex info mb-3">
                <span className="oldPrice">$20.00</span>
                <span className="netPrice text-danger ml-2">$10.00</span>
              </div>
              <span className="badge bg-success">IN STOCK</span>
              <p className="mt-3">
                Vivamus adipiscing nisl ut dolor dignissim semper. Nulla luctus
                malesuada tincidunt. Class aptent taciti sociosqu ad litora
                torquent
              </p>
              <div className="productSize d-flex align-items-center">
                <span>Size / Weight:</span>
                <ul className="list list-inline mb-0 pl-0 ml-3">
                  <li className="list-inline-item">
                    {" "}
                    <a
                      href="#/"
                      className={`tag ${activeSize === 0 ? "active" : ""}`}
                      onClick={() => isActive(0)}
                    >
                      50g
                    </a>
                  </li>
                  <li className="list-inline-item">
                    {" "}
                    <a
                      href="#/"
                      className={`tag ${activeSize === 1 ? "active" : ""}`}
                      onClick={() => isActive(1)}
                    >
                      100g
                    </a>
                  </li>
                  <li className="list-inline-item">
                    {" "}
                    <a
                      href="#/"
                      className={`tag ${activeSize === 2 ? "active" : ""}`}
                      onClick={() => isActive(2)}
                    >
                      200g
                    </a>
                  </li>
                  <li className="list-inline-item">
                    {" "}
                    <a
                      href="#/"
                      className={`tag ${activeSize === 3 ? "active" : ""}`}
                      onClick={() => isActive(3)}
                    >
                      500g
                    </a>
                  </li>
                </ul>
              </div>

              <div className="d-flex align-items-center mt-3">
                <QuantityBox />
                <Button
                  className="btn-lg btn-big btn-round ml-3"
                  sx={{
                    backgroundColor: "#00aaff",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#0088cc",
                    },
                  }}
                >
                  <BsFillCartFill /> &nbsp; Add to Cart
                </Button>
                <Tooltip title="Add to Wishlist" placement="top">
                  <Button
                    className="btn-lg btn-big btn-circle ml-4"
                    sx={{
                      backgroundColor: "#00aaff",
                      color: "white",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: "white",
                        color: "#00aaff",
                        border: "1px solid #00aaff",
                      },
                      "&:active": {
                        backgroundColor: "#00aaff",
                        color: "white",
                      },
                    }}
                  >
                    <FaRegHeart />
                  </Button>
                </Tooltip>
                <Tooltip title="Add to Compare" placement="top">
                  <Button
                    className="btn-lg btn-big btn-circle ml-2"
                    sx={{
                      backgroundColor: "#00aaff",
                      color: "white",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: "white",
                        color: "#00aaff",
                        border: "1px solid #00aaff",
                      },
                      "&:active": {
                        backgroundColor: "#00aaff",
                        color: "white",
                      },
                    }}
                  >
                    <MdCompareArrows />
                  </Button>
                </Tooltip>
              </div>
            </div>
          </div>
          <br />

          <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto", p: 3 }}>
            <StyledTabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
            >
              <Tab label="Description" />
              <Tab label="Additional Info" />
              <Tab label={`Reviews (${reviews.length})`} />
            </StyledTabs>

            <ContentBox>
              {tabValue === 0 && (
                <Typography fontSize="1.1rem" lineHeight={1.7}>
                  Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry. Lorem Ipsum has been the industry's
                  standard dummy text ever since the 1500s, when an unknown
                  printer took a galley of type and scrambled it to make a type
                  specimen book.
                </Typography>
              )}

              {tabValue === 1 && (
                <Table
                  sx={{
                    "& .MuiTableCell-root": { fontSize: "1.05rem", py: 2 },
                  }}
                >
                  <TableBody>
                    {productSpecs.map((spec) => (
                      <TableRow
                        key={spec.name}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell
                          component="th"
                          scope="row"
                          sx={{
                            fontWeight: "medium",
                            color: "#333",
                            width: "40%",
                          }}
                        >
                          {spec.name}
                        </TableCell>
                        <TableCell>{spec.value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {tabValue === 2 && (
                <Box>
                  {/* Add a review section */}
                  <Box sx={{ mb: 5 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
                      Add a review
                    </Typography>

                    <ReviewTextField
                      multiline
                      rows={6}
                      placeholder="Write a Review"
                      value={review}
                      onChange={handleReviewChange}
                      variant="outlined"
                    />

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 3,
                      }}
                    >
                      <Rating
                        value={rating}
                        onChange={handleRatingChange}
                        sx={{
                          "& .MuiRating-iconFilled": {
                            fontSize: "1.8rem",
                            color: "#ffc107",
                          },
                          "& .MuiRating-iconEmpty": { fontSize: "1.8rem" },
                        }}
                      />

                      <SubmitButton
                        variant="contained"
                        onClick={handleSubmitReview}
                      >
                        Submit Review
                      </SubmitButton>
                    </Box>
                  </Box>

                  {/* Divider */}
                  <Box sx={{ height: 1, backgroundColor: "#e0e0e0", mb: 4 }} />

                  {/* Existing reviews */}
                  <Typography variant="h5" sx={{ mb: 4, fontWeight: 500 }}>
                    Customer questions & answers
                  </Typography>

                  {reviews.map((review, index) => (
                    <ReviewItem key={index}>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: "medium", mb: 0.5 }}
                      >
                        {review.user}
                      </Typography>
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mb: 1.5 }}
                      >
                        {review.date}
                      </Typography>
                      <Rating
                        value={review.rating}
                        readOnly
                        precision={0.5}
                        sx={{
                          mb: 2,
                          "& .MuiRating-iconFilled": {
                            fontSize: "1.5rem",
                            color: "#ffc107",
                          },
                          "& .MuiRating-iconEmpty": { fontSize: "1.5rem" },
                        }}
                      />
                      {review.comment && (
                        <Typography
                          variant="body1"
                          fontSize="1.1rem"
                          lineHeight={1.6}
                        >
                          {review.comment}
                        </Typography>
                      )}
                    </ReviewItem>
                  ))}
                </Box>
              )}
            </ContentBox>
          </Box>

          <br />
          <RelatedProducts title="RELATED PRODUCTS" />
          <RelatedProducts title="RELATED PRODUCTS" />
        </div>
      </section>
    </>
  );
};
export default ProductDetails;
