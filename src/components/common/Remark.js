import React from 'react';
import compose from 'recompose/compose';
import TextField from '@material-ui/core/TextField';
import {connect} from 'react-redux';
import { withSnackbar } from 'notistack';

import {
  updateRemark,
} from '../../redux/remarkActions';

import {
  apiRemarkCreate,
} from '../../utils/ApiFetch';

class Remark extends React.Component {
  onChangeRemark = (e) => {
    const {sym, dispatchUpdateRemark, remarkKey} = this.props;
    dispatchUpdateRemark(sym, remarkKey, {content: e.target.value})
  }

  onFinishRemark = () => {
    const {sym, dispatchUpdateRemark, remarkKey, enqueueSnackbar} = this.props;
    const remarkContent = this.getRemarkContent();
    apiRemarkCreate({sym, key: remarkKey, content: remarkContent}).then(resp => {
      if (resp.data.success) {
        dispatchUpdateRemark(sym, remarkKey, resp.data.payload);
      } else {
        enqueueSnackbar(`UpdateRemark Error: ${resp.data.error}`, {variant: 'error'});
      }
    })
  }

  getRemarkContent = () => {
    const {remarks, remarkKey} = this.props;
    let remarkContent = '';
    if (remarks && remarks[remarkKey]) {
      remarkContent = remarks[remarkKey].content;
    }
    return remarkContent;
  }

  render() {
    const remarkContent = this.getRemarkContent();
    return (
      <TextField
        fullWidth
        size="small"
        label="Remarks"
        multiline
        variant="outlined"
        value={remarkContent}
        onChange={this.onChangeRemark}
        onBlur={this.onFinishRemark}
      />
    )
  }

}


const mapStateToProps = (state, props) => ({
  remarks: state.remarks[props.sym],
})


export default compose(
  connect(mapStateToProps, {
    dispatchUpdateRemark: updateRemark,
  }),
  withSnackbar,
)(Remark);