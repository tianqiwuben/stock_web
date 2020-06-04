import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import {
  apiGetAgg,
  apiPostAgg,
} from '../../utils/ApiFetch';

const useStyles = theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  row: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
  error: {
    margin: theme.spacing(1),
    color: 'red',
  },
});

class Aggregates extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      status: 'idle',
      error: '',
    }
  }

  componentDidMount() {
    this.onShow();
  }

  onGenerate = () => {

  }

  onShow = () => {
    const {status} = this.state;
    if (status !== 'idle') {
      return;
    }
    this.setState({
      status: 'loading',
      error: '',
    });
    const query = {
      sym: 'SPY',
    }
    apiGetAgg(query).then(resp => {
      if (resp.data.success) {
        if (!resp.data.payload) {
          this.setState({
            status: 'idle',
            error: 'Not found'
          });
        }
      }
    });
  }

  render() {
    const {error} = this.state;
    const {classes} = this.props;
    return (
      <Paper>
        <div className={classes.row}>
          <Button variant="contained" color="default" onClick={this.onGenerate}>
            Generate
          </Button>
          <Button variant="contained" color="primary" onClick={this.onShow}>
            Show
          </Button>
        </div>
        {
          error !== '' &&
          <Typography variant="h6" gutterBottom className={classes.error}>
            {error}
          </Typography>
        }
      </Paper>
    );
  }
}


export default compose(
  withStyles(useStyles),
)(Aggregates);