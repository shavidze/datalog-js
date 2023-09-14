
## Datalog-JS

This project provides a mechanism to match patterns against triples using a given context, primarily used in semantic web applications. It efficiently handles variable bindings, ensuring accurate matches and updating the context with new bindings as necessary.

---

### Pseudo Algorithm

```sql
 Function matchPattern(pattern, triple, context):
    For each patternPart in pattern:
        Get corresponding triplePart from triple
        Update context using matchPart(patternPart, triplePart, context)
    Return updated context

Function matchPart(patternPart, triplePart, context):
    If context is null:
        Return null
    If isVariable(patternPart):
        Return matchVariable(patternPart, triplePart, context)
    If patternPart equals triplePart:
        Return context
    Return null

Function isVariable(x):
    If x is a string and starts with '?':
        Return true
    Return false

Function matchVariable(variable, triplePart, context):
    If variable exists in context:
        Get bound value from context
        Return matchPart(bound value, triplePart, context)
    Add variable to context with value as triplePart
    Return updated context

Function querySingle(pattern, db, context):
    Initialize results as empty list
    For each triple in db:
        MatchedContext = matchPattern(pattern, triple, context)
        If MatchedContext is not null:
            Add MatchedContext to results
    Return results

Function queryWhere(patterns, db):
    Initialize contexts as a list with an empty object
    For each pattern in patterns:
        Update contexts using querySingle(pattern, db, context)
    Return contexts

Function query(queryObj, db):
    contexts = queryWhere(queryObj.where, db)
    Return map of contexts using actualize(context, queryObj.find)

Function actualize(context, find):
    Initialize results as empty list
    For each findPart in find:
        If isVariable(findPart):
            Add context value of findPart to results
        Else:
            Add findPart to results
    Return results

```