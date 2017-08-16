import React from 'react';
import moment from 'moment';

import * as CalendarModel from '../models/calendar.js';
import events from './events';
import EditEvent from './EditEvent.jsx';
import findFreeTimes from '../models/findFreeTimes.js';

class EditEventModal extends React.Component {
  constructor(props) {
    super(props);
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
    e.preventDefault();

    console.log('event is', e.target.meetingLength.value, e.target.title.value)

    var meetingLength = e.target.meetingLength.value
    var meetingTitle = e.target.title.value
    var timeMin = moment(this.props.date, "MM/DD/YYYY");

    var queryInfo = {
      timeMin: timeMin.toISOString(),
      timeMax: timeMin.add('1', 'days').toISOString()
    };

    // put selected contacts and selected contacts from groups into same array
    var allContacts = this.props.selectedContacts.slice();
    this.props.selectedGroups.forEach((group)=> {
      console.log('group: ', group)
      group.contacts.forEach((contact) => {
        if (!this.checkExist(allContacts, contact)) {
          console.log('Contact: ', allContacts)
          allContacts.push(contact);
        }
      })
    })

    CalendarModel.freeBusy(allContacts, this.props.user.user, queryInfo.timeMin, queryInfo.timeMax, (calendars) => {
      // receives back calendars array with each element being an object with a email address as its only property
      // each property has a value that is an object with a busy property
      // value of busy property is an array of objects that include start and end property of busy times
      findFreeTimes.findAvailableSlots(meetingLength, calendars, (freeSlots) => {
        // passsing back the available slots as well as the selected date in ISO format (queryInfo.timeMin)
        this.props.updateSlotsAndEventInfo(freeSlots, queryInfo.timeMin, meetingTitle, meetingLength)
      });
    })

  }

  cancel() {
    this.s
  }

  render() {
    return (
      <div className="addevent">
        <form onSubmit={this.handleEventSubmit.bind(this)}>
          <input type="text" name="title" placeholder={this.props.title}></input>
          <input type="text" name="meetingLength" placeholder="Meeting Length (min)"></input>
          <button className="createEventButton">Update event</button>
          <button className="createEventButton" style={{margin: '20px'}}onClick={this.props.toggleEdit}>Cancel</button>
        </form>
      </div>

    );
  }
}

export default EditEventModal;
