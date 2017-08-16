import React from 'react';
import BigCalendar from 'react-big-calendar';
import moment from 'moment';
import * as CalendarModel from '../models/calendar.js';
import FreeTimeSlotsModal from './FreeTimeSlotsModal.jsx';
import CreateDateModal from './CreateDateModal.jsx';
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
      events: [],
      availableSlots: [],
      displayModal: false,
      displayPickDateModal: false,
      selectedDate: undefined,
      eventDateTime: undefined,
      eventTitle: '',
      meetingLength: 0
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

  updateSlotsAndEventInfo(freeSlots, eventDate, eventTitle, eventLength) {
    this.setState({
      availableSlots: freeSlots,
      displayModal: true,
      selectedDate: eventDate,
      eventTitle: eventTitle,
      meetingLength: eventLength
    })
  }

  // get the selected meeting time in ISO format
  getEventDateTime(isoDateTime) {
    this.setState({
      eventDateTime: isoDateTime
    })
  }

  closeModal() {
    this.setState({
      displayPickDateModal: !this.state.displayPickDateModal
    })
  }

  render(){
    return (
      <div className="calendar">
        <AddEvent
          handleFinish={this.props.handleFinish}
          handleCreateClick={this.props.handleCreateClick}
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
          onSelectSlot={(slotInfo) =>
            this.setState({displayPickDateModal: !this.state.displayPickDateModal, selectedDate: slotInfo.start.toLocaleString().split(',')[0]})
          }
        />
        {this.state.displayPickDateModal ? <CreateDateModal
          closeModal={this.closeModal.bind(this)}
          updateSlotsAndEventInfo={this.updateSlotsAndEventInfo.bind(this)}
          user={this.props.user}
          availableSlots={this.state.availableSlots}
          selectedDate={this.state.selectedDate}
          getEventDateTime={this.getEventDateTime.bind(this)}
          eventTitle={this.state.eventTitle}
          selectedContacts={this.props.selectedContacts}
          selectedGroups={this.props.selectedGroups}
          meetingLength={this.state.meetingLength}
          renderEventsToCalendar = {this.renderEventsToCalendar.bind(this)}
        /> : null}
        {this.state.displayModal && <FreeTimeSlotsModal
          user={this.props.user}
          availableSlots={this.state.availableSlots}
          selectedDate={this.state.selectedDate}
          getEventDateTime={this.getEventDateTime.bind(this)}
          eventTitle={this.state.eventTitle}
          selectedContacts={this.props.selectedContacts}
          selectedGroups={this.props.selectedGroups}
          meetingLength={this.state.meetingLength}
          renderEventsToCalendar = {this.renderEventsToCalendar.bind(this)}
          />
        }
      </div>
    )
  }
}


export default BigCalBasic;
