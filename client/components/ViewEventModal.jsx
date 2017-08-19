import React from 'react';
import Modal from 'react-modal';
import InlineBlock from 'react-inline-block';
import Columns from 'react-columns';
import CreateEventModal from './CreateDateModal.jsx';
import Iframe from 'react-iframe';
import EditEvent from './EditEvent.jsx';
import Map from './Map.jsx';
import moment from 'moment';

// Modal styling
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

class ViewEventModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      modalIsOpen: true,
      toggleEdit: false

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
    this.setState({modalIsOpen: false});
    this.props.closeViewModal()
    this.props.editingMode(false)

  }

  toggleEditEvent() {

    if (this.props.user.user.emailAddress === this.props.eventPicked.creator.email) {
      this.props.editingMode(true)
      this.setState({
        toggleEdit: !this.state.toggleEdit
      });
    } else {
      alert('you ca;ajs;l');
    }
  }

  render() {
    return (
      <div className="viewModal">

        <Modal
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={customStyles}
          contentLabel="Time Slots Modal"
        >

        {!this.state.toggleEdit ?
          <div>
            <div className="modalTitle">
              <button className="createEventButton" onClick={this.toggleEditEvent.bind(this)}> Edit </button>
            </div>
            <h2 className="modalTitle">{this.props.eventPicked.summary}</h2>

            <h3 className="modalTitle"> When: {this.props.eventPicked.start
              .toString().split(' ').slice(0, 4).join(' ')} at {this.props.eventTime}
            </h3>


            <div className="yomama">
              {this.props.eventPicked.attendees ?
                <Columns columns="2">
                  {this.props.eventPicked.attendees.map((atnd) => {

                    if (atnd.email !== this.props.user.user.emailAddress) {

                        return <div id="attendee">
                        {atnd.email}: <label style={{'fontWeight': 'bold', fontSize: '14px', 'color': atnd.responseStatus === 'accepted' ? 'rgb(30, 214, 118)' : atnd.responseStatus === 'needsAction' ? 'rgb(235, 181, 21)' : 'rgb(216, 86, 29)'}}>{atnd.responseStatus === 'needsAction' ? 'pending' : atnd.responseStatus}</label></div>
                      }
                    }
                  )}
                </Columns>
              : null}
            </div>

              <div className="modalTitle" id="event-location-map">
                <Map location={this.props.eventPicked.location} />
              </div>
            </div>

          :

          <EditEvent
          up={this.props.up}
          attendees={this.props.eventPicked.attendees.slice()}
          updateEditedContacts={this.props.updateEditedContacts}
          allContacts={this.props.allContacts}
          user={this.props.user}
          eventTime={this.state.eventTime}
          toggleEdit={this.toggleEditEvent.bind(this)}
          eventPicked={this.props.eventPicked}
          updateSlotsAndEventInfo={this.props.updateSlotsAndEventInfo}
          editingMode={this.props.editingMode}
          eventTime={this.props.eventTime}
          renderEventsToCalendar = {this.props.renderEventsToCalendar}
          closeViewModal={this.props.closeViewModal}
          readyToUpdate={this.props.readyToUpdate}
          readyToUpdateBool={this.props.readyToUpdateBool}
          />
        }

        </Modal>
      </div>
    );
  }
}

export default ViewEventModal;
