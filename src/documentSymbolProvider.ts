// Reference:
//   https://code.visualstudio.com/api/language-extensions/programmatic-language-features#show-all-symbol-definitions-within-a-document
//   https://github.com/Gimly/vscode-fortran/blob/229cddce53a2ea0b93032619efeef26376cd0d2c/src/documentSymbolProvider.ts
import vscode = require('vscode')
import { VbaSymbol, vbaSymbols } from './extension'

type IMatcher = { type: vscode.SymbolKind; regex: RegExp }

export class VbaDocumentSymbolProvider
  implements vscode.DocumentSymbolProvider
{
  public provideDocumentSymbols(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.DocumentSymbol[] {
    // [Public | Private | Friend] [Static] Sub name [(arglist)]

    const matchers = [
      // [Public | Private | Friend] [Static] Function name [(arglist)] [As type]
      // [Public | Private | Friend] [Static] Sub name [(arglist)]
      {
        type: vscode.SymbolKind.Function,
        regex:
          /^\s*((?<scope>Public|Private|Friend)\s+)?((?<static>Static)\s+)?(?<funcType>Function|Sub)\s+(?<name>\w+)/i,
      },
      {
        type: vscode.SymbolKind.Function,
        regex:
          /^\s*((?<scope>Public|Private|Friend)\s+)?(?<decl>Declare\s+)(?<x64>PtrSafe\s+)(?<funcType>Function|Sub)\s+(?<name>\w+)\s+(Lib\s+"(?<lib>[^"]+)"\s+)(?:Alias\s+"(?<alias>\w+)"\s+)?/i,
      },
      //[Public | Private | Friend] [Static] Property [Get | Let | Set] name[(arglist)] [as type]
      {
        type: vscode.SymbolKind.Property,
        regex:
          /^\s*((?<scope>Public|Private|Friend)\s+)?((?<static>Static)\s+)?(?<funcType>Property\s+)(?<propType>Get|Set|Let\s+)(?<name>\w+)/i,
      },
      {
        type: vscode.SymbolKind.Property,
        regex:
          /^\s*((?<scope>Public|Private|Friend)\s+)((?<static>Static)\s+)?(?<name>\w+)\s+as\s+\w+/i,
      },
      //[Public | Private | Friend] Enum name
      {
        type: vscode.SymbolKind.Enum,
        regex:
          /^\s*((?<scope>Public|Private|Friend)\s+)?(?<funcType>Enum)\s+(?<name>\w+)/i,
      },
      {
        type: vscode.SymbolKind.Struct,
        regex:
          /^\s*((?<scope>Public|Private|Friend)\s+)?(?<funcType>Type)\s+(?<name>\w+)/i,
      },
    ] as IMatcher[]

    const result: vscode.DocumentSymbol[] = []
    vbaSymbols.splice(0)

    for (let iLine = 0; iLine < document.lineCount; iLine++) {
      var line = document.lineAt(iLine)
      var text = line.text
      for (let matcher of matchers) {
        if (matcher.regex.test(text)) {
          const match = text.match(matcher.regex)
          if (match?.groups) {
            vbaSymbols.push(
              new VbaSymbol(
                match.groups.name,
                document.uri,
                line.range
              )
            )
            let decl = match.groups.decl
              ? [
                  'Declare',
                  match.groups.x64 ? 'x64' : 'x32',
                  match.groups.lib,
                  match.groups.alias,
                ]
              : []
            let detail: string = [
              match.groups.scope,
              match.groups.static ? 'Static' : undefined,
              ...decl,
            ]
              .filter(e => e)
              .join(' ')
            result.push(
              //detail: match.groups.scope,
              new vscode.DocumentSymbol(
                match.groups.name,
                detail,
                matcher.type,
                line.range,
                line.range
              )
            )
          }
          break
        }
      }
    }
    return result
  }
}
