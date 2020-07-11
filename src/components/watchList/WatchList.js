import React from 'react';
import Grid from '@material-ui/core/Grid';
import StreamList from './StreamList';

class WatchList extends React.Component {
  render() {
    return (
      <Grid container spacing={3}>
        <StreamList list_name="streaming_watch_list"/>
        <StreamList list_name="notifier_watch_list"/>
      </Grid>
    );
  }
}


export default WatchList;