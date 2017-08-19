import React from 'react';
import Modal from 'react-modal'
import TimeSlot from './TimeSlot.jsx'

// Modal styling
const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : '70%',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)',
    maxHeight             : '325px', // This sets the max height
    overflow              : 'scroll', // This tells the modal to scroll
    border                : '1px solid black',
    //borderBottom          : '1px solid black', // for some reason the bottom border was being cut off, so made it a little thicker
    borderRadius         : '0px'
  }
};

class FreeTimeSlotsModal extends React.Component {
  constructor() {
    super();

    this.state = {
      modalIsOpen: true
    };

    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  openModal() {
    console.log('openModal')
    this.setState({modalIsOpen: true});
  }

  closeModal() {
    console.log('closeModal')
    this.setState({modalIsOpen: false});
    this.props.readyToUpdate(false)
    this.props.displayPickDateModal()
    
    if (!this.props.beingEdited) {
      this.props.closeModal()
    }

  }

  render() {
    return (
      <div className="timeModal">

        <Modal
          isOpen={this.state.modalIsOpen}
          onRequestClose={this.closeModal}
          style={customStyles}
          contentLabel="Time Slots Modal"
        >

          <h2 className="modalTitle">Available Meeting Times</h2>
          {
            this.props.availableSlots.map( (slot, i) => {
              return (
                <TimeSlot
                  user={this.props.user}
                  key={i}
                  slotTime={slot}
                  closeModal={this.closeModal.bind(this)}
                  closeDisplayModal={this.props.closeDisplayModal}
                  selectedDate={this.props.selectedDate}
                  getEventDateTime={this.props.getEventDateTime}
                  eventTitle={this.props.eventTitle}
                  location={this.props.location}
                  eventId={this.props.eventId}
                  selectedContacts={this.props.selectedContacts}
                  selectedGroups={this.props.selectedGroups}
                  editedContacts={this.props.editedContacts}
                  beingEdited={this.props.beingEdited}
                  updateEditedContacts={this.props.updateEditedContacts}
                  editingMode={this.props.editingMode}
                  meetingLength={this.props.meetingLength}
                  renderEventsToCalendar = {this.props.renderEventsToCalendar}
                  readyToUpdate={this.props.readyToUpdate}
                />
              )
            })
          }
        </Modal>
      </div>
    );
  }
}

export default FreeTimeSlotsModal;
