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
    this.state = {
      date: ''
    }
    //binding functions here
    //this.mergeContactsAndGroups = this.mergeContactsAndGroups.bind(this);
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
    this.props.handleCreateClick()
    this.props.handleFinish()


    // user inputs
    var meetingLength = e.target.meetingLength.value // in minutes
    var meetingTitle = e.target.title.value
    var timeMin = moment(this.props.date, "MM/DD/YYYY");

    var queryInfo = {
      timeMin: timeMin.toISOString(),
      timeMax: timeMin.add('1', 'days').toISOString() // add a day so we can query from midnight of current day to midnight of following day
    };

    // put selected contacts and selected contacts from groups into same array
    var allContacts = this.props.selectedContacts.slice();
    this.props.selectedGroups.forEach((group)=> {
      // console.log('group: ', group)
      group.contacts.forEach((contact) => {
        if (!this.checkExist(allContacts, contact)) {
          // console.log('Contact: ', allContacts)
          allContacts.push(contact);
        }
      })
    })


    //================
    //================ Need to wrap the below call in recursive check for success.
    //                  if response is 401, make call to reauth and then try again
    //                  needs counter to make sure no infinite loop
    //                  https://github.com/fiznool/passport-oauth2-refresh/issues/1

    // call freebusy method to get back busy times
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
