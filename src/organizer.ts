import * as toml from 'toml';
import * as vscode from 'vscode';

interface TomlSection {
    name: string;
    content: string;
    startLine: number;
    endLine: number;
}

export class CargoTomlOrganizer {
    private getConfiguration(): vscode.WorkspaceConfiguration {
        return vscode.workspace.getConfiguration('organize-cargo-toml');
    }

    public organize(content: string): string {
        // Handle empty input
        if (!content.trim()) {
            return content;
        }

        const preserveComments = this.getConfiguration().get<boolean>('preserveComments', true);

        try {
            // Parse the TOML content
            const parsed = toml.parse(content);
            
            if (preserveComments) {
                return this.organizeWithComments(content);
            } else {
                return this.organizeWithoutComments(parsed);
            }
        } catch (error) {
            throw new Error(`Failed to parse TOML: ${error}`);
        }
    }


    private organizeWithComments(content: string): string {
        const lines = content.split('\n');
        const sections = this.extractSections(lines);
        
        // Sort sections alphabetically, but keep package first
        const sortedSections = this.sortSections(sections);
        
        // Sort the content within each section
        const organizedSections = sortedSections.map(section => 
            this.sortSectionContent(section.content)
        );

        return organizedSections.join('\n\n').trim() + '\n';
    }

    private organizeWithoutComments(parsed: any): string {
        const sections: string[] = [];
        
        // Always add package section first if it exists
        if (parsed.package) {
            sections.push(this.formatSection('package', parsed.package));
        }
        
        // Add all other sections alphabetically
        const otherKeys = Object.keys(parsed)
            .filter(key => key !== 'package')
            .sort();
            
        for (const key of otherKeys) {
            sections.push(this.formatSection(key, parsed[key]));
        }

        return sections.join('\n\n') + '\n';
    }

    private extractSections(lines: string[]): TomlSection[] {
        const sections: TomlSection[] = [];
        let currentSection: string | null = null;
        let currentContent: string[] = [];
        let startLine = 0;
        let topLevelContent: string[] = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();
            
            // Check if this is a section header
            const sectionMatch = trimmedLine.match(/^\[([^\]]+)\]$/);
            
            if (sectionMatch) {
                // Save any top-level content as package section
                if (topLevelContent.length > 0 && currentSection === null) {
                    sections.push({
                        name: 'package',
                        content: topLevelContent.join('\n').trim(),
                        startLine: 0,
                        endLine: i - 1
                    });
                    topLevelContent = [];
                }
                
                // Save the previous section if it exists
                if (currentSection !== null) {
                    sections.push({
                        name: currentSection,
                        content: currentContent.join('\n').trim(),
                        startLine,
                        endLine: i - 1
                    });
                }
                
                // Start a new section
                currentSection = sectionMatch[1];
                currentContent = [line];
                startLine = i;
            } else if (currentSection !== null) {
                // Add line to current section
                currentContent.push(line);
            } else {
                // This is top-level content (package info)
                topLevelContent.push(line);
            }
        }

        // Handle remaining content
        if (topLevelContent.length > 0 && currentSection === null) {
            sections.push({
                name: 'package',
                content: topLevelContent.join('\n').trim(),
                startLine: 0,
                endLine: lines.length - 1
            });
        } else if (currentSection !== null) {
            sections.push({
                name: currentSection,
                content: currentContent.join('\n').trim(),
                startLine,
                endLine: lines.length - 1
            });
        }

        return sections;
    }

    private sortSections(sections: TomlSection[]): TomlSection[] {
        // Find package section and other sections
        const packageSection = sections.find(s => s.name === 'package');
        const otherSections = sections.filter(s => s.name !== 'package');
        
        // Sort other sections alphabetically
        otherSections.sort((a, b) => a.name.localeCompare(b.name));
        
        // Return package first, then others
        return packageSection ? [packageSection, ...otherSections] : otherSections;
    }

    private sortSectionContent(sectionContent: string): string {
        const lines = sectionContent.split('\n');
        if (lines.length === 0) return sectionContent;
        
        // Find the section header line (if any)
        const headerLineIndex = lines.findIndex(line => line.trim().match(/^\[.*\]$/));
        
        let headerLine = '';
        let contentLines: string[] = [];
        let prefixLines: string[] = [];
        
        if (headerLineIndex === -1) {
            // No header found - this is top-level package info
            contentLines = lines;
        } else {
            headerLine = lines[headerLineIndex];
            prefixLines = lines.slice(0, headerLineIndex);
            contentLines = lines.slice(headerLineIndex + 1);
        }
        
        // Group key-value pairs with their associated comments
        const keyValueGroups: { keyLine: string; comments: string[] }[] = [];
        const orphanedComments: string[] = [];
        
        let currentComments: string[] = [];
        
        contentLines.forEach((line) => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
                // This is a key-value line
                keyValueGroups.push({
                    keyLine: line,
                    comments: [...currentComments]
                });
                currentComments = [];
            } else if (trimmed.startsWith('#')) {
                // This is a comment - collect it
                currentComments.push(line);
            } else if (trimmed === '') {
                // Empty line - if we have pending comments, keep them pending
                if (currentComments.length > 0) {
                    currentComments.push(line);
                }
            } else {
                // Other lines (like continuation lines) - keep with key-value
                if (keyValueGroups.length > 0) {
                    keyValueGroups[keyValueGroups.length - 1].keyLine += '\n' + line;
                }
            }
        });
        
        // Any remaining comments are orphaned
        orphanedComments.push(...currentComments);
        
        // Sort key-value groups alphabetically by key name and recursively sort complex values
        keyValueGroups.sort((a, b) => {
            const keyA = a.keyLine.trim().split('=')[0].trim().toLowerCase();
            const keyB = b.keyLine.trim().split('=')[0].trim().toLowerCase();
            return keyA.localeCompare(keyB);
        });

        // Process each group: sort complex values and prepare output lines
        const processedGroups = keyValueGroups.map(group => ({
            ...group,
            keyLine: this.sortComplexValuesInLine(group.keyLine)
        }));
        
        // Reconstruct the section
        const result: string[] = [];
        
        // Add prefix lines (comments before section header)
        result.push(...prefixLines);
        
        // Add header if it exists, or create one for package section
        if (headerLineIndex !== -1) {
            result.push(headerLine);
        } else {
            // This is top-level content, add [package] header
            result.push('[package]');
        }
        
        // Add sorted key-value pairs with their associated comments
        processedGroups.forEach(group => {
            // Add any comments that come before this key-value pair
            result.push(...group.comments);
            // Add the key-value pair
            result.push(group.keyLine);
        });
        
        // Add any orphaned comments at the end
        if (orphanedComments.length > 0) {
            result.push(...orphanedComments);
        }
        
        return result.join('\n');
    }

    private formatSection(name: string, data: any): string {
        if (typeof data === 'object' && data !== null) {
            let result = `[${name}]\n`;
            // Sort keys alphabetically
            const sortedKeys = Object.keys(data).sort();
            for (const key of sortedKeys) {
                const value = (data as any)[key];
                if (typeof value === 'object' && value !== null) {
                    // Handle complex values like { version = "1.0", features = ["full"] }
                    result += `${key} = ${this.formatComplexValue(value)}\n`;
                } else {
                    result += `${key} = ${JSON.stringify(value)}\n`;
                }
            }
            return result.trim();
        }
        
        return `${name} = ${JSON.stringify(data)}`;
    }

    private sortComplexValuesInLine(line: string): string {
        const trimmed = line.trim();
        const equalIndex = trimmed.indexOf('=');
        
        if (equalIndex === -1) {
            return line; // No equals sign, return as-is
        }
        
        const key = trimmed.substring(0, equalIndex).trim();
        const value = trimmed.substring(equalIndex + 1).trim();
        
        // Check if the value is a complex object (starts with { and ends with })
        if (value.startsWith('{') && value.endsWith('}')) {
            const sortedValue = this.sortComplexObjectString(value);
            const indentation = line.substring(0, line.indexOf(line.trim()));
            return `${indentation}${key} = ${sortedValue}`;
        }
        
        return line; // Not a complex value, return as-is
    }

    private sortComplexObjectString(objectString: string): string {
        try {
            // Remove the outer braces and split by commas
            const inner = objectString.slice(1, -1).trim();
            if (!inner) return objectString;
            
            // Parse key-value pairs
            const pairs: string[] = [];
            let currentPair = '';
            let depth = 0;
            let inString = false;
            let escapeNext = false;
            
            for (let i = 0; i < inner.length; i++) {
                const char = inner[i];
                
                if (escapeNext) {
                    escapeNext = false;
                    currentPair += char;
                    continue;
                }
                
                if (char === '\\') {
                    escapeNext = true;
                    currentPair += char;
                    continue;
                }
                
                if (char === '"') {
                    inString = !inString;
                    currentPair += char;
                    continue;
                }
                
                if (!inString) {
                    if (char === '[' || char === '{') {
                        depth++;
                    } else if (char === ']' || char === '}') {
                        depth--;
                    } else if (char === ',' && depth === 0) {
                        pairs.push(currentPair.trim());
                        currentPair = '';
                        continue;
                    }
                }
                
                currentPair += char;
            }
            
            if (currentPair.trim()) {
                pairs.push(currentPair.trim());
            }
            
            // Sort pairs by key name
            const sortedPairs = pairs.sort((a, b) => {
                const keyA = a.split('=')[0].trim().toLowerCase();
                const keyB = b.split('=')[0].trim().toLowerCase();
                return keyA.localeCompare(keyB);
            });
            
            return `{ ${sortedPairs.join(', ')} }`;
            
        } catch (error) {
            // If parsing fails, return original string
            return objectString;
        }
    }

    private formatComplexValue(value: any): string {
        if (Array.isArray(value)) {
            return JSON.stringify(value);
        } else if (typeof value === 'object' && value !== null) {
            const pairs = Object.entries(value)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([k, v]) => `${k} = ${JSON.stringify(v)}`);
            return `{ ${pairs.join(', ')} }`;
        }
        return JSON.stringify(value);
    }

}
