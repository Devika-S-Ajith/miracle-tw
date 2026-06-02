//import numeral from 'numeral';
import {
  Box,
  Card,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material';
import ExternalLinkIcon from '../../../../assets/icons/ExternalLink';
import InformationCircleIcon from '../../../../assets/icons/InformationCircle';

const pages = [
  {
    bounceRate: 60,
    uniqueVisits: 8584,
    url: 'Aurangabad',
    visitors: 95847
  },
  {
    bounceRate: 50,
    uniqueVisits: 648,
    url: 'Thane',
    visitors: 7500
  },
  {
    bounceRate: 20,
    uniqueVisits: 568,
    url: 'Nagpur',
    visitors: 85406
  },
  {
    bounceRate: 12,
    uniqueVisits: 12322,
    url: 'Ahmednagar',
    visitors: 75050
  },
  // {
  //   bounceRate: 10,
  //   uniqueVisits: 11645,
  //   url: '/blog/understand-programming-principles',
  //   visitors: 68003
  // },
  // {
  //   bounceRate: 8,
  //   uniqueVisits: 10259,
  //   url: '/blog/design-patterns',
  //   visitors: 49510
  // }
];

const ReportsMostVisitedPages = () => (
  <Card>
    <CardHeader
      disableTypography
      title={(
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          <Typography
            color="textPrimary"
            variant="h6"
          >
            Most Visited Areas
          </Typography>
          <Tooltip title="Refresh rate is 24h">
            <InformationCircleIcon fontSize="small" />
          </Tooltip>
        </Box>
      )}
    />
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>
            Locality/District
          </TableCell>
          <TableCell>
            New Visitors
          </TableCell>
          <TableCell>
            Total Visits
          </TableCell>
          <TableCell>
            Re-Integration rate
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {pages.map((page) => (
          <TableRow
            key={page.url}
            sx={{
              '&:last-child td': {
                border: 0
              }
            }}
          >
            <TableCell>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <ExternalLinkIcon
                  fontSize="small"
                  sx={{
                    color: 'text.secondary',
                    cursor: 'pointer'
                  }}
                />
                <Typography
                  color="textPrimary"
                  sx={{ ml: 2 }}
                  variant="body2"
                >
                  {page.url}
                </Typography>
              </Box>
            </TableCell>
            <TableCell>
              {/* {numeral(page.visitors).format('0,0')} */}
              {"3564"}
            </TableCell>
            <TableCell>
              {/* {numeral(page.uniqueVisits).format('0,0')} */}
              {"5547"}
            </TableCell>
            <TableCell>
              {page.bounceRate}
              %
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Card>
);

export default ReportsMostVisitedPages;
