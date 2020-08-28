import React from 'react';
import compose from 'recompose/compose';
import clsx from 'clsx';
import { withStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Container from '@material-ui/core/Container';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import CircularProgress from '@material-ui/core/CircularProgress';
import Box from '@material-ui/core/Box';
import Trend from '../trend/Trend';
import {
  Switch,
  Route,
  Link,
} from "react-router-dom";
import Configs from '../configs/Configs';
import Triggers from '../triggers/Triggers';
import Process from '../process/Process';
import {apiConstants} from '../../utils/ApiFetch';
import {setDB} from '../common/Constants';
import Transactions from '../transaction/Transactions';
import SideChart from '../charts/SideChart';
import WSocket from '../common/WSocket';
import BulkPanel from '../bulk/BulkPanel';
import MsgBar from '../messages/MsgBar';
import Messages from '../messages/Messages';
import TrendOnly from '../trend/TrendOnly';
import SymProp from '../configs/SymProp';
import WatchList from '../watchList/WatchList';
import Suggestions from '../suggestions/Suggestions';
import Steven from '../wechat/Steven';
import Status from '../status/Status';

const drawerWidth = 320;

const styles = theme => ({
  root: {
    display: 'flex',
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: 'none',
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9),
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
});

class Dashboard extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      open: true,
      loading: true,
    }
  }

  componentDidMount() {
    apiConstants().then(resp => {
      setDB(resp.data.payload);
      this.setState({loading: false});
    })
  }

  handleDrawerOpen = () => {
    this.setState({open: !this.state.open});
  }

  render() {
    const {classes} = this.props;
    const {open, loading} = this.state;
    return (
      <div className={classes.root}>
        <CssBaseline />
        <AppBar position="absolute" className={clsx(classes.appBar, open && classes.appBarShift)}>
          <Toolbar className={classes.toolbar}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={this.handleDrawerOpen}
              className={clsx(classes.menuButton, open && classes.menuButtonHidden)}
            >
              <MenuIcon />
            </IconButton>
            <Typography component="h1" variant="h6" noWrap className={classes.title}>
              Dashboard
            </Typography>
            <MsgBar />
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          classes={{
            paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose),
          }}
          open={open}
        >
          <div className={classes.toolbarIcon}>
            <IconButton onClick={this.handleDrawerOpen}>
              <ChevronLeftIcon />
            </IconButton>
          </div>
          <Divider />
          <List>
            <Link to="/status">
              <ListItem button>
                <ListItemText primary="Status" />
              </ListItem>
            </Link>
            <Link to="/suggestions">
              <ListItem button>
                <ListItemText primary="Suggestions" />
              </ListItem>
            </Link>
            <Link to="/configs">
              <ListItem button>
                <ListItemText primary="Configs" />
              </ListItem>
            </Link>
            <Link to="/transactions">
              <ListItem button>
                <ListItemText primary="Transactions" />
              </ListItem>
            </Link>
            <Link to="/trend">
              <ListItem button>
                <ListItemText primary="Trend" />
              </ListItem>
            </Link>
            <Link to="/trend_only">
              <ListItem button>
                <ListItemText primary="Trend Only" />
              </ListItem>
            </Link>
            <Link to="/sym_prop">
              <ListItem button>
                <ListItemText primary="Sym Props" />
              </ListItem>
            </Link>
            <Link to="/triggers">
              <ListItem button>
                <ListItemText primary="Triggers" />
              </ListItem>
            </Link>
            <Link to="/process">
              <ListItem button>
                <ListItemText primary="Process" />
              </ListItem>
            </Link>
            <Link to="/bulk">
              <ListItem button>
                <ListItemText primary="Bulk Opts" />
              </ListItem>
            </Link>
            <Link to="/watch_list">
              <ListItem button>
                <ListItemText primary="Watch List" />
              </ListItem>
            </Link>
            <Link to="/steven">
              <ListItem button>
                <ListItemText primary="Steven" />
              </ListItem>
            </Link>
          </List>
          <Divider />
          <SideChart />
        </Drawer>
        <main className={classes.content}>
          <div className={classes.appBarSpacer} />
          {
            loading ?
            <Box display="flex" flexDirection="column" justifyContent="space-around" alignItems="center" height="100%">
              <CircularProgress size={48}/>
              <div></div>
            </Box>
            :
            <Container maxWidth="lg" className={classes.container}>
              <Switch>
                <Route path="/status" component={Status} />
                <Route path="/suggestions" component={Suggestions} />
                <Route path="/configs/:id?" component={Configs} />
                <Route path="/transactions" component={Transactions} />
                <Route path="/trend" component={Trend} />
                <Route path="/trend_only" component={TrendOnly} />
                <Route path="/triggers" component={Triggers} />
                <Route path="/process" component={Process} />
                <Route path="/bulk" component={BulkPanel} />
                <Route path="/messages" component={Messages} />
                <Route path="/sym_prop/:id?" component={SymProp} />
                <Route path="/watch_list" component={WatchList} />
                <Route path="/steven" component={Steven} />
                <Route component={Configs} />
              </Switch>
            </Container>
          }
          </main>
        <WSocket />
      </div>
    );
  }
}


export default compose(
  withStyles(styles),
)(Dashboard);