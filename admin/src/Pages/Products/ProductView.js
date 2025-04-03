import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Breadcrumbs,
  Chip,
  Button,
  Rating,
  Stack,
  LinearProgress,
  Avatar,
  IconButton,
  TextField,
  Divider,
} from "@mui/material";
import {
  LocalOffer as TagIcon,
  Category as CategoryIcon,
  Palette as ColorIcon,
  Straighten as SizeIcon,
  AttachMoney as PriceIcon,
  Inventory as StockIcon,
  Star as StarIcon,
  CalendarToday as DateIcon,
  MoreVert as MoreIcon,
  Reply as ReplyIcon,
} from "@mui/icons-material";
import { useTheme } from "../../context/ThemeContext";

const ProductView = () => {
  const { isDarkMode } = useTheme();
  const [selectedImage, setSelectedImage] = useState(0);
  const productImages = [
    "https://mironcoder-hotash.netlify.app/images/product/single/01.webp",
    "https://mironcoder-hotash.netlify.app/images/product/single/03.webp",
    "https://mironcoder-hotash.netlify.app/images/product/single/02.webp",
    "https://mironcoder-hotash.netlify.app/images/product/single/04.webp",
  ];

  return (
    <Box
      sx={{
        p: 3,
        bgcolor: isDarkMode ? "#0f1824" : "#f5f5f5",
        minHeight: "100vh",
        transition: "all 0.3s ease",
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          sx={{
            mb: 2,
            color: isDarkMode ? "#fff" : "#1a1a1a",
            fontWeight: 500,
          }}
        >
          Product View
        </Typography>
        <Breadcrumbs
          separator="/"
          aria-label="breadcrumb"
          sx={{
            "& .MuiBreadcrumbs-separator": {
              color: isDarkMode
                ? "rgba(255, 255, 255, 0.5)"
                : "rgba(0, 0, 0, 0.4)",
            },
          }}
        >
          <Link
            to="/"
            style={{
              color: isDarkMode ? "#90caf9" : "#1976d2",
              textDecoration: "none",
            }}
          >
            Home
          </Link>
          <Link
            to="/products"
            style={{
              color: isDarkMode ? "#90caf9" : "#1976d2",
              textDecoration: "none",
            }}
          >
            Products
          </Link>
          <Typography
            sx={{
              color: isDarkMode
                ? "rgba(255, 255, 255, 0.7)"
                : "rgba(0, 0, 0, 0.6)",
            }}
          >
            Product View
          </Typography>
        </Breadcrumbs>
      </Box>

      <Grid container spacing={3}>
        {/* Product Gallery */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "#fff",
              border: `1px solid ${
                isDarkMode ? "rgba(255, 255, 255, 0.1)" : "#e0e0e0"
              }`,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                color: isDarkMode ? "#fff" : "#1a1a1a",
                fontWeight: 500,
              }}
            >
              Product Gallery
            </Typography>
            <Box
              sx={{
                border: `1px dashed ${
                  isDarkMode ? "rgba(255, 255, 255, 0.1)" : "#e0e0e0"
                }`,
                borderRadius: 1,
                p: 2,
                mb: 2,
                minHeight: 400,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                bgcolor: isDarkMode ? "rgba(0, 0, 0, 0.2)" : "#fff",
              }}
            >
              <img
                src={productImages[selectedImage]}
                alt="Product"
                style={{
                  maxWidth: "100%",
                  maxHeight: 400,
                  objectFit: "contain",
                }}
              />
            </Box>
            <Box sx={{ display: "flex", gap: 1, overflowX: "auto" }}>
              {productImages.map((image, index) => (
                <Box
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  sx={{
                    border: `1px dashed ${
                      selectedImage === index
                        ? "#1976d2"
                        : isDarkMode
                        ? "rgba(255, 255, 255, 0.1)"
                        : "#e0e0e0"
                    }`,
                    borderRadius: 1,
                    p: 0.5,
                    width: 80,
                    height: 80,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    bgcolor: isDarkMode ? "rgba(0, 0, 0, 0.2)" : "#fff",
                    "&:hover": {
                      borderColor: "#1976d2",
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Product Details */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "#fff",
              border: `1px solid ${
                isDarkMode ? "rgba(255, 255, 255, 0.1)" : "#e0e0e0"
              }`,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                color: isDarkMode ? "#fff" : "#1a1a1a",
                fontWeight: 500,
              }}
            >
              Product Details
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                mb: 3,
                color: isDarkMode
                  ? "rgba(255, 255, 255, 0.9)"
                  : "rgba(0, 0, 0, 0.87)",
                fontWeight: 500,
              }}
            >
              Formal suits for men wedding slim fit 3 piece dress business party
              jacket
            </Typography>

            <Box sx={{ "& > div": { mb: 2 } }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    width: 100,
                    color: isDarkMode
                      ? "rgba(255, 255, 255, 0.7)"
                      : "rgba(0, 0, 0, 0.6)",
                  }}
                >
                  Brand
                </Box>
                <Typography
                  sx={{
                    color: isDarkMode
                      ? "rgba(255, 255, 255, 0.5)"
                      : "rgba(0, 0, 0, 0.4)",
                  }}
                >
                  :
                </Typography>
                <Box sx={{ ml: 2, color: isDarkMode ? "#fff" : "#1a1a1a" }}>
                  Ecstasy
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    width: 100,
                    color: isDarkMode
                      ? "rgba(255, 255, 255, 0.7)"
                      : "rgba(0, 0, 0, 0.6)",
                  }}
                >
                  Category
                </Box>
                <Typography
                  sx={{
                    color: isDarkMode
                      ? "rgba(255, 255, 255, 0.5)"
                      : "rgba(0, 0, 0, 0.4)",
                  }}
                >
                  :
                </Typography>
                <Box sx={{ ml: 2, color: isDarkMode ? "#fff" : "#1a1a1a" }}>
                  Man's
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                <Box
                  sx={{
                    width: 100,
                    color: isDarkMode
                      ? "rgba(255, 255, 255, 0.7)"
                      : "rgba(0, 0, 0, 0.6)",
                  }}
                >
                  Tags
                </Box>
                <Typography
                  sx={{
                    color: isDarkMode
                      ? "rgba(255, 255, 255, 0.5)"
                      : "rgba(0, 0, 0, 0.4)",
                  }}
                >
                  :
                </Typography>
                <Box sx={{ ml: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {["SUITE", "PARTY", "DRESS", "SMART", "MAN", "STYLES"].map(
                    (tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        sx={{
                          bgcolor: isDarkMode
                            ? "rgba(255, 255, 255, 0.05)"
                            : "rgba(0, 0, 0, 0.08)",
                          color: isDarkMode ? "#fff" : "#1a1a1a",
                          border: "none",
                          "&:hover": {
                            bgcolor: isDarkMode
                              ? "rgba(255, 255, 255, 0.1)"
                              : "rgba(0, 0, 0, 0.12)",
                          },
                        }}
                      />
                    )
                  )}
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    width: 100,
                    color: isDarkMode
                      ? "rgba(255, 255, 255, 0.7)"
                      : "rgba(0, 0, 0, 0.6)",
                  }}
                >
                  Color
                </Box>
                <Typography
                  sx={{
                    color: isDarkMode
                      ? "rgba(255, 255, 255, 0.5)"
                      : "rgba(0, 0, 0, 0.4)",
                  }}
                >
                  :
                </Typography>
                <Box sx={{ ml: 2, display: "flex", gap: 1 }}>
                  {[
                    { label: "RED", color: "#f44336" },
                    { label: "BLUE", color: "#2196f3" },
                    { label: "GREEN", color: "#4caf50" },
                    { label: "YELLOW", color: "#ffeb3b" },
                    { label: "PURPLE", color: "#9c27b0" },
                  ].map(({ label, color }) => (
                    <Chip
                      key={label}
                      label={label}
                      size="small"
                      sx={{
                        bgcolor: isDarkMode
                          ? "rgba(255, 255, 255, 0.05)"
                          : "rgba(0, 0, 0, 0.08)",
                        color: color,
                        border: "none",
                        "&:hover": {
                          bgcolor: isDarkMode
                            ? "rgba(255, 255, 255, 0.1)"
                            : "rgba(0, 0, 0, 0.12)",
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    width: 100,
                    color: isDarkMode
                      ? "rgba(255, 255, 255, 0.7)"
                      : "rgba(0, 0, 0, 0.6)",
                  }}
                >
                  Size
                </Box>
                <Typography
                  sx={{
                    color: isDarkMode
                      ? "rgba(255, 255, 255, 0.5)"
                      : "rgba(0, 0, 0, 0.4)",
                  }}
                >
                  :
                </Typography>
                <Box sx={{ ml: 2, display: "flex", gap: 1 }}>
                  {["SM", "MD", "LG", "XL", "XXL"].map((size) => (
                    <Chip
                      key={size}
                      label={size}
                      size="small"
                      sx={{
                        bgcolor:
                          size === "MD"
                            ? "#1976d2"
                            : isDarkMode
                            ? "rgba(255, 255, 255, 0.05)"
                            : "rgba(0, 0, 0, 0.08)",
                        color:
                          size === "MD"
                            ? "#fff"
                            : isDarkMode
                            ? "#fff"
                            : "#1a1a1a",
                        border: "none",
                        "&:hover": {
                          bgcolor:
                            size === "MD"
                              ? "#1565c0"
                              : isDarkMode
                              ? "rgba(255, 255, 255, 0.1)"
                              : "rgba(0, 0, 0, 0.12)",
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    width: 100,
                    color: isDarkMode
                      ? "rgba(255, 255, 255, 0.7)"
                      : "rgba(0, 0, 0, 0.6)",
                  }}
                >
                  Price
                </Box>
                <Typography
                  sx={{
                    color: isDarkMode
                      ? "rgba(255, 255, 255, 0.5)"
                      : "rgba(0, 0, 0, 0.4)",
                  }}
                >
                  :
                </Typography>
                <Box sx={{ ml: 2 }}>
                  <Typography
                    component="span"
                    sx={{
                      color: isDarkMode ? "#90caf9" : "#1976d2",
                      fontWeight: "bold",
                    }}
                  >
                    $37.00
                  </Typography>
                  <Typography
                    component="span"
                    sx={{
                      ml: 1,
                      textDecoration: "line-through",
                      color: isDarkMode
                        ? "rgba(255, 255, 255, 0.5)"
                        : "rgba(0, 0, 0, 0.4)",
                    }}
                  >
                    $42.00
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    width: 100,
                    color: isDarkMode
                      ? "rgba(255, 255, 255, 0.7)"
                      : "rgba(0, 0, 0, 0.6)",
                  }}
                >
                  Stock
                </Box>
                <Typography
                  sx={{
                    color: isDarkMode
                      ? "rgba(255, 255, 255, 0.5)"
                      : "rgba(0, 0, 0, 0.4)",
                  }}
                >
                  :
                </Typography>
                <Box sx={{ ml: 2, color: isDarkMode ? "#fff" : "#1a1a1a" }}>
                  (68) Piece
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    width: 100,
                    color: isDarkMode
                      ? "rgba(255, 255, 255, 0.7)"
                      : "rgba(0, 0, 0, 0.6)",
                  }}
                >
                  Review
                </Box>
                <Typography
                  sx={{
                    color: isDarkMode
                      ? "rgba(255, 255, 255, 0.5)"
                      : "rgba(0, 0, 0, 0.4)",
                  }}
                >
                  :
                </Typography>
                <Box sx={{ ml: 2, color: isDarkMode ? "#fff" : "#1a1a1a" }}>
                  (03) Review
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    width: 100,
                    color: isDarkMode
                      ? "rgba(255, 255, 255, 0.7)"
                      : "rgba(0, 0, 0, 0.6)",
                  }}
                >
                  Published
                </Box>
                <Typography
                  sx={{
                    color: isDarkMode
                      ? "rgba(255, 255, 255, 0.5)"
                      : "rgba(0, 0, 0, 0.4)",
                  }}
                >
                  :
                </Typography>
                <Box sx={{ ml: 2, color: isDarkMode ? "#fff" : "#1a1a1a" }}>
                  02 Feb 2020
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Product Description */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mt: 3,
          borderRadius: 2,
          bgcolor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "#fff",
          border: `1px solid ${
            isDarkMode ? "rgba(255, 255, 255, 0.1)" : "#e0e0e0"
          }`,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            color: isDarkMode ? "#fff" : "#1a1a1a",
            fontWeight: 500,
          }}
        >
          Product Description
        </Typography>
        <Typography
          sx={{
            color: isDarkMode
              ? "rgba(255, 255, 255, 0.7)"
              : "rgba(0, 0, 0, 0.6)",
            lineHeight: 1.8,
          }}
        >
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestiae
          reprehenderit repellendus expedita esse cupiditate quos doloremque
          rerum...
        </Typography>
      </Paper>

      {/* Rating Analytics */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mt: 3,
          borderRadius: 2,
          bgcolor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "#fff",
          border: `1px solid ${
            isDarkMode ? "rgba(255, 255, 255, 0.1)" : "#e0e0e0"
          }`,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            mb: 3,
            color: isDarkMode ? "#fff" : "#1a1a1a",
            fontWeight: 500,
          }}
        >
          Rating Analytics
        </Typography>
        <Grid container spacing={4}>
          {/* Left side - Rating bars */}
          <Grid item xs={12} md={8}>
            {[
              { star: 5, count: 22, percentage: 60 },
              { star: 4, count: 6, percentage: 40 },
              { star: 3, count: 5, percentage: 20 },
              { star: 2, count: 3, percentage: 10 },
              { star: 1, count: 2, percentage: 5 },
            ].map((rating) => (
              <Box
                key={rating.star}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 1.5,
                }}
              >
                <Typography
                  sx={{
                    width: 60,
                    color: isDarkMode
                      ? "rgba(255, 255, 255, 0.7)"
                      : "rgba(0, 0, 0, 0.6)",
                  }}
                >
                  {rating.star} Star
                </Typography>
                <Box
                  sx={{
                    flex: 1,
                    mx: 2,
                    height: 8,
                    borderRadius: 1,
                    bgcolor: isDarkMode
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(0, 0, 0, 0.08)",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      width: `${rating.percentage}%`,
                      height: "100%",
                      bgcolor: "#fdd835",
                      borderRadius: 1,
                    }}
                  />
                </Box>
                <Typography
                  sx={{
                    width: 40,
                    color: isDarkMode
                      ? "rgba(255, 255, 255, 0.7)"
                      : "rgba(0, 0, 0, 0.6)",
                    textAlign: "right",
                  }}
                >
                  ({String(rating.count).padStart(2, "0")})
                </Typography>
              </Box>
            ))}
          </Grid>

          {/* Right side - Average rating */}
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                textAlign: "center",
                borderLeft: {
                  md: `1px solid ${
                    isDarkMode ? "rgba(255, 255, 255, 0.1)" : "#e0e0e0"
                  }`,
                },
                pl: { md: 4 },
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  mb: 2,
                  color: isDarkMode
                    ? "rgba(255, 255, 255, 0.9)"
                    : "rgba(0, 0, 0, 0.87)",
                }}
              >
                Total Review (38)
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  mb: 1,
                  fontWeight: "bold",
                  color: isDarkMode ? "#90caf9" : "#1976d2",
                }}
              >
                4.9
              </Typography>
              <Rating
                value={4.5}
                precision={0.5}
                readOnly
                sx={{
                  mb: 1,
                  "& .MuiRating-iconFilled": {
                    color: "#fdd835",
                  },
                }}
              />
              <Typography
                sx={{
                  color: isDarkMode
                    ? "rgba(255, 255, 255, 0.7)"
                    : "rgba(0, 0, 0, 0.6)",
                }}
              >
                Your Average Rating Star
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Customer Reviews */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mt: 3,
          borderRadius: 2,
          bgcolor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "#fff",
          border: `1px solid ${
            isDarkMode ? "rgba(255, 255, 255, 0.1)" : "#e0e0e0"
          }`,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            mb: 3,
            color: isDarkMode ? "#fff" : "#1a1a1a",
            fontWeight: 500,
          }}
        >
          Customer Reviews
        </Typography>
        <Stack spacing={2}>
          {[
            {
              name: "Miron Mahmud",
              time: "25 minutes ago!",
              rating: 4.5,
              avatar:
                "https://mironcoder-hotash.netlify.app/images/avatar/01.jpg",
              isAdmin: false,
            },
            {
              name: "Tahmina Bonny",
              time: "3 weeks ago!",
              rating: 4.5,
              avatar:
                "https://mironcoder-hotash.netlify.app/images/avatar/02.jpg",
              isAdmin: true,
            },
            {
              name: "Marjana Akter",
              time: "few minutes ago!",
              rating: 4.5,
              avatar:
                "https://mironcoder-hotash.netlify.app/images/avatar/03.jpg",
              isAdmin: false,
            },
          ].map((review, index) => (
            <Box
              key={index}
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: isDarkMode
                  ? "rgba(0, 0, 0, 0.2)"
                  : "rgba(0, 0, 0, 0.02)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Avatar
                    src={review.avatar}
                    sx={{ width: 48, height: 48, mr: 2 }}
                  />
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography
                        sx={{
                          fontWeight: 500,
                          color: isDarkMode ? "#fff" : "#1a1a1a",
                        }}
                      >
                        {review.name}
                      </Typography>
                      {review.isAdmin && (
                        <Chip
                          label="ADMIN"
                          size="small"
                          sx={{
                            ml: 1,
                            bgcolor: isDarkMode
                              ? "rgba(255, 255, 255, 0.1)"
                              : "rgba(0, 0, 0, 0.08)",
                            color: isDarkMode ? "#fff" : "#1a1a1a",
                          }}
                        />
                      )}
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: isDarkMode
                          ? "rgba(255, 255, 255, 0.5)"
                          : "rgba(0, 0, 0, 0.4)",
                      }}
                    >
                      {review.time}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <IconButton
                    size="small"
                    sx={{
                      color: isDarkMode
                        ? "rgba(255, 255, 255, 0.7)"
                        : "rgba(0, 0, 0, 0.54)",
                    }}
                  >
                    <MoreIcon />
                  </IconButton>
                  <Button
                    startIcon={<ReplyIcon />}
                    variant="contained"
                    sx={{
                      ml: 1,
                      bgcolor: "#0858f7",
                      color: "#fff",
                      fontWeight: 500,
                      "&:hover": {
                        bgcolor: "#1565c0",
                      },
                    }}
                  >
                    REPLY
                  </Button>
                </Box>
              </Box>
              <Rating
                value={review.rating}
                precision={0.5}
                readOnly
                size="small"
                sx={{
                  mb: 1,
                  "& .MuiRating-iconFilled": {
                    color: "#fdd835",
                  },
                }}
              />
              <Typography
                sx={{
                  color: isDarkMode
                    ? "rgba(255, 255, 255, 0.7)"
                    : "rgba(0, 0, 0, 0.6)",
                }}
              >
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Omnis
                quo nostrum dolore fugiat ducimus labore debitis unde autem
                recusandae? Eius harum tempora quis minima, adipisci natus quod
                magni omnis quas.
              </Typography>
            </Box>
          ))}
        </Stack>

        {/* Review Reply Form */}
        <Box
          sx={{
            mt: 3,
            p: 3,
            borderRadius: 2,
            bgcolor: isDarkMode ? "rgba(0, 0, 0, 0.2)" : "rgba(0, 0, 0, 0.02)",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              color: isDarkMode ? "#fff" : "#1a1a1a",
              fontWeight: 500,
            }}
          >
            Review Reply Form
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Write here"
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                bgcolor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "#fff",
                "& fieldset": {
                  borderColor: isDarkMode
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.1)",
                },
                "&:hover fieldset": {
                  borderColor: isDarkMode
                    ? "rgba(255, 255, 255, 0.2)"
                    : "rgba(0, 0, 0, 0.2)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#1976d2",
                },
              },
              "& .MuiInputBase-input": {
                color: isDarkMode ? "#fff" : "#1a1a1a",
              },
            }}
          />
          <Button
            fullWidth
            variant="contained"
            sx={{
              bgcolor: "#0858f7",
              color: "#fff",
              py: 1.5,
              fontWeight: 500,
              "&:hover": {
                bgcolor: "#1565c0",
              },
            }}
          >
            DROP YOUR REPLIES
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProductView;
