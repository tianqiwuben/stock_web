import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import {connect} from 'react-redux';
import Paper from '@material-ui/core/Paper';
import FormControl from '@material-ui/core/FormControl';
import {apiPostSteven, apiDeleteSteven, apiGetSteven} from '../../utils/ApiFetch';
import { withSnackbar } from 'notistack';
import {registerComponent} from '../common/Constants';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';

const styles = theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 60,
  },
});

class Steven extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      prevText: '',
      lastSym: '',
      positions: [],
    }
  }

  componentDidMount(){
    this.onFetch();
    registerComponent('steven', this);
  }

  componentWillUnmount(){
    registerComponent('steven', null);
  }

  onFetch = () => {
    apiGetSteven().then(resp => {
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

  onSave = () => {
    const {
      text,
      prevText,
    } = this.state;
    if (text && text.length > 0) {
      if (text !== prevText) {
        const payload = {text};
        this.setState({prevText: text});
        apiPostSteven(payload).then(resp => {
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
    apiDeleteSteven(sym).then(resp => {
      const {enqueueSnackbar} = this.props;
      if (!resp.data.success) {
        enqueueSnackbar(`ERROR: ${resp.data.error}`, {variant: 'error'});
      }
    });
  }

  render() {
    const {classes} = this.props;
    const {
      text,
      lastSym,
      positions,
    } = this.state;
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={12} lg={12}>
          <Paper>
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
            <Button color="primary" onClick={this.onSave}>
              SUBMIT
            </Button>
            <span>Last Sym: {lastSym}</span>
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
)(Steven);