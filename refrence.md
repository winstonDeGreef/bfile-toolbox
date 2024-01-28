# Introduction
This documentation is split into different sections for each header in the extension.

# Import / Export
This allows you to import and export settings from the extension.

# Code

## Language
The programming language that the code is written in. Currently, the only supported language is `PARI`.

## Code
Here, you should put a function that calculates the sequence. This function will be called according to the type dropdown.


### automatic type detection
Bfile toolbox tries to automatically assign the type based on the code. If it finds a function on the first line with one of the following names:
 - `a` becomes explicit
 - `lista` and `vector_a` become list
 - `isok` becomes check
 - `T` becomes table/triangle explicit

In the code textarea, if the first line starts with `(LANG)` and said `LANG` is recognized by the extension, this will automatically set the language to `LANG` and remove `(LANG)`. `LANG` is case insensitive.

## Type
There are four types of functions currently supported:
 - explicit: here, the function is called with a single argument, the index of the sequence to calculate. Example: `a(n)=n^2+1`
 - List: here, the function is called with a single argument, the amount of values the function should calculate. The function then returns a list of values. Example: `lista(nn)=my(v=vector(nn)); v[1] = 0; v[2] = 1; for(n=3, nn, v[n] = v[n-1] + v[n-2]); v`
 - check: here, the function is called with a single argument. The function should return true (or truthy) value if the argument is in the sequence and false (or falsy) value if the argument is not in the sequence. Example: `isok(n)=my(d=digits(n)); vecsum(d)==factorback(d)`
 - Table/Triangle explicit: here, the function is called with two arguments, the row and column of the sequence to calculate. Example: `a(n,k)=binomial(n,k)`

## main function
This is the function that is called to calculate the sequence. If your code looks like:
```
helper(a, b) = digits(a)*digits(b)~
f(n)=helper(n, n+1)
```
Then you should set the main function to `f` and type to explicit.
If the name of your main function is one of ones mentioned at [automatic type detection](#automatic-type-detection), then the type will be set automatically.

# Limit Output Length
The oeis has set some limits on the size of bfiles. Bfile toolbox will automatically stop calculating terms when these limits have been reached. If you want to change these limits, you can do so here.

## Max Line length
The maximum length of a line in the bfile. This is the maximum amount of characters that can be on a single line in the bfile.

## Max Size Type
When working with tables/triangles, its helpful to define the limit of the amount of terms as an amount of rows/antidiagonals. In this dropdown you can select the type of limit you want to use. The options are:
 - index: limit the last index to the value in max index.
 - rows/antidiagonals: limit the amount of rows/antidiagonals to the value in Max antidiagonal/row count.

# Import bfiles
If you reference a bfile in the code textarea, it will automatically be imported. In this section you can exclude these bfiles from being imported and can import other ones.

# List Settings
If the type is set to list, you can set a setting here that are specific to the list function type.

## Length guess algorithm
When using the list function type, bfile toolbox doesn't want to calculate too many terms, because that wastes compute, but too little will require the function to be called again with a larger value. This setting allows you to set the algorithm that is used to guess the amount of terms that should be calculated. Currently available:
 - Linear: starts at start guess and increments by increment every time.
 - custom: allows you to put in custom guesses, one per line

# Table/Triangle Settings
If the type is set to list, you can set some settings here that are specific to the Table/Triangle explicit function type.

## Is it a ...?
You can choose between:
 - table: this will make the bfile flattened by antidiagonals
 - triangle: this will make the bfile flattened by rows

## Upward antidiagonal
If the type is set to table, you can choose whether the bfile should be flattened by upward or downward antidiagonals.

## start x
The starting offset for the first argument of the main function.

## start y
The starting offset for the second argument of the main function.

# Pari
If the language is set to PARI, you can set some settings here that are specific to the PARI language.

## include memoize.gp
[memoize.gp](https://user42.tuxfamily.org/pari-memoize/index.html) is a pari library that implements a memoize function. Checking this will load the library making it possible to uze the memoize function in your code.

## pari size max
This sets the value for the pari default parisizemax. See [pari documentation](https://pari.math.u-bordeaux.fr/dochtml/html-stable/GP_defaults.html#parisizemax) for more information.

## pari size
This sets the value for the pari default parizise. See [pari documentation](https://pari.math.u-bordeaux.fr/dochtml/html-stable/GP_defaults.html#parisize) for more information.

You probably shouldn't be setting this, because pari will automatically allocate more ram if it needs it, limited by parisizemax.

# Generated code
This shows the code that is generated by the extension. If include memoize.gp is enabled, this shows the code without the memoize function included. In that case a button will appear to view the full code in a new tab.

# Run
Here you set the server to run the code on and can run the code.

## Server
The server to run the code on. This is most likely your local machine. Whenever you run the start command, the server will log the following to stdout:

```Listening on http://localhost:<number>/```

Put the entire link, including http:// in the server input.

## Run
This will run the code.

# Status
Here you can see information about how many terms have been calculated.

# stop button
This will stop the code. If it's taking too long to calculate terms until the limits in [Limit output length](#limit-output-length) have been reached, you can press this button to stop the code. If you don't press this button, the code will stop automatically when the limits have been reached.

## general tab
Depending on the function type, different information will be shown here.

### explicit
The following information will be shown:
 - results calculated: the amount of terms that have been calculated, total
 - max result length: the length of the longest line calculated up to now.
 - current result length: the length of the last line that has been calculated
 - sequential results calculated: the amount of terms that have been calculated sequentially, total. This is the same as results calculated. In the future, when explicit parallel is implemented, this might be different to results calculated.

### list
The following information will be shown:
 - results calculated: the amount of terms that have been calculated, total
 - max result length: the length of the longest line calculated up to now.

### check
The following information will be shown:
 - check results calculated: the amount of terms in the sequence that have been found
 - checked up to: the last `n` that has been checked

### Table/Triangle explicit
same as explicit.

## stdout tab
This shows the stdout of the program.

## stderr tab
This shows the stderr of the program.

# Output
Here you can configure the bfile that is generated based on the calculated terms.

## truncate
Use this to truncate the amount of terms in the bfile. This is useful if you decide to stop the code manually, and want to round the last index in the bfile to a nice number.

## Include header with information about oeis toolbox
This will include a header in the bfile with information about the bfile toolbox extension. Including this has three benefits.
1. It makes it significantly easier for other people to use the same code as you did to generate the bfile. This also makes it possible to reproduce the bfile.
2. If there is ever a bug in the bfile toolbox extension, this makes it possible to track down all the bfiles that might have been affected by said bug.
3. It spreads the word about the bfile toolbox extension. Other people will probably also find the extension helpful.

## regenerate bfile
If you made some change to how the bfile is generated based on the calculated terms, use this to regenerate the bfile.

## open in new tab
This will open the bfile in a new tab.

## edit bfile directly
This makes the textarea that contains the generated bfile editable. After making changes, you need to press the save button to save the changes to the bfile that is automatically attached to the form.

