// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

async function getWorkspaceFolder(): Promise<
  vscode.WorkspaceFolder | undefined
> {
  let folder: vscode.WorkspaceFolder | undefined;

  if (
    !vscode.workspace.workspaceFolders ||
    vscode.workspace.workspaceFolders.length === 0
  ) {
    return undefined;
  } else if (vscode.workspace.workspaceFolders.length === 1) {
    folder = vscode.workspace.workspaceFolders[0];
  } else {
    folder = await vscode.window.showWorkspaceFolderPick({
      placeHolder: `Select the workspace folder`,
    });
    if (!folder) {
      return undefined;
    }
  }

  return folder;
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "vscode-stashek" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let syncOneSubscription = vscode.commands.registerCommand(
    "vscode-stashek.syncOne",
    async () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      let gitStatusTask = new vscode.ShellExecution(
        "pwd && git stash && git pull && git stash pop --index 0"
      );
      const folderToSync = await getWorkspaceFolder();

      if (folderToSync === undefined) {
        vscode.window.showInformationMessage(
          "Sync canceled. You need to select a folder first!"
        );
      } else {
        // sync specific
        vscode.tasks.executeTask(
          new vscode.Task(
            { type: "stashek" },
            folderToSync,
            "Stashek",
            "Stashek",
            gitStatusTask
          )
        );
        vscode.window.showInformationMessage(`Synced ${folderToSync.name}`);
      }
    }
  );

  context.subscriptions.push(syncOneSubscription);

  let syncAllSubscription = vscode.commands.registerCommand(
    "vscode-stashek.syncAll",
    async () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      const workspaceFolders = vscode.workspace.workspaceFolders;
      let gitStatusTask = new vscode.ShellExecution(
        "pwd && git stash && git pull && git stash pop --index 0"
      );

      workspaceFolders?.forEach((folder) => {
        vscode.tasks.executeTask(
          new vscode.Task(
            { type: "stashek" },
            folder,
            "Stashek",
            "Stashek",
            gitStatusTask
          )
        );
        vscode.window.showInformationMessage(`Synced ${folder.name}`);
      });
    }
  );
  context.subscriptions.push(syncAllSubscription);
}

// this method is called when your extension is deactivated
export function deactivate() {}
