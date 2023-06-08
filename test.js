/**
 * @typedef {import('mdast').Root} Root
 */

import assert from 'node:assert/strict'
import test from 'node:test'
import {VFileMessage} from './index.js'

/* eslint-disable no-undef */
/** @type {Error} */
let exception
/** @type {Error} */
let changedMessage
/** @type {Error} */
let multilineException

try {
  // @ts-expect-error: we want to capture this error.
  variable = 1
} catch (error_) {
  const error = /** @type {Error} */ (error_)
  exception = error
}

try {
  // @ts-expect-error: we want to capture this error.
  variable = 1
} catch (error_) {
  const error = /** @type {Error} */ (error_)
  error.message = 'foo'
  changedMessage = error
}

try {
  // @ts-expect-error: we want to capture this error.
  variable = 1
} catch (error_) {
  const error = /** @type {Error} */ (error_)
  error.message = 'foo\nbar\nbaz'
  multilineException = error
}
/* eslint-enable no-undef */

test('VFileMessage', async function () {
  assert.deepEqual(
    Object.keys(await import('./index.js')).sort(),
    ['VFileMessage'],
    'should expose the public api'
  )

  assert.ok(new VFileMessage('') instanceof Error, 'should return an Error')

  const m1 = new VFileMessage('Foo')

  assert.equal(m1.name, '1:1')
  assert.equal(m1.file, '')
  assert.equal(m1.reason, 'Foo')
  assert.equal(m1.ruleId, undefined)
  assert.equal(m1.source, undefined)
  assert.equal(m1.stack, '')
  assert.equal(m1.fatal, undefined)
  assert.equal(m1.line, undefined)
  assert.equal(m1.column, undefined)
  assert.deepEqual(m1.place, undefined)

  assert.equal(
    String(m1),
    '1:1: Foo',
    'should have a pretty `toString()` message'
  )

  const m2 = new VFileMessage(exception)

  assert.equal(
    m2.message,
    'variable is not defined',
    'should accept an error (1)'
  )

  assert.equal(
    String(m2.stack || '').split('\n')[0],
    'ReferenceError: variable is not defined',
    'should accept an error (2)'
  )

  const m3 = new VFileMessage(changedMessage)

  assert.equal(m3.message, 'foo', 'should accept a changed error (1)')

  assert.equal(
    String(m3.stack || '').split('\n')[0],
    'ReferenceError: foo',
    'should accept a changed error (2)'
  )

  const m4 = new VFileMessage(multilineException)

  assert.equal(
    m4.message,
    'foo\nbar\nbaz',
    'should accept a multiline error (1)'
  )

  assert.equal(
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

  assert.deepEqual(m5.place, literalNode.position, 'should accept a node (1)')
  assert.equal(String(m5), '2:3-2:5: test', 'should accept a node (2)')
  assert.equal(
    String(new VFileMessage('test', {type: 'x'})),
    '1:1: test',
    'should accept a node (3)'
  )

  assert.equal(
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

  assert.deepEqual(m6.place, position, 'should accept a position (1)')
  assert.equal(String(m6), '2:3-2:5: test', 'should accept a position (2)')

  const point = position.start
  const m7 = new VFileMessage('test', point)

  assert.deepEqual(m7.place, point, 'should accept a position (3)')

  assert.equal(String(m7), '2:3: test', 'should accept a position (4)')

  assert.equal(
    new VFileMessage('test', 'charlie').ruleId,
    'charlie',
    'should accept a `ruleId` as `origin`'
  )

  const m8 = new VFileMessage('test', 'delta:echo')

  assert.deepEqual(
    [m8.source, m8.ruleId],
    ['delta', 'echo'],
    'should accept a `source` and `ruleId` in `origin`'
  )

  const m9 = new VFileMessage('Something went wrong', {
    ancestors: [literalNode],
    cause: exception,
    place: literalNode.position,
    ruleId: 'my-rule',
    source: 'my-package'
  })

  assert.equal(m9.reason, 'Something went wrong', 'should support options')
  assert.deepEqual(
    [m9.line, m9.column],
    [2, 3],
    'should support `options.place` for `line`/`column`'
  )
  assert.deepEqual(
    [m9.source, m9.ruleId],
    ['my-package', 'my-rule'],
    'should support `options.source`, `options.ruleId`'
  )
})
