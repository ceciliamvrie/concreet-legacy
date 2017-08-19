import React from 'react';
import moment from 'moment';
import { SingleDatePicker } from 'react-dates';
import AddEventModal from './AddEventModal.jsx';
import * as CalendarModel from '../models/calendar.js';
import events from './events';
import FreeTimeSlotsModal from './FreeTimeSlotsModal.jsx';
import findFreeTimes from '../models/findFreeTimes.js';

class AddEvent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      topCreateSelected: false,
      value: 30
    }
  }

  handleIt() {
    console.log('first')
    this.props.topCreateSelected()
    this.props.closeModal()

  }

  handleClick() {
    console.log('second')
    this.setState({
      topCreateSelected: !this.state.topCreateSelected
    })
  }
  // check if contact already exists to prevent duplicates
  checkExist(contacts, target) {
    let check = false;
    for (let contact of contacts) {
      if (contact._id === target._id) {
        check = true;
      }
    }
    return check;
  }

  handleEventSubmit(e) {

  }

  render() {
    return (
      <div className="addevent">
            <form onSubmit={this.handleEventSubmit.bind(this)}>
                <button className="createEventButton" onClick={this.handleIt.bind(this)}>Create Event</button>
            </form>
      </div>

    );
  }
}

export default AddEvent;
