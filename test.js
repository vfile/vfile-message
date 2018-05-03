'use strict'

var test = require('tape')
var VMessage = require('.')

/* eslint-disable no-undef */
var exception
var changedMessage
var multilineException

try {
  variable = 1
} catch (err) {
  err.stack = cleanStack(err.stack, 3)
  exception = err
}

try {
  variable = 1
} catch (err) {
  err.message = 'foo'
  err.stack = cleanStack(err.stack, 3)
  changedMessage = err
}

try {
  variable = 1
} catch (err) {
  err.message = 'foo\nbar\nbaz'
  err.stack = cleanStack(err.stack, 5)
  multilineException = err
}
/* eslint-enable no-undef */

test('VMessage(reason[, position][, origin])', function(t) {
  var message
  var pos

  t.ok(new VMessage('') instanceof Error, 'should return an Error')

  message = new VMessage('Foo')

  t.equal(message.name, '1:1')
  t.equal(message.file, '')
  t.equal(message.reason, 'Foo')
  t.equal(message.ruleId, null)
  t.equal(message.source, null)
  t.equal(message.stack, '')
  t.equal(message.fatal, null)
  t.equal(message.line, null)
  t.equal(message.column, null)
  t.deepEqual(message.location, {
    start: {line: null, column: null},
    end: {line: null, column: null}
  })

  t.equal(
    String(message),
    '1:1: Foo',
    'should have a pretty `toString()` message'
  )

  message = new VMessage(exception)

  t.equal(
    message.message,
    'variable is not defined',
    'should accept an error (1)'
  )

  t.equal(
    message.stack
      .split('\n')
      .slice(0, 2)
      .join('\n'),
    [
      'ReferenceError: variable is not defined',
      '    at Object.<anonymous> (test.js:1:1)'
    ].join('\n'),
    'should accept an error (2)'
  )

  message = new VMessage(changedMessage)

  t.equal(message.message, 'foo', 'should accept a changed error (1)')

  t.equal(
    message.stack
      .split('\n')
      .slice(0, 2)
      .join('\n'),
    ['ReferenceError: foo', '    at Object.<anonymous> (test.js:1:1)'].join(
      '\n'
    ),
    'should accept a changed error (2)'
  )

  message = new VMessage(multilineException)

  t.equal(
    message.message,
    'foo\nbar\nbaz',
    'should accept a multiline error (1)'
  )

  t.equal(
    message.stack
      .split('\n')
      .slice(0, 4)
      .join('\n'),
    [
      'ReferenceError: foo',
      'bar',
      'baz',
      '    at Object.<anonymous> (test.js:1:1)'
    ].join('\n'),
    'should accept a multiline error (2)'
  )

  pos = {
    position: {
      start: {line: 2, column: 3},
      end: {line: 2, column: 5}
    }
  }

  message = new VMessage('test', pos)

  t.deepEqual(message.location, pos.position, 'should accept a node (1)')
  t.equal(String(message), '2:3-2:5: test', 'should accept a node (2)')

  pos = pos.position
  message = new VMessage('test', pos)

  t.deepEqual(message.location, pos, 'should accept a location (1)')
  t.equal(String(message), '2:3-2:5: test', 'should accept a location (2)')

  pos = pos.start
  message = new VMessage('test', pos)

  t.deepEqual(
    message.location,
    {
      start: pos,
      end: {line: null, column: null}
    },
    'should accept a position (1)'
  )

  t.equal(String(message), '2:3: test', 'should accept a position')

  t.equal(
    new VMessage('test', 'charlie').ruleId,
    'charlie',
    'should accept a `ruleId` as `origin`'
  )

  message = new VMessage('test', 'delta:echo')

  t.deepEqual(
    [message.source, message.ruleId],
    ['delta', 'echo'],
    'should accept a `source` and `ruleId` in `origin`'
  )

  t.end()
})

function cleanStack(stack, max) {
  return stack
    .replace(/\(\/.+\//g, '(')
    .replace(/\d+:\d+/g, '1:1')
    .split('\n')
    .slice(0, max)
    .join('\n')
}
