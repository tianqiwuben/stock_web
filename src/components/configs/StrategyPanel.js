import React from 'react';
import compose from 'recompose/compose';
import {connect} from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import StrategyValues from './StrategyValues';
import StrategyOptimization from './StrategyOptimization';


const useStyles = theme => ({

});


class StrategyPanel extends React.Component {
  render() {
    const {onChangeConfig} = this.props;
    return (
      <Grid container spacing={3}>
        <StrategyValues
          onChangeConfig={onChangeConfig}
        />
        <StrategyValues
          isTest={true}
          onChangeConfig={onChangeConfig}
        />
        <StrategyOptimization 
          onChangeConfig={onChangeConfig}
        />
      </Grid>
    );
  }
}

const mapStateToProps = state => ({
})

export default compose(
  withStyles(useStyles),
  connect(mapStateToProps),
)(StrategyPanel);