import { makeStyles } from '@mui/styles'
export default makeStyles((theme) => ({
  alphaList: {
    listStyleType: 'upper-alpha',
    '& *': {
      marginTop: theme.spacing(1),
    },
  },
  romanList: {
    listStyleType: 'upper-roman',
    '& *': {
      marginTop: theme.spacing(1),
    },
  },
  ul: {
    marginTop: theme.spacing(1),
    listStyle: 'none',
    '& > li': {
      marginTop: 0,
    },
  },
}))
