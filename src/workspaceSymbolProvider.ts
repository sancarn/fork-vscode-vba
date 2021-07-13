import { VbaDocumentSymbolProvider } from './documentSymbolProvider'
import vscode = require('vscode')
import { fstat } from 'fs'

export class VBAWorkspaceSymbolProvider
  implements vscode.WorkspaceSymbolProvider
{
  public async provideWorkspaceSymbols(
    query: string,
    token: vscode.CancellationToken
  ) {
    const results: vscode.SymbolInformation[] = []

    //Iterate over classes
    for (let uri of await vscode.workspace.findFiles('*.cls')) {
      let document = await vscode.workspace.openTextDocument(uri)
      let firstNLines = document.getText(
        new vscode.Range(
          new vscode.Position(1, 1),
          new vscode.Position(20, 1)
        )
      )
      let match = firstNLines.match(
        /^Attribute VB_Name = "(?<name>\w+)"/
      )
      if (match?.groups) {
        if (match.groups.name) {
          results.push({
            name: match.groups.name,
            containerName: '',
            kind: vscode.SymbolKind.Class,
            location: new vscode.Location(
              uri,
              new vscode.Position(1, 1)
            ),
          })
        }
      }
    }
    //Iterate over forms:
    for (let uri of await vscode.workspace.findFiles('*.frm')) {
      let document = await vscode.workspace.openTextDocument(uri)
      let firstNLines = document.getText(
        new vscode.Range(
          new vscode.Position(1, 1),
          new vscode.Position(30, 1)
        )
      )
      let match = firstNLines.match(
        /^Attribute VB_Name = "(?<name>\w+)"/
      )
      if (match?.groups) {
        if (match.groups.name) {
          results.push({
            name: match.groups.name,
            containerName: '',
            kind: vscode.SymbolKind.Class,
            location: new vscode.Location(
              uri,
              new vscode.Position(1, 1)
            ),
          })
        }
      }
    }

    return results
  }
}
