Statement
 = (ComplexVariable / SimpleVariable / Text)+

ComplexVariable
 = Dollar "{" f:FunctionCall? v:ValidVariableName "}" {return { function: (f && f.length) ? f : "noop", variable: v } }

FunctionCall
 = f:Function " " { return f.reduce((acc, i) => acc + i) }

SimpleVariable
 = Dollar v:ValidVariableName { return { type: "VARIABLE", function: "noop", variable: v } }

Text
  = t: (ErrorDollar / EscapedDollar / NotDollar)+ { return { type: "TEXT", text: t.reduce((acc, i) => acc + i) } }

EscapedDollar
  = "$$" { return "$" }

ErrorDollar
  = "$" x:[^a-z\{\$] { return "$" + x }

Function
  = [a-z]+

ValidVariableName
  = v:[a-z]vs:[a-z_]* { return v + vs.reduce((acc, i) => acc + i) }

NotDollar
  = [^$]

Dollar
  = "$"

