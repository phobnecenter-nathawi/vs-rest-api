'use strict';

/// <reference types="node" />

// The MIT License (MIT)
// 
// vs-rest-api (https://github.com/mkloubert/vs-rest-api)
// Copyright (c) Marcel Joachim Kloubert <marcel.kloubert@gmx.net>
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.


import * as FS from 'fs';
import * as Moment from 'moment';
import * as Path from 'path';
import * as rapi_contracts from './contracts';
import * as rapi_controller from './controller';
import * as rapi_helpers from './helpers';
import * as vscode from 'vscode';


let controller: rapi_controller.Controller;

export function activate(context: vscode.ExtensionContext) {
    let now = Moment();

    // package file
    let pkgFile: rapi_contracts.PackageFile;
    try {
        pkgFile = JSON.parse(FS.readFileSync(Path.join(__dirname, '../../package.json'), 'utf8'));
    }
    catch (e) {
        rapi_helpers.log(`[ERROR] extension.activate(): ${rapi_helpers.toStringSafe(e)}`);
    }

    let outputChannel = vscode.window.createOutputChannel("Remote Editor");

    // show infos about the app
    {
        if (pkgFile) {
            outputChannel.appendLine(`${pkgFile.displayName} (${pkgFile.name}) - v${pkgFile.version}`);
        }

        outputChannel.appendLine(`Copyright (c) ${now.format('YYYY')}  Marcel Joachim Kloubert <marcel.kloubert@gmx.net>`);
        outputChannel.appendLine('');
        outputChannel.appendLine(`GitHub : https://github.com/mkloubert/vs-remote-editor`);
        outputChannel.appendLine(`Twitter: https://twitter.com/mjkloubert`);
        outputChannel.appendLine(`Donate : [PayPal] https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=74YKCZZXPCP64`);
        outputChannel.appendLine(`         [Flattr] https://flattr.com/submit/auto?fid=o62pkd&url=https%3A%2F%2Fgithub.com%2Fmkloubert%2Fvs-remote-editor`);

        outputChannel.appendLine('');
    }

    controller = new rapi_controller.Controller(context, outputChannel, pkgFile);
    
    let toggleServerState = vscode.commands.registerCommand('extension.remoteEditor.toggleHostState', () => {
        try {
            controller.toggleHostState();
        }
        catch (e) {
            vscode.window.showErrorMessage(`[REMOTE EDITOR TOGGLE]: ${rapi_helpers.toStringSafe(e)}`);
        }
    });

    // notfiy setting changes
    context.subscriptions
           .push(vscode.workspace.onDidChangeConfiguration(controller.onDidChangeConfiguration, controller));

    context.subscriptions
           .push(toggleServerState);

    controller.onActivated();
}

export function deactivate() {
    if (controller) {
        controller.onDeactivate();
    }
}
