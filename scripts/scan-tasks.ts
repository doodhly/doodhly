import fs from 'fs';
import path from 'path';

interface Task {
    description: string;
    file: string;
    line: number;
    type: 'checkbox' | 'todo-keyword' | 'heading' | 'inline';
}

interface TaskGroup {
    file: string;
    tasks: Task[];
}

function isInCodeBlock(lines: string[], lineIndex: number): boolean {
    let inCodeBlock = false;
    for (let i = 0; i < lineIndex; i++) {
        const line = lines[i].trim();
        if (line.startsWith('```')) {
            inCodeBlock = !inCodeBlock;
        }
    }
    return inCodeBlock;
}

function parseMarkdownFile(filePath: string): Task[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const tasks: Task[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNumber = i + 1;

        // Skip if inside code block
        if (isInCodeBlock(lines, i)) {
            continue;
        }

        // Pattern 1: Unchecked checkbox - [ ]
        if (/^[\s]*[-*]\s+\[\s\]/.test(line)) {
            const description = line.replace(/^[\s]*[-*]\s+\[\s\]\s*/, '').trim();
            if (description) {
                tasks.push({
                    description,
                    file: filePath,
                    line: lineNumber,
                    type: 'checkbox'
                });
            }
            continue;
        }

        // Skip completed checkboxes - [x] [X] [/]
        if (/^[\s]*[-*]\s+\[[xX\/]\]/.test(line)) {
            continue;
        }

        // Pattern 2: TODO/PENDING keywords on list items
        if (/^[\s]*[-*]\s+(TODO|Todo|todo|PENDING|Pending|pending):?\s+/i.test(line)) {
            const description = line.replace(/^[\s]*[-*]\s+(TODO|Todo|todo|PENDING|Pending|pending):?\s+/i, '').trim();
            if (description && !description.match(/^(DONE|done|Done|COMPLETED|completed|Completed)/i)) {
                tasks.push({
                    description,
                    file: filePath,
                    line: lineNumber,
                    type: 'todo-keyword'
                });
            }
            continue;
        }

        // Pattern 3: TODO/PENDING headings (##, ###, etc.)
        if (/^#{1,6}\s+(TODO|Todo|todo|PENDING|Pending|pending|Tasks|TASKS|tasks)\s*$/i.test(line)) {
            tasks.push({
                description: line.replace(/^#{1,6}\s+/, '').trim(),
                file: filePath,
                line: lineNumber,
                type: 'heading'
            });
            continue;
        }

        // Pattern 4: Inline TODO (not in lists or headings)
        if (!line.trim().startsWith('-') &&
            !line.trim().startsWith('*') &&
            !line.trim().startsWith('#') &&
            /TODO|FIXME|HACK|XXX/i.test(line)) {

            // Extract just the TODO part
            const match = line.match(/(TODO|FIXME|HACK|XXX)[\s:]+(.+?)(\.|$)/i);
            if (match && match[2]) {
                const description = `${match[1]}: ${match[2].trim()}`;
                tasks.push({
                    description,
                    file: filePath,
                    line: lineNumber,
                    type: 'inline'
                });
            }
        }
    }

    return tasks;
}

function findMarkdownFiles(dir: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // Skip node_modules, .git, .next, etc.
            if (!['node_modules', '.git', '.next', 'dist', 'build', '.husky'].includes(file)) {
                findMarkdownFiles(filePath, fileList);
            }
        } else if (file.endsWith('.md')) {
            fileList.push(filePath);
        }
    });

    return fileList;
}

function main() {
    const rootDir = process.argv[2] || process.cwd();
    console.log(`Scanning for pending tasks in: ${rootDir}\n`);

    const markdownFiles = findMarkdownFiles(rootDir);
    console.log(`Found ${markdownFiles.length} markdown files\n`);

    const allTaskGroups: TaskGroup[] = [];
    let totalTasks = 0;

    markdownFiles.forEach(file => {
        const tasks = parseMarkdownFile(file);
        if (tasks.length > 0) {
            allTaskGroups.push({ file, tasks });
            totalTasks += tasks.length;
        }
    });

    // Output results
    if (allTaskGroups.length === 0) {
        console.log('✅ No pending tasks found!');
        return;
    }

    console.log(`📋 Found ${totalTasks} pending tasks across ${allTaskGroups.length} files:\n`);
    console.log('='.repeat(80) + '\n');

    allTaskGroups.forEach(group => {
        const relativePath = path.relative(rootDir, group.file);
        console.log(`📄 ${relativePath} (${group.tasks.length} tasks)`);
        console.log('-'.repeat(80));

        group.tasks.forEach(task => {
            const typeLabel = task.type.toUpperCase().padEnd(12);
            console.log(`  Line ${String(task.line).padStart(4)}: [${typeLabel}] ${task.description}`);
        });

        console.log('');
    });

    console.log('='.repeat(80));
    console.log(`\nTotal: ${totalTasks} pending tasks`);
}

main();
