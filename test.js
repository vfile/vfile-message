/**
 * @typedef {import('unist').Position} Position
 * @typedef {import('unist').Point} Point
 * @typedef {import('mdast').Root} Root
 */

import path from 'node:path'
import test from 'tape'
import {VFileMessage} from './index.js'

/* eslint-disable no-undef */
/** @type {Error} */
let exception
/** @type {Error} */
let changedMessage
/** @type {Error} */
let multilineException

try {
  // @ts-expect-error
  variable = 1
} catch (error_) {
  const error = /** @type {Error} */ (error_)
  error.stack = cleanStack(error.stack, 3)
  exception = error
}

try {
  // @ts-expect-error
  variable = 1
} catch (error_) {
  const error = /** @type {Error} */ (error_)
  error.message = 'foo'
  error.stack = cleanStack(error.stack, 3)
  changedMessage = error
}

try {
  // @ts-expect-error
  variable = 1
} catch (error_) {
  const error = /** @type {Error} */ (error_)
  error.message = 'foo\nbar\nbaz'
  error.stack = cleanStack(error.stack, 5)
  multilineException = error
}
/* eslint-enable no-undef */

test('VFileMessage(reason[, place][, origin])', function (t) {
  t.ok(new VFileMessage('') instanceof Error, 'should return an Error')

  const m1 = new VFileMessage('Foo')

  t.equal(m1.name, '1:1')
  t.equal(m1.file, '')
  t.equal(m1.reason, 'Foo')
  t.equal(m1.ruleId, null)
  t.equal(m1.source, null)
  t.equal(m1.stack, '')
  t.equal(m1.fatal, null)
  t.equal(m1.line, null)
  t.equal(m1.column, null)
  t.deepEqual(m1.position, {
    start: {line: null, column: null},
    end: {line: null, column: null}
  })

  t.equal(String(m1), '1:1: Foo', 'should have a pretty `toString()` message')

  const m2 = new VFileMessage(exception)

  t.equal(m2.message, 'variable is not defined', 'should accept an error (1)')

  t.equal(
    String(m2.stack || '').split('\n')[0],
    'ReferenceError: variable is not defined',
    'should accept an error (2)'
  )

  const m3 = new VFileMessage(changedMessage)

  t.equal(m3.message, 'foo', 'should accept a changed error (1)')

  t.equal(
    String(m3.stack || '').split('\n')[0],
    'ReferenceError: foo',
    'should accept a changed error (2)'
  )

  const m4 = new VFileMessage(multilineException)

  t.equal(m4.message, 'foo\nbar\nbaz', 'should accept a multiline error (1)')

  t.equal(
    String(m4.stack || '')
      .split('\n')
      .slice(0, 3)
      .join('\n'),
    'ReferenceError: foo\nbar\nbaz',
    'should accept a multiline error (2)'
  )

  const literalNode = {
    type: 'x',
    position: {
      start: {line: 2, column: 3},
      end: {line: 2, column: 5}
    }
  }

  const m5 = new VFileMessage('test', literalNode)

  t.deepEqual(m5.position, literalNode.position, 'should accept a node (1)')
  t.equal(String(m5), '2:3-2:5: test', 'should accept a node (2)')
  t.equal(
    String(new VFileMessage('test', {type: 'x'})),
    '1:1-1:1: test',
    'should accept a node (3)'
  )

  t.equal(
    String(
      new VFileMessage(
        'xxx',
        /** @type {Root} */ ({
          type: 'root',
          children: [],
          position: {
            start: {line: 1, column: 1},
            end: {line: 2, column: 1}
          }
        })
      )
    ),
    '1:1-2:1: xxx',
    'should accept a node (4, typed)'
  )

  const position = literalNode.position
  const m6 = new VFileMessage('test', position)

  t.deepEqual(m6.position, position, 'should accept a position (1)')
  t.equal(String(m6), '2:3-2:5: test', 'should accept a position (2)')

  const point = position.start
  const m7 = new VFileMessage('test', point)

  t.deepEqual(
    m7.position,
    {
      start: point,
      end: {line: null, column: null}
    },
    'should accept a position (3)'
  )

  t.equal(String(m7), '2:3: test', 'should accept a position (4)')

  t.deepEqual(
    // @ts-expect-error
    new VFileMessage('test', {}).position,
    {start: {line: null, column: null}, end: {line: null, column: null}},
    'should ignore an empty object'
  )

  t.equal(
    // @ts-expect-error runtime supports an overload w/o position.
    new VFileMessage('test', 'charlie').ruleId,
    'charlie',
    'should accept a `ruleId` as `origin`'
  )

  // @ts-expect-error runtime supports an overload w/o position.
  const m8 = new VFileMessage('test', 'delta:echo')

  t.deepEqual(
    [m8.source, m8.ruleId],
    ['delta', 'echo'],
    'should accept a `source` and `ruleId` in `origin`'
  )

  t.end()
})

/**
 * @param {string|undefined} stack
 * @param {number} max
 * @returns {string}
 */
function cleanStack(stack, max) {
  return String(stack || '')
    .replace(new RegExp('\\(.+\\' + path.sep, 'g'), '(')
    .replace(/\d+:\d+/g, '1:1')
    .split('\n')
    .slice(0, max)
    .join('\n')
}
