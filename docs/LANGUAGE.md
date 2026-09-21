# Algorithm language reference

This document describes the syntax accepted by the current interpreter. It is
not a universal definition of pseudocode: universities use different dialects,
and the project will refine this one using real course material.

## Program structure

```algorithm
Algorithme Addition
Variables
    a, b, resultat : Entier
Debut
    a <- 12
    b <- 8
    resultat <- a + b
    Ecrire("Resultat : ", resultat)
Fin
```

A program starts with `Algorithme` and a name. Declarations come before
`Debut`. Executable instructions sit between `Debut` and `Fin`.

Keywords are case-insensitive. Accented forms such as `Début`, `Écrire`,
`Réel`, and `Chaîne` are accepted alongside their unaccented forms.

## Values and variables

The available scalar types are:

| Type | Purpose | Example |
|---|---|---|
| `Entier` | Whole numbers | `42` |
| `Reel` | Decimal numbers | `3.14` |
| `Chaine` | Text | `"Bonjour"` |

Declare one or several variables on a line:

```algorithm
age : Entier
prix, total : Reel
nom : Chaine
```

Use `<-` to assign a value:

```algorithm
age <- 20
total <- prix * 3
```

Using an undeclared variable is an error.

## Expressions

The interpreter supports `+`, `-`, `*`, and `/`. Multiplication and division
run before addition and subtraction. Parentheses make the intended order clear.

```algorithm
resultat <- (2 + 3) * 4
```

The `+` operator can also join text values. Division by zero is an error.

## Output

`Ecrire` prints its comma-separated arguments on one line:

```algorithm
Ecrire("Total : ", total)
```

## Comments

Text after `//` is ignored until the end of the line:

```algorithm
total <- prix * quantite // Calcul du prix final
```

## Current limits

The following syntax is planned but not implemented yet:

- `Lire` and interactive input;
- comparisons and Boolean values;
- `Si`, `Sinon`, and `FinSi`;
- `Pour`, `TantQue`, and repeat loops;
- arrays and matrices;
- procedures and functions;
- drawing instructions.

The editor may already highlight some planned keywords. Highlighting does not
mean that the interpreter can execute them.
