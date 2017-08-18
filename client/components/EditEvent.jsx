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
      modalIsOpen: true,
      attendees: this.props.eventPicked.attendees,
      datePicked: '',
      meetingLengthTitle: 'Set Meeting Length',
      meetingLength: 30,
      toggleTitle: false,
      toggleDate: false,
      toggleLocation: false,
      toggleMeetLength: false,
      toggleTime: false,
      dateValue: value,
      formattedValue: '',
      checkAvail: true,
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
    // references are now sync'd and can be accessed.
    // this.subtitle.style.color = '#f00';
  }

  closeModal() {
    this.props.closeModal()
    this.setState({modalIsOpen: false});
  }

  deleteEvent() {
    // delete event
    // console.log('delete event button clicked');
    // CalendarModel.deleteEventAjax(this.props.user.user, function(err, res) {
    //   //something happens
    // })
  }

  removeAttendee(e) {
    // have this send a confirmation email that they were removed from event
    e.preventDefault()

    var i = e.target.getAttribute('name')
    console.log('attendees', this.props.eventPicked.attendees)
    console.log('current selected item', this.props.eventPicked.attendees.splice(i, 1))
    
    this.setState({
      attendees: this.props.eventPicked.attendees
    }, () => {
      console.log('REMAINING ATTENDEES AFTER removed', this.state.attendees)
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
    this.props.eventPicked.summary = e.target.title.value
    console.log('title changed', this.props.eventPicked.summary);
  }

  handleDateChange() {
    this.editDate()

    var hiddenInputElement = document.getElementById("datePicker");
    this.setState({
      datePicked: hiddenInputElement.getAttribute('data-formattedvalue')
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
    this.props.eventPicked.location = e.target.location.value
    console.log('location changed', this.props.eventPicked.location);
  }

  toggleAvail() {

    var meetingLength = JSON.parse(this.state.meetingLength);
    var meetingTitle = this.props.eventPicked.summary;
    let location = this.props.eventPicked.location;
    var timeMin = moment(this.state.datePicked, "MM/DD/YYYY");
    var queryInfo = {
      timeMin: timeMin.toISOString(),
      timeMax: timeMin.add('1', 'days').toISOString()
    };

    console.log('CONTACTS BEFORE', contacts)
    var contacts = []
    console.log('ATTENDEES', this.props.eventPicked.attendees)
    var temp = {}
    // grab unique emails. Right now there are duplicates because of faulty memeber adding process
    for (var i = 0; i < this.props.eventPicked.attendees.length; i++) {
      for (var j = 0; j < this.props.allContacts.length; j++) {
        
        if (this.props.allContacts[j].emailAddress === this.props.eventPicked.attendees[i].email) {
          temp[this.props.eventPicked.attendees[i].email] = this.props.allContacts[j] || 'FUDGE'
        }
      }
    }

    for (var member in temp) {
      contacts.push(temp[member])
    }
    console.log('CONTACTS AFTER', contacts)
    CalendarModel.freeBusy(contacts, this.props.user.user, queryInfo.timeMin, queryInfo.timeMax, (calendars) => {
      console.log(queryInfo.timeMin, queryInfo.timeMax)
      // receives back calendars array with each element being an object with a email address as its only property
      // each property has a value that is an object with a busy property
      // value of busy property is an array of objects that include start and end property of busy times
      findFreeTimes.findAvailableSlots(meetingLength, calendars, (freeSlots) => {
        // passsing back the available slots as well as the selected date in ISO format (queryInfo.timeMin)
        console.log('got here ok')
        this.props.updateSlotsAndEventInfo(freeSlots, queryInfo.timeMin, meetingTitle, meetingLength, location)
      });
    })
    this.setState({
      topCreateSelected: !this.state.topCreateSelected
    })
    console.log('check available clicked')
  }

  update() {

    this.setState({
      checkAvail: !this.state.checkAvail
    })

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
              <button className="createEventButton" onClick={this.deleteEvent}> Delete this Event (*batman voice* it's garbage ) </button>
            </div>
            {this.state.toggleTitle ?
              <form onSubmit={this.handleTitleChange.bind(this)}>
                <input type="text" className="titleEdit" name="title" placeholder={this.props.eventPicked.summary}/>
                <button> Accept </button>
              </form>
            :
              <h2 className="modalTitle">
                <i onClick={this.editTitle.bind(this)} className="fa fa-pencil fa-fw" aria-hidden="true"></i>
                 {this.props.eventPicked.summary}
              </h2>
            }

            {!this.state.toggleDate ?
              <div>
                <h3 className="modalTitle">
                  <i onClick={this.editDate.bind(this)} className="fa fa-pencil fa-fw" aria-hidden="true"></i>
                   When: {this.props.eventPicked.start
                    .toString().split(' ').slice(0, 4).join(' ')}
                </h3>
              </div>
            : 
                <FormGroup style={{textAlign: 'center', width: '35%', marginLeft: '32%'}}>
                  <DatePicker clearButtonElement="" id="datePicker" style={{height: '25px', fontSize: '18px', textAlign: 'center', width: '100%'}}
                   name="date" value={this.state.dateValue} onChange={this.handleDatePicked}/>
                  <button style={{marginTop: '5px', marginBottom: '5px'}} onClick={this.handleDateChange.bind(this)}> Accept </button>
                </FormGroup>
            }
            <div>
            {this.state.toggleMeetLength ? 
              <div style={{marginLeft: '10%'}}>Time Length: {Math.floor(this.state.meetingLength / 60)} Hours   {this.state.meetingLength % 60} Mins
                <h3>
                  <input style={{marginLeft: '8%', width: '28%'}} type="range" name="meetingLength" min="30" max="600" value={this.state.meetingLength} onChange={(e => this.setState({meetingLength: e.target.value, meetingLengthTitle: e.target.value}))}></input>
                </h3>
                <button style={{marginLeft: '16%', marginBottom: '10px'}}onClick={this.handleMeetLengthChange.bind(this)}> Accept </button>
              </div>
            :
              <div>
                <h3 style={{marginLeft: '38%'}}>
                  <i onClick={this.editMeetLength.bind(this)} className="fa fa-pencil fa-fw" aria-hidden="true"></i>
                    Length {Math.floor(this.state.meetingLength / 60)} Hours   {this.state.meetingLength % 60} Mins
                </h3>
              </div> 
            }

            {this.state.toggleLocation ? 
              <div style={{marginLeft: '38%'}}>
                <form onSubmit={this.handleLocationChange.bind(this)}>
                  <input type="text" name="location" placeholder={this.props.eventPicked.location}/>
                  <button style={{marginLeft: '2px', marginBottom: '10px'}}> Accept </button>
                </form>
              </div>
            :
              <div>
                <h3 style={{marginLeft: '38%'}}>
                  <i onClick={this.editLocation.bind(this)} className="fa fa-pencil fa-fw" aria-hidden="true"></i>
                    {this.props.eventPicked.location}
                </h3>
              </div> 
            }

            </div>

            <div>
              {this.props.eventPicked.attendees ?
                <Columns columns="2">
                  {this.props.eventPicked.attendees.map((atnd, i) =>
                    <div id="attendee"><i className="fa fa-minus-circle fa-fw" id="minusDelete" aria-hidden="true" onClick={this.removeAttendee.bind(this)} name={i}></i>
                    {atnd.email}: <label style={{fontStyle: 'italic', fontSize: '14px'}}>{atnd.responseStatus}</label></div>
                  )}
                </Columns>
              : null}
            </div>
            <div style={{textAlign: 'right'}}>
              {this.state.checkAvail ? 
                <button className="createEventButton" onClick={this.toggleAvail.bind(this)}>Check Available Times</button>
              :  
                <button className="createEventButton" onClick={this.update.bind(this)}>Update event</button>
              }
              <button className="createEventButton" style={{margin: '20px'}}onClick={this.props.toggleEdit}>Cancel</button>
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
