export default {
  two_stage_trailing: {
    name: 'Two Stage Trailing',
    fields: [
      {
        key: 'aggs_seconds',
        name: 'Aggregation seconds',
        optimization_type: 'split',
        optimization_name: 'split(,)',
        optimization_default: '5,10,30',
      },
      {
        key: 'ma_v_threshould',
        name: 'MA Vol Trigger',
        optimization_type: 'range',
        optimization_name: 'Distribution Top %',
        optimization_default: {min: '99', max: '99.9', step: '0.1'},
      },
      {
        key: 'c_diff_threshould',
        name: 'Price Diff Trigger %',
        optimization_type: 'range',
        optimization_name: 'Distribution Top %',
        optimization_default: {min: '99', max: '99.9', step: '0.1'},
      },
      {
        key: 'stop_trailing_diff',
        name: 'Stop Trailing %',
        optimization_type: 'range',
        optimization_name: 'Relative to c_diff_threshould',
        optimization_default: {min: '0.2', max: '2', step: '0.1'},
      },
      {
        key: 'half_target',
        name: 'Half Target %',
        optimization_type: 'range',
        optimization_name: 'Relatively to c_diff_threshould',
        optimization_default: {min: '0.2', max: '2', step: '0.1'},
      },
    ],
  },
  one_stage_long_limit: {
    name: 'One stage sell when target/max time reached (long only)',
    fields: [
      {
        key: 'aggs_seconds',
        name: 'Aggregation seconds',
        optimization_type: 'split',
        optimization_name: 'split(,)',
        optimization_default: '5,10,30',
      },
      {
        key: 'ma_v_threshould',
        name: 'MA Vol Trigger',
        optimization_type: 'range',
        optimization_name: 'Distribution Top %',
        optimization_default: {min: '99', max: '99.9', step: '0.1'},
      },
      {
        key: 'c_diff_threshould',
        name: 'Price Diff Trigger %',
        optimization_type: 'range',
        optimization_name: 'Distribution Top %',
        optimization_default: {min: '99', max: '99.9', step: '0.1'},
      },
      {
        key: 'stop_diff',
        name: 'Stop %',
        optimization_type: 'range',
        optimization_name: 'Relative to c_diff_threshould',
        optimization_default: {min: '0.25', max: '5', step: '0.25'},
      },
      {
        key: 'target',
        name: 'Target %',
        optimization_type: 'range',
        optimization_name: 'Relatively to c_diff_threshould',
        optimization_default: {min: '0.25', max: '5', step: '0.25'},
      },
      {
        key: 'time_limit',
        name: 'Max hold seconds',
        optimization_type: 'split',
        optimization_name: 'split(,)',
        optimization_default: '600',
      },
    ]
  },
  one_stage_long_trailing: {
    name: 'One stage trailing (long only)',
    fields: [
      {
        key: 'aggs_seconds',
        name: 'Aggregation seconds',
        optimization_type: 'split',
        optimization_name: 'split(,)',
        optimization_default: '5,10,30',
      },
      {
        key: 'ma_v_threshould',
        name: 'MA Vol Trigger',
        optimization_type: 'range',
        optimization_name: 'Distribution Top %',
        optimization_default: {min: '97', max: '99.9', step: '0.2'},
      },
      {
        key: 'c_diff_threshould',
        name: 'Price Diff Trigger %',
        optimization_type: 'range',
        optimization_name: 'Distribution Top %',
        optimization_default: {min: '97', max: '99.9', step: '0.2'},
      },
      {
        key: 'stop_diff',
        name: 'Stop %',
        optimization_type: 'range',
        optimization_name: 'Relative to c_diff_threshould',
        optimization_default: {min: '0.1', max: '2', step: '0.2'},
      },
    ]
  }
}