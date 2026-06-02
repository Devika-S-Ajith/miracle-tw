import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { useTranslation } from "react-i18next";

const CustomTableHeader = (props) => {
  const { headers } = props;
  const { t } = useTranslation(["common"]);

  return (
    <>
      <TableRow key="Header">
        {headers.map((header, index) => (
          <TableCell
            key={index}
            sx={{ backgroundColor: "#ffffff", fontWeight: "bold" }}
            align="Left"
          >
            {t(`common:common.${header.label}`)}
          </TableCell>
        ))}
      </TableRow>
    </>
  );
};

export default CustomTableHeader;
