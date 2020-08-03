import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';
import NotificationsIcon from '@material-ui/icons/Notifications';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import EmailIcon from '@material-ui/icons/Email';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import {apiGetMessages, apiMarkRead} from '../../utils/ApiFetch';
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
        enqueueSnackbar(`Fetch Messages Error: ${resp.data.error}`, {variant: 'error'});
      }
    })
  }


  onClickIcon = (e) => {
    this.setState({dropDownOpen: true, anchorEl: e.currentTarget})
  }

  handleClose = () => {
    this.setState({dropDownOpen: false});
  }

  onClickReadAll = () => {
    const {enqueueSnackbar, messagesPage} = this.props;
    const payload = {
      message_id: messagesPage.barIds,
    }
    apiMarkRead(payload).then(resp => {
      if (resp.data.success) {
        enqueueSnackbar('Success')
        this.fetchMessage();
      } else {
        enqueueSnackbar(resp.data.error, {variant: 'error'})
      }
    })
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
              <Link key={row.id} to={row.url || "/messages"} onClick={this.handleClose}>
                <MenuItem >
                  <ListItemIcon>
                    {
                      row.variant_str === 'warning' ?
                      <ErrorOutlineIcon style={{color: "#ff9966"}}/>
                      : row.variant_str === 'success' ?
                      <CheckCircleOutlineIcon style={{color: "#339900"}}/>
                      : row.variant_str === 'error' ?
                      <CancelOutlinedIcon style={{color: "red"}}/>
                      : null
                    }
                  </ListItemIcon>
                  <ListItemText
                    primaryTypographyProps={row.is_read ? null : {style: {fontWeight: 'bold'}}}
                    primary={row.message}
                    secondary={row.created_at}
                  />
                </MenuItem>
              </Link>
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