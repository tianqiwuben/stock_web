import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import {connect} from 'react-redux';
import Paper from '@material-ui/core/Paper';
import FormControl from '@material-ui/core/FormControl';
import {apiPostManual, apiDeleteManual, apiGetManual} from '../../utils/ApiFetch';
import { withSnackbar } from 'notistack';
import {registerComponent} from '../common/Constants';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';

const styles = theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 60,
  },
  text: {
    marginLeft: theme.spacing(2),
  },
});

class Manual extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      env: 'paper',
      prevText: '',
      lastSym: '',
      positions: [],
    }
  }

  componentDidMount(){
    this.onFetch();
    registerComponent('manual', this);
  }

  componentWillUnmount(){
    registerComponent('manual', null);
  }

  onFetch = () => {
    apiGetManual().then(resp => {
      const {enqueueSnackbar} = this.props;
      if (!resp.data.success) {
        enqueueSnackbar(`ERROR: ${resp.data.error}`, {variant: 'error'});
      } else {
        this.updatePositions(resp.data.payload);
      }
    })
  }

  updatePositions = (data) => {
    const st = {
      positions: [],
    }
    for (let sym in data) {
      if (sym === 'last_sym') {
        st.lastSym = data.last_sym;
      } else {
        st.positions.push({sym: sym, ...data[sym]});
      }
    }
    this.setState(st);
  }

  handleChange = (e) => {
    this.setState({
      'text': e.target.value,
    })
  }

  onSave = (sym = null) => {
    const {
      text,
      prevText,
      env,
    } = this.state;
    const newTxt = sym || text;
    if (newTxt && newTxt.length > 0) {
      if (newTxt !== prevText) {
        const payload = {text: newTxt, env};
        this.setState({prevText: newTxt});
        apiPostManual(payload).then(resp => {
          const {enqueueSnackbar} = this.props;
          if (!resp.data.success) {
            enqueueSnackbar(`ERROR: ${resp.data.error}`, {variant: 'error'});
          }
        });
      }
      this.setState({text: ''});
    }
  }

  onDeletePos = (sym) => {
    apiDeleteManual(sym).then(resp => {
      const {enqueueSnackbar} = this.props;
      if (!resp.data.success) {
        enqueueSnackbar(`ERROR: ${resp.data.error}`, {variant: 'error'});
      }
    });
  }

  changeEnv = (e, env) => {
    this.setState({env});
  }

  render() {
    const {classes} = this.props;
    const {
      text,
      lastSym,
      positions,
      env,
    } = this.state;
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={12} lg={12}>
          <Paper>
            <Box display="flex" flexDirection="row" alignItems="center">
              <FormControl className={classes.formControl}>
                <TextField
                  value={text}
                  onChange={this.handleChange}
                  onKeyPress={(ev) => {
                    if (ev.key === 'Enter') {
                      this.onSave();
                    }
                  }}
                />
              </FormControl>
              <Button color="primary" onClick={() => this.onSave()}>
                SUBMIT
              </Button>
              <ToggleButtonGroup
                size="small"
                value={env}
                exclusive
                onChange={this.changeEnv}
              >
                <ToggleButton value="prod">
                  PROD
                </ToggleButton>
                <ToggleButton value="paper">
                  PAPER
                </ToggleButton>
              </ToggleButtonGroup>
              <Typography className={classes.text} variant="body">Last Sym: {lastSym}</Typography>
              <Typography className={classes.text} variant="body">AAPL 500;</Typography>
              <Typography className={classes.text} variant="body">100.1 99.5;</Typography>
              <Typography className={classes.text} variant="body">AAPL 99;</Typography>
            </Box>
          </Paper>
        </Grid>
        {
          positions.map(pos => (
            <Grid item xs={12} md={4} lg={3}>
              <Paper>
                <List>
                  {
                    Object.keys(pos).map(k => (
                      <ListItem key={k}>
                        <ListItemText>{k}</ListItemText>
                        <ListItemSecondaryAction>
                          {pos[k]}
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))
                  }
                  <ListItem>
                    <ListItemText>
                      <Button color="secondary" onClick={() => this.onDeletePos(pos['sym'])}>DELETE</Button>
                      <Button onClick={() => this.onSave(pos['sym'])}>FLATTEN</Button>
                    </ListItemText>
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          ))
        }
      </Grid>
    );
  }
}

const mapStateToProps = state => ({
})


export default compose(
  withStyles(styles),
  connect(mapStateToProps),
  withSnackbar
)(Manual);