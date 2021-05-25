import React from 'react';
import compose from 'recompose/compose';
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
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import MenuIcon from '@material-ui/icons/Menu';
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
import WSocket from '../common/WSocket';
import BulkPanel from '../bulk/BulkPanel';
import MsgBar from '../messages/MsgBar';
import Messages from '../messages/Messages';
import TrendOnly from '../trend/TrendOnly';
import WatchList from '../watchList/WatchList';
import Manual from '../manual/Manual';
import Status from '../status/Status';
import TestPanel from './TestPanel';
import StatusBar from './StatusBar';
import Backtest from '../backtest/Backtest';
import {getComponent} from '../common/Constants';
import TuneConfig from '../strategy/TuneConfig';
import SecondPullBack from '../secondPullBack/SecondPullBack';
import TopPlayer from '../topplayer/TopPlayer';

const styles = theme => ({
  root: {
    display: 'flex',
  },
  drawer: {
    width: 240,
  },
  content: {
    flexGrow: 1,
    paddingTop: theme.spacing(10),
    paddingBottom: theme.spacing(3),
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

  onOpenTestPanel = () => {
    const tp = getComponent('testPanel');
    if (tp) {
      tp.popWithOptions({
        mode: 'simulate',
      })
    }
  }

  render() {
    const {classes} = this.props;
    const {open, loading} = this.state;
    return (
      <div className={classes.root}>
        <CssBaseline />
        <AppBar>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={this.handleDrawerOpen}
            >
              <MenuIcon />
            </IconButton>
            <StatusBar />
            <Button onClick={this.onOpenTestPanel}>TEST</Button>
            <div style={{flex: 1}} />
            <MsgBar />
          </Toolbar>
        </AppBar>
        <Drawer
          anchor="left"
          open={open}
          onClose={this.handleDrawerOpen}
        >
          <List
            className={classes.drawer}
            onClick={this.handleDrawerOpen}
            onKeyDown={this.handleDrawerOpen}
          >
            <Link to="/status">
              <ListItem button>
                <ListItemText primary="Status" />
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
            <Link to="/manual">
              <ListItem button>
                <ListItemText primary="Manual" />
              </ListItem>
            </Link>
            <Link to="/second_pull_back">
              <ListItem button>
                <ListItemText primary="Second Pull Back" />
              </ListItem>
            </Link>
            <Link to="/backtest">
              <ListItem button>
                <ListItemText primary="Backtest" />
              </ListItem>
            </Link>
            <Link to="/tuneconfig">
              <ListItem button>
                <ListItemText primary="Tune Strategy" />
              </ListItem>
            </Link>
            <Link to="/top_player">
              <ListItem button>
                <ListItemText primary="TopPlayer" />
              </ListItem>
            </Link>
          </List>
          <Divider />
        </Drawer>
        <main className={classes.content}>
          {
            loading ?
            <Box display="flex" flexDirection="column" justifyContent="space-around" alignItems="center" height="100%">
              <CircularProgress size={48}/>
              <div></div>
            </Box>
            :
            <Container maxWidth="xl" className={classes.container}>
              <Switch>
                <Route path="/status" component={Status} />
                <Route path="/configs/:id?" component={Configs} />
                <Route path="/transactions" component={Transactions} />
                <Route path="/trend" component={Trend} />
                <Route path="/trend_only" component={TrendOnly} />
                <Route path="/triggers" component={Triggers} />
                <Route path="/process" component={Process} />
                <Route path="/bulk" component={BulkPanel} />
                <Route path="/messages" component={Messages} />
                <Route path="/watch_list" component={WatchList} />
                <Route path="/manual" component={Manual} />
                <Route path="/backtest" component={Backtest} />
                <Route path="/tuneconfig" component={TuneConfig} />
                <Route path="/second_pull_back" component={SecondPullBack} />
                <Route path="/top_player" component={TopPlayer} />
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