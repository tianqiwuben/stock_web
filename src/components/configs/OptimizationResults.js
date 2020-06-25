import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import Grid from '@material-ui/core/Grid';
import {connect} from 'react-redux';

import {apiOptimizationApply} from '../../utils/ApiFetch';

const useStyles = theme => ({
  wrapper: {
    position: 'relative',
    display: 'inline',
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
});

class OptimizationResults extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      testLoading: false,
    }
  }

  saveConfig = (id, env) => {
    apiOptimizationApply(id, {save_to: env}).then(resp => {
      if(resp.data.success) {
        const {onFetchConfigs} = this.props;
        onFetchConfigs();
      }
    });
  }

  render() {
    const {
      classes,
      isPercent,
      strategy,
      optimizations,
    } = this.props;
    const data = optimizations[strategy];
    if (!data || !data.headers) {
      return null;
    }
    return (
      <Grid container spacing={3}>
        <Grid item sm={12} md={12} lg={12}>
          <TableContainer component={Paper}>
            <Table className={classes.table}>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Profit %</TableCell>
                  <TableCell>Count</TableCell>
                  {
                    data.headers.map(h => (
                      <TableCell key={h}>
                        <Tooltip title={h}><span>P</span></Tooltip>
                      </TableCell>
                    ))
                  }
                  <TableCell>UpdatedAt</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  data.records.map(row => (
                    <TableRow key={row.id}>
                      <TableCell>{row.result_type}</TableCell>
                      <TableCell>{row.profit}</TableCell>
                      <TableCell>{row.transaction_count}</TableCell>
                      {
                        data.headers.map(h => (
                          <TableCell key={h}>
                            {row.configs[`${h}${isPercent ? '_pct' : ''}`]}
                          </TableCell>
                        ))
                      }
                      <TableCell>{row.updated_at}</TableCell>
                      <TableCell>
                        <Button onClick={() => {this.saveConfig(row.id, 'test')}}>TEST</Button>
                        <Button onClick={() => {this.saveConfig(row.id, 'prod')}}>PROD</Button>
                      </TableCell>
                    </TableRow>
                  ))
                }
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    );
  }
}

const mapStateToProps = state => ({
  sym: state.configs.sym,
  isPercent: state.configs.isPercent,
  optimizations: state.optimizations,
  strategy: state.configs.strategy,
})

export default compose(
  withStyles(useStyles),
  connect(mapStateToProps),
)(OptimizationResults);