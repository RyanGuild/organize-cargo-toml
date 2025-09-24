import * as vscode from 'vscode';
import { CargoTomlOrganizer } from './organizer';

export function activate(context: vscode.ExtensionContext) {
    console.log('Organize Cargo.toml extension is now active');

    const organizer = new CargoTomlOrganizer();

    // Register the organize command
    const organizeCommand = vscode.commands.registerCommand('organize-cargo-toml.organize', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const document = editor.document;
        if (!document.fileName.toLowerCase().includes('cargo.toml')) {
            vscode.window.showErrorMessage('This command only works with Cargo.toml files');
            return;
        }

        try {
            const originalText = document.getText();
            const organizedText = await organizer.organize(originalText);
            
            if (originalText !== organizedText) {
                const edit = new vscode.WorkspaceEdit();
                const fullRange = new vscode.Range(
                    document.positionAt(0),
                    document.positionAt(originalText.length)
                );
                edit.replace(document.uri, fullRange, organizedText);
                
                const success = await vscode.workspace.applyEdit(edit);
                if (success) {
                    vscode.window.showInformationMessage('Cargo.toml organized successfully');
                } else {
                    vscode.window.showErrorMessage('Failed to apply changes');
                }
            } else {
                vscode.window.showInformationMessage('Cargo.toml is already organized');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Error organizing Cargo.toml: ${error}`);
        }
    });

    context.subscriptions.push(organizeCommand);

    // Register code lens provider for Cargo.toml files to show inline organize link
    const codeLensProvider = vscode.languages.registerCodeLensProvider(
        [
            { scheme: 'file', pattern: '**/*Cargo.toml' },
            { scheme: 'file', pattern: '**/*cargo.toml' }
        ],
        {
            provideCodeLenses(document: vscode.TextDocument): vscode.ProviderResult<vscode.CodeLens[]> {
                // Add code lens at the top of the file
                const topOfDocument = new vscode.Range(0, 0, 0, 0);
                const codeLens = new vscode.CodeLens(topOfDocument, {
                    title: "🗂️ Organize Cargo.toml",
                    command: "organize-cargo-toml.organize",
                    arguments: []
                });

                return [codeLens];
            }
        }
    );

    context.subscriptions.push(codeLensProvider);
}

export function deactivate() {
    console.log('Organize Cargo.toml extension is now deactivated');
}
