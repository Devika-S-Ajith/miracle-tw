import { makeStyles } from "@mui/styles";
import { tableCellClasses } from "@mui/material/TableCell";

export const useStyles = makeStyles((theme) => ({
  input: {
    background: "white",
    borderRadius: "4px",
    position: "relative",
    border: "1px solid #D6DBDE",
    fontSize: 16,
    width: "100%",
    padding: "13px 12px",
    disableUnderline: true,
    "&:hover": {
      background: "white",
      border: "1px solid #000000",
      borderRadius: "4px",
    },
  },
  password: {
    // borderRadius: "4px",
    position: "relative",
    // border: "1px solid #D6DBDE",
    // borderRight: "none",
    fontSize: 16,
    width: "100%",
    padding: "14px 12px",
  },
}));

export const tableContainerStyles = {
  mt: 2,
  maxHeight: 350,
  "&::-webkit-scrollbar": {
    width: "3px",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "#888",
    borderRadius: "6px",
  },
  "&::-webkit-scrollbar-track": {
    backgroundColor: "#f2f2f2",
  },
};

export const tableStyles = {
  [`& .${tableCellClasses.root}`]: {
    //borderBottom: 'none',
  },
};

export const statusField = {
  Pending: { color: "#F5A70B", label: "Pending" },
  true: { color: "#357323", label: "Active" },
  false: { color: "#C6C4BE", label: "Deactivated" },
  Active: { color: "#357323", label: "Active" },
  Deactivated: { color: "#C6C4BE", label: "Deactivated" },
  Incompleted: { color: "red", label: "Incomplete" },
  UNKNOWN: { color: "#C6C4BE", label: "UNKNOWN" },
  InActive: { color: "##C6C4BE", label: "InActive" },
};
