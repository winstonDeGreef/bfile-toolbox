default(parisize, 50 * 1024 * 1024);
a(n)=my(k=2); while(fibonacci(k)<=n, k++); while(n>1, while(fibonacci(k--)>n, ); n-=fibonacci(k)); n==1 

for(i=0, 10000000000, s=Str(i, " ", a(i)); if(length(s) > 1000, break); print(Str("result ", s));)

