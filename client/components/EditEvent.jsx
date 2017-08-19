import React from 'react';
import moment from 'moment';
import Modal from 'react-modal';
import Columns from 'react-columns';
import * as CalendarModel from '../models/calendar.js';
import events from './events';
import findFreeTimes from '../models/findFreeTimes.js';
import EditEventModal from './EditEventModal.jsx';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import DatePicker from 'react-bootstrap-date-picker';

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : '70%',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)',
    maxHeight             : '425px', // This sets the max height
    width                 : '700px',
    overflow              : 'scroll', // This tells the modal to scroll
    border                : '1px solid black',
    //borderBottom          : '1px solid black', // for some reason the bottom border was being cut off, so made it a little thicker
    borderRadius         : '0px'
  }
};

class EditEvent extends React.Component {
  constructor(props) {
    super(props);

    var value = new Date().toISOString();

    this.state = {
      currentMeetingLength: (this.props.eventTime + '-' + this.props.eventEndTime),
      noDate: true,
      dateDidChange: false,
      modalIsOpen: true,
      attendees: this.props.attendees,
      title: this.props.eventPicked.summary,
      location: this.props.eventPicked.location,
      datePicked: '',
      meetingLengthTitle: 'Set Meeting Length',
      meetingLength: 30,
      toggleTitle: false,
      toggleDate: false,
      toggleLocation: false,
      toggleMeetLength: false,
      toggleTime: false,
      dateValue: this.props.eventPicked.start.toISOString(),
      date: this.props.eventPicked.start.toLocaleDateString(),
      formattedValue: '',
      checkAvail: this.props.readyToUpdateBool,
      eventTime: this.props.eventTime
    };

    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleDatePicked = this.handleDatePicked.bind(this);
  }

  handleDatePicked(dateValue, formattedValue) {
    this.setState({
      dateValue: dateValue, // ISO String, ex: "2016-11-19T12:00:00.000Z"
      formattedValue: formattedValue, // Formatted String, ex: "11/19/2016"
    });
  }

  componentDidUpdate(){

  }

  openModal() {
    this.setState({modalIsOpen: true});
  }

  afterOpenModal() {
   
  }

  closeModal() {
    this.props.closeViewModal()
    this.props.editingMode(false)
    this.setState({modalIsOpen: false});
  }

  deleteEvent() {
    console.log('delete event button clicked');
    CalendarModel.deleteEventAjax(this.props.eventPicked.id, this.props.user.user, (err, res) => {
      this.props.renderEventsToCalendar();
      this.props.closeViewModal();
      this.props.editingMode();
    })
  }

  removeAttendee(e) {
    // have this send a confirmation email that they were removed from event
    e.preventDefault()

    var i = e.target.getAttribute('name')

    this.state.attendees.splice(i, 1)

    this.setState({
      attendees: this.state.attendees
    })
  }

  editTitle() {
    this.setState({
      toggleTitle: !this.state.toggleTitle
    })
  }

  editLocation() {
    this.setState({
      toggleLocation: !this.state.toggleLocation
    })
  }

  editMeetLength() {

    this.setState({
      toggleMeetLength: !this.state.toggleMeetLength
    })
  }

  editTime() {
    this.setState({
      toggleTime: !this.state.toggleTime
    })
  }

  editDate() {

    this.setState({
      toggleDate: !this.state.toggleDate
    })
  }

  handleTitleChange(e) {
    e.preventDefault();
    this.editTitle()
    this.setState({
      title: e.target.title.value
    }) 
  }

  handleDateChange() {
    this.editDate()

    var hiddenInputElement = document.getElementById("datePicker");
    this.setState({
      datePicked: hiddenInputElement.getAttribute('data-formattedvalue'),
      date: hiddenInputElement.getAttribute('data-formattedvalue'),
      dateDidChange: true
    }, () => {
      console.log('date changed', this.state.datePicked)
    })
  }

  handleMeetLengthChange() {
    this.editMeetLength()
    console.log('new meeting length', this.state.meetingLength)
  }

  handleTimeChange() {
    this.editTime()
    console.log('time changed');
  }

  handleLocationChange(e) {
    this.editLocation()
    this.setState({
      location: e.target.location.value
    })
    console.log('location changed', this.props.eventPicked.location);
  }

  toggleAvail() {
    var meetingLength = JSON.parse(this.state.meetingLength);
    var meetingTitle = this.state.title;
    let location = this.state.location;

    if (this.state.datePicked) {
      console.log('DATE WAS PICKED')
      var timeMin = moment(this.state.datePicked, "MM/DD/YYYY");
    } else {
      console.log('DATE WAS nooooooot PICKED')
      var timeMin = moment(this.props.eventPicked.start.toLocaleDateString(), "MM/DD/YYYY");
    }

    var queryInfo = {
      timeMin: timeMin.toISOString(),
      timeMax: timeMin.add('1', 'days').toISOString()
    };

    var contacts = []
    var temp = {}
    // grab unique emails. Right now there are duplicates because of faulty memeber adding process
    if (this.state.attendees) {
      for (var i = 0; i < this.state.attendees.length; i++) {
        for (var j = 0; j < this.props.allContacts.length; j++) {

          if (this.props.allContacts[j].emailAddress === this.state.attendees[i].email ) {
            temp[this.state.attendees[i].email] = this.props.allContacts[j] || 'FUDGE'
          }
        }
      }
    }

    for (var member in temp) {
      contacts.push(temp[member])
    }

    this.props.updateEditedContacts(contacts)

    CalendarModel.freeBusy(contacts, this.props.user.user, queryInfo.timeMin, queryInfo.timeMax, (calendars) => {
      console.log(queryInfo.timeMin, queryInfo.timeMax)
      // receives back calendars array with each element being an object with a email address as its only property
      // each property has a value that is an object with a busy property
      // value of busy property is an array of objects that include start and end property of busy times
      findFreeTimes.findAvailableSlots(meetingLength, calendars, (freeSlots) => {
        // passsing back the available slots as well as the selected date in ISO format (queryInfo.timeMin)
        this.props.updateSlotsAndEventInfo(freeSlots, queryInfo.timeMin, meetingTitle, meetingLength, location, this.props.eventPicked.id)
        this.setState({
          dateDidChange: false
        })
      });
    })

    console.log('check available clicked')
  }

  update() {
    console.log('NO DATES', this.props.readyToUpdateBool)
    var up = this.props.up

    if (!this.props.readyToUpdateBool) {
      console.log('FML', this.props.user.user)
      CalendarModel.updateEvent(this.state.attendees, this.props.user.user, this.state.title, this.props.eventPicked.startDateTime, this.props.eventPicked.endDateTime, this.state.location, this.props.eventPicked.id, (data) => {
        this.props.eventPicked.attendees = this.state.attendees;
        this.props.eventPicked.summary = this.state.title;
        this.props.eventPicked.location = this.state.location;
        this.props.readyToUpdate(false, []);
        this.props.editingMode();
        this.props.renderEventsToCalendar();
        this.props.toggleEdit();
      })
    } else {
      console.log('got in non no date update')
      CalendarModel.updateEvent(up[0], this.props.user.user, this.state.title, up[3], up[4], this.props.eventPicked.location, up[6], (data) => {
        this.props.eventPicked.attendees = this.state.attendees;
        this.props.eventPicked.summary = this.state.title;
        this.props.eventPicked.location = this.state.location;
        this.props.readyToUpdate(false, []);
        this.props.editingMode();
        this.props.renderEventsToCalendar();
        this.props.toggleEdit();
        this.setState({
          dateDidChange: false
        })
      })
    }
  }

  render() {
    return (
      <div className="addevent">

        <Modal
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={customStyles}
          contentLabel="Time Slots Modal"
        >
          <div>
            <div className="modalTitle">
              <button className="createEventButton" onClick={this.deleteEvent.bind(this)}> Delete this Event </button>
            </div>
            {this.state.toggleTitle ?
              <form onSubmit={this.handleTitleChange.bind(this)}>
                <input type="text" className="titleEdit" name="title" placeholder={this.state.title}/>
                <button> Accept </button>
              </form>
            :
              <h2 className="modalTitle">
                <i onClick={this.editTitle.bind(this)} className="fa fa-pencil fa-fw" aria-hidden="true"></i>
                 {this.state.title}
              </h2>
            }

            {!this.state.toggleDate ?
              <div>
                <h3 className="modalTitle">
                  <i onClick={this.editDate.bind(this)} className="fa fa-pencil fa-fw" aria-hidden="true"></i>
                   When: {this.state.date}
                </h3>
              </div>
            :
                <FormGroup style={{textAlign: 'center', width: '35%', marginLeft: '31%'}}>
                  <DatePicker clearButtonElement="" id="datePicker" style={{height: '25px', fontSize: '18px', textAlign: 'center', width: '100%'}}
                   name="date" value={this.state.dateValue} onChange={this.handleDatePicked}/>
                  <button style={{marginTop: '5px', marginBottom: '5px'}} onClick={this.handleDateChange.bind(this)}> Accept </button>
                </FormGroup>
            }
            <div>
            {this.state.toggleMeetLength ?
              <div style={{marginLeft: '31%'}}>Time Length: {Math.floor(this.state.meetingLength / 60)} Hours   {this.state.meetingLength % 60} Mins
                <h3>
                  <input style={{marginLeft: '8%', width: '28%'}} type="range" name="meetingLength" min="30" max="600" value={this.state.meetingLength} onChange={(e => this.setState({meetingLength: e.target.value, meetingLengthTitle: e.target.value}))}></input>
                </h3>
                <button style={{marginLeft: '16%', marginBottom: '10px'}}onClick={this.handleMeetLengthChange.bind(this)}> Accept </button>
              </div>
            :
              <div>
                <h3 style={{marginLeft: '32%'}}>
                  <i onClick={this.editMeetLength.bind(this)} className="fa fa-pencil fa-fw" aria-hidden="true"></i>
                    Set Length: {Math.floor(this.state.meetingLength / 60)} Hours   {this.state.meetingLength % 60} Mins
                </h3>
              </div>
            }

            {this.state.toggleLocation ?
              <div style={{marginLeft: '35%'}}>
                <form onSubmit={this.handleLocationChange.bind(this)}>
                  <input style={{marginLeft: '-10%', width: '300px', height: '30px', fontSize: '16px'}} type="text" name="location" placeholder={this.state.location || 'Set Location'}/>
                  <button style={{marginLeft: '2px', marginBottom: '10px'}}> Accept </button>
                </form>
              </div>
            :
              <div>
                <h3 style={{marginLeft: '34%'}}>
                  <i onClick={this.editLocation.bind(this)} className="fa fa-pencil fa-fw" aria-hidden="true"></i>
                    {this.state.location || 'No Location For This Event'}
                </h3>
              </div>
            }
            <div style={{marginLeft: '42%', marginTop: '20px'}}> {this.props.readyToUpdateBool ? this.props.up[7] + '-' + this.props.up[8]: this.state.currentMeetingLength}</div>
            {this.state.dateDidChange ? 
            <button className="createEventButton" style={{marginLeft: '36%', textAlign: 'center'}} onClick={this.toggleAvail.bind(this)}>Check Available Times</button>
            : null}
            </div>

            <div>
              {this.props.eventPicked.attendees ?
                <Columns columns="2">
                  {this.state.attendees.map((atnd, i) => {
                    if (atnd.email !== this.props.user.user.emailAddress) {
                        return <div id="attendee"><i className="fa fa-minus-circle fa-fw" id="minusDelete" aria-hidden="true" onClick={this.removeAttendee.bind(this)} name={i}></i>
                        {atnd.email}: <label style={{fontStyle: 'italic', fontSize: '14px'}}>{atnd.responseStatus}</label></div>
                      }
                    }
                  )}
                </Columns>
              : null}
            </div>
            <div style={{textAlign: 'right'}}>
            {!this.state.dateDidChange ? 
              <button className="createEventButton" style={{margin: '10px'}} onClick={this.update.bind(this)}>Update event</button>
              : null }
              <button className="createEventButton" style={{margin: '10px'}} onClick={this.props.toggleEdit}>Cancel</button>

            </div>
          </div>
          </Modal>
        {console.log()}
      </div>

    );
  }
}

// {this.props.eventPicked.start.toString().split(' ').slice(4, 5).join(' ').slice(0, 5)}

export default EditEvent;
