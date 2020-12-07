'use strict'

var stringify = require('unist-util-stringify-position')

module.exports = VMessage

// Inherit from `Error#`.
function VMessagePrototype() {}
VMessagePrototype.prototype = Error.prototype
VMessage.prototype = new VMessagePrototype()

// Message properties.
VMessage.prototype.file = ''
VMessage.prototype.name = ''
VMessage.prototype.reason = ''
VMessage.prototype.message = ''
VMessage.prototype.stack = ''
VMessage.prototype.fatal = null
VMessage.prototype.column = null
VMessage.prototype.line = null

// Construct a new VMessage.
//
// Note: We cannot invoke `Error` on the created context, as that adds readonly
// `line` and `column` attributes on Safari 9, thus throwing and failing the
// data.
function VMessage(reason, position, origin) {
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

  range = stringify(position) || '1:1'

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
  this.message = this.reason = reason.message || reason
  this.stack = reason.stack || ''
  this.column = position ? position.column : null
  this.line = position ? position.line : null
  this.location = location
  this.source = parts[0] || null
  this.ruleId = parts[1] || null
}
