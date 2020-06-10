import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';

import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';

const useStyles = theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 180,
  },
});

class Filters extends React.Component {

  render() {
    const {
      dayFrame,
      sym,
      price_d,
      volumn_d,
      hourFrame,
      isShort,
      handleChange,
    } = this.props;
    const {classes} = this.props;
    return (
      <React.Fragment>
        <FormControl className={classes.formControl}>
          <TextField
            label="Symbol"
            value={sym}
            onChange={e => handleChange('sym', e)}
          />
        </FormControl>
        <FormControl className={classes.formControl}>
          <InputLabel>Day Frame</InputLabel>
          <Select
            value={dayFrame}
            onChange={e => handleChange('dayFrame', e)}
          >
            <MenuItem value={'d1901_2002'}>2019/01-2020/02</MenuItem>
            <MenuItem value={'d2002_2003'}>2020/02-2020/03</MenuItem>
            <MenuItem value={'d2003_2012'}>2020/03-2020/12</MenuItem>
            <MenuItem value={'d1901_2012'}>2019/01-2020/12</MenuItem>
          </Select>
        </FormControl>
        <FormControl className={classes.formControl}>
          <TextField
            label="Price D"
            value={price_d}
            onChange={e => handleChange('price_d', e)}
          />
        </FormControl>
        <FormControl className={classes.formControl}>
          <TextField
            label="Vol D"
            value={volumn_d}
            onChange={e => handleChange('volumn_d', e)}
          />
        </FormControl>
        <FormControl className={classes.formControl}>
          <InputLabel>Hour Frame</InputLabel>
          <Select
            value={hourFrame}
            onChange={e => handleChange('hourFrame', e)}
          >
            <MenuItem value={'no_ext'}>No Ext</MenuItem>
            <MenuItem value={'ext_only'}>Ext only</MenuItem>
            <MenuItem value={'all'}>All</MenuItem>
          </Select>
        </FormControl>
        <FormControl className={classes.formControl}>
          <InputLabel>Is Short</InputLabel>
          <Select
            value={isShort}
            onChange={e => handleChange('isShort', e)}
          >
            <MenuItem value={'long_only'}>Long Only</MenuItem>
            <MenuItem value={'short_only'}>Short Only</MenuItem>
            <MenuItem value={'all'}>All</MenuItem>
          </Select>
        </FormControl>

      </React.Fragment>
    );
  }
}


export default compose(
  withStyles(useStyles),
)(Filters);