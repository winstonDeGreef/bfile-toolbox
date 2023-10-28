{
  my(comma = Vecsmall(",")[1]);
memoize_INTERNAL_any_comma(str) =
  my(v = Vecsmall(str));
  for(i=1,#v, if(v[i]==comma, return(1)));
  0;
}

{
my(close_paren = Vecsmall(")")[1]);
memoize_INTERNAL_func_is_zero_args(func) =
  if(type(func)!= "t_CLOSURE", error("not a function"));
  my(v = Vecsmall(Str(func)));
  #v >= 2 && v[2] == close_paren;
}

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

  if(! (#v >= 2 && v[1] == open_paren),
     error("cannot memoize an install()ed function (put a gp wrapper around it)"));

  my(ret         = List(),
     in_name     = 1,
     in_string   = 0,
     parens      = 0,
     is_variadic = 0);
  for(i=2, #v,
     my(ch = v[i]);
     if(in_string,
        if(ch==doublequote, in_string=0,  
           ch==backslash,   i++);         
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
     if(parens>0, next());

     if(ch==comma,                       in_name=1,
        setsearch(colon_equals_set, ch), in_name=0);
     if(in_name, listput(ret,ch)));

  error("memoize_INTERNAL_func_args() oops, no closing paren");
}


{
if(type(mapisdefined)!="t_CLOSURE",

if(memoize_INTERNAL_args=='memoize_INTERNAL_args,
   memoize_INTERNAL_args   = List([]);     
   memoize_INTERNAL_values = List([]));    


memoize_INTERNAL_call0 = ((m)->
  if(memoize_INTERNAL_args[m],
     memoize_INTERNAL_values[m] = memoize_INTERNAL_args[m](); \\ call and record
     memoize_INTERNAL_args[m]=0);
  memoize_INTERNAL_values[m]
);

memoize_INTERNAL_make0 = ((m)-> ()->memoize_INTERNAL_call0(m));

memoize_INTERNAL_store = ((m, key,value)->
  my(pos = setsearch(memoize_INTERNAL_args[m],key,1));
  listinsert(memoize_INTERNAL_args[m], key, pos);
  listinsert(memoize_INTERNAL_values[m], value, pos);
  value
);

memoize_INTERNAL_make = ((func)->
  my(m         = #memoize_INTERNAL_args,
     args      = memoize_INTERNAL_func_args(func),
     argnames  = args[1],
     args_full = args[2],
     key_str   = if(memoize_INTERNAL_any_comma(argnames),
                    Str("[",argnames,"]"),
                    argnames),
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

memoize = ((memoize_INTERNAL_func)->
  if(memoize_INTERNAL_func_is_zero_args(memoize_INTERNAL_func),
     listput(memoize_INTERNAL_args,   memoize_INTERNAL_func);
     listput(memoize_INTERNAL_values, 0);
     memoize_INTERNAL_make0(#memoize_INTERNAL_args),

     listput(memoize_INTERNAL_args,   List());
     listput(memoize_INTERNAL_values, List());
     eval(memoize_INTERNAL_make(memoize_INTERNAL_func)))
)

,
if(memoize_INTERNAL_maps=='memoize_INTERNAL_maps,
   memoize_INTERNAL_maps = List([]));
memoize_INTERNAL_call0 = ((m)->
  if(memoize_INTERNAL_maps[m][1],
     memoize_INTERNAL_maps[m][2] = memoize_INTERNAL_maps[m][1]();
     memoize_INTERNAL_maps[m][1]=0);
  memoize_INTERNAL_maps[m][2]
);

memoize_INTERNAL_make0 = ((m)-> ()->memoize_INTERNAL_call0(m));

memoize_INTERNAL_store = ((m, key,value)->
  mapput(memoize_INTERNAL_maps[m],key,value);
  value
);

memoize_INTERNAL_make = ((func)->
  my(m         = #memoize_INTERNAL_maps,
     args      = memoize_INTERNAL_func_args(func),
     argnames  = args[1],
     args_full = args[2],
     key_str   = if(memoize_INTERNAL_any_comma(argnames),
                    Str("[",argnames,"]"),
                    argnames),
     call_str  = Strprintf(if(args[3],
                              "call(memoize_INTERNAL_func,[%s])",
                              "memoize_INTERNAL_func(%s)"),
                           argnames));
  Strprintf("(%s)->my(memoize_INTERNAL_value);if(!mapisdefined(memoize_INTERNAL_maps[%d],%s,&memoize_INTERNAL_value), mapput(memoize_INTERNAL_maps[%d],%s,memoize_INTERNAL_value=%s)); memoize_INTERNAL_value",
            args_full,
            m, key_str,
            m, key_str, call_str)
);

memoize = ((memoize_INTERNAL_func)->
  if(memoize_INTERNAL_func_is_zero_args(memoize_INTERNAL_func),
     listput(memoize_INTERNAL_maps, [memoize_INTERNAL_func,0]);
     memoize_INTERNAL_make0(#memoize_INTERNAL_maps),

     listput(memoize_INTERNAL_maps, Map());
     eval(memoize_INTERNAL_make(memoize_INTERNAL_func)))

)

);
}


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
