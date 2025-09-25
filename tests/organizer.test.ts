import { describe, test, beforeEach, expect } from 'vitest';
import { CargoTomlOrganizer } from '../src/organizer';
import * as fs from 'fs';
import * as path from 'path';

describe('CargoTomlOrganizer', () => {
    let organizer: CargoTomlOrganizer;

    beforeEach(() => {
        organizer = new CargoTomlOrganizer();
    });

    const testCasesDir = path.join(__dirname, '..', 'test-cases');

    const testCases = [
        {
            name: 'basic package info transformation',
            input: 'unsorted-basic.toml',
            expected: 'sorted-basic.toml'
        },
        {
            name: 'complex project with multiple sections',
            input: 'unsorted-complex.toml',
            expected: 'sorted-complex.toml'
        },
        {
            name: 'existing [package] section',
            input: 'unsorted-with-package-section.toml',
            expected: 'sorted-with-package-section.toml'
        },
        {
            name: 'preservation of comments',
            input: 'unsorted-with-comments.toml',
            expected: 'sorted-with-comments.toml'
        },
        {
            name: 'minimal project',
            input: 'unsorted-minimal.toml',
            expected: 'sorted-minimal.toml'
        }
    ];

    testCases.forEach(testCase => {
        test(`should correctly organize ${testCase.name}`, () => {
            const inputPath = path.join(testCasesDir, testCase.input);
            const expectedPath = path.join(testCasesDir, testCase.expected);

            // Skip test if files don't exist
            if (!fs.existsSync(inputPath) || !fs.existsSync(expectedPath)) {
                console.warn(`Skipping test ${testCase.name}: missing files`);
                return;
            }

            const inputContent = fs.readFileSync(inputPath, 'utf8');
            const expectedContent = fs.readFileSync(expectedPath, 'utf8');

            const result = organizer.organize(inputContent);

            // Normalize whitespace for comparison
            const normalizeContent = (content: string) => {
                return content
                    .split('\n')
                    .map(line => line.trimEnd())
                    .join('\n')
                    .trim();
            };

            expect(normalizeContent(result)).toBe(normalizeContent(expectedContent));
        });
    });

    test('should handle empty input', () => {
        const result = organizer.organize('');
        expect(result).toBe('');
    });

    test('should handle input with only comments', () => {
        const input = `# This is a comment
# Another comment`;
        const result = organizer.organize(input);
        // Should create an empty package section with comments
        expect(result).toContain('[package]');
    });

    test('should sort dependencies alphabetically', () => {
        // Create a simple test case inline for this specific functionality test
        const input = `[dependencies]
zebra = "1.0"
alpha = "1.0"
beta = "1.0"`;
        const result = organizer.organize(input);
        
        // Check that dependencies are sorted
        const lines = result.split('\n');
        const depStartIndex = lines.findIndex(line => line.trim() === '[dependencies]');
        const depLines = lines.slice(depStartIndex + 1, depStartIndex + 4);
        
        expect(depLines[0]).toContain('alpha');
        expect(depLines[1]).toContain('beta');
        expect(depLines[2]).toContain('zebra');
    });

    test('should sort complex dependency values', () => {
        // Create a simple test case inline for this specific functionality test
        const input = `[dependencies]
complex = { version = "1.0", features = ["b", "a"], optional = true }`;
        const result = organizer.organize(input);
        
        // Complex values should have keys sorted alphabetically (features before version)
        expect(result).toContain('{ features = ["b", "a"], optional = true, version = "1.0" }');
    });

    test('should hoist [package] section to top', () => {
        // Create a simple test case inline for this specific functionality test
        const input = `[dependencies]
serde = "1.0"

[package]
name = "test"
version = "1.0.0"

[features]
default = []`;
        const result = organizer.organize(input);
        const lines = result.split('\n').filter(line => line.trim());
        
        // First non-comment line should be [package]
        const firstSection = lines.find(line => line.startsWith('['));
        expect(firstSection).toBe('[package]');
    });

    test('should sort sections alphabetically except package', () => {
        // Create a simple test case inline for this specific functionality test
        const input = `[package]
name = "test"

[workspace]
members = []

[features]
default = []

[dependencies]
serde = "1.0"

[build-dependencies]
cc = "1.0"`;
        const result = organizer.organize(input);
        const lines = result.split('\n');
        
        const sectionHeaders = lines
            .filter(line => line.trim().startsWith('[') && !line.includes('[['))
            .map(line => line.trim());
        
        expect(sectionHeaders[0]).toBe('[package]');
        expect(sectionHeaders[1]).toBe('[build-dependencies]');
        expect(sectionHeaders[2]).toBe('[dependencies]');
        expect(sectionHeaders[3]).toBe('[features]');
        expect(sectionHeaders[4]).toBe('[workspace]');
    });
});
