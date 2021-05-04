import {stringifyPosition} from 'unist-util-stringify-position'

// Inherit from `Error#`.
function VFileMessagePrototype() {}
VFileMessagePrototype.prototype = Error.prototype
VFileMessage.prototype = new VFileMessagePrototype()

// Message properties.
VFileMessage.prototype.file = ''
VFileMessage.prototype.name = ''
VFileMessage.prototype.reason = ''
VFileMessage.prototype.message = ''
VFileMessage.prototype.stack = ''
VFileMessage.prototype.fatal = null
VFileMessage.prototype.column = null
VFileMessage.prototype.line = null

// Construct a new VFileMessage.
//
// Note: We cannot invoke `Error` on the created context, as that adds readonly
// `line` and `column` attributes on Safari 9, thus throwing and failing the
// data.
export function VFileMessage(reason, position, origin) {
  var parts = []
  var index
  var range
  var location

  if (typeof position === 'string') {
    origin = position
    position = null
  }

  if (typeof origin === 'string') {
    index = origin.indexOf(':')

    if (index === -1) {
      parts[1] = origin
    } else {
      parts[0] = origin.slice(0, index)
      parts[1] = origin.slice(index + 1)
    }
  }

  range = stringifyPosition(position) || '1:1'

  location = {
    start: {line: null, column: null},
    end: {line: null, column: null}
  }

  // Node.
  if (position && position.position) {
    position = position.position
  }

  if (position) {
    // Position.
    if (position.start) {
      location = position
      position = position.start
    } else {
      // Point.
      location.start = position
    }
  }

  this.name = range
  this.reason = reason.message || reason
  this.message = this.reason
  this.stack = reason.stack || ''
  this.column = position ? position.column : null
  this.line = position ? position.line : null
  this.location = location
  this.source = parts[0] || null
  this.ruleId = parts[1] || null
}
