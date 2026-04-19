const { executeCode } = require('./services/executionService');
async function test() {
  const code = `import sys

def solve():
    data = sys.stdin.read().split()
    if not data:
        return
        
    n = int(data[0])
    if n == 0:
        print(0)
        return
        
    leaves = [int(x) for x in data[1:n+1]]
    
    count = 1
    last_eaten = leaves[0]
    
    for i in range(1, n):
        if leaves[i] > last_eaten:
            last_eaten = leaves[i]
            count += 1
            
    print(count)

if __name__ == '__main__':
    solve()
`;
  // test it with [3, 1, 4, 3, 6, 8, 7]
  console.log(await executeCode(code, 71, "[3, 1, 4, 3, 6, 8, 7]"));
}
test();
