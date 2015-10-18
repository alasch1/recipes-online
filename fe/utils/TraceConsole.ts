/**
 * Created by aschneider on 8/10/2015.
 */
/// <reference path="../definitions/jquery.d.ts" />

module alasch.cookbook.ui.utils {
    enum LogLevel {
        INFO,
        DEBUG,
        WARNING,
        ERROR
    }

    class TraceEntity {
        level:LogLevel;
        msg:string;
        time:string;

        constructor(level:LogLevel, msg:string) {
            this.level = level;
            this.msg = msg;
            this.time = new Date().toString().split(" ")[4];
        }
    }

    export class LoggerFactory {

        static traceConsole: TraceConsole;
        static getLogger(name: string) : Logger {
            return new Logger(name, LoggerFactory.getTraceConsole());
        }

        static getTraceConsole(): TraceConsole {
            if (!LoggerFactory.traceConsole) {
                LoggerFactory.traceConsole = new TraceConsole()
            }
            return LoggerFactory.traceConsole;
        }
    }

    export class TraceConsole {
        traceDivElement: Element;
        logEntries: TraceEntity[];
        isVisible: boolean;

        static consoleLimit: number = 500;
        static traceContainerId:string = "#TraceContainer";
        static traceConsoleId:string = "#TraceConsole";

        constructor() {
            this.logEntries = [];
            this.isVisible = true;
            this.hide();
        }

        append2log(logMsg:TraceEntity) {
            if (this.logEntries.length >= TraceConsole.consoleLimit) {
                this.logEntries.shift();
            }
            this.logEntries.push(logMsg);
        }

        toggleDisplay() {
            if (this.isVisible) {
                this.hide();
            }
            else {
                this.show();
            }
        }

        show() {
            this.isVisible = true;
            $(TraceConsole.traceContainerId).show();
        }

        hide() {
            this.isVisible = false;
            $(TraceConsole.traceContainerId).hide();
        }

        append2Dom(entity:TraceEntity) {
            var traceRow = document.createElement("div");
            traceRow.className = TraceConsole.logLevel2CssClass(entity.level);
            var node = document.createTextNode(entity.time + " " + entity.msg);
            traceRow.appendChild(node);
            if (!this.traceDivElement) {
                // The lazy init to ensure that the DOM already exists
                this.traceDivElement = $(TraceConsole.traceConsoleId).get(0);
            }
            this.traceDivElement.appendChild(traceRow);
        }

        // TraceConsole operation
        document_OnKeydown(keyEvent) {
            var keyCode = (keyEvent.keyCode || keyEvent.which);
            var targetKeyCode = "X".charCodeAt(0);
            if (keyEvent.ctrlKey && keyEvent.shiftKey && keyCode == targetKeyCode) {
                // shift+ctrl+X were pressed
                LoggerFactory.getTraceConsole().toggleDisplay();
            }
        }

        private static logLevel2CssClass(level:LogLevel) {
            var cssClass:string = "logItem ";
            var defaultCssClass:string = "logLevelInfo";
            switch (level) {
                case LogLevel.INFO:
                    cssClass += "logLevelInfo";
                    break;
                case LogLevel.DEBUG:
                    cssClass += "logLevelDebug";
                    break;
                case LogLevel.WARNING:
                    cssClass +=  "logLevelWarning";
                    break;
                case LogLevel.ERROR:
                    cssClass += "logLevelError";
                    break;
                default :
                    cssClass += defaultCssClass;
                    break;
            }

            return cssClass;
        }
    }

    // An individual _logger for a specific software component
    // Is responsible to format log message and put it to console
    export class Logger {
        name: string;
        traceConsole: TraceConsole;

        constructor(name: string, traceConsole: TraceConsole) {
            this.name = name;
            this.traceConsole = traceConsole;
        }

        info(msg:string) {
            this.log(LogLevel.INFO, msg);
        }

        debug(msg:string) {
            this.log(LogLevel.DEBUG, msg);
        }

        warning(msg:string) {
            this.log(LogLevel.WARNING, msg);
        }

        error(msg:string) {
            this.log(LogLevel.ERROR, msg);
        }

        private log(logLevel:LogLevel, msg:string) {
            msg = "[" + this.name + "] " + msg;
            var logMsg = new TraceEntity(logLevel, msg);
            this.traceConsole.append2log(logMsg);
            this.traceConsole.append2Dom(logMsg);
        }
    }
}

$(document).ready(function () {
    var traceConsole = alasch.cookbook.ui.utils.LoggerFactory.getTraceConsole();
    $(document).keydown(traceConsole.document_OnKeydown.bind(traceConsole));
});


