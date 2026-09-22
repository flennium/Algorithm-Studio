# Algorithm Studio language 1.0

Algorithm Studio implements a stable French teaching-pseudocode dialect. Pseudocode has no universal grammar; universities agree on concepts while choosing different spellings. Version 1.0 therefore defines an explicit, executable procedural core instead of claiming to reproduce every local notation.

## Program organization

```algorithm
Algorithme Exemple
Constantes
    MAX = 30
Variables
    notes : Tableau[1..MAX] de Reel

Fonction EstAdmis(note : Reel) : Booleen
Debut
    Retourner note >= 10
FinFonction

Debut
    notes[1] <- 14.5
    Si EstAdmis(notes[1]) Alors
        Ecrire("Admis")
    FinSi
Fin
```

Sections must appear in this order: `Constantes`, global `Variables`, functions/procedures, then the main `Debut`/`Fin` block. Empty optional sections are omitted. Keywords are case-insensitive. Common accented and unaccented variants are accepted. `//` starts a line comment outside a string.

## Data

| Type | Values | Initial value |
|---|---|---|
| `Entier` | whole numbers | `0` |
| `Reel` | decimal or whole numbers | `0` |
| `Chaine` | text in double quotes | `""` |
| `Caractere` | exactly one character | `""` |
| `Booleen` | `Vrai`, `Faux` | `Faux` |

Assignment uses `<-`. Constants use `=` or `<-` and cannot be reassigned.

Arrays declare inclusive bounds. Several bounds create a matrix or higher-dimensional array:

```algorithm
valeurs : Tableau[1..10] de Entier
grille : Tableau[0..2, 0..2] de Booleen

valeurs[1] <- 42
grille[1, 2] <- Vrai
```

## Expressions

Precedence from highest to lowest:

1. Parentheses and calls/indexing
2. Unary `+`, `-`, `NON`
3. `*`, `/`, `DIV`, `MOD`
4. `+`, `-`
5. `=`, `<>`, `!=`, `<`, `<=`, `>`, `>=`
6. `ET`
7. `OU`

`DIV` is truncated integer division and `MOD` is the remainder. `+` concatenates when either operand is text.

Standard functions are `Longueur`, `Majuscule`, `Minuscule`, `Abs`, `Racine`, `Arrondi`, `Min`, and `Max`.

## Input and output

```algorithm
Lire(nom, age)
Ecrire(nom, " a ", age, " ans")
```

`Lire` requests values in order and validates them against the target type. Both desktop and web versions present the same input flow. `Ecrire` renders its arguments on one line.

## Selection and iteration

```algorithm
Si note >= 16 Alors
    Ecrire("Très bien")
Sinon Si note >= 10 Alors
    Ecrire("Admis")
Sinon
    Ecrire("Ajourné")
FinSi

Pour i <- 10 A 0 Pas -1 Faire
    Ecrire(i)
FinPour

TantQue actif Faire
    actif <- Faux
FinTantQue

Repeter
    compteur <- compteur + 1
JusquA compteur = 10
```

The runtime stops after 100,000 executed statements to diagnose likely infinite loops.

## Functions, procedures, and recursion

Parameters are typed and separated by semicolons. They are passed by value. Each call receives an isolated local scope.

```algorithm
Fonction Factorielle(n : Entier) : Entier
Debut
    Si n <= 1 Alors
        Retourner 1
    Sinon
        Retourner n * Factorielle(n - 1)
    FinSi
FinFonction

Procedure RepeterTexte(texte : Chaine; fois : Entier)
Variables
    i : Entier
Debut
    Pour i <- 1 A fois Faire
        Ecrire(texte)
    FinPour
FinProcedure
```

A function must return a value compatible with its announced type. A procedure is called as an instruction and does not return a value.

## Diagnostics

- `ALG-P…`: program structure or syntax;
- `ALG-S…`: declarations, types, calls, and semantic rules;
- `ALG-R…`: execution failures such as division by zero, invalid indexes, or runaway loops.

Every diagnostic includes a source line. The editor places the same diagnostic directly on the affected code.

## Version 1.0 boundary

The stable core covers scalar values, constants, Unicode identifiers, arrays and matrices, typed input/output, expressions, decisions, all three standard loop forms, functions, procedures, local scope, return values, and recursion.

Records, pointers, file systems, linked structures, graphics, and object orientation are not universal pseudocode primitives. They require platform-specific object models and are intentionally outside the portable 1.0 core rather than being partially implemented.

## Academic basis

The curriculum boundary was derived from introductory material at [Université Lyon 1](https://perso.univ-lyon1.fr/elodie.desseree/LIFAPI/CM.html), which progresses through functions/procedures, parameter passing, arrays, strings, structures, and files; [Université de Lille](https://culturenumerique.univ-lille.fr/module4/media/texte_final.pdf), which separates control and data structures; and [Universitat Politècnica de Catalunya](https://www.cs.upc.edu/~jordicf/Teaching/programming/), which covers loops, scope, subprograms, recursion, vectors, multidimensional vectors, and structures. The syntax above is Algorithm Studio's documented dialect; the curriculum sources establish coverage, not a universal grammar.
