
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

    console.log('inside closeModal other')

    this.setState({
      displayPickDateModal: !this.state.displayPickDateModal,
      selectedDate: 'Meeting Date'

    })
    
  }

  displayPickDateModal() {

      this.setState({
        displayModal: false,
      })

  }

  // handleTopCreateSelect() {
  //   this.setState({
  //     topCreateSelected: !this.state.topCreateSelected,
  //     displayModal: !this.state.displayModal
  //   })
  // }


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
    console.log('UPDATE CONTACTS EDITED CALLED', this.state.beingEdited, bool)
    this.setState({
      beingEdited: bool,
      displayModal: false
    }, () => {
      console.log('UPDATE AFTER SET STATE IN BIG CAL', this.state.beingEdited)
    })
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
          titleAccessor='summary'
          defaultDate={new Date()}
          onSelectSlot={(slotInfo) => {
            this.setState({displayPickDateModal: !this.state.displayPickDateModal, selectedDate: slotInfo.start.toLocaleString().split(',')[0]})
            }
          }
          onSelectEvent={event => {
            var time = event.start.toString().split(' ').slice(4, 5).join(' ')
            var newTime = time.split('')
            var hour = newTime.splice(0, 2).join('')
            newTime = newTime.slice(0, 3)

            var final = ''
            if (Number(hour) > 12) {
              var t = Number(hour) - 12
              final = t + newTime.join('') + 'am'
            } else {
              final = hour + newTime.join('') + 'pm'
            }

            this.setState({
              displayViewModal: !this.state.displayViewModal,
              eventPicked: event,
              eventTime: final
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
          up={this.state.up}
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
