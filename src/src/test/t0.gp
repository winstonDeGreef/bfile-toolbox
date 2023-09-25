a(n) = n! * sum(k=0, n\2, (-3)^k * binomial(n-k,k)/(n-k)!)
for(i=0, 1000, print(i, " ", a(i)))