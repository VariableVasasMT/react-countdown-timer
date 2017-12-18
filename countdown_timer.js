import React, { Component } from "react";
import PropTypes from "prop-types";

// Generic Countdown Timer UI component
//
// https://github.com/uken/react-countdown-timer
//
// props:
//   - initialTimeRemaining: Number
//       The time remaining for the countdown (in ms).
//
//   - interval: Number (optional -- default: 1000ms)
//       The time between timer ticks (in ms).
//
//   - formatFunc(timeRemaining): Function (optional)
//       A function that formats the timeRemaining.
//
//   - tickCallback(timeRemaining): Function (optional)
//       A function to call each tick.
//
//   - completeCallback(): Function (optional)
//       A function to call when the countdown completes.
//
class CountdownTimer extends Component {
  const displayName = 'CountdownTimer';

  static propTypes = {
    initialTimeRemaining: PropTypes.number.isRequired,
    interval: PropTypes.number,
    formatFunc: PropTypes.func,
    tickCallback: PropTypes.func,
    completeCallback: PropTypes.func
  };

  getDefaultProps = () => {
    return {
      interval: 1000,
      formatFunc: null,
      tickCallback: null,
      completeCallback: null
    };
  };

  getInitialState = () => {
    // Normally an anti-pattern to use this.props in getInitialState,
    // but these are all initializations (not an anti-pattern).
    return {
      timeRemaining: this.props.initialTimeRemaining,
      timeoutId: null,
      prevTime: null
    };
  };

  componentDidMount() {
    this.tick();
  };

  componentWillReceiveProps(newProps) {
    if (this.state.timeoutId) { clearTimeout(this.state.timeoutId); }
    this.setState({prevTime: null, timeRemaining: newProps.initialTimeRemaining});
  };

  componentDidUpdate() {
    if ((!this.state.prevTime) && this.state.timeRemaining > 0 && this.isMounted()) {
      this.tick();
    }
  };

  componentWillUnmount() {
    clearTimeout(this.state.timeoutId);
  };

  tick = () => {
    let currentTime = Date.now();
    let dt = this.state.prevTime ? (currentTime - this.state.prevTime) : 0;
    let interval = this.props.interval;

    // correct for small variations in actual timeout time
    let timeRemainingInInterval = (interval - (dt % interval));
    let timeout = timeRemainingInInterval;

    if (timeRemainingInInterval < (interval / 2.0)) {
      timeout += interval;
    }

    let timeRemaining = Math.max(this.state.timeRemaining - dt, 0);
    let countdownComplete = (this.state.prevTime && timeRemaining <= 0);

    if (this.isMounted()) {
      if (this.state.timeoutId) { clearTimeout(this.state.timeoutId); }
      this.setState({
        timeoutId: countdownComplete ? null : setTimeout(this.tick, timeout),
        prevTime: currentTime,
        timeRemaining: timeRemaining
      });
    }

    if (countdownComplete) {
      if (this.props.completeCallback) { this.props.completeCallback(); }
      return;
    }

    if (this.props.tickCallback) {
      this.props.tickCallback(timeRemaining);
    }
  };

  getFormattedTime = (milliseconds) => {
    if (this.props.formatFunc) {
      return this.props.formatFunc(milliseconds);
    }

    let totalSeconds = Math.round(milliseconds / 1000);

    let seconds = parseInt(totalSeconds % 60, 10);
    let minutes = parseInt(totalSeconds / 60, 10) % 60;
    let hours = parseInt(totalSeconds / 3600, 10);

    seconds = seconds < 10 ? '0' + seconds : seconds;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    hours = hours < 10 ? '0' + hours : hours;

    return hours + ':' + minutes + ':' + seconds;
  };

  render() {
    let timeRemaining = this.state.timeRemaining;

    return (
      <div className='timer'>
        {this.getFormattedTime(timeRemaining)}
      </div>
    );
  }
};

module.exports = CountdownTimer;
