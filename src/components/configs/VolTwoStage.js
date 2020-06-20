import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListSubheader from '@material-ui/core/ListSubheader';

import {
  Link,
} from "react-router-dom";

const useStyles = theme => ({

});


const FIELD_MAP = {
  ma_v_seconds: 'MA Vol seconds',
  c_diff_seconds: 'Price Diff seconds',
  ma_v: 'MA Vol Trigger',
  c_diff: 'Price Diff Trigger %',
  stop_trailing: 'Stop Trailing %',
  half_target: 'Half Target %',
}

class VolTwoStage extends React.Component {
  constructor(props) {
    super(props);
    const st = {};
    for(let key in FIELD_MAP) {
      st[key] = '';
    }
    this.state = st;
    this.sym = '';
    this.last_c = 0;
  }

  handleChange = (field, e) => {
    this.setState({
      [field]: e.target.value,
    });
  }

  componentDidMount() {
    const {registerModule, isTest} = this.props;
    const name = isTest ? 'VolTwoStageTest' : 'VolTwoStage';
    registerModule(name, this);
  }

  updateData = (data) => {
    this.sym = data.sym;
    this.last_c = data.last_c;
    const {isTest} = this.props;
    const k1 = isTest ? data.vol_two_stage_1_test : data.vol_two_stage_1;
    const k2 = isTest ? data.vol_two_stage_2_test : data.vol_two_stage_2;
    const k3 = isTest ? data.vol_two_stage_3_test : data.vol_two_stage_3;
    if (k1 && k2 && k3) {
      this.setState({
        ma_v_seconds: k1.vi || '',
        c_diff_seconds: k2.vi || '',
        c_diff: k1.vf || '',
        ma_v: k3.vi || '',
        stop_trailing: k2.vf || '',
        half_target: k3.vf || '',
      });
    } else {
      const st = {};
      for(let key in FIELD_MAP) {
        st[key] = '';
      }
      this.setState(st);
    }
  }

  onSave = () => {
    const {
      ma_v_seconds,
      c_diff_seconds,
      ma_v,
      c_diff,
      stop_trailing,
      half_target,
    } = this.state;
    const {isTest} = this.props;
    const k1 = isTest ? 'vol_two_stage_1_test' : 'vol_two_stage_1';
    const k2 = isTest ? 'vol_two_stage_2_test' : 'vol_two_stage_2';
    const k3 = isTest ? 'vol_two_stage_3_test' : 'vol_two_stage_3';
    const payload = {
      [k1]: {
        vi: ma_v_seconds,
        vf: c_diff,
      },
      [k2]: {
        vi: c_diff_seconds,
        vf: stop_trailing,
      },
      [k3]: {
        vi: ma_v,
        vf: half_target,
      }
    };
    const {onChangeConfig} = this.props;
    onChangeConfig(payload);
  }

  render() {
    const {classes, isTest} = this.props;
    const {c_diff_seconds, ma_v_seconds} = this.state;
    const title = `Vol 2 Stage Trailing${isTest ? ' Test' : ''}`;
    return (
      <Grid item xs={6} md={4} lg={4}>
        <Paper>
            <List subheader={<ListSubheader>{title}</ListSubheader>}>
            {
              Object.keys(FIELD_MAP).map(field => {
                let title = FIELD_MAP[field];
                if (title.substr(-1) === '%') {
                  title += ` $${(this.last_c * this.state[field] / 100).toFixed(3)}`;
                }
                return (
                  <ListItem key={field}>
                    <ListItemText>{title}</ListItemText>
                    <ListItemSecondaryAction>
                      <TextField
                        value={this.state[field]}
                        onChange={e => this.handleChange(field, e)}
                        inputProps={{
                          style: { textAlign: "right" }
                        }}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                )
              })
            }
            <ListItem>
              <ListItemText>
                <Button color="primary" onClick={this.onSave}>
                  Save
                </Button>
                <Link to={`/triggers?sym=${this.sym}&c_diff_t=${c_diff_seconds}&ma_v_t=${ma_v_seconds}`} >
                  <Button>
                    Triggers
                  </Button>
                </Link>
                {
                  isTest &&
                  <Button>
                    Run Test
                  </Button>
                }
              </ListItemText>
            </ListItem>
          </List>
        </Paper>
      </Grid>
    );
  }
}


export default compose(
  withStyles(useStyles),
)(VolTwoStage);