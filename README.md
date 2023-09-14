
## Datalog-JS

This project provides a mechanism to match patterns against triples using a given context, primarily used in semantic web applications. It efficiently handles variable bindings, ensuring accurate matches and updating the context with new bindings as necessary.

---

### Pseudo Algorithm

```sql
Function matchPattern(pattern, triple, context):
    // Iterate over each part of the pattern
    For each patternPart in pattern:
        // Get the corresponding part from the triple
        Get corresponding triplePart from triple
        // Update the context by matching the pattern part with the triple part
        Update context using matchPart(patternPart, triplePart, context)
    // Return the updated context after matching all parts
    Return updated context

Function matchPart(patternPart, triplePart, context):
    // If the current context is null, return null
    If context is null:
        Return null
    // If the pattern part is a variable, match it with the triple part
    If patternPart is a variable:
        Update context using matchVariable(patternPart, triplePart, context)
    // If the pattern part and triple part are equal, return the current context
    Else if patternPart equals triplePart:
        Return context
    // If the pattern part and triple part dont match, return null
    Else:
        Return null
Function isVariable(x):
    // Check if x is a string and starts with '?'
    If x is a string and starts with '?':
        Return true
    // If x is not a variable, return false
    Else:
        Return false

Function matchVariable(variable, triplePart, context):
    // Check if the variable is already bound in the context
    If variable is already bound in context:
        // Get the value bound to the variable in the context
        Get the bound value from context
        // Match the bound value with the triple part and update the context
        Update context using matchPart(bound value, triplePart, context)
    // If the variable is not bound in the context, bind it to the triple part
    Else:
        Add variable to context with value as triplePart
        // Return the updated context with the new binding
        Return updated context

```