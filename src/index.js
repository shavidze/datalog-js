/**
 * Matches a pattern against a triple using a given context.
 * @param {Array} pattern - The pattern to match.
 * @param {Array} triple - The triple to match against.
 * @param {Object} context - The context for variable bindings.
 * @returns {Object} - Updated context after matching.
 */
export function matchPattern(pattern, triple, context) {
  return pattern.reduce((context, patternPart, idx) => {
    const triplePart = triple[idx];
    return matchPart(patternPart, triplePart, context);
  }, context);
}

/**
 * Matches a part of the pattern against a part of the triple.
 * @param {*} patternPart - Part of the pattern.
 * @param {*} triplePart - Corresponding part of the triple.
 * @param {Object} context - The context for variable bindings.
 * @returns {Object|null} - Updated context or null if mismatch.
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
 * @param {*} x - Value to check.
 * @returns {boolean} - True if x is a variable, false otherwise.
 */
function isVariable(x) {
  return typeof x === "string" && x.startsWith("?");
}

/**
 * Matches a variable against a part of the triple.
 * @param {string} variable - The variable to match.
 * @param {*} triplePart - Part of the triple to match against.
 * @param {Object} context - The context for variable bindings.
 * @returns {Object} - Updated context after matching the variable.
 */
export function matchVariable(variable, triplePart, context) {
  if (context.hasOwnProperty(variable)) {
    const bound = context[variable];
    return matchPart(bound, triplePart, context);
  }
  return { ...context, [variable]: triplePart };
}

/**
 * Queries a single pattern against the database.
 * @param {Array} pattern - The pattern to query.
 * @param {Object} db - The database to query against.
 * @param {Object} context - The context for variable bindings.
 * @returns {Array} - Array of contexts resulting from successful matches.
 */
export function querySingle(pattern, db, context) {
  return relevantTriples(pattern, db)
    .map((triple) => matchPattern(pattern, triple, context))
    .filter((x) => x);
}

/**
 * Queries multiple patterns against the database.
 * @param {Array} patterns - Array of patterns to query.
 * @param {Object} db - The database to query against.
 * @returns {Array} - Combined results of all queries.
 */
export function queryWhere(patterns, db) {
  return patterns.reduce(
    (contexts, pattern) => {
      return contexts.flatMap((context) => querySingle(pattern, db, context));
    },
    [{}]
  );
}

/**
 * Main query function that matches patterns and returns results.
 * @param {Object} queryObj - Object containing 'find' and 'where' patterns.
 * @param {Object} db - The database to query against.
 * @returns {Array} - Array of results after matching patterns.
 */
export function query({ find, where }, db) {
  const contexts = queryWhere(where, db);
  return contexts.map((context) => actualize(context, find));
}

/**
 * Replaces variables in the 'find' pattern with actual values from the context.
 * @param {Object} context - The context for variable bindings.
 * @param {Array} find - The 'find' pattern.
 * @returns {Array} - Array with variables replaced by their actual values.
 */
function actualize(context, find) {
  return find.map((findPart) => {
    return isVariable(findPart) ? context[findPart] : findPart;
  });
}

/**
 * Returns all triples from the database that are relevant to a given pattern.
 * @param {Array} pattern - The pattern to check relevance for.
 * @param {Object} db - The database to check against.
 * @returns {Array} - Array of relevant triples.
 */
function relevantTriples(pattern, db) {
  const [id, attribute, value] = pattern;
  if (!isVariable(id)) {
    return db.entityIndex[id];
  }
  if (!isVariable(attribute)) {
    return db.attrIndex[attribute];
  }
  if (!isVariable(value)) {
    return db.valueIndex[value];
  }
  return db.triples;
}

/**
 * Creates an index of triples by a given part (0, 1, or 2).
 * @param {Array} triples - Array of triples.
 * @param {number} idx - Index (0, 1, or 2) to create the index by.
 * @returns {Object} - Index of triples by the given part.
 */
function indexBy(triples, idx) {
  return triples.reduce((index, triple) => {
    const k = triple[idx];
    index[k] = index[k] || [];
    index[k].push(triple);
    return index;
  }, {});
}

/**
 * Creates a database object from a list of triples.
 * @param {Array} triples - Array of triples.
 * @returns {Object} - Database object.
 */
export function createDB(triples) {
  return {
    triples,
    entityIndex: indexBy(triples, 0),
    attrIndex: indexBy(triples, 1),
    valueIndex: indexBy(triples, 2),
  };
}
