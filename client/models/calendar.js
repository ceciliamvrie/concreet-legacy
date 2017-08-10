
// controllers to get back calendar data from Google Calendars API
// see https://docs.google.com/document/d/1Z7jaqjRvIZuvRJZW8X6a3JDIfilJTGclH0C-zYTAq04/edit for
// walkthrough an examples of response bodies for different API requests

import $ from 'jquery';
import moment from 'moment';

// retrieves all calendars for a single user
export const getCalendarList = (token, callback) => {
  // token is special key provided by google to identify a user and a session
  var searchParams = {access_token: token};

  $.get('https://www.googleapis.com/calendar/v3/users/me/calendarList', searchParams, (data) => {
    // data is an object with an items property that contains an array of calendar data
    callback(token, data.items);
  }).fail((err) => {
    console.log(err);
  })
};

export const getCalendarEvents = function (token, calendarList, callback) {
  for (var calendar of calendarList) {

    // replace any pound sign with its escape character. Pound sign interferes with URL search
    calendar.id = calendar.id.replace('#', '%23')

    var twoWeeksAgo = moment().subtract(2, 'weeks').format("YYYY-MM-DDTHH:mm:ssZ");
    var twoWeeksFromNow = moment().add(2, 'weeks').format("YYYY-MM-DDTHH:mm:ssZ");

    // params inclue user token, single events to true to avoid returning all recurring events
    // give it a time range from one week ago to one week from now.
    // order by start time(ascending). Earliest event will be 0th element in items array
    var searchParams = {
      access_token: token,
      singleEvents: true,
      timeMin: twoWeeksAgo,
      timeMax: twoWeeksFromNow,
      orderBy: 'startTime'
    };

    $.get(`https://www.googleapis.com/calendar/v3/calendars/${calendar.id}/events`, searchParams, (data) => {
      // data is an object with an items property that contains an array of calendar data
      callback(data.items);
    });
  }
}

export const processEvents = function (eventsList, callback) {
  for (var event of eventsList) {
    event.end = new Date (event.end.dateTime);
    event.start = new Date (event.start.dateTime);
  }
  callback(eventsList);
}

export const getEventData = (eventInfo, callback) => {
  // eventData contains token, calendarId, and eventId properties
  eventInfo.calendarId = 'hackreactor.com_9kddcjfdij7ak91o0t2bdlpnoo@group.calendar.google.com';
  eventInfo.eventId = 'hmohhg9pjtr795k22mq17eltvk_20170801T223000Z'

  var searchParams = {
    access_token: eventInfo.token,
  }

  $.get(`https://www.googleapis.com/calendar/v3/calendars/${eventInfo.calendarId}/events/${eventInfo.eventId}`, searchParams, (data) => {
    callback(data);
  });
};

// old freeBusy saved for future reference
// export const freeBusy = (queryInfo, callback) => {
//   // queryInfo contains token, timeMin, timeMax, and calendar ids
//
//   var calendars = queryInfo.items.map( (calendar) => {
//     return {id: calendar.id}
//   });
//
//   // dummy data
//   var requestBody = {
//     "items": calendars,
//     "timeMin": "2017-08-14T05:00:00Z",
//     "timeMax": "2017-08-15T05:00:00Z",
//   }
//
//   $.ajax({
//     type: "POST",
//     url: `https://www.googleapis.com/calendar/v3/freeBusy`,
//     headers: {Authorization: `Bearer ${queryInfo.token}`},
//     data: JSON.stringify(requestBody),
//     contentType: 'application/json',
//     dataType: 'json',
//     success: function(data) {
//       // data returns an object with calendars property
//       // calendars property returns all calendars searched for
//       // each calendar has a busy property with array of busy times
//
//       // give callback the calendars and their busy property
//       callback(data.calendars);
//     }
//   })
// };

export const accessControl = (token, calendarId, callback) => {

  var requestBody = {
    "kind": "calendar#aclRule",
    "role": "freeBusyReader",
    "scope": {
      "value": "jordan.n.hoang@gmail.com",
      "type": "user"
    }
  };

  $.ajax({
    type: "POST",
    url: `https://www.googleapis.com/calendar/v3/calendars/jordan.n.hoang@utexas.edu/acl`,
    headers: {Authorization: `Bearer ${token}`},
    data: JSON.stringify(requestBody),
    contentType: 'application/json',
    dataType: 'json',
    success: (data) => {
      callback(data)
    }

  });
}

export const freeBusy = (group, currentUser, timeMin, timeMax, callback) => {

var allContactsCalendars = [];

//will be deleted once timeMin and timeMax are passed in
var timeMin = '2017-08-01T17:06:02.000Z';
var timeMax =  '2017-08-09T17:06:02.000Z';


//will be deleted when the current proper user is passed in
  $.get(`/groups/user/${currentUser._id}`, (data) => {
    console.log('data', data[0].contacts);
    var queryGroup = data[0].contacts;
// end of delete

// add current user to queries
    queryGroup.push(currentUser)


// query freeBusy for all members of
    for (var member of queryGroup) {
      var id = member._id;
      var email = member.emailAddress;
      var accessToken = member.accessToken;
      var refreshToken = member.refreshToken;

      // dummy data
      var requestBody = {
        "items": [
          {
            "id": email
          },
          // {
          //   "id": "hackreactor.com_9kddcjfdij7ak91o0t2bdlpnoo@group.calendar.google.com"
          // }
        ],
        "timeMin": timeMin,
        "timeMax": timeMax,
      }

      $.ajax({
        type: "POST",
        url: `https://www.googleapis.com/calendar/v3/freeBusy`,
        headers: {Authorization: `Bearer ${accessToken}`},
        data: JSON.stringify(requestBody),
        contentType: 'application/json',
        dataType: 'json',
        success: function(data) {
          console.log('each cal', data.calendars)
          //add to array that contains all members freeBusytimes
          allContactsCalendars.push(data.calendars)
        },
        error: function(err) {
          // still need to work out refresh accessToken
        }
      });
    } //for loop end
    callback(allContactsCalendars);
  })
}

//way to call it
//CalendarModel.addEvent(this.props.selectedContacts, this.props.user.user, 'non-imaginative title', 'timeStart', 'timeEnd' , (data)=>console.log('calendars', data));


export const addEvent = (queryGroup, currentUser, title, timeStart, timeEnd, callback) => {
  var accessToken = currentUser.accessToken;
  var calendarId = currentUser.emailAddress;
  console.log('add event accessToken & eems', accessToken, calendarId);
  var attendees = []


//delete this THESE ARE TEMPORARY DEFAULTS
  timeStart = {
    "dateTime": "2017-08-10T13:00:00",
    "timeZone": "America/Los_Angeles"
  };
  timeEnd = {
    "dateTime": "2017-08-10T14:00:00",
    "timeZone": "America/Los_Angeles"
  };
  queryGroup = [
    {
      _id: '598c7e657b913129c469119b',
      emailAddress: 'concreetjo@gmail.com',
      googleId: '100975285035041480697',
      refreshToken: '1/1UQtnX2oh95M5ler6hWvzA4GGk82twQxe1uTBFUwEUI',
      accessToken: 'ya29.GlujBM1d2tp5PkefyztEY53sEsgOEyAZqMRxqtP60CgyJPmNvPZBwgt2ILKfB7Y7xT23C5ryDSBHlA0owg_gral-ZJRe-UUAsneYG4E_j3Yt-KFMfgKOISCmjMyK',
      __v: 0,
      isSignedUp: true
    }
  ]

//end delete

  for (var member of queryGroup) {
    var attendee = {
      email: member.emailAddress,
      responseStatus: 'accepted'
    };
    attendees.push(attendee);
  }

  var requestBody = {
    "attendees": attendees,
    "start": timeStart,
    "end": timeEnd,
    "reminders": {
      "useDefault": true,
    },
    "summary": title
  };

  $.ajax({
    type: "POST",
    url: `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
    headers: {Authorization: `Bearer ${accessToken}`},
    data: JSON.stringify(requestBody),
    contentType: 'application/json',
    dataType: 'json',
    success: function() {
      console.log('new event added')
    },
    error: function(err) {
      console.log('did not post new event', err)
    }
  });
}
