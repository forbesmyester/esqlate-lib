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

// tslint:disable:max-line-length
const parameterPullMainRe = /((?:\r|\n|.){0,99999}(^|[^\$]))(\$\{[a-z_]{1,300}\}|\$[a-z_]{1,300})((?:\r|\n|.){0,99999})/;
// tslint:enable:max-line-length
const parameterRe = /\$\{?([a-z_]{1,300})\}?/;

export function pullParameter(s: string): PullParameterAnswer|null {
    const match: null|RegExpMatchArray = s.match(parameterPullMainRe);
    if (match) {
        const paramMatch = match[3].match(parameterRe);
        if (paramMatch === null) {
            throw new Error("convert.ts: pullParameter: Identified Parameter but could not get name");
        }
        const r: PullParameterAnswer = {
            pre: match[1],
            parameter: paramMatch[1],
            length: match.length,
        };
        if (match[4] !== "") {
            r.post = match[4];
        }
        return r;
    }
    return null;
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

    let foundParameter: boolean = true;
    let foundEscapedDollar: boolean = true;
    let loop: number = 0;
    let ret: Array<(string | EsqlateParameter)> = typeof statement === "string" ?
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
        const match = pullParameter(stat);
        foundParameter = foundParameter ? foundParameter : match !== null;
        if (match) {
            const toAdd = [match.pre, getParameter(match.parameter)];
            if (match.post) {
                toAdd.push(match.post);
            }
            return acc.concat(toAdd);
        }
        return acc.concat(stat);
    }

    function dollarReducer(acc: EsqlateStatementNormalized, stat: string | EsqlateParameter): EsqlateStatementNormalized {
        if (typeof stat !== "string") {
            return acc.concat(stat);
        }
        const match: null|RegExpMatchArray = stat.match(/\$\$/);
        foundEscapedDollar = foundEscapedDollar ? foundEscapedDollar : match !== null;
        if (match) {
            return acc.concat([stat.replace(/\$\$/g, "$")]);
        }
        return acc.concat(stat);
    }

    while (foundParameter && ++loop < 10000) {
        foundParameter = false;
        ret = ret.reduce(parameterReducer, []);
    }

    loop = 0;
    while (foundEscapedDollar && ++loop < 10000) {
        foundEscapedDollar = false;
        ret = ret.reduce(dollarReducer, []);
    }

    return ret;
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
