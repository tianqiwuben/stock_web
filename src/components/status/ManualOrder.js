import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import Divider from '@material-ui/core/Divider';
import {apiPostOrder} from '../../utils/ApiFetch';
import { withSnackbar } from 'notistack';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import FormControl from '@material-ui/core/FormControl';

import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import {StrategyDB} from '../common/Constants';

const styles = theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 60,
  },
});


class ManualOrder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sym: '',
      sym_quota: '',
      strategy: 'manual',
      action_name: 'buy_long',
      action_type: 'market',
      price: '',
      replaceTransId: null,
      isNew: true,
    }
  }

  onPlaceOrder = () => {
    const {sym, sym_quota, strategy, action_name, action_type, price, isNew, replaceTransId} = this.state;
    const {env, enqueueSnackbar} = this.props;
    const payload = {
      env, sym, sym_quota, strategy, action_name, action_type, price, isNew, replaceTransId
    }
    if (!isNew) {
      if (!replaceTransId) {
        enqueueSnackbar('Transaction to replace must be selected', {variant: 'error'})
        return;
      }
    }
    apiPostOrder(payload).then(resp => {
      if (resp.data.success) {
        enqueueSnackbar('Order Placed', {variant: 'success'});
      } else {
        enqueueSnackbar(resp.data.error, {variant: 'error'})
      }
    })
  }

  handleChange = (field, e) => {
    this.setState({
      [field]: e.target.value,
    });
  }

  onSelectReplace = (e) => {
    const {workingOrders} = this.props;
    const replaceTransId = e.target.value;
    const trans = workingOrders.by_id[replaceTransId];
    if (trans) {
      this.setState({
        replaceTransId,
        sym: trans.sym,
        strategy: trans.strategy,
        action_name: trans.action_name,
        action_type: trans.action_type === 0 ? 'market' : 'limit',
        sym_quota: trans.sym_quota,
        price: trans.price,
      })
    } else {
      this.setState({
        replaceTransId,
      })
    }
  }

  switchNewReplace = () => {
    this.setState({isNew: !this.state.isNew})
  }

  render() {
    const {classes, env, workingOrders} = this.props;
    const {
      sym,
      strategy,
      action_name,
      action_type,
      sym_quota,
      price,
      isNew,
      replaceTransId,
    } = this.state;
    const woList = [];
    if(workingOrders && workingOrders.by_id) {
      for(let oid in workingOrders.by_id) {
        const trans = workingOrders.by_id[oid];
        woList.push(trans);
      }
    }
    return (
      <React.Fragment>
        <Divider />
        <ListItem>
          <ListItemText onClick={this.switchNewReplace}>
            {isNew ? 'Symbol' : 'Replace'}
          </ListItemText>
          <ListItemSecondaryAction>
            {
              isNew ?
              <TextField
                value={sym}
                onChange={e => this.handleChange('sym', e)}
                inputProps={{
                  style: { textAlign: "right" }
                }}
                style = {{width: 80}}
              />
              :
              <FormControl className={classes.formControl}>
                <Select
                  value={replaceTransId}
                  onChange={this.onSelectReplace}
                  autoWidth
                >
                  {
                    woList.map(trans => (
                      <MenuItem key={trans.id} value={trans.id}>{`${trans.sym} ${trans.action_name} ${trans.strategy} ${trans.sym_quota}`}</MenuItem>
                    ))
                  }
                </Select>
              </FormControl>
            }
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem>
          <ListItemText>
            Strategy
          </ListItemText>
          <ListItemSecondaryAction>
            <FormControl className={classes.formControl}>
              <Select
                value={strategy}
                onChange={e => this.handleChange('strategy', e)}
                autoWidth
              >
                {
                  Object.keys(StrategyDB).map(key => (
                    <MenuItem key={key} value={key}>{key}</MenuItem>
                  ))
                }
              </Select>
            </FormControl>
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem>
          <ListItemText>
            Action
          </ListItemText>
          <ListItemSecondaryAction>
            <FormControl className={classes.formControl}>
              <Select
                value={action_name}
                onChange={e => this.handleChange('action_name', e)}
                autoWidth
              >
                <MenuItem value={'buy_long'}>buy_long</MenuItem>
                <MenuItem value={'sell_long'}>sell_long</MenuItem>
                <MenuItem value={'buy_short'}>buy_short</MenuItem>
                <MenuItem value={'sell_short'}>sell_short</MenuItem>
              </Select>
            </FormControl>
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem>
          <ListItemText>
            Type
          </ListItemText>
          <ListItemSecondaryAction>
            <FormControl className={classes.formControl}>
              <Select
                value={action_type}
                onChange={e => this.handleChange('action_type', e)}
                autoWidth
              >
                <MenuItem value={'market'}>market</MenuItem>
                <MenuItem value={'limit'}>limit</MenuItem>
              </Select>
            </FormControl>
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem>
          <ListItemText>
            Sym Quota
          </ListItemText>
          <ListItemSecondaryAction>
            <TextField
              value={sym_quota}
              onChange={e => this.handleChange('sym_quota', e)}
              inputProps={{
                style: { textAlign: "right" }
              }}
              style = {{width: 80}}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem>
          <ListItemText>
            Price
          </ListItemText>
          <ListItemSecondaryAction>
            <TextField
              value={price}
              onChange={e => this.handleChange('price', e)}
              inputProps={{
                style: { textAlign: "right" }
              }}
              style = {{width: 80}}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem>
          <ListItemText>
            <Button onClick={this.onPlaceOrder}>Place Order</Button>
          </ListItemText>
          <ListItemSecondaryAction>{env}</ListItemSecondaryAction>
        </ListItem>
        <Divider />
      </React.Fragment>
    );
  }
}

export default compose(
  withStyles(styles),
  withSnackbar,
)(ManualOrder);