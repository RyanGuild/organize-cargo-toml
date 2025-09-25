// Mock VSCode API for testing
import { vi } from 'vitest';

const mockFn = () => vi.fn();

export const workspace = {
    getConfiguration: mockFn().mockReturnValue({
        get: mockFn().mockImplementation((key: string, defaultValue?: any) => {
            if (key === 'preserveComments') return true;
            return defaultValue;
        })
    })
};

export const window = {
    showErrorMessage: mockFn(),
    showInformationMessage: mockFn(),
    activeTextEditor: null
};

export const commands = {
    registerCommand: mockFn()
};

export const languages = {
    registerDocumentFormattingEditProvider: mockFn()
};

export class WorkspaceEdit {
    replace = mockFn();
}

export class Range {
    constructor(public start: any, public end: any) {}
}

export class TextEdit {
    static replace = mockFn();
}
