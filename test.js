/**
 * @typedef {import('unist').Node} Node
 * @typedef {import('unist').Position} Position
 * @typedef {import('unist').Point} Point
 */

import path from 'path'
import test from 'tape'
import {VFileMessage} from './index.js'

/* eslint-disable no-undef */
/** @type {Error} */
var exception
/** @type {Error} */
var changedMessage
/** @type {Error} */
var multilineException

try {
  // @ts-ignore
  variable = 1
} catch (error) {
  error.stack = cleanStack(error.stack, 3)
  exception = error
}

try {
  // @ts-ignore
  variable = 1
} catch (error) {
  error.message = 'foo'
  error.stack = cleanStack(error.stack, 3)
  changedMessage = error
}

try {
  // @ts-ignore
  variable = 1
} catch (error) {
  error.message = 'foo\nbar\nbaz'
  error.stack = cleanStack(error.stack, 5)
  multilineException = error
}
/* eslint-enable no-undef */

test('VFileMessage(reason[, place][, origin])', function (t) {
  /** @type {VFileMessage} */
  var message
  /** @type {Node|Position|Point} */
  var place

  t.ok(new VFileMessage('') instanceof Error, 'should return an Error')

  message = new VFileMessage('Foo')

  t.equal(message.name, '1:1')
  t.equal(message.file, '')
  t.equal(message.reason, 'Foo')
  t.equal(message.ruleId, null)
  t.equal(message.source, null)
  t.equal(message.stack, '')
  t.equal(message.fatal, null)
  t.equal(message.line, null)
  t.equal(message.column, null)
  t.deepEqual(message.position, {
    start: {line: null, column: null},
    end: {line: null, column: null}
  })

  t.equal(
    String(message),
    '1:1: Foo',
    'should have a pretty `toString()` message'
  )

  message = new VFileMessage(exception)

  t.equal(
    message.message,
    'variable is not defined',
    'should accept an error (1)'
  )

  t.equal(
    message.stack.split('\n')[0],
    'ReferenceError: variable is not defined',
    'should accept an error (2)'
  )

  message = new VFileMessage(changedMessage)

  t.equal(message.message, 'foo', 'should accept a changed error (1)')

  t.equal(
    message.stack.split('\n')[0],
    'ReferenceError: foo',
    'should accept a changed error (2)'
  )

  message = new VFileMessage(multilineException)

  t.equal(
    message.message,
    'foo\nbar\nbaz',
    'should accept a multiline error (1)'
  )

  t.equal(
    message.stack.split('\n').slice(0, 3).join('\n'),
    'ReferenceError: foo\nbar\nbaz',
    'should accept a multiline error (2)'
  )

  place = {
    type: 'x',
    position: {
      start: {line: 2, column: 3},
      end: {line: 2, column: 5}
    }
  }

  message = new VFileMessage('test', place)

  t.deepEqual(message.position, place.position, 'should accept a node (1)')
  t.equal(String(message), '2:3-2:5: test', 'should accept a node (2)')
  t.equal(
    String(new VFileMessage('test', {type: 'x'})),
    '1:1-1:1: test',
    'should accept a node (3)'
  )

  place = place.position
  message = new VFileMessage('test', place)

  t.deepEqual(message.position, place, 'should accept a position (1)')
  t.equal(String(message), '2:3-2:5: test', 'should accept a position (2)')

  place = place.start
  message = new VFileMessage('test', place)

  t.deepEqual(
    message.position,
    {
      start: place,
      end: {line: null, column: null}
    },
    'should accept a position (3)'
  )

  t.equal(String(message), '2:3: test', 'should accept a position (4)')

  t.deepEqual(
    // @ts-ignore
    new VFileMessage('test', {}).position,
    {start: {line: null, column: null}, end: {line: null, column: null}},
    'should ignore an empty object'
  )

  t.equal(
    // @ts-ignore runtime supports an overload w/o position.
    new VFileMessage('test', 'charlie').ruleId,
    'charlie',
    'should accept a `ruleId` as `origin`'
  )

  // @ts-ignore runtime supports an overload w/o position.
  message = new VFileMessage('test', 'delta:echo')

  t.deepEqual(
    [message.source, message.ruleId],
    ['delta', 'echo'],
    'should accept a `source` and `ruleId` in `origin`'
  )

  t.end()
})

/**
 * @param {string} stack
 * @param {number} max
 * @returns {string}
 */
function cleanStack(stack, max) {
  return stack
    .replace(new RegExp('\\(.+\\' + path.sep, 'g'), '(')
    .replace(/\d+:\d+/g, '1:1')
    .split('\n')
    .slice(0, max)
    .join('\n')
}
