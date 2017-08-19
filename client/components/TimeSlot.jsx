import React from 'react';
import moment from 'moment';
import * as CalendarModel from '../models/calendar.js'

class TimeSlot extends React.Component {
	constructor(props) {
		super(props);
	}

	// check if contacts already exist to prevent duplicates
	checkExist(contacts, target) {
	  let check = false;
	  for (let contact of contacts) {
	    if (contact._id === target._id) {
	      check = true;
	    }
	  }
	  return check;
	}

	handleClick() {
		// put selected contacts and selected contacts from groups into same array
		var allContacts = [];

		if (this.props.beingEdited) {
			allContacts = this.props.editedContacts
		} else {
			allContacts = this.props.selectedContacts.slice();
			this.props.selectedGroups.forEach((group)=> {
			  group.contacts.forEach((contact) => {
			    if (!this.checkExist(allContacts, contact)) {
			      // console.log('Contact: ', allContacts)
			      allContacts.push(contact);
			    }
			  })
			})
		}

		// get the selected date in ISO format without any time aspect
		var selectedDate = this.props.selectedDate.split('T')[0]

		// convert the unformatted time into a moment object
		var momentTime = moment(this.props.slotTime.unformatted.split(':').join(''), "HHmmss", true).format('HH:mm:ss')

		// convert moment object into an ISO string and pluck only the time aspect of it, without the date
		var isoTime = moment(momentTime, 'HH:mm:ss').toISOString().split('T')[1]

		// put together the selectedDate with the selectedTime
		var selectedDateTime = (selectedDate + 'T' + isoTime);

		// end time is selectedTime plus meetingLength
		var endTime = moment(selectedDateTime).add(this.props.meetingLength, 'minutes').toISOString();

		this.props.getEventDateTime(selectedDateTime);

		var eventId = this.props.eventId

		// call add event to create google calendar event for all users
		if (this.props.beingEdited) {
			console.log('$$$$$$$$$$$$$$$$')
			var user = this.props.user.user
			var title = this.props.eventTitle
			var location = this.props.location
			this.props.readyToUpdate(true, [allContacts, user, title, selectedDateTime, endTime, location, eventId])
		} else {
			CalendarModel.addEvent(allContacts, this.props.user.user, this.props.eventTitle, selectedDateTime, endTime, this.props.location, (data) => {
				this.props.renderEventsToCalendar();
		    this.props.closeModal()
			})
	  }
	}

	render() {
		return (
			<div className="slotButtonDiv">
			  <button className="slotButton" onClick={this.handleClick.bind(this)}>{this.props.slotTime.formatted} - {this.props.slotTime.end}</button>
			</div>
		)
	}

}

export default TimeSlot;
