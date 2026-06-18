const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src').filter(f => f.endsWith('.jsx'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace text-text-primary with text-white if it's on a button with bg-gradient or bg-emerald etc
  content = content.replace(/(className=["'][^"']*)(text-text-primary)([^"']*bg-gradient[^"']*["'])/g, '$1text-white$3');
  content = content.replace(/(className=["'][^"']*bg-gradient[^"']*)(text-text-primary)([^"']*["'])/g, '$1text-white$3');
  
  // Same for bg-red-500, bg-emerald-500, bg-violet-600
  content = content.replace(/(className=["'][^"']*)(text-text-primary)([^"']*(?:bg-emerald-|bg-red-|bg-violet-)[^"']*["'])/g, '$1text-white$3');
  content = content.replace(/(className=["'][^"']*(?:bg-emerald-|bg-red-|bg-violet-)[^"']*)(text-text-primary)([^"']*["'])/g, '$1text-white$3');

  fs.writeFileSync(file, content);
});
console.log('Fixed text-white on colored buttons.');
