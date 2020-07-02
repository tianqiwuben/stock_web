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
import Tooltip from '@material-ui/core/Tooltip';
import Grid from '@material-ui/core/Grid';
import {connect} from 'react-redux';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import {StrategyDB} from '../common/Constants';

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
    apiOptimizationApply(id, {button_action: env}).then(resp => {
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
    if (!optimizations) {
      return null;
    }
    const data = optimizations[strategy];
    if (!data) {
      return null;
    }
    return (
      <Grid container spacing={3}>
        <Grid item sm={12} md={12} lg={12}>
          <TableContainer component={Paper}>
            <Table className={classes.table} size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Profit %</TableCell>
                  <TableCell>Count</TableCell>
                  <TableCell>Hold(min)</TableCell>
                  {
                    StrategyDB[strategy].map(f => (
                      <TableCell key={f.key}>
                        <Tooltip title={f.key}><span>P</span></Tooltip>
                      </TableCell>
                    ))
                  }
                  <TableCell>UpdatedAt</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  data.map(row => (
                    <TableRow key={row.id}>
                      <TableCell>{row.result_type}</TableCell>
                      <TableCell>{row.profit}</TableCell>
                      <TableCell>{row.transaction_count}</TableCell>
                      <TableCell>{(row.hold_seconds / 60).toFixed(1)}</TableCell>
                      {
                        StrategyDB[strategy].map(f => {
                          let c = row.configs[f.key];
                          if (isPercent && row.configs[f.key + '_pct']) {
                            c = row.configs[f.key + '_pct'];
                          }
                          return (
                            <TableCell key={f.key}>
                              {c}
                            </TableCell>
                          )
                        })
                      }
                      <TableCell>{row.updated_at}</TableCell>
                      <TableCell>
                        <ButtonGroup variant="text" color="primary" >
                          <Button onClick={() => {this.saveConfig(row.id, 'test')}}>TEST</Button>
                          <Button onClick={() => {this.saveConfig(row.id, 'prod')}}>PROD</Button>
                          {
                            row.persist ?
                              <Button onClick={() => {this.saveConfig(row.id, 'unpersist')}}>DISC</Button>
                            :
                              <Button onClick={() => {this.saveConfig(row.id, 'persist')}}>KEEP</Button>
                          }
                          <Button onClick={() => {this.saveConfig(row.id, 'delete')}}>DEL</Button>
                        </ButtonGroup>
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
  optimizations: state.configs.optimization_results,
  strategy: state.configs.strategy,
})

export default compose(
  withStyles(useStyles),
  connect(mapStateToProps),
)(OptimizationResults);