import React from "react";
import { FaEdit, FaTrash, FaUpload } from "react-icons/fa";
import "./styles.css";
import Pagination from "@mui/material/Pagination";
import { fetchDataFromApi, deleteData } from "../../utils/api";
import { editData } from "../../utils/api";
import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import { Link } from "react-router-dom";

const CategoryList = () => {
  const [open, setOpen] = useState(false);
  const [catData, setCatData] = useState([]);
  const [editId, setEditId] = useState(null);
  const [imageInputType, setImageInputType] = useState("url");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // Phân trang
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    image: "",
    color: "",
  });

  const changeInput = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    fetchDataFromApi("/api/categories")
      .then((res) => {
        const data = Array.isArray(res) ? res : [];
        setCatData(data);
        setTotalPages(Math.ceil(data.length / itemsPerPage));
        console.log("Loaded categories:", res);
      })
      .catch((err) => {
        console.error("Error loading categories:", err);
      });
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Lấy các mục cho trang hiện tại
  const getCurrentItems = () => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return catData.slice(startIndex, endIndex);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      name: "",
      image: "",
      color: "",
    });
    setImageFile(null);
    setImagePreview("");
    setImageInputType("url");
  };

  const editCategory = (id) => {
    setOpen(true);
    setEditId(id);
    fetchDataFromApi(`/api/categories/${id}`)
      .then((res) => {
        if (res) {
          setFormData({
            name: res.name || "",
            image: res.image || "",
            color: res.color || "",
          });
          setImagePreview(res.image || "");
          console.log("Category to edit:", res);
        }
      })
      .catch((err) => {
        console.error("Error fetching category:", err);
      });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleImageTypeChange = (e) => {
    setImageInputType(e.target.value);
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setFormData({
      ...formData,
      image: url,
    });
    setImagePreview(url);
  };

  // Convert image file to base64 for Cloudinary upload
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form with data:", formData);
    console.log("Editing category ID:", editId);

    if (!editId) {
      console.error("Missing editId");
      return;
    }

    try {
      let updatedData = { ...formData };

      // If image input type is file and a file is selected
      if (imageInputType === "file" && imageFile) {
        // Convert file to base64 for Cloudinary upload
        const base64Image = await fileToBase64(imageFile);
        updatedData.image = base64Image;
      }

      // Send the update request
      const response = await editData(`/api/categories/${editId}`, updatedData);
      console.log("Update response:", response);
      loadCategories();
      handleClose();
    } catch (error) {
      console.error(
        "Error updating category:",
        error.response?.data || error.message
      );
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xoá danh mục này không?")) {
      deleteData("/api/categories/", id)
        .then((res) => {
          console.log("Kết quả xoá:", res);
          if (res.success) {
            alert("Xoá thành công");
            loadCategories();
          } else {
            alert("Xoá thất bại");
          }
        })
        .catch((err) => {
          console.error("Lỗi khi xoá:", err);
          alert("Đã xảy ra lỗi khi xoá");
        });
    }
  };

  // Tính toán số hiển thị
  const startItem = (page - 1) * itemsPerPage + 1;
  const endItem = Math.min(page * itemsPerPage, catData.length);

  return (
    <>
      <div className="header">
        <h1>Category List</h1>
        <div className="breadcrumbs">
          <Link to="/" className="breadcrumb-link">
            Home
          </Link>
          <span className="separator">~</span>
          <Link to="/category" className="breadcrumb-link">
            Category
          </Link>
          <span className="separator">~</span>
          <span>Category List</span>
        </div>
      </div>
      <div className="category-table-container">
        <div className="table-header-section">
          <h3>Category List</h3>
        </div>

        <div className="table-responsive">
          <table className="category-table">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" />
                </th>
                <th>UID</th>
                <th>Ảnh</th>
                <th>Tên Danh Mục</th>
                <th>Color</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {getCurrentItems().map((item, index) => {
                return (
                  <tr key={item.id || index}>
                    <td>
                      <input type="checkbox" />
                    </td>
                    <td>{item.id}</td>
                    <td>
                      <div className="category-info">
                        <img src={item.image} alt="Ảnh Danh Mục" />
                        <div>
                          <div className="category-name"></div>
                          <div className="category-color"></div>
                        </div>
                      </div>
                    </td>
                    <td>{item.name}</td>
                    <td>
                      <div
                        className="color-display mr-2"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      {item.color}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-btn"
                          onClick={() => editCategory(item.id)}
                          type="button"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="delete-btn"
                          type="button"
                          onClick={() => handleDelete(item.id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <div className="showing-info">
            {catData.length > 0
              ? `showing ${startItem} to ${endItem} of ${catData.length} results`
              : "No results to display"}
          </div>
          <div className="pagination">
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </div>
        </div>
      </div>

      <Dialog
        className="editModal"
        open={open}
        onClose={handleClose}
        maxWidth="md"
      >
        <DialogTitle>Chỉnh sửa</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <DialogContentText>Chỉnh sửa danh mục sản phẩm</DialogContentText>
            <TextField
              autoFocus
              required
              margin="dense"
              id="name"
              name="name"
              label="Category Name"
              type="text"
              value={formData.name}
              fullWidth
              onChange={changeInput}
            />

            {/* Image upload options */}
            <FormControl component="fieldset" className="mt-3 mb-2">
              <FormLabel component="legend">Phương thức chọn ảnh</FormLabel>
              <RadioGroup
                row
                name="imageInputType"
                value={imageInputType}
                onChange={handleImageTypeChange}
              >
                <FormControlLabel value="url" control={<Radio />} label="URL" />
                <FormControlLabel
                  value="file"
                  control={<Radio />}
                  label="Upload File"
                />
              </RadioGroup>
            </FormControl>

            {/* Show different input based on selection */}
            {imageInputType === "url" ? (
              <TextField
                required={imageInputType === "url"}
                margin="dense"
                id="image"
                name="image"
                label="Category Image URL"
                type="text"
                value={formData.image}
                fullWidth
                onChange={handleUrlChange}
              />
            ) : (
              <div className="file-upload-container mt-2 mb-2">
                <input
                  type="file"
                  id="imageFile"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <label htmlFor="imageFile">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<FaUpload />}
                  >
                    Chọn File Ảnh
                  </Button>
                </label>
                {imageFile && <span className="ml-2">{imageFile.name}</span>}
              </div>
            )}

            {/* Image preview */}
            {imagePreview && (
              <div className="image-preview mt-2 mb-2">
                <p>Xem trước:</p>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ maxWidth: "100%", maxHeight: "200px" }}
                />
              </div>
            )}

            <TextField
              required
              margin="dense"
              id="color"
              name="color"
              label="Category Color"
              type="text"
              value={formData.color}
              fullWidth
              onChange={changeInput}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} variant="outlined" type="button">
              Cancel
            </Button>
            <Button type="submit" variant="outlined">
              Lưu
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default CategoryList;
