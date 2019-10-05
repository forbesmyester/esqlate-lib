import {
    EsqlateParameter,
    EsqlateStatement,
    EsqlateStatementNormalized } from "../res/schema-definition";

export * from "../res/schema-definition";
export * from "../res/schema-result";
export * from "../res/schema-request";
export * from "../res/schema-request-creation";
export * from "../res/schema-request-creation-response";

export function normalize(variables: EsqlateParameter[], statement: EsqlateStatement): EsqlateStatementNormalized {

    let foundVariable: boolean = true;
    let foundEscapedDollar: boolean = true;
    let loop: number = 0;
    let ret: Array<(string | EsqlateParameter)> = typeof statement === "string" ?
        [statement] :
        statement;

    function getVariable(findingName: string): EsqlateParameter {
        const r = variables.find(({ name }) => name === findingName);
        if (r === undefined) {
            throw new Error(`Statement refers to variable ${findingName} but it does not exist`);
        }
        return r;
    }

    function variableReducer(acc: EsqlateStatementNormalized, stat: string | EsqlateParameter): EsqlateStatementNormalized {
        if (typeof stat !== "string") {
            return acc.concat(stat);
        }
        const re = /((?:\r|\n|.){0,9999}(^|[^\$]))(\$[a-z_]{1,300})((?:\r|\n|.){0,9999})/;
        const match: null|RegExpMatchArray = stat.match(re);
        foundVariable = foundVariable ? foundVariable : match !== null;
        if (match) {
            const toAdd = [match[1], getVariable(match[3].substring(1))];
            if (match[4] !== "") {
                toAdd.push(match[4]);
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

    while (foundVariable && ++loop < 10000) {
        foundVariable = false;
        ret = ret.reduce(variableReducer, []);
    }

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
