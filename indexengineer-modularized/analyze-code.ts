import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// Type definitions
interface ComponentAnalysis {
  name: string;
  type: 'component' | 'page' | 'utility' | 'api';
  imports: string[];
  exports: ExportInfo[];
  stateVariables?: StateVariable[];
  hooks?: string[];
  dependencies?: string[];
}

interface ExportInfo {
  name: string;
  type: string;
  params?: ParameterInfo[];
  returnType?: string;
}

interface ParameterInfo {
  name: string;
  type: string;
}

interface StateVariable {
  name: string;
  type: string;
}

interface FileStructure {
  path: string;
  analysis: ComponentAnalysis;
}

// Configuration
const config = {
  includeDirs: [
    'src/app',
    'src/components',
    'src/lib',
    'src/types',
    'src/implementations'
  ],
  extensions: ['.ts', '.tsx'],
  ignoreFiles: [
    'next-env.d.ts',
    'next.config.mjs',
    'tailwind.config.ts'
  ]
};

function analyzeTypeScript(sourceFile: ts.SourceFile): ComponentAnalysis {
  const analysis: ComponentAnalysis = {
    name: path.basename(sourceFile.fileName),
    type: determineFileType(sourceFile.fileName),
    imports: [],
    exports: [],
    stateVariables: [],
    hooks: [],
    dependencies: []
  };

  function determineFileType(fileName: string): ComponentAnalysis['type'] {
    if (fileName.includes('/pages/') || fileName.includes('/app/')) return 'page';
    if (fileName.includes('/api/')) return 'api';
    if (fileName.includes('/components/')) return 'component';
    return 'utility';
  }

  function visit(node: ts.Node) {
    if (ts.isImportDeclaration(node)) {
      const importPath = (node.moduleSpecifier as ts.StringLiteral).text;
      analysis.imports.push(importPath);
      
      if (importPath === 'react' && node.importClause?.namedBindings) {
        const namedImports = node.importClause.namedBindings as ts.NamedImports;
        namedImports.elements.forEach(element => {
          if (element.name.text.startsWith('use')) {
            analysis.hooks?.push(element.name.text);
          }
        });
      }
    }

    if (ts.isExportDeclaration(node) || (ts.isFunctionDeclaration(node) && node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword))) {
      const exportInfo: ExportInfo = {
        name: ts.isFunctionDeclaration(node) && node.name ? node.name.text : 'default',
        type: ts.isFunctionDeclaration(node) ? 'function' : 'other',
        params: []
      };
      
      if (ts.isFunctionDeclaration(node)) {
        node.parameters.forEach(param => {
          exportInfo.params?.push({
            name: param.name.getText(),
            type: param.type ? param.type.getText() : 'any'
          });
        });
      }
      
      analysis.exports.push(exportInfo);
    }

    if (ts.isCallExpression(node) && node.expression.getText() === 'useState') {
      const variableName = node.parent?.parent?.getText().split('=')[0].trim();
      const stateType = node.typeArguments?.[0]?.getText() || 'unknown';
      if (variableName) {
        analysis.stateVariables?.push({ name: variableName, type: stateType });
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return analysis;
}

function shouldAnalyzeFile(filePath: string): boolean {
  const relativePath = path.relative(process.cwd(), filePath);
  const extension = path.extname(filePath);
  
  if (config.ignoreFiles.includes(path.basename(filePath))) {
    return false;
  }
  
  if (!config.extensions.includes(extension)) {
    return false;
  }
  
  return config.includeDirs.some(dir => relativePath.startsWith(dir));
}

function analyzeProject(rootDir: string): FileStructure[] {
  const results: FileStructure[] = [];
  
  function processFile(filePath: string) {
    if (!shouldAnalyzeFile(filePath)) {
      return;
    }

    try {
      const sourceFile = ts.createSourceFile(
        filePath,
        fs.readFileSync(filePath, 'utf-8'),
        ts.ScriptTarget.Latest,
        true
      );
      
      const relativePath = path.relative(rootDir, filePath);
      results.push({
        path: relativePath,
        analysis: analyzeTypeScript(sourceFile)
      });
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error);
    }
  }
  
  function walkDir(dir: string) {
    if (!fs.existsSync(dir)) {
      console.error(`Directory ${dir} does not exist`);
      return;
    }

    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else {
        processFile(filePath);
      }
    }
  }
  
  config.includeDirs.forEach(dir => {
    const fullPath = path.join(rootDir, dir);
    walkDir(fullPath);
  });
  
  return results;
}

function generateDocumentation(analysis: FileStructure[]): string {
  let docs = '# Next.js Project Analysis\n\n';
  
  const groupedFiles: { [key: string]: FileStructure[] } = {};
  analysis.forEach(file => {
    const dir = path.dirname(file.path);
    if (!groupedFiles[dir]) {
      groupedFiles[dir] = [];
    }
    groupedFiles[dir].push(file);
  });
  
  Object.entries(groupedFiles).forEach(([dir, files]) => {
    docs += `## Directory: ${dir}\n\n`;
    
    files.forEach(file => {
      const { analysis: fileAnalysis } = file;
      docs += `### File: ${path.basename(file.path)}\n\n`;
      docs += `Type: ${fileAnalysis.type}\n\n`;
      
      if (fileAnalysis.imports.length) {
        docs += '#### Dependencies\n';
        fileAnalysis.imports.forEach((imp: string) => docs += `- ${imp}\n`);
        docs += '\n';
      }
      
      if (fileAnalysis.exports.length) {
        docs += '#### Exports\n';
        fileAnalysis.exports.forEach((exp: ExportInfo) => {
          docs += `- ${exp.name} (${exp.type})\n`;
          if (exp.params?.length) {
            docs += '  Parameters:\n';
            exp.params.forEach((param: ParameterInfo) => 
              docs += `  - ${param.name}: ${param.type}\n`
            );
          }
        });
        docs += '\n';
      }
      
      if (fileAnalysis.stateVariables?.length) {
        docs += '#### State Variables\n';
        fileAnalysis.stateVariables.forEach((state: StateVariable) => {
          docs += `- ${state.name}: ${state.type}\n`;
        });
        docs += '\n';
      }
      
      if (fileAnalysis.hooks?.length) {
        docs += '#### React Hooks Used\n';
        fileAnalysis.hooks.forEach((hook: string) => docs += `- ${hook}\n`);
        docs += '\n';
      }
      
      docs += '---\n\n';
    });
  });
  
  return docs;
}

async function main() {
  try {
    console.log('Starting project analysis...');
    
    const projectRoot = process.cwd();
    const analysis = analyzeProject(projectRoot);
    const documentation = generateDocumentation(analysis);
    
    const outputDir = path.join(projectRoot, 'docs');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    
    const outputFile = path.join(outputDir, 'project-analysis.md');
    fs.writeFileSync(outputFile, documentation);
    
    console.log(`Analysis complete! Documentation saved to ${outputFile}`);
    
    const analysisJson = path.join(outputDir, 'analysis.json');
    fs.writeFileSync(analysisJson, JSON.stringify(analysis, null, 2));
    console.log(`Raw analysis data saved to ${analysisJson}`);
  } catch (error) {
    console.error('Error during analysis:', error);
    process.exit(1);
  }
}

main();