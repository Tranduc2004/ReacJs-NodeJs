import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import { MdClose } from "react-icons/md";
import { styled } from "@mui/material/styles";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogTitle-root": {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing(2),
  },
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
}));

const ProductModal = (props) => {
  return (
    <BootstrapDialog
      open={true}
      onClose={() => props.closeProductModal()}
      aria-labelledby="product-dialog-title"
    >
      <DialogTitle id="product-dialog-title" sx={{ m: 0, p: 2 }}>
        <IconButton
          aria-label="close"
          onClick={() => props.closeProductModal()}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <MdClose />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <h4 className="mb-0">All Natural Italian-Style Chicken Meatballs</h4>
        <div className="d-flex align-items-center">
          <span>Brands:</span>
          <span>Welch's</span>
        </div>
      </DialogContent>
    </BootstrapDialog>
  );
};

export default ProductModal;
