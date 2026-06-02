import { Box } from '@mui/system';
import SmallText from '../../../../components/SmallText/SmallText';
import { useTranslation } from 'react-i18next';

const NoDataFoundText = ({ message = "No data found" }) => {
  
  const { t } = useTranslation(["common"]);
  
  return (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      width: '100%',
    }}
  >
    <SmallText color="text.secondary" value={t(`common:common.${message}`, message)} />
  </Box>
)};

export default NoDataFoundText;
