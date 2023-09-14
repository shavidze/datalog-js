import exampleTriples from "./example-triples.js";

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

/**
 * Queries a single pattern against the database.
 *
 * @param {Array} pattern - The pattern to be queried.
 * @param {Array} db - The database of triples.
 * @param {Object} context - The current context.
 * @returns {Array} - List of matched contexts.
 */
function querySingle(pattern, db, context) {
  return db
    .map((triple) => matchPattern(pattern, triple, context))
    .filter((x) => x);
}

/**
 * Queries multiple patterns against the database.
 *
 * @param {Array} patterns - List of patterns to be queried.
 * @param {Array} db - The database of triples.
 * @returns {Array} - List of matched contexts.
 */

function queryWhere(patterns, db) {
  return patterns.reduce(
    (contexts, pattern) => {
      return contexts.flatMap((context) => querySingle(pattern, db, context));
    },
    [{}]
  );
}

/**
 * Main query function that matches patterns and returns results.
 *
 * @param {Object} queryObj - Object containing 'find' and 'where' keys.
 * @param {Array} db - The database of triples.
 * @returns {Array} - List of results after querying.
 */

function query({ find, where }, db) {
  const contexts = queryWhere(where, db);
  return contexts.map((context) => actualize(context, find));
}

/**
 * Replaces variables in the 'find' pattern with actual values from the context.
 *
 * @param {Object} context - The current context.
 * @param {Array} find - The 'find' pattern.
 * @returns {Array} - Actualized results.
 */

function actualize(context, find) {
  return find.map((findPart) => {
    return isVariable(findPart) ? context[findPart] : findPart;
  });
}

console.log(
  query(
    {
      find: ["?year"],
      where: [
        ["?id", "movie/title", "Alien"],
        ["?id", "movie/year", "?year"],
      ],
    },
    exampleTriples
  )
);

console.log(
  query(
    {
      find: ["?attr", "?value"],
      where: [[200, "?attr", "?value"]],
    },
    exampleTriples
  )
);

console.log(
  query(
    {
      find: ["?directorName", "?movieTitle"],
      where: [
        ["?arnoldId", "person/name", "Arnold Schwarzenegger"],
        ["?movieId", "movie/cast", "?arnoldId"],
        ["?movieId", "movie/title", "?movieTitle"],
        ["?movieId", "movie/director", "?directorId"],
        ["?directorId", "person/name", "?directorName"],
      ],
    },
    exampleTriples
  )
);
