import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Stack,
  Divider,
  Checkbox,
  FormControlLabel,
  useTheme,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const ProductUpload = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    brand: "",
    price: "",
    countInStock: "",
    category: "",
    isFeatured: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    setSelectedImages((prev) => [...prev, ...imageUrls]);
  };

  return (
    <Box
      sx={{
        bgcolor: isDarkMode ? "#0f1824" : "#f5f5f5",
        minHeight: "100vh",
        width: "100%",
        position: "relative",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          borderRadius: 0,
          bgcolor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "#fff",
          border: "none",
          p: 4,
          minHeight: "calc(100vh - 24px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Stack spacing={4}>
          {/* Basic Information Section */}
          <Box sx={{ minHeight: "calc(100vh - 400px)" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 4,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: isDarkMode ? "#fff" : "#1a1a1a",
                  fontWeight: 500,
                }}
              >
                Basic Information
              </Typography>
              <Button
                sx={{
                  minWidth: 40,
                  height: 40,
                  borderRadius: 1,
                  color: isDarkMode ? "#fff" : "#1a1a1a",
                  "&:hover": {
                    bgcolor: isDarkMode
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.05)",
                  },
                }}
              >
                •••
              </Button>
            </Box>

            <TextField
              fullWidth
              label="NAME"
              name="name"
              value={formData.name}
              onChange={handleChange}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  bgcolor: isDarkMode ? "rgba(0, 0, 0, 0.2)" : "#f5f5f5",
                  height: "56px",
                  "& fieldset": {
                    border: "none",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: isDarkMode
                    ? "rgba(255, 255, 255, 0.7)"
                    : "rgba(0, 0, 0, 0.6)",
                },
                "& .MuiInputBase-input": {
                  color: isDarkMode ? "#fff" : "#1a1a1a",
                },
              }}
            />

            <TextField
              fullWidth
              multiline
              rows={6}
              label="DESCRIPTION"
              name="description"
              value={formData.description}
              onChange={handleChange}
              sx={{
                mb: 4,
                "& .MuiOutlinedInput-root": {
                  bgcolor: isDarkMode ? "rgba(0, 0, 0, 0.2)" : "#f5f5f5",
                  "& fieldset": {
                    border: "none",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: isDarkMode
                    ? "rgba(255, 255, 255, 0.7)"
                    : "rgba(0, 0, 0, 0.6)",
                },
                "& .MuiInputBase-input": {
                  color: isDarkMode ? "#fff" : "#1a1a1a",
                },
              }}
            />

            <FormControl fullWidth sx={{ mb: 4 }}>
              <InputLabel
                sx={{
                  color: isDarkMode
                    ? "rgba(255, 255, 255, 0.7)"
                    : "rgba(0, 0, 0, 0.6)",
                  width: "100%",
                }}
              >
                CATEGORY
              </InputLabel>
              <Select
                name="category"
                value={formData.category}
                onChange={handleChange}
                sx={{
                  bgcolor: isDarkMode ? "rgba(0, 0, 0, 0.2)" : "#f5f5f5",
                  height: "56px",
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                  "& .MuiSelect-select": {
                    color: isDarkMode ? "#fff" : "#1a1a1a",
                  },
                }}
              >
                <MenuItem value="mens">Mens</MenuItem>
                <MenuItem value="womens">Womens</MenuItem>
                <MenuItem value="kids">Kids</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="BRAND"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              sx={{
                mb: 4,
                "& .MuiOutlinedInput-root": {
                  bgcolor: isDarkMode ? "rgba(0, 0, 0, 0.2)" : "#f5f5f5",
                  height: "56px",
                  "& fieldset": {
                    border: "none",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: isDarkMode
                    ? "rgba(255, 255, 255, 0.7)"
                    : "rgba(0, 0, 0, 0.6)",
                },
                "& .MuiInputBase-input": {
                  color: isDarkMode ? "#fff" : "#1a1a1a",
                },
              }}
            />

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="PRICE"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: isDarkMode ? "rgba(0, 0, 0, 0.2)" : "#f5f5f5",
                      height: "56px",
                      "& fieldset": {
                        border: "none",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: isDarkMode
                        ? "rgba(255, 255, 255, 0.7)"
                        : "rgba(0, 0, 0, 0.6)",
                    },
                    "& .MuiInputBase-input": {
                      color: isDarkMode ? "#fff" : "#1a1a1a",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="COUNT IN STOCK"
                  name="countInStock"
                  value={formData.countInStock}
                  onChange={handleChange}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: isDarkMode ? "rgba(0, 0, 0, 0.2)" : "#f5f5f5",
                      height: "56px",
                      "& fieldset": {
                        border: "none",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: isDarkMode
                        ? "rgba(255, 255, 255, 0.7)"
                        : "rgba(0, 0, 0, 0.6)",
                    },
                    "& .MuiInputBase-input": {
                      color: isDarkMode ? "#fff" : "#1a1a1a",
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isFeatured}
                    onChange={handleChange}
                    name="isFeatured"
                    sx={{
                      color: isDarkMode
                        ? "rgba(255, 255, 255, 0.5)"
                        : "rgba(0, 0, 0, 0.3)",
                      "&.Mui-checked": {
                        color: "#0858f7",
                      },
                    }}
                  />
                }
                label="Featured Product"
                sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
              />
            </Box>
          </Box>

          {/* Media Section */}
          <Box sx={{ mt: 3 }}>
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
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: isDarkMode ? "#fff" : "#1a1a1a",
                    fontWeight: 500,
                  }}
                >
                  Media
                </Typography>
              </Box>

              <Grid container spacing={2}>
                {selectedImages.map((image, index) => (
                  <Grid item xs={6} sm={4} md={3} lg={2} key={index}>
                    <Paper
                      sx={{
                        position: "relative",
                        p: 1,
                        border: `2px solid ${
                          index === selectedImageIndex
                            ? "#0858f7"
                            : "transparent"
                        }`,
                        borderRadius: 1,
                        cursor: "pointer",
                        "&:hover": {
                          borderColor: "#0858f7",
                        },
                      }}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        style={{
                          width: "100%",
                          height: "150px",
                          objectFit: "cover",
                          borderRadius: "4px",
                        }}
                      />
                      {index === selectedImageIndex && (
                        <CheckCircleIcon
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            color: "#0858f7",
                          }}
                        />
                      )}
                    </Paper>
                  </Grid>
                ))}
                <Grid item xs={6} sm={4} md={3} lg={2}>
                  <Paper
                    component="label"
                    sx={{
                      p: 1,
                      height: "150px",
                      border: `2px dashed ${
                        isDarkMode ? "rgba(255, 255, 255, 0.1)" : "#e0e0e0"
                      }`,
                      borderRadius: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      bgcolor: isDarkMode ? "rgba(0, 0, 0, 0.2)" : "#f5f5f5",
                      "&:hover": {
                        borderColor: "#0858f7",
                        "& .upload-icon": {
                          color: "#0858f7",
                        },
                      },
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      hidden
                      onChange={handleImageUpload}
                    />
                    <CloudUploadIcon
                      className="upload-icon"
                      sx={{
                        fontSize: 40,
                        color: isDarkMode
                          ? "rgba(255, 255, 255, 0.5)"
                          : "rgba(0, 0, 0, 0.3)",
                        mb: 1,
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        color: isDarkMode
                          ? "rgba(255, 255, 255, 0.5)"
                          : "rgba(0, 0, 0, 0.3)",
                        textAlign: "center",
                      }}
                    >
                      image upload
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
                <Button
                  variant="contained"
                  sx={{
                    px: 4,
                    py: 1.5,
                    bgcolor: "#0858f7",
                    color: "#fff",
                    "&:hover": {
                      bgcolor: "#0646c6",
                    },
                    borderRadius: 1,
                    textTransform: "uppercase",
                    fontWeight: 500,
                  }}
                >
                  Publish Product
                </Button>
              </Box>
            </Paper>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default ProductUpload;
