\\ Copyright 2014, 2015, 2017 Kevin Ryde
\\
\\ memoize.gp is free software; you can redistribute it and/or modify it
\\ under the terms of the GNU General Public License as published by the Free
\\ Software Foundation; either version 3, or (at your option) any later
\\ version.
\\
\\ memoize.gp is distributed in the hope that it will be useful, but
\\ WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
\\ or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
\\ for more details.
\\
\\ You should have received a copy of the GNU General Public License along
\\ with memoize.gp  See the file COPYING.  If not, see
\\ <http://www.gnu.org/licenses/>.


\\ http://user42.tuxfamily.org/pari-memoize/index.html


\\ Usage: read("memoize.gp");
\\        foo(x,y,z) = some hairy code;
\\        foo = memoize(foo);      /* to memoize foo() */
\\
\\
\\ memoize(func) takes a function, ie. a closure, and returns a new function
\\ (ie. another closure) which is called the same but caches return values.
\\
\\ This is good for recursions or for slow calculations which will be
\\ re-used.
\\
\\ Function arguments can be any types.  The cache is a Map() and arguments
\\ are sought by key lookup there, or in GP 2.7 and earlier by a setsearch()
\\ in a list.  In both cases this means equality by the "universal" cmp()
\\ and so any integer, float, polynomial, vector, matrix, etc.
\\
\\
\\ ----------------------------------------------------------------------------
\\ Default Values
\\ 
\\     foo(x,y=x+1) = 10*x + y;
\\     foo = memoize(foo);
\\     foo(1)
\\     foo(1,2)
\\ 
\\ Default values in function arguments are evaluated in the usual way.
\\ The default value expressions can use other arguments and globals.
\\ 
\\ The defaulting is done by the memoize wrapper and the full arguments are
\\ then used for cache lookup and passed to the original function.
\\
\\ Passing the full arguments to the original function (when it's called)
\\ means the defaulting is not re-run.  This is the same as if the func was
\\ not memoized, which might be good if the defaulting has some global
\\ side-effects.
\\
\\ Using the full arguments for the cache means it is on actual values, no
\\ matter whether values result from defaulting or from explicit arguments
\\ in a call.
\\ 
\\ ----------------------------------------------------------------------------
\\ Zero Arguments
\\ 
\\     foo() = some hairy code;
\\     foo = memoize(foo);
\\ 
\\ For a zero-argument func, the first call to the memoized func calls the
\\ original.  Thereafter the value it returned is cached and it's not called
\\ again.  The code for the original is discarded too.
\\ 
\\ Memoizing a zero-argument function can "defer" calculation of a constant
\\ or one-off initialization which is slow or expensive and might be needed
\\ only sometimes.
\\
\\ When doing deferred initialization, a little care should be taken with
\\ the return value.  If it's accidentally some big intermediate value then
\\ that will be held as the memoized result.
\\ 
\\ ----------------------------------------------------------------------------
\\ Recursion
\\ 
\\     fib(n) = if(n<2,n, fib(n-1) + fib(n-2));
\\     fib = memoize(fib);
\\ 
\\ or in one expression
\\ 
\\     fib = memoize(n -> if(n<2,n, fib(n-1)+fib(n-2)));
\\ 
\\ When recursing be sure to store the memoize to the name recursed.  If
\\ the name recursed is not the memoized version then there's no speedup.
\\
\\ Memoizing allows a formula to be written out directly, helping to make
\\ the calculation clear to a human reader.  A faster or smaller form might
\\ be attempted later.  For example linear recurrences can be calculated by
\\ powers of a matrix, or just numbers depending on the roots, which is
\\ likely to run faster for medium to large inputs, depending perhaps how
\\ often the same values are re-used.
\\
\\ If a set of functions recurse mutually between each other then it might
\\ be necessary to memoize all of them.  If there's a cycle then it might be
\\ enough to memoize just one in the cycle to break the chain.
\\ 
\\ ----------------------------------------------------------------------------
\\ Errors
\\
\\ If the wrapped function throws an error instead of returning then that
\\ error propagates through the memoize in the usual way up to whatever
\\ outer error handling is in force.
\\
\\ Nothing is memoized when the wrapped function throws an error.  If the
\\ same arguments are presented again then the wrapped function is called
\\ again and presumably throws its error again.
\\
\\ This behaviour is simplest for the memoize wrapper and it suits cases
\\ where bad arguments are detected by the wrapped function early and
\\ without much work.
\\
\\ ----------------------------------------------------------------------------
\\ Creation by One Expression
\\
\\ A memoized function can be written in one expression by memoizing an
\\ anonymous function
\\ 
\\     foo = memoize(n -> some(); hairy(); code);
\\ 
\\     bar = {
\\       memoize((x,y,z) ->
\\               some(); hairy();
\\               code()
\\              );
\\     }
\\
\\ An advantage of this style is that the function name "foo" or "bar" is
\\ written only once.
\\
\\ The word "memoize" can be deleted to experiment with how much it does or
\\ doesn't helps speed or hurts memory use.  The parens around the anonymous
\\ function can be left.
\\
\\     foo = (n -> some(); hairy(); code);    \\ with "memoize" deleted
\\
\\ On the other hand an advantage of separate foo=memoize(foo) is that it
\\ can be applied to an existing function (perhaps from another file), or a
\\ function can be written in a usual foo(x)=... style and only afterwards
\\ consider memoizing it or not.
\\
\\ ----------------------------------------------------------------------------
\\ Aliasing
\\
\\ Memoization is within the closure returned, so if a memoized function is
\\ assigned to another variable then calls to either one of them are the
\\ memoized code.
\\
\\     foo(n) = some code;
\\     foo = memoize(foo);
\\     bar = foo;           \\ alias bar() is also the memoized func
\\
\\ Remember to make the alias after memoizing, otherwise "bar" will be the
\\ original unmemoized function.
\\     
\\ ----------------------------------------------------------------------------
\\ Help Text
\\ 
\\ addhelp() text is associated with a symbol and it remains even when the
\\ function assigned to that symbol changes.  So any memoize() redefinition
\\ of a function does not change the help display.
\\ 
\\ ----------------------------------------------------------------------------
\\ install()ed C Functions
\\
\\ Functions created by install() from gp2c or other C code cannot be
\\ memoized directly because their Str(foo) text doesn't show the number of
\\ arguments.  The current suggestion is to wrap a C func in a gp level
\\ function.
\\
\\     /* C_library_time__via_install() is the C level time() */
\\     install(time, "lf", "C_library_time__via_install");
\\
\\     C_library_time() = C_library_time__via_install();  /* GP wrapper */
\\     C_library_time = memoize(C_library_time);          /* then memoize */
\\
\\     /* or instead an anonymous function for a one-line memoize */
\\     C_library_time = memoize(()->C_library_time__via_install());
\\
\\ (gp internally knows the arguments needed, but circa its version 2.7.3
\\ don't think there's a documented interface to that.)
\\
\\ ----------------------------------------------------------------------------
\\ Variadic Functions
\\
\\ Variadic functions foo(v[..]) of gp 2.9 up can be memoized, including
\\ with initial fixed arguments and possible default values for such fixed
\\ arguments foo(a,b=2,c[..]).
\\
\\     foo(args[..]) = 2*vecsum(args);
\\     foo = memoize(foo);
\\     foo(1,2,3)
\\
\\ Passing a vector of things to a function is more usual GP style, but both
\\ work.  The memoized form has the same variadic nature as the orginal.
\\
\\ ----------------------------------------------------------------------------
\\ Other Limitations
\\
\\ Cached arguments and values are held forever.  If the memoized closure is
\\ discarded or replaced by redefining a function then the old cached data
\\ is not destroyed but remains forever unused by anything.
\\ 
\\ The argument names of the given func must not be names
\\ "memoize_INTERNAL_foo" etc used internally by memoize.gp.  This is since
\\ argument names from the original function are used in the new memoize
\\ wrapper and so are in the same scope as some memoize internals.
\\ 
\\ Original argument names are kept for the benefit of default value
\\ expressions so those expressions can refer to preceding parameters, and
\\ since keeping the names may help identify the function or its expected
\\ parameters when debugging etc.
\\ 
\\ Argument names are extracted from a func by a parse of its Str()
\\ stringized form.  The parse understands ":" type names (as used by gp2c)
\\ and default value expressions, including expressions with nested parens
\\ (), brackets [], and literal strings "", including backslash \\ escapes
\\ in strings.  This should suffice for gp syntax circa its version 2.9.  If
\\ some default value expression is misunderstood by memoize() then it may
\\ be necessary to simplify or to hide it in a function call.
\\
\\ memoize.gp cannot be compiled with gp2c circa its 0.0.9pl2 since gp2c
\\ doesn't enjoy the function-scoped lexicals used for constants.  Any
\\ advantage from compiling memoize.gp would probably be small.
\\
\\ In the implementation for GP 2.7, a ^C interrupt of a memoized function
\\ might come in between the listinsert()s of args and value.  If that
\\ happens the tables will be inconsistent and the memoized function
\\ unusable.  Normally this only happens interactively, and interrupting
\\ tends to be unusual.  The suggestion is to reload the code of affected
\\ memoized functions.  The GP 2.9 implementation using Map() ought to be
\\ safe to ^C.
\\
\\
\\----------------------------------------------------------------------------
\\ See also:
\\
\\ http://oeis.org/wiki/Memoization
\\   On memoization in various maths systems and programming languages.


\\----------------------------------------------------------------------------
\\ Version 1 - the first version.
\\ Version 2 - better error message for install()ed functions.
\\ Version 3 - don't break existing funcs if memoize.gp loaded a second time.
\\ Version 4 - variadic functions.
\\ Version 5 - use Map() when available.


\\----------------------------------------------------------------------------

\\ memoize_INTERNAL_any_comma(str) returns true if string str contains any
\\ comma character ","
{
  my(comma = Vecsmall(",")[1]);
memoize_INTERNAL_any_comma(str) =
  my(v = Vecsmall(str));
  for(i=1,#v, if(v[i]==comma, return(1)));
  0;
}

\\ memoize_INTERNAL_func_is_zero_args(func) returns true if func takes no
\\ arguments at all, ie. is like foo()
{
my(close_paren = Vecsmall(")")[1]);
memoize_INTERNAL_func_is_zero_args(func) =
  if(type(func)!= "t_CLOSURE", error("not a function"));
  my(v = Vecsmall(Str(func)));
  #v >= 2 && v[2] == close_paren;
}

\\ memoize_INTERNAL_func_args(func) returns a vector of two strings
\\     [ argnames, args_full ]
\\ argnames is just the names, args_full includes default value
\\ expressions.  For example
\\
\\     foo(x,y=2*(x+1)) = 3*x+4*y;
\\     memoize_INTERNAL_func_args(foo)
\\     =>
\\     ["x,y", "x,y=2*(x+1)"]
{
my (open_paren       = Vecsmall("(")[1],
    open_set         = Set(Vecsmall("([")),  /* open parens */
    close_set        = Set(Vecsmall(")]")),  /* close parens */
    open_bracket     = Vecsmall("[")[1],
    comma            = Vecsmall(",")[1],
    colon_equals_set = Set(Vecsmall(":=")),
    doublequote      = Vecsmall("\"")[1],
    backslash        = Vecsmall("\\")[1]);
memoize_INTERNAL_func_args(func) =
  if(type(func)!= "t_CLOSURE", error("not a function"));
  my(v = Vecsmall(Str(func)));

  \\ an install()ed function has Str(foo)=="foo", rather than "(x,y)->code"
  if(! (#v >= 2 && v[1] == open_paren),
     error("cannot memoize an install()ed function (put a gp wrapper around it)"));

  my(ret         = List(),
     in_name     = 1,
     in_string   = 0,
     parens      = 0,
     is_variadic = 0);
  for(i=2, #v,
     my(ch = v[i]);
     \\ print("i=",i," in_name=",in_name,"  in_string=",in_string, "  ",Strchr(ch),"   is_variadic ",is_variadic);
     if(in_string,
        if(ch==doublequote, in_string=0,  \\ end of string
           ch==backslash,   i++);         \\ skip next char
        next);
     if(ch==doublequote,         in_string=1; next());
     if(in_name && ch==open_bracket, is_variadic=1);
     if(setsearch(open_set, ch), parens++;    next());
     if(setsearch(close_set, ch),
        parens--;
        if(parens<0, return([Strchr(Vecsmall(ret)),
                             if(i==2,"",Strchr(v[2..i-1])),
                             is_variadic]));
        next());
     if(parens>0, next());  \\ skip everything inside nested parens

     if(ch==comma,                       in_name=1,
        setsearch(colon_equals_set, ch), in_name=0);
     if(in_name, listput(ret,ch)));

  error("memoize_INTERNAL_func_args() oops, no closing paren");
}


{
if(type(mapisdefined)!="t_CLOSURE",

\\----------------------------------------------------------------------------
\\ GP 2.7, using lists

\\ memoize_INTERNAL_args   = List [ ... ]
\\ memoize_INTERNAL_values = List [ ... ]
\\ Each memoized function has an index m into the two lists
\\
\\ For func(n) of 1 or more argument, element m in both are further lists
\\     memoize_INTERNAL_args[m]   = list( arg,   arg,   ...)
\\     memoize_INTERNAL_values[m] = list( value, value, ...)
\\ Each entry in memoized_args[m] is a cached argument value of func.
\\ For 1 argument func(x) each args entry is the argument x.
\\ For 2 or more arguments each args entry is a vector [x,y,...].
\\ The corresponding entry in list memoized_values[m] is cached value
\\ func(args).
\\ memoize_INTERNAL_args[m] is kept sorted ready for setsearch().
\\ When a new func(arg) call is encountered the arg and value are inserted
\\ into the lists at the place setsearch() says.
\\
\\ For func() of 0 arguments (ie. only ever 0 arguments)
\\     memoize_INTERNAL_args[m]   = func or 0
\\     memoize_INTERNAL_values[m] = value
\\ If func has not been called yet then memoize_INTERNAL_args[m] is func.
\\ If func has been called then memoize_INTERNAL_args[m] is 0 and
\\ memoize_INTERNAL_values[m] is the value which func() returned.
\\

\\ if not already initialized
if(memoize_INTERNAL_args=='memoize_INTERNAL_args,
   memoize_INTERNAL_args   = List([]);     \\ list of lists
   memoize_INTERNAL_values = List([]));    \\ vector of lists


\\ memoize_INTERNAL_call0(m) makes a memoized call to a zero-argument function
\\ at index m.
\\ The original func is in memoize_INTERNAL_args[m] if it has not yet been
\\ called.
memoize_INTERNAL_call0 = ((m)->
  if(memoize_INTERNAL_args[m],
     memoize_INTERNAL_values[m] = memoize_INTERNAL_args[m](); \\ call and record
     memoize_INTERNAL_args[m]=0);
  memoize_INTERNAL_values[m]
);

\\ memoize_INTERNAL_make0(m) returns a 0-argument function calling
\\ memoize_INTERNAL_call0(m).
\\ This is a function-creating function so as not to capture lexicals in the
\\ new function (other than the index m), in particular not capture the
\\ original memoize_INTERNAL_func.
memoize_INTERNAL_make0 = ((m)-> ()->memoize_INTERNAL_call0(m));

\\ key is either a single argument or a vector of arguments
memoize_INTERNAL_store = ((m, key,value)->
  my(pos = setsearch(memoize_INTERNAL_args[m],key,1));
  listinsert(memoize_INTERNAL_args[m], key, pos);
  listinsert(memoize_INTERNAL_values[m], value, pos);
  value
);

\\ Return a string which is a memoized version of func.
\\ func is the original function.  Argument names etc are extracted from it.
\\ The returned string expects the original func to be to available as
\\ a lexical memoize_INTERNAL_func.
memoize_INTERNAL_make = ((func)->
  my(m         = #memoize_INTERNAL_args,
     args      = memoize_INTERNAL_func_args(func),
     argnames  = args[1],
     args_full = args[2],
     key_str   = if(memoize_INTERNAL_any_comma(argnames),
                    Str("[",argnames,"]"), \\ 2 or more args
                    argnames),             \\ 1 arg
     call_str  = Strprintf(if(args[3],
                              "call(memoize_INTERNAL_func,[%s])",
                              "memoize_INTERNAL_func(%s)"),
                           argnames));
  Strprintf("(%s)->my(memoize_INTERNAL_pos=setsearch(memoize_INTERNAL_args[%d],%s)); if(memoize_INTERNAL_pos, memoize_INTERNAL_values[%d][memoize_INTERNAL_pos], memoize_INTERNAL_store(%d,%s,%s))",
            args_full,
            m, key_str,
            m,
            m, key_str, call_str)
);

\\ Parameter name is "memoize_INTERNAL_func" so as not to clash with any
\\ arguments in that function.
memoize = ((memoize_INTERNAL_func)->
  if(memoize_INTERNAL_func_is_zero_args(memoize_INTERNAL_func),
     \\ 0 args
     listput(memoize_INTERNAL_args,   memoize_INTERNAL_func);
     listput(memoize_INTERNAL_values, 0);
     memoize_INTERNAL_make0(#memoize_INTERNAL_args),

     \\ 1 or more args
     listput(memoize_INTERNAL_args,   List());
     listput(memoize_INTERNAL_values, List());
     eval(memoize_INTERNAL_make(memoize_INTERNAL_func)))
)

,
\\----------------------------------------------------------------------------
\\ GP 2.9 up, using Map()

\\ memoize_INTERNAL_maps  = List
\\ Each memoized function has an index m into the maps list.
\\
\\ For func(n) of 1 or more argument, memoize_INTERNAL_maps[m] is
\\     Map args -> value
\\ For 1 argument func(x), the key is the argument x.
\\ For 2 or more arguments func(x,y), the key is a vector [x,y,...] of args.
\\ The map value is the cached return value func(args).
\\
\\ For func() of 0 arguments (only ever 0 arguments), memoize_INTERNAL_maps[m]
\\ is   [ func or 0, value]
\\ If func has not been called yet then v[1] is func.
\\ If func has been called then v[1] is 0 and v[2] is the value which func()
\\ returned.
\\

\\ if not already initialized
if(memoize_INTERNAL_maps=='memoize_INTERNAL_maps,
   memoize_INTERNAL_maps = List([]));    \\ list of maps (or vectors)

\\ memoize_INTERNAL_call0(m) makes a memoized call to a zero-argument function
\\ at index m.
\\ The original func is in memoize_INTERNAL_map[m][1] if it has not yet been
\\ called.
memoize_INTERNAL_call0 = ((m)->
  if(memoize_INTERNAL_maps[m][1],
     \\ call and record
     memoize_INTERNAL_maps[m][2] = memoize_INTERNAL_maps[m][1]();
     memoize_INTERNAL_maps[m][1]=0);
  memoize_INTERNAL_maps[m][2]
);

\\ memoize_INTERNAL_make0(m) returns a 0-argument function calling
\\ memoize_INTERNAL_call0(m).
\\ This is a function-creating function so as not to capture lexicals in the
\\ new function (other than the index m needed when called), in particular
\\ not capture the original memoize_INTERNAL_func.
memoize_INTERNAL_make0 = ((m)-> ()->memoize_INTERNAL_call0(m));

\\ key is either a single argument or a vector of arguments
memoize_INTERNAL_store = ((m, key,value)->
  mapput(memoize_INTERNAL_maps[m],key,value);
  value
);

\\ Return a string which is a memoized version of func.
\\ func is the original function.  Argument names etc are extracted from it.
\\ The returned string expects the original func to be to available as
\\ a lexical memoize_INTERNAL_func.
memoize_INTERNAL_make = ((func)->
  my(m         = #memoize_INTERNAL_maps,
     args      = memoize_INTERNAL_func_args(func),
     argnames  = args[1],
     args_full = args[2],
     key_str   = if(memoize_INTERNAL_any_comma(argnames),
                    Str("[",argnames,"]"), \\ 2 or more args
                    argnames),             \\ 1 arg
     call_str  = Strprintf(if(args[3],
                              "call(memoize_INTERNAL_func,[%s])",
                              "memoize_INTERNAL_func(%s)"),
                           argnames));
  Strprintf("(%s)->my(memoize_INTERNAL_value);if(!mapisdefined(memoize_INTERNAL_maps[%d],%s,&memoize_INTERNAL_value), mapput(memoize_INTERNAL_maps[%d],%s,memoize_INTERNAL_value=%s)); memoize_INTERNAL_value",
            args_full,
            m, key_str,            \\ mapisdefined
            m, key_str, call_str)  \\ store
);

\\ Parameter name is "memoize_INTERNAL_func" so as not to clash with any
\\ arguments in that function.
memoize = ((memoize_INTERNAL_func)->
  if(memoize_INTERNAL_func_is_zero_args(memoize_INTERNAL_func),
     \\ 0 args
     listput(memoize_INTERNAL_maps, [memoize_INTERNAL_func,0]);
     memoize_INTERNAL_make0(#memoize_INTERNAL_maps),

     \\ 1 or more args
     listput(memoize_INTERNAL_maps, Map());
     eval(memoize_INTERNAL_make(memoize_INTERNAL_func)))

)

);
}

\\----------------------------------------------------------------------------
\\ documentation

{
addhelp(memoize,
"func = memoize(func)
Return a memoized version of function func.

func should be a function (a closure).  It can take any number of arguments,
including arguments with default values.  The return is likewise a function
(a closure).

    foo(x) = some hairy code;
    foo = memoize(foo);

or in a single expression if preferred

    foo=memoize((x,y) -> some hairy code using x and y);

See comments at the start of memoize.gp for more details.");
}
