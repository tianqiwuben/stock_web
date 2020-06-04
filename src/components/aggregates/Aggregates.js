import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import {apiBars} from '../../utils/ApiFetch';

const useStyles = theme => ({
});

class Aggregates extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
    }
  }

  componentDidMount() {
    apiBars({sym: 'SPY', frame: 'min1'}).then(resp => {
      if (resp.data.payload.bars && resp.data.payload.bars.length > 0) {
        this.setState({data: resp.data.payload.bars});
      }
    })
  }

  render() {
    const {data} = this.state;
    return (
      <React.Fragment>
        
      </React.Fragment>
    );
  }
}


export default compose(
  withStyles(useStyles),
)(Aggregates);