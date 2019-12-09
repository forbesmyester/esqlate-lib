/* tslint:disable */
const parser = require("../pegjs/parser");
/* tslint:enable */

import {
    EsqlateParameter,
    EsqlateStatement,
    EsqlateStatementNormalized } from "../res/schema-definition";

export * from "../res/schema-definition";
export * from "../res/schema-result";
export * from "../res/schema-request";
export * from "../res/schema-request-creation";
export * from "../res/schema-request-creation-response";

export interface PullParameterAnswer {
    pre: string;
    parameter: string;
    post?: string;
    length: number;
}

export enum ParsedType {
    TEXT = "TEXT",
    VARIABLE = "VARIABLE",
}
export interface ParsedText { type: ParsedType.TEXT; text: string; }
export interface ParsedVariable { type: ParsedType.VARIABLE; function: string; variable: string[]; }
export type ParsedItem = ParsedText | ParsedVariable;

export function rawParse(s: string): ParsedItem[] {
    return parser.parse(s);
}

export function removeLineBeginningWhitespace(s: string): string {
    const postNewlineRemove = s.replace(/^\n/, "").match(/^([ \t]*)/);
    if (!postNewlineRemove) { return s; }
    return s.split("\n").map((line) => {
        if (line.indexOf(postNewlineRemove[1]) === 0) {
            return line.replace(postNewlineRemove[1], "");
        }
        return line;
    }).join("\n");
}

export function normalize(parameters: EsqlateParameter[], statement: EsqlateStatement): EsqlateStatementNormalized {

    const ret: Array<(string | EsqlateParameter)> = typeof statement === "string" ?
        [statement] :
        statement;

    function getParameter(findingName: string): EsqlateParameter {
        const r = parameters.find(({ name }) => name === findingName);
        if (r === undefined) {
            throw new Error(`Statement refers to parameter ${findingName} but it does not exist`);
        }
        return r;
    }

    function parameterReducer(acc: EsqlateStatementNormalized, stat: string | EsqlateParameter): EsqlateStatementNormalized {
        if (typeof stat !== "string") {
            return acc.concat(stat);
        }
        return rawParse(stat).reduce(
            (innerAcc, item) => {
                if (item.type === ParsedType.TEXT) {
                    return innerAcc.concat(item.text);
                }
                if (item.function !== "noop") {
                    throw new Error("The function for a variable must be noop");
                }
                if (item.variable.length !== 1) {
                    throw new Error("Only one variable for a ${} is allowed");
                }
                return innerAcc.concat(getParameter(item.variable[0]));
            },
            acc,
        );
    }

    return ret.reduce(parameterReducer, []);
}

export interface HDocAttrs { [k: string]: string; }
export type TagIdClass = string;
export interface HDoc {
    tagIdClass: TagIdClass;
    inner: HDoc[] | string;
    attrs: HDocAttrs;
}

export function newlineBreak(statement: EsqlateStatementNormalized): EsqlateStatementNormalized[] {

    function allButLast<K>(ar: K[]): K[] {
        const ret = [];
        for (let i = 0; i < ar.length - 1; i++) {
            ret.push(ar[i]);
        }
        return ret;
    }

    function last<K>(ar: K[]): K {
        if (ar.length === 0) {
            throw new Error("newlineBreak: list: Empty");
        }
        return ar[ar.length - 1];
    }

    function reducer(acc: EsqlateStatementNormalized[], item: string | EsqlateParameter): EsqlateStatementNormalized[] {

        if (typeof item !== "string") {
            return [
                ...allButLast(acc),
                last(acc).concat([item]),
            ];
        }

        const [split0, ...splitRest] = item.split(/[\r\n]/);

        return [
            ...allButLast(acc),
            last(acc).concat([split0]),
        ].concat(splitRest.map((r) => [r]));
    }

    return statement.reduce(reducer, [[]]);

}

export function html_line(statement: EsqlateStatementNormalized): HDoc {

    function pre(s: string): string {
        const r = s.replace("\t", "    ");
        const m = r.match(/^ +/);
        if (m === null) {
            return r;
        }
        return m[0].replace(/ /g, " ") + r.substr(m[0].length);
    }

    function mapper(ed: string | EsqlateParameter): HDoc {
        if (typeof ed === "string") {
            return { tagIdClass: "span", inner: pre(ed), attrs: {} };
        }
        ed = ed as EsqlateParameter;
        if (ed.type === "select") {
            return {
                tagIdClass: "select",
                inner: [ ],
                attrs: { name: ed.name },
            };
        }
        if (ed.type === "string") {
            return { tagIdClass: "input", inner: [ ], attrs: { name: ed.name } };
        }
        if (ed.type === "integer") {
            return { tagIdClass: "input", inner: [ ], attrs: { name: ed.name, type: "number" } };
        }
        if (ed.type === "server") {
            return { tagIdClass: "span", inner: "$" + pre(ed.name), attrs: {} };
        }
        throw new Error(`Unknown parameter type ${ed.type}`);
    }

    return {
        tagIdClass: "div.line",
        inner: statement.map(mapper),
        attrs: {},
    };

}

export function html(statement: EsqlateStatementNormalized): HDoc {
    return {
        tagIdClass: "div",
        attrs: {},
        inner: newlineBreak(statement).map(html_line),
    };
}

export function forHyper(h: (x: any[]) => any, hdoc: HDoc): any {
    return h([
        hdoc.tagIdClass,
        hdoc.inner instanceof Array ?
            hdoc.inner.map((hd) => {
                if (hd instanceof String) {
                    return hd;
                }
                return forHyper(h, hd);
            }) :
            hdoc.inner,
        hdoc.attrs,
    ]);
}
