def calc(a):
    max = 0
    res = 0
    for x in a:
        if x > max:
            max = x
        res += max
    return res
t = int(input())

for _ in range(t):
    n = int(input())
    a = list(map(int, input().split()))
    ans = calc(a)
    
    for i in range(n):
        for j in range(i + 1, n):
            a[i], a[j] = a[j], a[i]
            ans = max(ans, calc(a))
            a[i], a[j] = a[j], a[i]
     
    print(ans)