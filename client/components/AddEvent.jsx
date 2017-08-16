import React from 'react';
import moment from 'moment';

import { SingleDatePicker } from 'react-dates';

import * as CalendarModel from '../models/calendar.js';
import events from './events';
import FreeTimeSlotsModal from './FreeTimeSlotsModal.jsx';
import findFreeTimes from '../models/findFreeTimes.js';

class AddEvent extends React.Component {
  constructor(props) {
    super(props);
    console.log(this.props)
    this.state = {
      date: ''
    }
  }

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
    e.preventDefault();

    var meetingLength = e.target.meetingLength.value
    var meetingTitle = e.target.title.value
    var timeMin = moment(e.target.title.value, "MM/DD/YYYY");

    var queryInfo = {
      timeMin: timeMin.toISOString(),
      timeMax: timeMin.add('1', 'days').toISOString()
    };

    var allContacts = this.props.selectedContacts.slice();
    this.props.selectedGroups.forEach((group)=> {
      group.contacts.forEach((contact) => {
        if (!this.checkExist(allContacts, contact)) {
          allContacts.push(contact);
        }
      })
    })

    CalendarModel.freeBusy(allContacts, this.props.user.user, queryInfo.timeMin, queryInfo.timeMax, (calendars) => {
      findFreeTimes.findAvailableSlots(meetingLength, calendars, (freeSlots) => {
        this.props.updateSlotsAndEventInfo(freeSlots, queryInfo.timeMin, meetingTitle, meetingLength)
      });
    })

  }

  render() {
    return (
      <div className="addevent">
        <form onSubmit={this.handleEventSubmit.bind(this)}>
          <input type="text" name="title" placeholder="Meeting Title"></input>
          <input type="text" name="meetingLength" placeholder="Meeting Length (min)"></input>
          <input type="text" name="date" placeholder="MM/DD/YYYY"></input>
          <button className="createEventButton">Create event</button>
        </form>
      </div>

    );
  }
}

export default AddEvent;
