const { executeCode } = require('./services/executionService');
async function test() {
  const code = `
const fs = require('fs');

function solve() {
    const inputStr = fs.readFileSync(0, 'utf-8').trim();
    if (!inputStr) return;
    
    const data = inputStr.split(/\\s+/);
    const n = parseInt(data[0], 10); 
    
    const pulses = [];
    for (let i = 1; i <= n; i++) {
        pulses.push(parseInt(data[i], 10));
    }
    
    for (let i = 1; i < n; i++) {
        if (pulses[i - 1] === 2 * pulses[i]) {
            console.log(i);
            return;
        }
    }
    console.log(-1);
}

solve();
`;
  console.log(await executeCode(code, 63, "[8, 3, 6, 3, 1]"));
}
test();
