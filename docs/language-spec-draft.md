# Algorithm language specification — draft 0

> Status: provisional. This document records a coherent starting dialect, not
> a claim about the exact university language. Real course material is the
> authority.

## 1. Draft lexical rules

- Source is Unicode text.
- Keywords are proposed to be case-insensitive.
- Identifiers preserve their original spelling.
- Spaces, tabs, and line endings separate tokens but are otherwise insignificant.
- A line comment begins with `//`.
- Integer literals use decimal digits.
- Real literals use `.` as the decimal separator in source code.
- Strings are enclosed in double quotes.
- Assignment is written `<-`; the Unicode arrow `←` may later be an editor
  convenience but should not be saved automatically.

## 2. Draft program structure

```algorithm
Algorithme NomDuProgramme

Constantes
    MAX <- 100

Variables
    compteur : Entier
    total : Reel

Debut
    // Instructions
Fin
```

`Constantes` and `Variables` are optional sections in this draft.

## 3. Draft scalar types

| Type | Example |
|---|---|
| `Entier` | `42` |
| `Reel` | `3.14` |
| `Booleen` | `Vrai`, `Faux` |
| `Caractere` | Not yet decided |
| `Chaine` | `"Bonjour"` |

Character literal syntax and implicit numeric conversions remain open.

## 4. Draft operators

From highest to lowest proposed precedence:

1. grouping with parentheses;
2. unary `NON`, unary `-`, unary `+`;
3. `*`, `/`, `DIV`, `MOD`;
4. `+`, `-`;
5. `=`, `<>`, `<`, `<=`, `>`, `>=`;
6. `ET`;
7. `OU`.

Logical operators require Boolean operands. The meaning of `/` for two integers
and the permitted implicit conversions must be confirmed.

## 5. Draft statements

### Assignment

```algorithm
total <- prix * quantite
```

### Input and output

```algorithm
Lire(nom)
Ecrire("Bonjour ", nom)
```

### Condition

```algorithm
Si note >= 10 Alors
    Ecrire("Admis")
Sinon
    Ecrire("Ajourne")
FinSi
```

### Counted loop

```algorithm
Pour i <- 1 A 10 Faire
    Ecrire(i)
FinPour
```

### While loop

```algorithm
TantQue valeur < 10 Faire
    valeur <- valeur + 1
FinTantQue
```

## 6. Deferred grammar

The following constructs will be specified after authentic examples are
available:

- `SinonSi` and selection statements;
- repeat/until loops;
- arrays and matrices;
- procedures, functions, scopes, and parameter modes;
- records or user-defined types;
- graphics instructions.

## 7. Diagnostic style

Diagnostics use the course vocabulary and explain the recovery action.

Preferred:

```text
ALG-P102  `Alors` attendu après la condition.  Ligne 8, colonne 17.
           Ajoutez `Alors` avant les instructions du bloc.
```

Avoid vague messages such as `Syntax error` or exposing internal parser terms to
students.

