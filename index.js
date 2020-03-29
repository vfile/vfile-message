'use strict'

var stringify = require('unist-util-stringify-position')

/**
 * @typedef {import('unist').Node} Node
 *
 * @typedef {object} Point
 * @property {number | null} line
 * @property {number | null} column
 *
 * @typedef {object} Position
 * @property {Point} start
 * @property {Point} end
 */

/**
 * A message
 */
class VMessage extends Error {
  /**
   * Construct a new VMessage.
   * Constructor of a message for `reason` at `position` from `origin`.
   * When an `Error` is passed in as `reason`, copies the stack.
   *
   * @param {string | Error} reason Reason for message. Uses the stack and message of the error if given.
   * @param {Node | Position | Point | string} [position] Place at which the message occurred in a file.
   * @param {string} [origin] Place in code the message originates from.
   */
  constructor(reason, position, origin) {
    super()

    /**
     * Path of a file
     *
     * @type {string}
     */
    this.file = ''

    /**
     * Reason for message.
     *
     * @type {string | Error}
     */
    this.reason = reason

    /**
     * Error message
     *
     * @type {string}
     */
    this.message = ''

    /**
     * Stack of message
     *
     * @type {string}
     */
    this.stack = ''

    /**
     * If `true` marks associated file as no longer processable.
     * Otherwise necessitates a (potential) change.
     *
     * @type {boolean | null | undefined}
     */
    this.fatal = null

    /**
     * Starting column of error
     *
     * @type {number | null}
     */
    this.column = null

    /**
     * Starting line of error
     *
     * @type {number | null}
     */
    this.line = null

    /**
     * Full range information
     *
     * @type {Position}
     */
    this.location = {
      start: {line: null, column: null},
      end: {line: null, column: null}
    }

    if (position && typeof position !== 'string') {
      /** @type {Point | null} */
      let point = null
      /** @type {Position | null} */
      let location = null
      if (isNode(position)) {
        if (position.position) {
          point = position.position.start
          location = position.position
        }
      } else if (isPosition(position)) {
        point = position.start
        location = position
      } else {
        point = position
        location = {start: position, end: {line: null, column: null}}
      }

      if (location) {
        this.location = location
      }

      if (point) {
        this.line = point.line
        this.column = point.column
      }
    }

    const parts =
      typeof position === 'string' ? parseOrigin(position) : parseOrigin(origin)
    // @ts-ignore stringify typing is missing the possible nulls
    const range = stringify(position) || '1:1'

    if (typeof reason === 'string') {
      this.message = reason
    } else {
      this.stack = reason.stack || ''
      this.message = reason.message
    }

    /**
     * Error name
     *
     * @type {string}
     */
    this.name = range

    /**
     * Namespace of warning
     *
     * @type {string | null}
     */
    this.source = parts[0]

    /**
     * Category of message
     *
     * @type {string | null}
     */
    this.ruleId = parts[1]
  }
}

/**
 * Determine if object is a Position
 *
 * @param {Node | Position | Point} [object] to check
 * @returns {object is Position}
 */
function isPosition(object) {
  return object !== undefined && 'start' in object
}

/**
 * Determine if object is a Node
 *
 * @param {Node | Position | Point} [object] to check
 * @returns {object is Node}
 */
function isNode(object) {
  return object !== undefined && 'position' in object
}

/**
 * Extract source and partId from an origin
 *
 * @param {string | undefined} origin to parse
 * @returns {[string | null, string | null]} source, ruleId
 */
function parseOrigin(origin) {
  /** @type {[string | null, string | null]} */
  var result = [null, null]

  if (typeof origin === 'string') {
    const index = origin.indexOf(':')

    if (index === -1) {
      result[1] = origin
    } else {
      result[0] = origin.slice(0, index)
      result[1] = origin.slice(index + 1)
    }
  }

  return result
}

module.exports = VMessage
