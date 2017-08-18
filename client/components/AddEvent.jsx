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
    this.props.closeModal()

  }

  handleClick() {
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
    e.preventDefault();
    console.log(this.props)
    var meetingLength = JSON.parse(e.target.meetingLength.value)
    var meetingTitle = e.target.title.value
    let location = e.target.location.value;
    var timeMin = moment(e.target.date.value, "MM/DD/YYYY");
    var queryInfo = {
      timeMin: timeMin.toISOString(),
      timeMax: timeMin.add('1', 'days').toISOString()
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

    CalendarModel.freeBusy(allContacts, this.props.user.user, queryInfo.timeMin, queryInfo.timeMax, (calendars) => {
      console.log(queryInfo.timeMin, queryInfo.timeMax)
      // receives back calendars array with each element being an object with a email address as its only property
      // each property has a value that is an object with a busy property
      // value of busy property is an array of objects that include start and end property of busy times
      findFreeTimes.findAvailableSlots(meetingLength, calendars, (freeSlots) => {
        // passsing back the available slots as well as the selected date in ISO format (queryInfo.timeMin)
        this.props.updateSlotsAndEventInfo(freeSlots, queryInfo.timeMin, meetingTitle, meetingLength, location)
      });
    })
    this.setState({
      topCreateSelected: !this.state.topCreateSelected
    })
  }

  render() {
    return (
      <div className="addevent">
        {
          this.state.topCreateSelected ?
            <form onSubmit={this.handleEventSubmit.bind(this)}>
              <div className="containe">
                <input type="text" name="title" placeholder="Meeting Title"></input>
                <input type="text" name="location" placeholder="Location"></input>
              </div>
              <div className="containe">
                <input id="dd" type="text" name="date" placeholder="MM/DD/YYYY"></input>
              </div>
                <p>
                  <span className="spandaman">Time Length:
                  <span className="time"> {Math.floor(this.state.value / 60)} Hours   {this.state.value % 60} Mins</span>
                  </span>
                </p>
              <div className="containe">
                <input type="range" name="meetingLength" min="30" max="600" value={this.state.value} onChange={(e => this.setState({value: e.target.value}))}></input>
              </div>
                <button className="createEventButton" onClick={this.handleIt.bind(this)}>Create It!</button>
            </form> : <button className="createEventButton" onClick={this.handleClick.bind(this)}>Create event</button>
        }
      </div>

    );
  }
}

export default AddEvent;
