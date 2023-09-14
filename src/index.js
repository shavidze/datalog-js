/**
 * Matches a pattern against a triple using a given context.
 *
 * @param {Array} pattern - The pattern to be matched.
 * @param {Array} triple - The triple against which the pattern is matched.
 * @param {Object} context - The initial context (variable bindings).
 * @returns {Object} - Updated context after matching.
 */
function matchPattern(pattern, triple, context) {
  return pattern.reduce((context, patternPart, idx) => {
    const triplePart = triple[idx];
    return matchPart(patternPart, triplePart, context);
  }, context);
}

/**
 * Matches a part of the pattern against a part of the triple.
 *
 * @param {*} patternPart - A part of the pattern.
 * @param {*} triplePart - A corresponding part of the triple.
 * @param {Object} context - The current context.
 * @returns {Object} - Updated context based on the match.
 */
function matchPart(patternPart, triplePart, context) {
  if (!context) return null;
  if (isVariable(patternPart)) {
    return matchVariable(patternPart, triplePart, context);
  }
  return patternPart === triplePart ? context : null;
}

/**
 * Checks if a given value is a variable (starts with a '?').
 *
 * @param {*} x - The value to be checked.
 * @returns {boolean} - True if x is a variable, false otherwise.
 */
function isVariable(x) {
  return typeof x === "string" && x.startsWith("?");
}

/**
 * Matches a variable against a part of the triple.
 *
 * @param {string} variable - The variable to be matched.
 * @param {*} triplePart - A part of the triple.
 * @param {Object} context - The current context.
 * @returns {Object} - Updated context after matching the variable.
 */
function matchVariable(variable, triplePart, context) {
  if (context.hasOwnProperty(variable)) {
    const bound = context[variable];
    return matchPart(bound, triplePart, context);
  }
  return { ...context, [variable]: triplePart };
}