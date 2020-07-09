import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import {connect} from 'react-redux';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TablePagination from '@material-ui/core/TablePagination';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper from '@material-ui/core/Paper';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import DoneIcon from '@material-ui/icons/Done';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';


import {apiGetMessages, apiMarkRead, apiDeleteMessage} from '../../utils/ApiFetch';
import { withSnackbar } from 'notistack';
import {updateMessagesPage, saveMessages, updateMessagesPageContent} from '../../redux/messagesActions';

import {
  Link,
} from "react-router-dom";

const styles = theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  row: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
});

const COLOR = {
  default: 'inherit',
  error: 'red',
  warning: '#ff9966',
  success: '#339900',
}

class Messages extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      detailsOpen: false,
      details: '',
      markAllDialog: false,
    }
  }

  componentDidMount() {
    this.onFetch();
  }

  onFetch = (newPage = null) => {
    if (typeof newPage == Number && newPage <= 0) {
      return;
    }
    const {
      dispatchSaveMessages,
      enqueueSnackbar, 
      dispatchUpdateMessagesPage,
      messagesPage,
    } = this.props;
    const {
      page,
      variant,
      unread_status,
    } = messagesPage;
    const fetchPage = newPage || page;
    apiGetMessages({page: fetchPage, variant, unread_status}).then(resp => {
      if (resp.data.success) {
        dispatchSaveMessages(resp.data.payload.records);
        dispatchUpdateMessagesPage(resp.data.payload);
      } else {
        enqueueSnackbar(`Fetch Messages Error: ${resp.data.error}`, {variant: 'error'});
      }
    })
  }

  markRead = (payload) => {
    const {enqueueSnackbar} = this.props;
    apiMarkRead(payload).then(resp => {
      if (resp.data.success) {
        enqueueSnackbar('Success')
        this.onFetch();
      } else {
        enqueueSnackbar(resp.data.error, {variant: 'error'})
      }
    })
  }

  onClickPayload = (id) => {
    const {messages} = this.props;
    this.setState({
      detailsOpen: true,
      details: messages[id].payload,
    })
  }

  closeDetail = () => {
    this.setState({
      detailsOpen: false,
    });
  }

  handleChange = (field, e) => {
    const {dispatchUpdateMessagesPageContent} = this.props;
    dispatchUpdateMessagesPageContent({[field]: e.target.value});
  }


  handleChangePage = (e, p) => {
    this.onFetch(p + 1);
  }

  markPageRead = () => {
    const {messagesPage} = this.props;
    this.markRead({message_id: messagesPage.ids})
  }

  markAllRead = () => {
    this.setState({markAllDialog: true});
  }

  closeMarkAllDialog = () => {
    this.setState({markAllDialog: false});
  }

  confirmMarkAll = () => {
    this.markRead({mark_all: true})
    this.closeMarkAllDialog();
  }

  onDeleteMessage = (id) => {
    const {enqueueSnackbar} = this.props;
    apiDeleteMessage(id).then(resp => {
      if (resp.data.success) {
        enqueueSnackbar('Success')
        this.onFetch();
      } else {
        enqueueSnackbar(resp.data.error, {variant: 'error'})
      }
    })
  }

  render() {
    const {classes, messages, messagesPage} = this.props;
    const {
      ids,
      page,
      total_entries,
      variant,
      unread_status,
      total_unread,
    } = messagesPage;
    const {detailsOpen, details, markAllDialog} = this.state;
    const data = ids.map((id) => messages[id]);
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={12} lg={12}>
          <Paper className={classes.row}>
              <FormControl className={classes.formControl}>
                <InputLabel>Variant</InputLabel>
                <Select
                  value={variant}
                  onChange={e => this.handleChange('variant', e)}
                  autoWidth
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="error">Error</MenuItem>
                  <MenuItem value="Warning">Warning</MenuItem>
                  <MenuItem value="success">Success</MenuItem>
                  <MenuItem value="default">Default</MenuItem>
                </Select>
              </FormControl>
              <FormControl className={classes.formControl}>
                <InputLabel>Read Status</InputLabel>
                <Select
                  value={unread_status}
                  onChange={e => this.handleChange('unread_status', e)}
                  autoWidth
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="read_only">Read Only</MenuItem>
                  <MenuItem value="unread_only">Unread Only</MenuItem>
                </Select>
              </FormControl>
              <Button variant="contained" color="primary" onClick={() => this.onFetch(1)}>
                Fetch
              </Button>
              <Button variant="contained" onClick={this.markPageRead}>
                Mark Page as Read
              </Button>
              <Button variant="contained" onClick={this.markAllRead}>
                {`Mark All ${total_unread} as Read`}
              </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={12} lg={12}>
          <TableContainer component={Paper}>
            <Table className={classes.table} size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Variant</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>Payload</TableCell>
                  <TableCell>URL</TableCell>
                  <TableCell>ReadAt<br/>CreatedAt</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <span style={{color: COLOR[row.variant_str]}}>
                        {row.variant_str}
                      </span>
                    </TableCell>
                    <TableCell>
                      {
                        row.is_read ?
                        row.message
                        :
                        <strong>{row.message}</strong>
                      }
                    </TableCell>
                    <TableCell onClick={() => {this.onClickPayload(row.id)}}>
                      {row.payload && row.payload.substring(0, 20)}
                    </TableCell>
                    <TableCell>
                      {
                        row.url && 
                        ( row.url.substring(0,4) === 'http' ?
                          <a href={row.url} target="_blank" rel="noopener noreferrer">
                            {row.url && row.url.substring(0, 20)}
                          </a>
                          :
                          <Link to={row.url}>
                            {row.url && row.url.substring(0, 20)}
                          </Link>
                        )
                      }
                    </TableCell>
                    <TableCell>{row.read_at}<br/>{row.created_at}</TableCell>
                    <TableCell>
                      {
                        !row.is_read &&
                        <IconButton onClick={() => {this.markRead({message_id: row.id})}}><DoneIcon /></IconButton>
                      }
                      <IconButton onClick={() => this.onDeleteMessage(row.id)}><DeleteOutlineIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[25]}
              count={total_entries}
              rowsPerPage={25}
              page={page - 1}
              onChangePage={this.handleChangePage}
            />
          </TableContainer>
          <Dialog
            open={detailsOpen}
            onClose={this.closeDetail}
            fullWidth
            maxWidth="lg"
          >
            <DialogContent>
              <TextField
                multiline
                value={details}
                fullWidth
              />
            </DialogContent>
          </Dialog>
          <Dialog
            open={markAllDialog}
            onClose={this.closeMarkAllDialog}
          >
            <DialogTitle>Are you sure to unmark all messages?</DialogTitle>
            <DialogActions>
              <Button onClick={this.closeMarkAllDialog} color="primary">
                Cancel
              </Button>
              <Button onClick={this.confirmMarkAll} color="primary" autoFocus>
                Mark All
              </Button>
            </DialogActions>
          </Dialog>
        </Grid>
      </Grid>
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
    dispatchUpdateMessagesPageContent: updateMessagesPageContent,
  }),
  withSnackbar
)(Messages);