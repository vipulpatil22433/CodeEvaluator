const { executeCode } = require('./services/executionService');
async function test() {
  const code = `
const fs = require('fs');

function solve() {
    let inputStr;
    try {
        inputStr = fs.readFileSync(0, 'utf-8');
    } catch(e) {
        inputStr = fs.readFileSync('/dev/stdin', 'utf-8');
    }
    inputStr = inputStr.trim();
    if (!inputStr) {
        console.log("no input");
        return;
    }
    
    const data = inputStr.split(/\\s+/);
    console.log("length of data: " + data.length);
    console.log(data);
}
solve();
`;
  console.log(await executeCode(code, 63, "[8, 3, 6, 3, 1]"));
}
test();
