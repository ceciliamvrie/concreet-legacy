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
      toggleTitle: false,
      toggleDate: false,
      toggleLocation: false,
      dateValue: value,
      formattedValue: '',
      value: 30
    };

    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleDatePicked = this.handleDatePicked.bind(this);
  }

  handleDatePicked(dateValue, formattedValue) {
    this.setState({
      dateValue: dateValue, // ISO String, ex: "2016-11-19T12:00:00.000Z"
      formattedValue: formattedValue // Formatted String, ex: "11/19/2016"
    });
  }

  componentDidUpdate(){
    // Access ISO String and formatted values from the DOM.
    var hiddenInputElement = document.getElementById("datePicker");
    console.log(hiddenInputElement.value); // ISO String, ex: "2016-11-19T12:00:00.000Z"
    console.log(hiddenInputElement.getAttribute('data-formattedvalue')) // Formatted String, ex: "11/19/2016"
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
    console.log('delete event button clicked');
  }

  removeAttendee(e) {
    // have this send a confirmation email that they were removed from event
    e.preventDefault()

    var i = e.target.getAttribute('name', this.props.eventPicked.attendees.length)

    this.setState({
      attendees: this.props.eventPicked.attendees.splice(i, 1)
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

  editDate() {
    this.setState({
      toggleDate: !this.state.toggleDate
    })
  }

  handleTitleChange(e) {
    e.preventDefault();
    this.editTitle()
    console.log('title changed', e.target.title.value);
  }

  handleDateChange() {
    this.editDate()
    console.log('date changed', this.state.formattedValue, this.state.dateValue);
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
                 value={this.state.dateValue} onChange={this.handleDatePicked}/>
                <button style={{marginTop: '10px', marginBottom: '20px'}}onClick={this.handleDateChange.bind(this)}> Accept </button>
              </FormGroup>
            }

           <div style={{width: '100%', marginLeft: '35%', marginTop: '10px', marginBottom: '10px'}}>Time Length: {Math.floor(this.state.value / 60)} Hours   {this.state.value % 60} Mins
             <h3>
               <input style={{width: '28%'}} type="range" name="meetingLength" min="30" max="600" value={this.state.value} onChange={(e => this.setState({value: e.target.value}))}></input>
             </h3>
           </div>

            <div>
              <Columns columns="2">
                {this.props.eventPicked.attendees.map((atnd, i) =>
                  <div id="attendee"><i className="fa fa-minus-circle fa-fw" id="minusDelete" aria-hidden="true" onClick={this.removeAttendee.bind(this)} name={i}></i>
                  {atnd.email}: <label style={{fontStyle: 'italic', fontSize: '14px'}}>{atnd.responseStatus}</label></div>
                )}
              </Columns>
            </div>
            <div style={{textAlign: 'right'}}>
              <button className="createEventButton">Update event</button>
              <button className="createEventButton" style={{margin: '20px'}}onClick={this.props.toggleEdit}>Cancel</button>
            </div>
          </div>
          </Modal>
        {console.log()}
      </div>

    );
  }
}

export default EditEvent;
