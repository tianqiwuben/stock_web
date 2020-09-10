import React from 'react';
import compose from 'recompose/compose';
import {connect} from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import BulkOptimization from './BulkOptimization';
import BulkAssignResult from './BulkAssignResult';
import BulkInitStrategy from './BulkInitStrategy';

const useStyles = theme => ({

});


class BulkPanel extends React.Component {
  render() {
    return (
      <Grid container spacing={3}>
        <BulkOptimization />
        <BulkAssignResult />
        <BulkInitStrategy />
      </Grid>
    );
  }
}

const mapStateToProps = state => ({
})

export default compose(
  withStyles(useStyles),
  connect(mapStateToProps),
)(BulkPanel);