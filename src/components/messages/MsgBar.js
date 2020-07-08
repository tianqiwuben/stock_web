import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';
import NotificationsIcon from '@material-ui/icons/Notifications';
import ErrorIcon from '@material-ui/icons/Error';
import EmailIcon from '@material-ui/icons/Email';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import {apiGetMessages} from '../../utils/ApiFetch';
import { withSnackbar } from 'notistack';
import {connect} from 'react-redux';

import {saveMessages, updateMessagesPage}  from '../../redux/messagesActions';

import {
  Link,
} from "react-router-dom";

const styles = theme => ({
});


class NsgBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dropDownOpen: false,
    }
  }

  componentDidMount() {
    this.fetchMessage();
  }

  fetchMessage = () => {
    apiGetMessages({}).then(resp => {
      const {dispatchSaveMessages, enqueueSnackbar, dispatchUpdateMessagesPage} = this.props;
      if (resp.data.success) {
        dispatchSaveMessages(resp.data.payload.records);
        dispatchUpdateMessagesPage(resp.data.payload);
      } else {
        enqueueSnackbar(`Fetch Messages Error: ${resp.data.error}`);
      }
    })
  }

  onClickMessage = (id) => {

  }

  onClickIcon = (e) => {
    this.setState({dropDownOpen: true, anchorEl: e.currentTarget})
  }

  handleClose = () => {
    this.setState({dropDownOpen: false});
  }

  onClickReadAll = () => {
    this.handleClose();
  }

  render() {
    const {
      messages,
      messagesPage,
    } = this.props;
    const {
      dropDownOpen,
      anchorEl,
    } = this.state;
    const data = messagesPage.barIds.map(id => messages[id]);
    return (
      <div>
        <IconButton color="inherit" onClick={this.onClickIcon}>
          <Badge badgeContent={messagesPage.total_unread} color="secondary">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={dropDownOpen}
          onClose={this.handleClose}
        >
          {
            data.map(row => (
              <MenuItem key={row.id} onClick={() => this.onClickMessage(row.id)}>
                <ListItemText primary={row.message} secondary={row.created_at} />
              </MenuItem>
            ))
          }
          <MenuItem onClick={this.onClickReadAll}>
            <ListItemIcon><DoneAllIcon/></ListItemIcon>
            <ListItemText primary="Mark all as read" />
          </MenuItem>
          <Link to="/messages" onClick={this.handleClose}>
            <MenuItem>
              <ListItemIcon><EmailIcon /></ListItemIcon>
              <ListItemText primary="All messages" />
            </MenuItem>
          </Link>
        </Menu>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  messages: state.messages,
  messagesPage: state.messagesPage,
})


export default compose(
  withStyles(styles),
  connect(mapStateToProps, {
    dispatchSaveMessages: saveMessages,
    dispatchUpdateMessagesPage: updateMessagesPage,
  }),
  withSnackbar,
)(NsgBar);