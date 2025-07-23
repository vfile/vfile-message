interface Error {
  // The following fields are “well known”.
  // Not standard.
  // Feel free to add other non-standard fields to your messages.
  /**
   * Path of a file (used throughout the `VFile` ecosystem).
   */
  file?: string

  /**
   * Specify the source value that's being reported, which is deemed
   * incorrect.
   */
  actual?: unknown

  /**
   * Suggest acceptable values that can be used instead of `actual`.
   */
  expected?: unknown

  /**
   * Long form description of the message (you should use markdown).
   */
  note?: string

  /**
   * Link to docs for the message.
   *
   * > 👉 **Note**: this must be an absolute URL that can be passed as `x`
   * > to `new URL(x)`.
   */
  url?: string
}
