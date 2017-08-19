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

  }

  render() {
    return (
      <div className="addevent">
            <form onSubmit={this.handleEventSubmit.bind(this)}>
              {/* <div className="containe">
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
              </div> */}
                <button className="createEventButton" onClick={this.handleIt.bind(this)}>Create Event</button>
            </form>
      </div>

    );
  }
}

export default AddEvent;
