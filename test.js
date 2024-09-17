import dependencyAnalyzer from './index.js';

const result = dependencyAnalyzer.analyze();

console.log('Unused dependencies:');
console.log(result.unusedDependencies);

console.log('Vulnerable dependencies:');
console.log(result.vulnerableDependencies);

console.log('Incompatible licenses:');
console.log(result.incompatibleLicenses);