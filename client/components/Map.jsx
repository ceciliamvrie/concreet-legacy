
import React from 'react';
import Iframe from 'react-iframe';
import API_KEY from '../gmaps_config.js';

class Map extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      location: this.props.location
    }
  }

  render() {
    return (
      <Iframe url={"https://www.google.com/maps/embed/v1/place?key=" + API_KEY + "&q=" + this.state.location}
         width="485px"
         height="350px"
         display="initial"
         position="relative"
         async
         defer
         allowFullScreen/>
    );
  }
}

export default Map;
