import { makeStyles } from '@material-ui/core/styles'
export default makeStyles((theme) => ({
  Card: {
    width: '100%',
    marginBottom: theme.spacing(2),
    padding: theme.spacing(3),
  },
  
  block: {
    display: 'flex',
    flexFlow: 'row nowrap',
    // justifyContent: 'space-between',
    // width: '100%',
    marginBottom: theme.spacing(1),
  },
  
  resourceImageView: {
    maxWidth: 600,
    minWidth: 300,
    maxHeight: 600,
    width: '100%'
  },
  imageWrapper: {
    display: 'flex',
    flexDirection: 'column',
    width: 'fit-content',
  },
  imageDiv: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  imageName: {
    marginRight: theme.spacing(3),
    textAlign: 'center',
    width: '100px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  arrowDiv: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  rightArrow: {
    marginLeft: 'auto !important'
  },
  group: {
    display: 'flex',
    flexFlow: 'column nowrap',
    marginBottom: theme.spacing(1),
  },
  groupTitle: {
    fontWeight: 'bold',
    color: '#95A1AC',
  },
  detailsTitle: {
    marginBottom: theme.spacing(2),
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  headerTitle: {
    marginBottom: theme.spacing(2),
  },
  email: {
    wordWrap: 'break-word'
  },
  divider: {
    margin: theme.spacing(1),
  },
  disableCursor: {
    cursor: 'not-allowed',
    pointerEvents: 'none',
  },
  dark: {
    fontWeight: 'bold'
  },
  profilePic: {
    display: 'flex',
    flexFlow: 'row nowrap',
    justifyContent: 'center',
    minWidth: 100,
    minHeight: 100,
    maxWidth: 100,
    maxHeight: 100,
    alignItems: 'center',
    borderRadius: '50% 50%',
    fontSize: 98,
    marginRight: theme.spacing(2),
  },
  
}))
