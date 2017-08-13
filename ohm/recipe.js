["grammar",{"source":"Jsondecl {\r\n\r\n\t// module\r\n\r\n\tModule =\r\n\t\t| Expression -- simple\r\n\t\t| Import* Declaration* -- compound\r\n\r\n\tImport =\r\n\t\t| \"import\" \"{\" listOf<ImportItem, \",\"> \"}\" \"from\" string -- list\r\n\r\n\tImportItem =\r\n\t\t| identifier -- simple\r\n\r\n\tDeclaration =\r\n\t\t| \"const\" identifier \"=\" Expression -- const\r\n\t\t| \"export\" \"const\" identifier \"=\" Expression -- export_const\r\n\t\t| \"export\" \"default\" Expression -- export_default\r\n\r\n\t// expressions\r\n\r\n\tExpression = LogicalOr\r\n\r\n\tLogicalOr = ListOf<LogicalAnd, \"|\">\r\n\r\n\tLogicalAnd = ListOf<LogicalNot, \"&\">\r\n\r\n\tLogicalNot = \"!\"* Primary\r\n\r\n\tPrimary =\r\n\t\t| Literal\r\n\t\t| Grouping\r\n\t\t| ChainedCall\r\n\r\n\tLiteral =\r\n\t\t| Object\r\n\t\t| List\r\n\t\t| number\r\n\t\t| string\r\n\t\t| regexp\r\n\t\t| constant\r\n\r\n\tGrouping = \"(\" Expression \")\"\r\n\r\n\tChainedCall = ListOf<Call, \".\">\r\n\r\n\tCall = identifier ArgumentList?\r\n\r\n\tObject (an object) = \"{\" ListOf<Property, \",\"> \"}\"\r\n\r\n\tList (a list) = \"[\" ListOf<ListItem, \",\"> \"]\"\r\n\r\n\t// helpers\r\n\r\n\tArgumentList = \"(\" ListOf<Expression, \",\"> \")\"\r\n\r\n\tProperty (a property) = Expression \":\" Expression\r\n\r\n\tListItem (a list item) = Expression\r\n\r\n\t// lexical rules\r\n\r\n\tspace := \"\\t\" | \"\\n\" | \"\\r\" | \" \" | comment\r\n\tcomment = multiLineComment | singleLineComment\r\n\tmultiLineComment = \"/*\" (~\"*/\" any)* \"*/\"\r\n\tsingleLineComment = \"//\" (~(\"\\n\" | \"\\r\") any)*\r\n\r\n\tidentifier (an indentifier) = identifierStart identifierPart*\r\n\tidentifierStart = \"A\"..\"Z\" | \"a\"..\"z\" | \"_\"\r\n\tidentifierPart = identifierStart | digit\r\n\r\n\tnumber (a number) = \"-\"? integerPart (\".\" fractionalPart)? exponentPart?\r\n\tintegerPart = positiveInteger | \"0\"\r\n\tpositiveInteger = nonZeroDigit digit*\r\n\tfractionalPart = digit+\r\n\texponentPart = (\"e\" | \"E\") (\"+\" | \"-\")? digit+\r\n\tnonZeroDigit = \"1\"..\"9\"\r\n\r\n\tstring (a string) = \"\\\"\" stringCharacter* \"\\\"\"\r\n\tstringCharacter = normalChar | escapeSequence\r\n\tnormalChar = ~(\"\\\"\" | \"\\\\\" | \"\\u0000\"..\"\\u001f\") any\r\n\tescapeSequence = \"\\\\\" escapeSpec\r\n\tescapeSpec =\r\n\t\t| \"\\\"\"\r\n\t\t| \"\\\\\"\r\n\t\t| \"\\\\/\"\r\n\t\t| \"b\"\r\n\t\t| \"f\"\r\n\t\t| \"n\"\r\n\t\t| \"r\"\r\n\t\t| \"t\"\r\n\t\t| unicodeEscapeSpec\r\n\tunicodeEscapeSpec = \"u\" hexDigit hexDigit hexDigit hexDigit\r\n\r\n\tregexp (a regexp) = \"/\" regexpBody \"/\"\r\n\tregexpBody = (\"\\\\/\" | ~\"/\" any)*\r\n\r\n\tconstant =\r\n\t\t| \"null\" -- null\r\n\t\t| \"true\" -- true\r\n\t\t| \"false\" -- false\r\n}"},"Jsondecl",null,"Module",{"Module_simple":["define",{"sourceInterval":[43,63]},null,[],["app",{"sourceInterval":[43,53]},"Expression",[]]],"Module_compound":["define",{"sourceInterval":[69,101]},null,[],["seq",{"sourceInterval":[69,89]},["star",{"sourceInterval":[69,76]},["app",{"sourceInterval":[69,75]},"Import",[]]],["star",{"sourceInterval":[77,89]},["app",{"sourceInterval":[77,88]},"Declaration",[]]]]],"Module":["define",{"sourceInterval":[29,101]},null,[],["alt",{"sourceInterval":[41,101]},["app",{"sourceInterval":[43,53]},"Module_simple",[]],["app",{"sourceInterval":[69,89]},"Module_compound",[]]]],"Import_list":["define",{"sourceInterval":[120,182]},null,[],["seq",{"sourceInterval":[120,174]},["terminal",{"sourceInterval":[120,128]},"import"],["terminal",{"sourceInterval":[129,132]},"{"],["app",{"sourceInterval":[133,156]},"listOf",[["app",{"sourceInterval":[140,150]},"ImportItem",[]],["terminal",{"sourceInterval":[152,155]},","]]],["terminal",{"sourceInterval":[157,160]},"}"],["terminal",{"sourceInterval":[161,167]},"from"],["app",{"sourceInterval":[168,174]},"string",[]]]],"Import":["define",{"sourceInterval":[106,182]},null,[],["app",{"sourceInterval":[118,182]},"Import_list",[]]],"ImportItem_simple":["define",{"sourceInterval":[205,225]},null,[],["app",{"sourceInterval":[205,215]},"identifier",[]]],"ImportItem":["define",{"sourceInterval":[187,225]},null,[],["app",{"sourceInterval":[203,225]},"ImportItem_simple",[]]],"Declaration_const":["define",{"sourceInterval":[249,291]},null,[],["seq",{"sourceInterval":[249,282]},["terminal",{"sourceInterval":[249,256]},"const"],["app",{"sourceInterval":[257,267]},"identifier",[]],["terminal",{"sourceInterval":[268,271]},"="],["app",{"sourceInterval":[272,282]},"Expression",[]]]],"Declaration_export_const":["define",{"sourceInterval":[297,355]},null,[],["seq",{"sourceInterval":[297,339]},["terminal",{"sourceInterval":[297,305]},"export"],["terminal",{"sourceInterval":[306,313]},"const"],["app",{"sourceInterval":[314,324]},"identifier",[]],["terminal",{"sourceInterval":[325,328]},"="],["app",{"sourceInterval":[329,339]},"Expression",[]]]],"Declaration_export_default":["define",{"sourceInterval":[361,408]},null,[],["seq",{"sourceInterval":[361,390]},["terminal",{"sourceInterval":[361,369]},"export"],["terminal",{"sourceInterval":[370,379]},"default"],["app",{"sourceInterval":[380,390]},"Expression",[]]]],"Declaration":["define",{"sourceInterval":[230,408]},null,[],["alt",{"sourceInterval":[247,408]},["app",{"sourceInterval":[249,282]},"Declaration_const",[]],["app",{"sourceInterval":[297,339]},"Declaration_export_const",[]],["app",{"sourceInterval":[361,390]},"Declaration_export_default",[]]]],"Expression":["define",{"sourceInterval":[432,454]},null,[],["app",{"sourceInterval":[445,454]},"LogicalOr",[]]],"LogicalOr":["define",{"sourceInterval":[459,494]},null,[],["app",{"sourceInterval":[471,494]},"ListOf",[["app",{"sourceInterval":[478,488]},"LogicalAnd",[]],["terminal",{"sourceInterval":[490,493]},"|"]]]],"LogicalAnd":["define",{"sourceInterval":[499,535]},null,[],["app",{"sourceInterval":[512,535]},"ListOf",[["app",{"sourceInterval":[519,529]},"LogicalNot",[]],["terminal",{"sourceInterval":[531,534]},"&"]]]],"LogicalNot":["define",{"sourceInterval":[540,565]},null,[],["seq",{"sourceInterval":[553,565]},["star",{"sourceInterval":[553,557]},["terminal",{"sourceInterval":[553,556]},"!"]],["app",{"sourceInterval":[558,565]},"Primary",[]]]],"Primary":["define",{"sourceInterval":[570,623]},null,[],["alt",{"sourceInterval":[583,623]},["app",{"sourceInterval":[585,592]},"Literal",[]],["app",{"sourceInterval":[598,606]},"Grouping",[]],["app",{"sourceInterval":[612,623]},"ChainedCall",[]]]],"Literal":["define",{"sourceInterval":[628,709]},null,[],["alt",{"sourceInterval":[641,709]},["app",{"sourceInterval":[643,649]},"Object",[]],["app",{"sourceInterval":[655,659]},"List",[]],["app",{"sourceInterval":[665,671]},"number",[]],["app",{"sourceInterval":[677,683]},"string",[]],["app",{"sourceInterval":[689,695]},"regexp",[]],["app",{"sourceInterval":[701,709]},"constant",[]]]],"Grouping":["define",{"sourceInterval":[714,743]},null,[],["seq",{"sourceInterval":[725,743]},["terminal",{"sourceInterval":[725,728]},"("],["app",{"sourceInterval":[729,739]},"Expression",[]],["terminal",{"sourceInterval":[740,743]},")"]]],"ChainedCall":["define",{"sourceInterval":[748,779]},null,[],["app",{"sourceInterval":[762,779]},"ListOf",[["app",{"sourceInterval":[769,773]},"Call",[]],["terminal",{"sourceInterval":[775,778]},"."]]]],"Call":["define",{"sourceInterval":[784,815]},null,[],["seq",{"sourceInterval":[791,815]},["app",{"sourceInterval":[791,801]},"identifier",[]],["opt",{"sourceInterval":[802,815]},["app",{"sourceInterval":[802,814]},"ArgumentList",[]]]]],"Object":["define",{"sourceInterval":[820,870]},"an object",[],["seq",{"sourceInterval":[841,870]},["terminal",{"sourceInterval":[841,844]},"{"],["app",{"sourceInterval":[845,866]},"ListOf",[["app",{"sourceInterval":[852,860]},"Property",[]],["terminal",{"sourceInterval":[862,865]},","]]],["terminal",{"sourceInterval":[867,870]},"}"]]],"List":["define",{"sourceInterval":[875,920]},"a list",[],["seq",{"sourceInterval":[891,920]},["terminal",{"sourceInterval":[891,894]},"["],["app",{"sourceInterval":[895,916]},"ListOf",[["app",{"sourceInterval":[902,910]},"ListItem",[]],["terminal",{"sourceInterval":[912,915]},","]]],["terminal",{"sourceInterval":[917,920]},"]"]]],"ArgumentList":["define",{"sourceInterval":[940,986]},null,[],["seq",{"sourceInterval":[955,986]},["terminal",{"sourceInterval":[955,958]},"("],["app",{"sourceInterval":[959,982]},"ListOf",[["app",{"sourceInterval":[966,976]},"Expression",[]],["terminal",{"sourceInterval":[978,981]},","]]],["terminal",{"sourceInterval":[983,986]},")"]]],"Property":["define",{"sourceInterval":[991,1040]},"a property",[],["seq",{"sourceInterval":[1015,1040]},["app",{"sourceInterval":[1015,1025]},"Expression",[]],["terminal",{"sourceInterval":[1026,1029]},":"],["app",{"sourceInterval":[1030,1040]},"Expression",[]]]],"ListItem":["define",{"sourceInterval":[1045,1080]},"a list item",[],["app",{"sourceInterval":[1070,1080]},"Expression",[]]],"space":["override",{"sourceInterval":[1106,1149]},null,[],["alt",{"sourceInterval":[1115,1149]},["terminal",{"sourceInterval":[1115,1119]},"\t"],["terminal",{"sourceInterval":[1122,1126]},"\n"],["terminal",{"sourceInterval":[1129,1133]},"\r"],["terminal",{"sourceInterval":[1136,1139]}," "],["app",{"sourceInterval":[1142,1149]},"comment",[]]]],"comment":["define",{"sourceInterval":[1152,1198]},null,[],["alt",{"sourceInterval":[1162,1198]},["app",{"sourceInterval":[1162,1178]},"multiLineComment",[]],["app",{"sourceInterval":[1181,1198]},"singleLineComment",[]]]],"multiLineComment":["define",{"sourceInterval":[1201,1242]},null,[],["seq",{"sourceInterval":[1220,1242]},["terminal",{"sourceInterval":[1220,1224]},"/*"],["star",{"sourceInterval":[1225,1237]},["seq",{"sourceInterval":[1226,1235]},["not",{"sourceInterval":[1226,1231]},["terminal",{"sourceInterval":[1227,1231]},"*/"]],["app",{"sourceInterval":[1232,1235]},"any",[]]]],["terminal",{"sourceInterval":[1238,1242]},"*/"]]],"singleLineComment":["define",{"sourceInterval":[1245,1291]},null,[],["seq",{"sourceInterval":[1265,1291]},["terminal",{"sourceInterval":[1265,1269]},"//"],["star",{"sourceInterval":[1270,1291]},["seq",{"sourceInterval":[1271,1289]},["not",{"sourceInterval":[1271,1285]},["alt",{"sourceInterval":[1273,1284]},["terminal",{"sourceInterval":[1273,1277]},"\n"],["terminal",{"sourceInterval":[1280,1284]},"\r"]]],["app",{"sourceInterval":[1286,1289]},"any",[]]]]]],"identifier":["define",{"sourceInterval":[1296,1357]},"an indentifier",[],["seq",{"sourceInterval":[1326,1357]},["app",{"sourceInterval":[1326,1341]},"identifierStart",[]],["star",{"sourceInterval":[1342,1357]},["app",{"sourceInterval":[1342,1356]},"identifierPart",[]]]]],"identifierStart":["define",{"sourceInterval":[1360,1403]},null,[],["alt",{"sourceInterval":[1378,1403]},["range",{"sourceInterval":[1378,1386]},"A","Z"],["range",{"sourceInterval":[1389,1397]},"a","z"],["terminal",{"sourceInterval":[1400,1403]},"_"]]],"identifierPart":["define",{"sourceInterval":[1406,1446]},null,[],["alt",{"sourceInterval":[1423,1446]},["app",{"sourceInterval":[1423,1438]},"identifierStart",[]],["app",{"sourceInterval":[1441,1446]},"digit",[]]]],"number":["define",{"sourceInterval":[1451,1523]},"a number",[],["seq",{"sourceInterval":[1471,1523]},["opt",{"sourceInterval":[1471,1475]},["terminal",{"sourceInterval":[1471,1474]},"-"]],["app",{"sourceInterval":[1476,1487]},"integerPart",[]],["opt",{"sourceInterval":[1488,1509]},["seq",{"sourceInterval":[1489,1507]},["terminal",{"sourceInterval":[1489,1492]},"."],["app",{"sourceInterval":[1493,1507]},"fractionalPart",[]]]],["opt",{"sourceInterval":[1510,1523]},["app",{"sourceInterval":[1510,1522]},"exponentPart",[]]]]],"integerPart":["define",{"sourceInterval":[1526,1561]},null,[],["alt",{"sourceInterval":[1540,1561]},["app",{"sourceInterval":[1540,1555]},"positiveInteger",[]],["terminal",{"sourceInterval":[1558,1561]},"0"]]],"positiveInteger":["define",{"sourceInterval":[1564,1601]},null,[],["seq",{"sourceInterval":[1582,1601]},["app",{"sourceInterval":[1582,1594]},"nonZeroDigit",[]],["star",{"sourceInterval":[1595,1601]},["app",{"sourceInterval":[1595,1600]},"digit",[]]]]],"fractionalPart":["define",{"sourceInterval":[1604,1627]},null,[],["plus",{"sourceInterval":[1621,1627]},["app",{"sourceInterval":[1621,1626]},"digit",[]]]],"exponentPart":["define",{"sourceInterval":[1630,1676]},null,[],["seq",{"sourceInterval":[1645,1676]},["alt",{"sourceInterval":[1646,1655]},["terminal",{"sourceInterval":[1646,1649]},"e"],["terminal",{"sourceInterval":[1652,1655]},"E"]],["opt",{"sourceInterval":[1657,1669]},["alt",{"sourceInterval":[1658,1667]},["terminal",{"sourceInterval":[1658,1661]},"+"],["terminal",{"sourceInterval":[1664,1667]},"-"]]],["plus",{"sourceInterval":[1670,1676]},["app",{"sourceInterval":[1670,1675]},"digit",[]]]]],"nonZeroDigit":["define",{"sourceInterval":[1679,1702]},null,[],["range",{"sourceInterval":[1694,1702]},"1","9"]],"string":["define",{"sourceInterval":[1707,1753]},"a string",[],["seq",{"sourceInterval":[1727,1753]},["terminal",{"sourceInterval":[1727,1731]},"\""],["star",{"sourceInterval":[1732,1748]},["app",{"sourceInterval":[1732,1747]},"stringCharacter",[]]],["terminal",{"sourceInterval":[1749,1753]},"\""]]],"stringCharacter":["define",{"sourceInterval":[1756,1801]},null,[],["alt",{"sourceInterval":[1774,1801]},["app",{"sourceInterval":[1774,1784]},"normalChar",[]],["app",{"sourceInterval":[1787,1801]},"escapeSequence",[]]]],"normalChar":["define",{"sourceInterval":[1804,1856]},null,[],["seq",{"sourceInterval":[1817,1856]},["not",{"sourceInterval":[1817,1852]},["alt",{"sourceInterval":[1819,1851]},["terminal",{"sourceInterval":[1819,1823]},"\""],["terminal",{"sourceInterval":[1826,1830]},"\\"],["range",{"sourceInterval":[1833,1851]},"\u0000","\u001f"]]],["app",{"sourceInterval":[1853,1856]},"any",[]]]],"escapeSequence":["define",{"sourceInterval":[1859,1891]},null,[],["seq",{"sourceInterval":[1876,1891]},["terminal",{"sourceInterval":[1876,1880]},"\\"],["app",{"sourceInterval":[1881,1891]},"escapeSpec",[]]]],"escapeSpec":["define",{"sourceInterval":[1894,2005]},null,[],["alt",{"sourceInterval":[1910,2005]},["terminal",{"sourceInterval":[1912,1916]},"\""],["terminal",{"sourceInterval":[1922,1926]},"\\"],["terminal",{"sourceInterval":[1932,1937]},"\\/"],["terminal",{"sourceInterval":[1943,1946]},"b"],["terminal",{"sourceInterval":[1952,1955]},"f"],["terminal",{"sourceInterval":[1961,1964]},"n"],["terminal",{"sourceInterval":[1970,1973]},"r"],["terminal",{"sourceInterval":[1979,1982]},"t"],["app",{"sourceInterval":[1988,2005]},"unicodeEscapeSpec",[]]]],"unicodeEscapeSpec":["define",{"sourceInterval":[2008,2067]},null,[],["seq",{"sourceInterval":[2028,2067]},["terminal",{"sourceInterval":[2028,2031]},"u"],["app",{"sourceInterval":[2032,2040]},"hexDigit",[]],["app",{"sourceInterval":[2041,2049]},"hexDigit",[]],["app",{"sourceInterval":[2050,2058]},"hexDigit",[]],["app",{"sourceInterval":[2059,2067]},"hexDigit",[]]]],"regexp":["define",{"sourceInterval":[2072,2110]},"a regexp",[],["seq",{"sourceInterval":[2092,2110]},["terminal",{"sourceInterval":[2092,2095]},"/"],["app",{"sourceInterval":[2096,2106]},"regexpBody",[]],["terminal",{"sourceInterval":[2107,2110]},"/"]]],"regexpBody":["define",{"sourceInterval":[2113,2145]},null,[],["star",{"sourceInterval":[2126,2145]},["alt",{"sourceInterval":[2127,2143]},["terminal",{"sourceInterval":[2127,2132]},"\\/"],["seq",{"sourceInterval":[2135,2143]},["not",{"sourceInterval":[2135,2139]},["terminal",{"sourceInterval":[2136,2139]},"/"]],["app",{"sourceInterval":[2140,2143]},"any",[]]]]]],"constant_null":["define",{"sourceInterval":[2166,2180]},null,[],["terminal",{"sourceInterval":[2166,2172]},"null"]],"constant_true":["define",{"sourceInterval":[2186,2200]},null,[],["terminal",{"sourceInterval":[2186,2192]},"true"]],"constant_false":["define",{"sourceInterval":[2206,2222]},null,[],["terminal",{"sourceInterval":[2206,2213]},"false"]],"constant":["define",{"sourceInterval":[2150,2222]},null,[],["alt",{"sourceInterval":[2164,2222]},["app",{"sourceInterval":[2166,2172]},"constant_null",[]],["app",{"sourceInterval":[2186,2192]},"constant_true",[]],["app",{"sourceInterval":[2206,2213]},"constant_false",[]]]]}]