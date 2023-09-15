import exampleTriples from "./example-triples.js";

// Matches a pattern against a triple using a given context.
function matchPattern(pattern, triple, context) {
  // For each part of the pattern, match it against the corresponding part of the triple.
  // If any part doesn't match, the whole pattern doesn't match.
  return pattern.reduce((context, patternPart, idx) => {
    const triplePart = triple[idx];
    return matchPart(patternPart, triplePart, context);
  }, context);
}

// Matches a part of the pattern against a part of the triple.
function matchPart(patternPart, triplePart, context) {
  // If the context is null, the match has already failed.
  if (!context) return null;
  // If the pattern part is a variable, match it against the triple part.
  if (isVariable(patternPart)) {
    return matchVariable(patternPart, triplePart, context);
  }
  // If the pattern part and the triple part are the same, return the context.
  // Otherwise, return null to indicate a mismatch.
  return patternPart === triplePart ? context : null;
}

// Checks if a given value is a variable (starts with a '?').
function isVariable(x) {
  return typeof x === "string" && x.startsWith("?");
}

// Matches a variable against a part of the triple.
function matchVariable(variable, triplePart, context) {
  // If the variable is already bound in the context, match its value against the triple part.
  if (context.hasOwnProperty(variable)) {
    const bound = context[variable];
    return matchPart(bound, triplePart, context);
  }
  // If the variable is not bound, bind it to the triple part and return the updated context.
  return { ...context, [variable]: triplePart };
}

// Queries a single pattern against the database.
function querySingle(pattern, db, context) {
  // Find all triples in the database that are relevant to the pattern.
  // For each relevant triple, match the pattern against the triple.
  // Return all contexts that resulted from successful matches.
  return relevantTriples(pattern, db)
    .map((triple) => matchPattern(pattern, triple, context))
    .filter((x) => x);
}

// Queries multiple patterns against the database.
function queryWhere(patterns, db) {
  // For each pattern, query it against the database.
  // Combine the results of all queries.
  return patterns.reduce(
    (contexts, pattern) => {
      return contexts.flatMap((context) => querySingle(pattern, db, context));
    },
    [{}]
  );
}

// Main query function that matches patterns and returns results.
function query({ find, where }, db) {
  // Query the 'where' patterns against the database.
  // For each resulting context, replace variables in the 'find' pattern with their values from the context.
  const contexts = queryWhere(where, db);
  return contexts.map((context) => actualize(context, find));
}

// Replaces variables in the 'find' pattern with actual values from the context.
function actualize(context, find) {
  return find.map((findPart) => {
    return isVariable(findPart) ? context[findPart] : findPart;
  });
}

// Returns all triples from the database that are relevant to a given pattern.
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

// Creates a database object from a list of triples.
function createDB(triples) {
  return {
    triples,
    entityIndex: indexBy(triples, 0),
    attrIndex: indexBy(triples, 1),
    valueIndex: indexBy(triples, 2),
  };
}

// Creates an index of triples by a given part (0, 1, or 2).
function indexBy(triples, idx) {
  return triples.reduce((index, triple) => {
    const k = triple[idx];
    index[k] = index[k] || [];
    index[k].push(triple);
    return index;
  }, {});
}

// Sample queries
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
