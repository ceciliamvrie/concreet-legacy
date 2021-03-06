
import React from 'react';
import BigCalendar from 'react-big-calendar';
import moment from 'moment';
import * as CalendarModel from '../models/calendar.js';
import FreeTimeSlotsModal from './FreeTimeSlotsModal.jsx';
import CreateDateModal from './CreateDateModal.jsx';
import ViewEventModal from './ViewEventModal.jsx';
import findFreeTimes from '../models/findFreeTimes.js';
import AddEvent from './AddEvent.jsx';

let allViews = Object.keys(BigCalendar.views).map(k => BigCalendar.views[k])

BigCalendar.setLocalizer(
  BigCalendar.momentLocalizer(moment)
);

class BigCalBasic extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      eventPicked: {},
      events: [],
      availableSlots: [],
      displayModal: false,
      displayViewModal: false,
      displayPickDateModal: false,
      selectedDate: undefined,
      eventDateTime: undefined,
      eventTitle: '',
      meetingLength: 0,
      location: '',
      eventId: '',
      editedContacts: [],
      beingEdited: false,
      eventTime: '',
      eventEndTime: '',
      readyToUpdateBool: false,
      up: []

    }

    this.renderEventsToCalendar();
  }

  renderEventsToCalendar() {
    var calendarList = [];
      CalendarModel.getCalendarEvents(this.props.user.user, calendarList, (eventsList) => {
        CalendarModel.processEvents(eventsList, (processedEvents) => {
          this.setState({
            events: processedEvents,
          })
        })
      })
  }

  updateSlotsAndEventInfo(freeSlots, eventDate, eventTitle, eventLength, location, eventId) {
    this.setState({
      availableSlots: freeSlots,
      displayModal: true,
      selectedDate: eventDate,
      eventTitle: eventTitle,
      meetingLength: eventLength,
      location: location,
      eventId: eventId
    })
  }

  // get the selected meeting time in ISO format
  getEventDateTime(isoDateTime) {
    this.setState({
      eventDateTime: isoDateTime
    })
  }

  closeDisplayModal() {
    if (this.state.topCreateSelected) {
      this.setState({
        displayModal: !this.state.displayModal,
        topCreateSelected: !this.state.topCreateSelected
      })
    }
    this.setState({
      displayModal: !this.state.displayModal,
    })
  }

  closeModal() {
    if (this.state.topCreateSelected) {
      this.setState({
        topCreateSelected: !this.state.topCreateSelected
      });
    } else {
      this.setState({
        displayPickDateModal: !this.state.displayPickDateModal
      });
    }
  }

  displayPickDateModal() {
    if (this.state.topCreateSelected) {
      this.setState({
        displayPickDateModal: !this.state.displayPickDateModal,
        displayModal: false
      })
    } else {
      this.setState({
        displayModal: false,
      })
    }
  }

  closeViewModal() {
    this.setState({
      displayViewModal: !this.state.displayViewModal
    })
  }

  updateEditedContacts(editedContacts, bool) {
    this.setState({
      editedContacts: editedContacts,
    })
  }

  readyToUpdate(bool, data) {
    this.setState({
      readyToUpdateBool: bool,
      up: data,
      displayModal: false
    })
  }

  editingMode(bool) {
    console.log('UPDATE CONTACTS EDITED CALLED', this.state.beingEdited)
    this.setState({
      beingEdited: bool,
      displayModal: false
    }, () => {
      console.log('UPDATE AFTER SET STATE IN BIG CAL', this.state.beingEdited)
    })
  }

  changeEventColor(event) {
    var style = { backgroundColor: '#8dc150' };

    if (event.organizer.email !== this.props.user.user.emailAddress) {
      return { style: style };
    } else {
      return { style : {} }
    }
  }

  render(){
    return (
      <div className="calendar">
        <AddEvent
          closeDisplayModal={this.closeDisplayModal.bind(this)}
          closeModal={this.closeModal.bind(this)}
          user={this.props.user}
          updateSlotsAndEventInfo={this.updateSlotsAndEventInfo.bind(this)}
          selectedContacts={this.props.selectedContacts}
          selectedGroups={this.props.selectedGroups}
        />

        <br/>
        <BigCalendar
          selectable
          {...this.props}
          popup
          events={this.state.events}
          views={allViews}
          eventPropGetter={this.changeEventColor.bind(this)}
          titleAccessor='summary'
          defaultDate={new Date()}
          onSelectSlot={(slotInfo) => {
            this.setState({displayPickDateModal: !this.state.displayPickDateModal, selectedDate: slotInfo.start.toLocaleString().split(',')[0]})
            }
          }
          onSelectEvent={event => {
            var startTime = event.start.toString().split(' ').slice(4, 5).join(' ')
            var newStartTime = startTime.split('')
            var startHour = newStartTime.splice(0, 2).join('')
            newStartTime = newStartTime.slice(0, 3)

            var endTime = event.end.toString().split(' ').slice(4, 5).join(' ')
            var newEndTime = endTime.split('')
            var endHour = newEndTime.splice(0, 2).join('')
            newEndTime = newEndTime.slice(0, 3)


            var startFinal = ''
            var endFinal = ''
            if (Number(startHour) > 12) {
              var t1 = Number(startHour) - 12
              startFinal = t1 + newStartTime.join('') + 'PM'
            } else {
              startFinal = startHour + newStartTime.join('') + 'AM'
            }
            if (Number(endHour) > 12) {
              var t2 = Number(endHour) - 12
              endFinal = t2 + newEndTime.join('') + 'PM'
            } else {
              endFinal = endHour + newEndTime.join('') + 'AM'
            }

            this.setState({
              displayViewModal: !this.state.displayViewModal,
              eventPicked: event,
              eventTime: startFinal,
              eventEndTime: endFinal
            }, () => {
              console.log('eventtime is ', this.state.eventTime)
            });
          }}
        />

        {this.state.displayPickDateModal ? <CreateDateModal
        topCreateSelected={this.state.topCreateSelected}
        closeModal={this.closeModal.bind(this)}
        updateSlotsAndEventInfo={this.updateSlotsAndEventInfo.bind(this)}
        user={this.props.user}
        availableSlots={this.state.availableSlots}
        selectedDate={this.state.selectedDate}
        getEventDateTime={this.getEventDateTime.bind(this)}
        eventTitle={this.state.eventTitle}
        location={this.state.location}
        selectedContacts={this.props.selectedContacts}
        selectedGroups={this.props.selectedGroups}
        meetingLength={this.state.meetingLength}
        renderEventsToCalendar = {this.renderEventsToCalendar.bind(this)}
        /> : null}

        {this.state.displayModal && <FreeTimeSlotsModal
          displayPickDateModal={this.displayPickDateModal.bind(this)}
          readyToUpdate={this.readyToUpdate.bind(this)}
          editedContacts={this.state.editedContacts}
          beingEdited={this.state.beingEdited}
          editingMode={this.editingMode.bind(this)}
          updateEditedContacts={this.updateEditedContacts.bind(this)}
          closeModal={this.closeModal.bind(this)}
          user={this.props.user}
          closeDisplayModal={this.closeDisplayModal.bind(this)}
          availableSlots={this.state.availableSlots}
          selectedDate={this.state.selectedDate}
          getEventDateTime={this.getEventDateTime.bind(this)}
          eventTitle={this.state.eventTitle}
          location={this.state.location}
          eventId={this.state.eventId}
          selectedContacts={this.props.selectedContacts}
          selectedGroups={this.props.selectedGroups}
          meetingLength={this.state.meetingLength}
          renderEventsToCalendar = {this.renderEventsToCalendar.bind(this)}
        />}

        {this.state.displayViewModal && <ViewEventModal
          eventTime={this.state.eventTime}
          up={this.state.up}
          eventTime={this.state.eventTime}
          eventEndTime={this.state.eventEndTime}
          readyToUpdate={this.readyToUpdate.bind(this)}
          readyToUpdateBool={this.state.readyToUpdateBool}
          editingMode={this.editingMode.bind(this)}
          updateEditedContacts={this.updateEditedContacts.bind(this)}
          allContacts={this.props.allContacts}
          closeViewModal={this.closeViewModal.bind(this)}
          updateSlotsAndEventInfo={this.updateSlotsAndEventInfo.bind(this)}
          user={this.props.user}
          eventPicked={this.state.eventPicked}
          getEventDateTime={this.getEventDateTime.bind(this)}
          selectedContacts={this.props.selectedContacts}
          selectedGroups={this.props.selectedGroups}
          renderEventsToCalendar = {this.renderEventsToCalendar.bind(this)}
          />
        }
      </div>
    )
  }
}


export default BigCalBasic;
