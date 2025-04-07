import { FaMinus } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import Button from "@mui/material/Button";

const QuantityBox = ({ quantity = 1, onIncrease, onDecrease }) => {
  return (
    <div className="quantityDrop d-flex align-items-center mr-3">
      <Button onClick={onDecrease}>
        <FaMinus />
      </Button>
      <input type="text" value={quantity} readOnly className="text-center" />
      <Button onClick={onIncrease}>
        <FaPlus />
      </Button>
    </div>
  );
};

export default QuantityBox;
