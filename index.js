/**
 * @typedef {import('unist').Node} Node
 * @typedef {import('unist').Position} Position
 * @typedef {import('unist').Point} Point
 */

import {stringifyPosition} from 'unist-util-stringify-position'

export class VFileMessage extends Error {
  /**
   * Constructor of a message for `reason` at `position` from `origin`.
   * When an error is passed in as `reason`, copies the `stack`.
   *
   * @param {string|Error} reason Reason for message (`string` or `Error`). Uses the stack and message of the error if given.
   * @param {Node|Position|Point} [position] Place at which the message occurred in a file (`Node`, `Position`, or `Point`, optional).
   * @param {string} [origin] Place in code the message originates from (`string`, optional).
   */
  constructor(reason, position, origin) {
    /** @type {[string?, string?]} */
    var parts = [null, null]
    /** @type {Position} */
    var location = {
      start: {line: null, column: null},
      end: {line: null, column: null}
    }
    /** @type {number} */
    var index

    super()

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

    if (position) {
      // Node.
      if ('type' in position || 'position' in position) {
        location = position.position
      }
      // Position.
      else if ('start' in position) {
        // @ts-ignore Looks like a position.
        location = position
      }
      // Point.
      else if ('line' in position) {
        // @ts-ignore Looks like a point.
        location.start = position
      }
    }

    // Fields from `Error`
    this.name = stringifyPosition(position) || '1:1'
    this.message = typeof reason === 'object' ? reason.message : reason
    this.stack = typeof reason === 'object' ? reason.stack : ''

    /**
     * Full range information, when available.
     * Has start and end properties, both set to an object with line and column, set to number?.
     * @type {Position?}
     */
    this.location = location
    /**
     * Reason for message.
     * @type {string}
     */
    this.reason = this.message
    /**
     * Starting column of error.
     * @type {number?}
     */
    this.column = location.start.line
    /**
     * Starting line of error.
     * @type {number?}
     */
    this.line = location.start.column
    /**
     * Namespace of warning.
     * @type {string?}
     */
    this.source = parts[0]
    /**
     * Category of message.
     * @type {string?}
     */
    this.ruleId = parts[1]

    // The following fields are “well known”.
    // Not standard.
    // Feel free to add other non-standard fields to your messages.

    /* eslint-disable no-unused-expressions */
    /**
     * You may add a file property with a path of a file (used throughout the VFile ecosystem).
     * @type {string?}
     */
    this.file
    /**
     * If true, marks associated file as no longer processable.
     * @type {boolean?}
     */
    this.fatal
    /**
     * You may add a url property with a link to documentation for the message.
     * @type {string?}
     */
    this.url
    /**
     * You may add a note property with a long form description of the message (supported by vfile-reporter).
     * @type {string?}
     */
    this.note
    /* eslint-enable no-unused-expressions */
  }
}

VFileMessage.prototype.file = ''
VFileMessage.prototype.name = ''
VFileMessage.prototype.reason = ''
VFileMessage.prototype.message = ''
VFileMessage.prototype.stack = ''
VFileMessage.prototype.fatal = null
VFileMessage.prototype.column = null
VFileMessage.prototype.line = null
VFileMessage.prototype.source = null
VFileMessage.prototype.ruleId = null
VFileMessage.prototype.location = null
