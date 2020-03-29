export = VMessage;
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
declare class VMessage extends Error {
    /**
     * Construct a new VMessage.
     * Constructor of a message for `reason` at `position` from `origin`.
     * When an `Error` is passed in as `reason`, copies the stack.
     *
     * @param {string | Error} reason Reason for message. Uses the stack and message of the error if given.
     * @param {Node | Position | Point | string} [position] Place at which the message occurred in a file.
     * @param {string} [origin] Place in code the message originates from.
     */
    constructor(reason: string | Error, position?: string | import("unist").Node | Point | Position | undefined, origin?: string | undefined);
    /**
     * Path of a file
     *
     * @type {string}
     */
    file: string;
    /**
     * Reason for message.
     *
     * @type {string | Error}
     */
    reason: string | Error;
    /**
     * Stack of message
     *
     * @type {string}
     */
    stack: string;
    /**
     * If `true` marks associated file as no longer processable.
     * Otherwise necessitates a (potential) change.
     *
     * @type {boolean | null | undefined}
     */
    fatal: boolean | null | undefined;
    /**
     * Starting column of error
     *
     * @type {number | null}
     */
    column: number | null;
    /**
     * Starting line of error
     *
     * @type {number | null}
     */
    line: number | null;
    /**
     * Full range information
     *
     * @type {Position}
     */
    location: Position;
    /**
     * Namespace of warning
     *
     * @type {string | null}
     */
    source: string | null;
    /**
     * Category of message
     *
     * @type {string | null}
     */
    ruleId: string | null;
}
declare namespace VMessage {
    export { Node, Point, Position };
}
type Position = {
    start: Point;
    end: Point;
};
type Point = {
    line: number | null;
    column: number | null;
};
type Node = import("unist").Node;
