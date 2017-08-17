
import React from 'react';
import Iframe from 'react-iframe';

class Map extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      location: this.props.location
    }
  }

  render() {
    return (
      <Iframe
        width="485px"
        height="350px"
        frameborder="0" style="border:0"
        async defer
        src={"https://www.google.com/maps/embed/v1/place?key=AIzaSyCMOEDp5TLmM37tCpw9i-ERmpU2kqhEMJg&q=" + this.state.location} allowFullScreen>
      </iframe>
    );
  }
}

export default Map;
