interface Error {
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
}
