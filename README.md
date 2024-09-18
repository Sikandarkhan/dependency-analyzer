
## Dependency Analyzer

**Dependency Analyzer** is an npm package that helps developers analyze and optimize their project's dependencies. It provides insights into unused dependencies, security vulnerabilities, and license compatibility, empowering you to streamline and secure your project.

**Features**
- Detect Unused Dependencies: Identifies and lists dependencies that are declared but not used in your project.
- Vulnerability Detection: Scans dependencies for potential security vulnerabilities (requires npm audit).
- License Compatibility: Checks if the dependencies adhere to permissive licenses.


## Installation

You can install the package using npm:

```bash
  npm install dependency-analyzer
```


## Usage 
Here's an example of how to use the Dependency Analyzer in your project:
```bash
import dependencyAnalyzer from 'dependency-analyzer';

const result = await dependencyAnalyzer.analyze();

console.log('Unused dependencies:');
console.log(result.unusedDependencies);

console.log('Vulnerable dependencies:');
console.log(result.vulnerableDependencies);

console.log('Incompatible licenses:');
console.log(result.incompatibleLicenses);
```


## API
```bash
analyze()
```
Analyzes the current project for the following:

- Unused Dependencies: Lists dependencies declared in package.json but not used in the code. 
- Vulnerable Dependencies: Shows dependencies with security vulnerabilities (using npm audit).
- Incompatible Licenses: Displays dependencies that don't have permissive licenses.

## Example output**
```bash

Unused dependencies:
['unused-package']

Vulnerable dependencies:
['vulnerable-package']

Incompatible licenses:
['non-permissive-license-package']
```
## **Contribution**
Feel free to contribute to this project by opening an issue or submitting a pull request. Your contributions are always welcome! Please adhere to this project's `code of conduct`.

##  **License**
This project is licensed under the MIT License.

## Authors

- [@Sikandar](https://www.github.com/Sikandarkhan)
