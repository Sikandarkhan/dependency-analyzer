import { Command } from 'commander';
import depcheck from 'depcheck';
// import * as d3 from 'd3';
import licenseChecker from 'license-checker';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { JSDOM }  from 'jsdom';
 import d3 from 'd3-node';


// Initialize the Commander program
const program = new Command();

program
  .version('1.0.0')
  .usage('[options] [command]')
  .option('-g, --graph', 'Generate dependency graph')
  .option('-u, --unused', 'Detect unused dependencies')
  .option('-s, --scan', 'Scan for security vulnerabilities')
  .option('-l, --license', 'Check license compatibility')
  .parse(process.argv);

// Main function to route the commands
const main = async () => {
  const commands = program.args;
  if (program.opts().graph) {
    await generateGraph();
  } else if (program.opts().unused) {
    await detectUnused();
  } else if (program.opts().scan) {
    await scanSecurity();
  } else if (program.opts().license) {
    await checkLicense();
  }
//   if (commands.includes('graph')) {
//     await generateGraph();
//   } else if (commands.includes('unused')) {
//     await detectUnused();
//   } else if (commands.includes('scan')) {
//     await scanSecurity();
//   } else if (commands.includes('license')) {
//     await checkLicense();
//   } else {
//     console.error("No valid command provided. Use --help for available options.");
//   }
};

// Execute the main function and catch any errors
main().catch(console.error);

// const d3 = require('d3-node')();

// Generate dependency graph using D3
async function generateGraph() {
    const dependencies = await getDependencies();
    const nodes = dependencies.map(dep => ({ id: dep.name }));
    const links = dependencies.map(dep => ({ source: dep.name, target: dep.dependencies?.[0]?.name || '' }));
  
    const svg = d3.select('body')
      .append('svg')
      .attr('width', 800)
      .attr('height', 600);

  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id))
    .force('charge', d3.forceManyBody())
    .force('center', d3.forceCenter(800 / 2, 600 / 2));

  const link = svg.append('g')
    .selectAll('line')
    .data(links)
    .enter()
    .append('line')
    .attr('stroke', 'gray');

  const node = svg.append('g')
    .selectAll('circle')
    .data(nodes)
    .enter()
    .append('circle')
    .attr('r', 10)
    .attr('fill', 'steelblue')
    .call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended));

  simulation.on('tick', () => {
    link.attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    node.attr('cx', d => d.x)
      .attr('cy', d => d.y);
  });

  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
}

// Detect unused dependencies
async function detectUnused() {
  depcheck(process.cwd(), {}, (unused) => {
    if (unused.dependencies.length === 0 && unused.devDependencies.length === 0) {
      console.log("No unused dependencies found.");
    } else {
      console.log('Unused dependencies:', unused.dependencies);
      console.log('Unused devDependencies:', unused.devDependencies);
    }
  });
}

// Scan for security vulnerabilities
async function scanSecurity() {
  exec('npm audit --json', (err, stdout, stderr) => {
    if (err) {
      console.error('Error running npm audit:', stderr);
      return;
    }

    const auditResults = JSON.parse(stdout);
    if (auditResults.metadata.totalVulnerabilities === 0) {
      console.log("No security vulnerabilities found.");
    } else {
      console.log('Security vulnerabilities:', auditResults);
    }
  });
}

// Check license compatibility for all dependencies
async function checkLicense() {
  const dependencies = await getDependencies();
  const licenses = await Promise.all(dependencies.map(async dep => {
    try {
      const license = await licenseChecker.getLicense(dep.name);
      return { name: dep.name, license };
    } catch (err) {
      console.error(`Error checking license for ${dep.name}:`, err);
      return { name: dep.name, license: 'Unknown' };
    }
  }));

  console.log('License Compatibility:');
  licenses.forEach(license => console.log(`- ${license.name}: ${license.license}`));
}

// Get dependencies from package.json
async function getDependencies() {
  try {
    const packageJson = await fs.readFile(path.join(process.cwd(), 'package.json'), 'utf8');
    const dependencies = JSON.parse(packageJson).dependencies;
    return Object.keys(dependencies).map(dep => ({ name: dep, version: dependencies[dep] }));
  } catch (error) {
    console.error('Error reading dependencies:', error);
    return [];
  }
}

// Get used dependencies from code
async function getUsedDependencies() {
  const files = await fs.readdir(process.cwd(), { withFileTypes: true });
  const usedDependencies = [];

  for (const file of files) {
    if (file.isFile()) {
      const filePath = path.join(process.cwd(), file.name);
      const fileContent = await fs.readFile(filePath, 'utf8');
      const requires = fileContent.match(/require\(['"](.*)['"]\)/g);
      const imports = fileContent.match(/import\s+.*\s+from\s+['"](.*)['"]/g);

      if (requires) {
        requires.forEach(requireStmt => {
          const moduleName = requireStmt.replace(/require\(['"]|['"]\)/g, '');
          usedDependencies.push(moduleName);
        });
      }

      if (imports) {
        imports.forEach(importStmt => {
          const moduleName = importStmt.replace(/import\s+.*\s+from\s+['"]|['"]/g, '');
          usedDependencies.push(moduleName);
        });
      }
    }
  }

  return usedDependencies;
}

// Check if a dependency is unused
function isUnused(dependency, usedDependencies) {
  return !usedDependencies.includes(dependency.name);
}

// Analyze function that exports the analysis of dependencies
export default {
  analyze: async () => {
    const dependencies = await getDependencies();
    const usedDependencies = await getUsedDependencies();

    // Filter unused dependencies
    // const unusedDependencies = dependencies.filter(dep => isUnused(dep, usedDependencies));
    const unusedDependencies = dependencies.filter((dep) => !usedDependencies.includes(dep.name));



    return {
      unusedDependencies: unusedDependencies.length ? unusedDependencies : "No unused dependencies found",
    };
  },
};
