import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import {connect} from 'react-redux';
import Paper from '@material-ui/core/Paper';

import querystring from 'querystring';
import Grid from '@material-ui/core/Grid';
import { withSnackbar } from 'notistack';
import LiveChart from '../common/LiveChart';
const styles = theme => ({
});

class SecondPullBack extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  componentDidMount() {
    const {location} = this.props;
    if (location && !!location.search) {
      const query = querystring.decode(location.search.substring(1));
      if (query.sym && query.start_ts && query.end_ts) {
        this.liveChart.onFetchChart(query.sym, query.end_ts, query.start_ts);
      }
    }
  }

  render() {
    return (
      <Grid container spacing={2}>
        <Grid item xs={12} md={12} lg={12} ref={el => this.chartEl = el}>
          <LiveChart setRef={el => this.liveChart = el} env={'test'} page="second_pull_back"/>
        </Grid>
      </Grid>
    );
  }
}

const mapStateToProps = state => ({
})


export default compose(
  withStyles(styles),
  connect(mapStateToProps, {
  }),
  withSnackbar
)(SecondPullBack);