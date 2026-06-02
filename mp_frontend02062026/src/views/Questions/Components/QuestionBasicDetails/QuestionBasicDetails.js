
import { useEffect } from 'react';
// import PropTypes from 'prop-types';
import {
  // Box,
  // Button,
  Card,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography
} from '@mui/material';
// import LockIcon from '../../../../assets/icons/Lock';
// import UserIcon from '../../../../assets/icons/User';
import Label from '../../../../components/Label';
// import { CommonDataContext } from '../../../../common/contexts/CommonDataContext';
// import { customerApi } from '../../../../__fakeApi__/customerApi';
import { useTranslation } from 'react-i18next';

const QuestionBasicDetails = (props) => {
  const { question, options, isLoading } = props;
  const { t } = useTranslation(['common']);
  useEffect(() => {
    console.log("isLoading >>", isLoading)
    return () => {
    }
  }, []);


  return (
    < Card
    //{...other}
    >
      <CardHeader title={t('common:question.Question Details')} />
      <Divider />
      <Table>
        <TableBody>
          <TableRow>
          </TableRow>


          <TableRow>
            <TableCell>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
                {t('common:question.Domain')}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography
                color="textSecondary"
                variant="body2"
              >
                {question && t(`common:assessment.${question.domainName}`)}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
                {t('common:question.Question')}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography
                color="textSecondary"
                variant="body2"
              >
                {question.questionText}
              </Typography>
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
                {t('common:question.Helper Text')}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography
                color="textSecondary"
                variant="body2"
              >
                {question.questionHelpText}
              </Typography>
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
                {t('common:question.Is Redflag')}
              </Typography>
            </TableCell>
            <TableCell>
              <Label sx={{ width: 50 }}
                //color="primary"
                color={question.isRedFlag ? 'error' : 'success'}
              >
                {/* {t(`common:common.${invoice.status}`)} */}
                {question.isRedFlag ? `${t('common:common.Yes')}` : `${t('common:common.No')}`}
              </Label>
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell sx={{ width: 450 }}>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
                {t('common:common.Options')}
              </Typography>
            </TableCell>
            <TableCell
            //sx={{display : "flex",flexDirection : "row"}}
            >
              {options.map((option, index) => {
                return (
                  <Typography
                    key={option.score}
                    color="textSecondary"
                    variant="body2"
                  >
                    {index + 1}
                    {". "}
                    {t(`common:assessment.${option.choiceName}`)}
                    {/* {index+1 === options.length ? " "  : ","} */}
                  </Typography>
                )
              })}
              {/* <Label color={isVerified ? 'success' : 'error'} sx={{ml : 2}}>
                {isVerified ? 'Email verified' : 'Email not verified'}
              </Label> */}
            </TableCell>
          </TableRow>





          <TableRow>
            <TableCell>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
                {t('common:common.Intervention Options')}
              </Typography>
            </TableCell>
            <TableCell>
              {question.choiceDetails && question.choiceDetails.length > 0 ? question.choiceDetails.map((choice, index) => {
                return (
                  <Typography
                    color="textSecondary"
                    variant="body2"
                  >
                    {choice.choiceName !== '' && choice.choiceName !== null && index + 1}
                    {choice.choiceName !== '' && choice.choiceName !== null && ". "}
                    {choice.choiceName !== '' && choice.choiceName}
                  </Typography>
                )

              })
                :
                <Typography
                  color="textSecondary"
                  variant="body2"
                >
                  {"No Options"}
                </Typography>}
            </TableCell>
          </TableRow>

        </TableBody>
      </Table>

    </Card>
  )
};


export default QuestionBasicDetails;


