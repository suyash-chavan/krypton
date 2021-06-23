const luxon = require('luxon')
const DATE_FORMAT = 'yyyy-MM-dd'
const TIME_FORMAT = 'hh:mm'
const TIME_24_SIMPLE = luxon.DateTime.TIME_24_SIMPLE

function dateTimeStringsToMillis (dateString, timeString) {
    return luxon.DateTime.fromFormat(
        `${dateString} ${timeString}`,
        `${DATE_FORMAT} ${TIME_FORMAT}`
    ).toMillis()
}

function dateTimeToDateString (dateTime) {
    return dateTime.toFormat(DATE_FORMAT)
}

function dateTimeToTimeString (dateTime) {
    return dateTime.toLocaleString(luxon.DateTime.TIME_24_SIMPLE)
}

function millisToDateTimeStrings (dateMillis) {
    const dateTime = luxon.DateTime.fromMillis(dateMillis)

    return dateTimeToDateString(dateTime) + ' ' + dateTimeToTimeString(dateTime)
}

module.exports = { dateTimeStringsToMillis, millisToDateTimeStrings, DATE_FORMAT, TIME_FORMAT, TIME_24_SIMPLE }
