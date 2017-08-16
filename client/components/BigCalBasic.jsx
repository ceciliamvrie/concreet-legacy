
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
      meetingLength: 0
    }

    this.renderEventsToCalendar();
  }




  // componentWillMount() {
  //   // CalendarModel.getCalendarList(this.props.user.user, (currentUser, calendarList) => {
  //     var calendarList = [];
  //     CalendarModel.getCalendarEvents(this.props.user.user, calendarList, (eventsList) => {
  //       CalendarModel.processEvents(eventsList, (processedEvents) => {
  //         this.setState({
  //           events: processedEvents,
  //         })
  //       })
  //     })
  //   // });
  // }

  renderEventsToCalendar() {
    // CalendarModel.getCalendarList(this.props.user.user, (currentUser, calendarList) => {
    var calendarList = [];
      CalendarModel.getCalendarEvents(this.props.user.user, calendarList, (eventsList) => {
        CalendarModel.processEvents(eventsList, (processedEvents) => {
          this.setState({
            events: processedEvents,
          })
        })
      })
    // });
  }

  updateSlotsAndEventInfo(freeSlots, eventDate, eventTitle, eventLength) {
    console.log('opening dates AAHHHH')
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

  closeDisplayModal() {
    this.setState({
      displayModal: !this.state.displayModal,
    })
  }

  closeModal() {
    console.log('inside closeModal')
    this.setState({
      displayPickDateModal: !this.state.displayPickDateModal,
    })
  }

  closeViewModal() {
    this.setState({
      displayViewModal: !this.state.displayViewModal
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
          onSelectSlot={(slotInfo) => {
            this.setState({displayPickDateModal: !this.state.displayPickDateModal, selectedDate: slotInfo.start.toLocaleString().split(',')[0]})
            }
          }
          onSelectEvent={event => {
            this.setState({
              displayViewModal: !this.state.displayViewModal,
              eventPicked: event
            });
          }}
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
          closeModal={this.closeModal.bind(this)}
          user={this.props.user}
          closeDisplayModal={this.closeDisplayModal.bind(this)}
          availableSlots={this.state.availableSlots}
          selectedDate={this.state.selectedDate}
          getEventDateTime={this.getEventDateTime.bind(this)}
          eventTitle={this.state.eventTitle}
          selectedContacts={this.props.selectedContacts}
          selectedGroups={this.props.selectedGroups}
          meetingLength={this.state.meetingLength}
          renderEventsToCalendar = {this.renderEventsToCalendar.bind(this)}
        />}

        {this.state.displayViewModal && <ViewEventModal
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
