import React from 'react';
import moment from 'moment';
import Modal from 'react-modal';
import Columns from 'react-columns';
import * as CalendarModel from '../models/calendar.js';
import events from './events';
import findFreeTimes from '../models/findFreeTimes.js';
import EditEventModal from './EditEventModal.jsx';

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

    this.state = {
      modalIsOpen: true,
      attendees: this.props.eventPicked.attendees,
      toggleTitle: false,
      toggleLocation: false
    };

    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
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
    var i = e.target.getAttribute('name')
    this.setState({
      attendees: this.state.attendees.splice(i, 1)
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

  handleTitleChange(e) {
    e.preventDefault();
    console.log('title changed', e.target.title.value);
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
              <button className="createEventButton" onClick={this.deleteEvent}> Delete this Event (it's garbage *batman voice*) </button>
            </div>

            {this.state.toggleTitle ? 
              <form onSubmit={this.handleTitleChange.bind(this)}>
                <input type="text" style={{width: '300px', height: '25px'}} name="title" value={this.props.eventPicked.summary}></input>
              </form>
               :
                <h2 className="modalTitle">
                  <i onClick={this.editTitle.bind(this)} className="fa fa-pencil fa-fw" aria-hidden="true"></i>
                   {this.props.eventPicked.summary}
                </h2>
              }

            <h3 className="modalTitle"> When: {this.props.eventPicked.start
              .toString().split(' ').slice(0, 4).join(' ')}
            </h3>


            <div>
              <Columns columns="2">
                {this.props.eventPicked.attendees.map((atnd, i) =>
                  <div id="attendee"><i className="fa fa-minus-circle fa-fw" id="minusDelete" aria-hidden="true" onClick={this.removeAttendee.bind(this)} name={i}></i>
                  {atnd.email}: <label style={{fontStyle: 'italic', fontSize: '14px'}}>{atnd.responseStatus}</label></div>
                )}
              </Columns>
            </div>
          </div>

          </Modal>
        {console.log()}
      </div>

    );
  }
}

export default EditEvent;
