import path from 'path'
import test from 'tape'
import {VFileMessage} from './index.js'

/* eslint-disable no-undef */
var exception
var changedMessage
var multilineException

try {
  variable = 1
} catch (error) {
  error.stack = cleanStack(error.stack, 3)
  exception = error
}

try {
  variable = 1
} catch (error) {
  error.message = 'foo'
  error.stack = cleanStack(error.stack, 3)
  changedMessage = error
}

try {
  variable = 1
} catch (error) {
  error.message = 'foo\nbar\nbaz'
  error.stack = cleanStack(error.stack, 5)
  multilineException = error
}
/* eslint-enable no-undef */

test('VFileMessage(reason[, position][, origin])', function (t) {
  var message
  var pos

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
  t.deepEqual(message.location, {
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

  pos = {
    position: {
      start: {line: 2, column: 3},
      end: {line: 2, column: 5}
    }
  }

  message = new VFileMessage('test', pos)

  t.deepEqual(message.location, pos.position, 'should accept a node (1)')
  t.equal(String(message), '2:3-2:5: test', 'should accept a node (2)')

  pos = pos.position
  message = new VFileMessage('test', pos)

  t.deepEqual(message.location, pos, 'should accept a location (1)')
  t.equal(String(message), '2:3-2:5: test', 'should accept a location (2)')

  pos = pos.start
  message = new VFileMessage('test', pos)

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
    new VFileMessage('test', 'charlie').ruleId,
    'charlie',
    'should accept a `ruleId` as `origin`'
  )

  message = new VFileMessage('test', 'delta:echo')

  t.deepEqual(
    [message.source, message.ruleId],
    ['delta', 'echo'],
    'should accept a `source` and `ruleId` in `origin`'
  )

  t.end()
})

function cleanStack(stack, max) {
  return stack
    .replace(new RegExp('\\(.+\\' + path.sep, 'g'), '(')
    .replace(/\d+:\d+/g, '1:1')
    .split('\n')
    .slice(0, max)
    .join('\n')
}
