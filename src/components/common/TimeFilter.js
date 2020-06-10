import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';

const useStyles = theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 180,
  },
});

const timeFields = {
  c1: 1,
  c2: 2,
  c3: 3,
  p1: 4,
  p2: 5,
}

class Filters extends React.Component {

  render() {
    const {
      handleChange,
    } = this.props;
    const {classes} = this.props;
    return (
      <React.Fragment>
        {
          Object.keys(timeFields).map(field =>
            <React.Fragment key={field}>
              <FormControl className={classes.formControl}>
                <TextField
                  label={`${timeFields[field]}m min(%)`}
                  value={this.props[`${field}_min`]}
                  onChange={e => handleChange(`${field}_min`, e)}
                />
              </FormControl>
              <FormControl className={classes.formControl}>
                <TextField
                  label={`${timeFields[field]}m max(%)`}
                  value={this.props[`${field}_max`]}
                  onChange={e => handleChange(`${field}_max`, e)}
                />
              </FormControl>
            </React.Fragment>
          )
        }
      </React.Fragment>
    );
  }
}


export default compose(
  withStyles(useStyles),
)(Filters);