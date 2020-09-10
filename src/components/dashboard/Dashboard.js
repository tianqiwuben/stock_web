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
import TestPanel from './TestPanel';
import StatusBar from './StatusBar';

const drawerWidth = 320;

const styles = theme => ({
  root: {
    display: 'flex',
  },
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
});

class Dashboard extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      open: false,
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
        <AppBar position="fixed" className={clsx(classes.appBar, open && classes.appBarShift)}>
          <Toolbar className={classes.toolbar}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={this.handleDrawerOpen}
              className={clsx(classes.menuButton, open && classes.hide)}
            >
              <MenuIcon />
            </IconButton>
            <StatusBar />
            <MsgBar />
          </Toolbar>
        </AppBar>
        <Drawer
          variant="persistent"
          anchor="left"
          className={classes.drawer}
          classes={{
            paper: clsx(classes.drawerPaper),
          }}
          open={open}
        >
          <div className={classes.drawerHeader}>
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
        <main className={clsx(classes.content, {
          [classes.contentShift]: open,
        })}>
          <div className={classes.drawerHeader} />
          {
            loading ?
            <Box display="flex" flexDirection="column" justifyContent="space-around" alignItems="center" height="100%">
              <CircularProgress size={48}/>
              <div></div>
            </Box>
            :
            <Container maxWidth="100%" className={classes.container}>
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
                <Route component={Status} />
              </Switch>
            </Container>
          }
          </main>
        <WSocket />
        <TestPanel />
      </div>
    );
  }
}


export default compose(
  withStyles(styles),
)(Dashboard);