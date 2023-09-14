
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
    If patternPart is a variable:
        Update context using matchVariable(patternPart, triplePart, context)
    Else if patternPart equals triplePart:
        Return context
    Else:
        Return null

Function isVariable(x):
    If x is a string and starts with '?':
        Return true
    Else:
        Return false

Function matchVariable(variable, triplePart, context):
    If variable is already bound in context:
        Get the bound value from context
        Update context using matchPart(bound value, triplePart, context)
    Else:
        Add variable to context with value as triplePart
        Return updated context
```