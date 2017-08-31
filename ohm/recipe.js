["grammar",{"source":"JSONdecl {\n\n\t// module\n\n\tModule =\n\t\t| Import* Declaration* ~Declarator Expression #term -- def\n\t\t| Import* Declaration* -- nodef\n\n\tImport =\n\t\t| \"import\" ImportClause \"from\" string #term -- list\n\n\tImportClause =\n\t\t| NamedImports\n\n\tNamedImports =\n\t\t| \"{\" \"}\" -- empty\n\t\t| \"{\" NonemptyListOf<ImportSpecifier, \",\"> \",\"? \"}\" -- list\n\n\tImportSpecifier =\n\t\t| identifier \"as\" identifier -- rename\n\t\t| identifier -- simple\n\n\tDeclaration =\n\t\t| \"const\" identifier \"=\" Expression #term -- const\n\t\t| \"export\" \"const\" identifier \"=\" Expression #term -- export_const\n\t\t| \"export\" \"default\" Expression #term -- export_default\n\n\t// expressions\n\n\tExpression = LogicalOr\n\n\tLogicalOr = NonemptyListOf<LogicalAnd, \"|\">\n\n\tLogicalAnd = NonemptyListOf<LogicalNot, \"&\">\n\n\tLogicalNot = \"!\"* Primary\n\n\tPrimary =\n\t\t| Literal\n\t\t| Grouping\n\t\t| Chain\n\n\tLiteral =\n\t\t| Object\n\t\t| Array\n\t\t| number\n\t\t| String\n\t\t| regexp\n\t\t| constant\n\n\tGrouping = \"(\" Expression \")\"\t\n\n\tChain = NonemptyListOf<(Call|Ref), \".\">\n\n\tRef = identifier\n\n\tCall = identifier \"(\" ListOf<Expression, \",\"> \")\"\n\n\tObject (an object) = \"{\" ListOf<Property, \",\"> \"}\"\n\n\tArray (an array) = \"[\" ListOf<ListItem, \",\"> \"]\"\n\n\tString = string\n\n\t// helpers\n\n\tProperty (a property) =\n\t\t| Expression Cardinality \":\" Expression -- cardinality\n\t\t| Expression \":\" Expression -- default\n\t\t| Expression \"-\" -- deny\n\n\tCardinality = \"?\" | \"*\" | \"+\" | \"-\" | NumericCardinality\n\n\tNumericCardinality =\n\t\t| \"{\" natural \"}\" -- single\n\t\t| \"{\" natural \"..\" natural \"}\" -- range\n\n\tListItem (a list item) = Expression\n\n\tDeclarator = \"import\" | \"export\" | \"const\"\n\n\t// lexical rules\n\n\tspace := \"\\t\" | \" \" | \"\\n\" | \"\\r\" | comment\n\tspaceInline = \"\\t\" | \" \" | commentInline\n\tcomment = blockComment | lineEndComment\n\tcommentInline = blockCommentInline | lineEndComment\n\tblockComment = \"/*\" (~\"*/\" any)* \"*/\"\n\tblockCommentInline = \"/*\" (~(\"*/\" | \"\\n\" | \"\\r\") any)* \"*/\"\n\tlineEndComment = \"//\" (~(\"\\n\" | \"\\r\") any)*\n\tterm =\n\t\t| space* (\";\" | end)\n\t\t| spaceInline* (\"\\r\" | \"\\n\" | end)\n\n\tidentifier (an indentifier) = identifierStart identifierPart*\n\tidentifierStart = \"A\"..\"Z\" | \"a\"..\"z\" | \"_\"\n\tidentifierPart = identifierStart | digit\n\n\tnumber (a number) = \"-\"? natural (\".\" fractionalPart)? exponentPart?\n\tnatural = positiveInteger | \"0\"\n\tpositiveInteger = nonZeroDigit digit*\n\tfractionalPart = digit+\n\texponentPart = (\"e\" | \"E\") (\"+\" | \"-\")? digit+\n\tnonZeroDigit = \"1\"..\"9\"\n\n\tstring (a string) = \"\\\"\" stringCharacter* \"\\\"\"\n\tstringCharacter = normalChar | escapeSequence\n\tnormalChar = ~(\"\\\"\" | \"\\\\\" | \"\\u0000\"..\"\\u001f\") any\n\tescapeSequence = \"\\\\\" escapeSpec\n\tescapeSpec =\n\t\t| \"\\\"\"\n\t\t| \"\\\\\"\n\t\t| \"\\\\/\"\n\t\t| \"b\"\n\t\t| \"f\"\n\t\t| \"n\"\n\t\t| \"r\"\n\t\t| \"t\"\n\t\t| unicodeEscapeSpec\n\tunicodeEscapeSpec = \"u\" hexDigit hexDigit hexDigit hexDigit\n\n\tregexp (a regular expression) = \"/\" regexpBody \"/\" regexpFlags\n\tregexpBody = (\"\\\\/\" | ~\"/\" any)+\n\tregexpFlags = (\"A\"..\"Z\" | \"a\"..\"z\")*\n\n\tconstant =\n\t\t| \"this\" -- this\n\t\t| \"null\" -- null\n\t\t| \"true\" -- true\n\t\t| \"false\" -- false\n}"},"JSONdecl",null,"Module",{"Module_def":["define",{"sourceInterval":[38,94]},null,[],["seq",{"sourceInterval":[38,87]},["star",{"sourceInterval":[38,45]},["app",{"sourceInterval":[38,44]},"Import",[]]],["star",{"sourceInterval":[46,58]},["app",{"sourceInterval":[46,57]},"Declaration",[]]],["not",{"sourceInterval":[59,70]},["app",{"sourceInterval":[60,70]},"Declarator",[]]],["app",{"sourceInterval":[71,81]},"Expression",[]],["lex",{"sourceInterval":[82,87]},["app",{"sourceInterval":[83,87]},"term",[]]]]],"Module_nodef":["define",{"sourceInterval":[99,128]},null,[],["seq",{"sourceInterval":[99,119]},["star",{"sourceInterval":[99,106]},["app",{"sourceInterval":[99,105]},"Import",[]]],["star",{"sourceInterval":[107,119]},["app",{"sourceInterval":[107,118]},"Declaration",[]]]]],"Module":["define",{"sourceInterval":[25,128]},null,[],["alt",{"sourceInterval":[36,128]},["app",{"sourceInterval":[38,87]},"Module_def",[]],["app",{"sourceInterval":[99,119]},"Module_nodef",[]]]],"Import_list":["define",{"sourceInterval":[144,193]},null,[],["seq",{"sourceInterval":[144,185]},["terminal",{"sourceInterval":[144,152]},"import"],["app",{"sourceInterval":[153,165]},"ImportClause",[]],["terminal",{"sourceInterval":[166,172]},"from"],["app",{"sourceInterval":[173,179]},"string",[]],["lex",{"sourceInterval":[180,185]},["app",{"sourceInterval":[181,185]},"term",[]]]]],"Import":["define",{"sourceInterval":[131,193]},null,[],["app",{"sourceInterval":[142,193]},"Import_list",[]]],"ImportClause":["define",{"sourceInterval":[196,227]},null,[],["app",{"sourceInterval":[213,227]},"NamedImports",[]]],"NamedImports_empty":["define",{"sourceInterval":[249,265]},null,[],["seq",{"sourceInterval":[249,256]},["terminal",{"sourceInterval":[249,252]},"{"],["terminal",{"sourceInterval":[253,256]},"}"]]],"NamedImports_list":["define",{"sourceInterval":[270,327]},null,[],["seq",{"sourceInterval":[270,319]},["terminal",{"sourceInterval":[270,273]},"{"],["app",{"sourceInterval":[274,310]},"NonemptyListOf",[["app",{"sourceInterval":[289,304]},"ImportSpecifier",[]],["terminal",{"sourceInterval":[306,309]},","]]],["opt",{"sourceInterval":[311,315]},["terminal",{"sourceInterval":[311,314]},","]],["terminal",{"sourceInterval":[316,319]},"}"]]],"NamedImports":["define",{"sourceInterval":[230,327]},null,[],["alt",{"sourceInterval":[247,327]},["app",{"sourceInterval":[249,256]},"NamedImports_empty",[]],["app",{"sourceInterval":[270,319]},"NamedImports_list",[]]]],"ImportSpecifier_rename":["define",{"sourceInterval":[352,388]},null,[],["seq",{"sourceInterval":[352,378]},["app",{"sourceInterval":[352,362]},"identifier",[]],["terminal",{"sourceInterval":[363,367]},"as"],["app",{"sourceInterval":[368,378]},"identifier",[]]]],"ImportSpecifier_simple":["define",{"sourceInterval":[393,413]},null,[],["app",{"sourceInterval":[393,403]},"identifier",[]]],"ImportSpecifier":["define",{"sourceInterval":[330,413]},null,[],["alt",{"sourceInterval":[350,413]},["app",{"sourceInterval":[352,378]},"ImportSpecifier_rename",[]],["app",{"sourceInterval":[393,403]},"ImportSpecifier_simple",[]]]],"Declaration_const":["define",{"sourceInterval":[434,482]},null,[],["seq",{"sourceInterval":[434,473]},["terminal",{"sourceInterval":[434,441]},"const"],["app",{"sourceInterval":[442,452]},"identifier",[]],["terminal",{"sourceInterval":[453,456]},"="],["app",{"sourceInterval":[457,467]},"Expression",[]],["lex",{"sourceInterval":[468,473]},["app",{"sourceInterval":[469,473]},"term",[]]]]],"Declaration_export_const":["define",{"sourceInterval":[487,551]},null,[],["seq",{"sourceInterval":[487,535]},["terminal",{"sourceInterval":[487,495]},"export"],["terminal",{"sourceInterval":[496,503]},"const"],["app",{"sourceInterval":[504,514]},"identifier",[]],["terminal",{"sourceInterval":[515,518]},"="],["app",{"sourceInterval":[519,529]},"Expression",[]],["lex",{"sourceInterval":[530,535]},["app",{"sourceInterval":[531,535]},"term",[]]]]],"Declaration_export_default":["define",{"sourceInterval":[556,609]},null,[],["seq",{"sourceInterval":[556,591]},["terminal",{"sourceInterval":[556,564]},"export"],["terminal",{"sourceInterval":[565,574]},"default"],["app",{"sourceInterval":[575,585]},"Expression",[]],["lex",{"sourceInterval":[586,591]},["app",{"sourceInterval":[587,591]},"term",[]]]]],"Declaration":["define",{"sourceInterval":[416,609]},null,[],["alt",{"sourceInterval":[432,609]},["app",{"sourceInterval":[434,473]},"Declaration_const",[]],["app",{"sourceInterval":[487,535]},"Declaration_export_const",[]],["app",{"sourceInterval":[556,591]},"Declaration_export_default",[]]]],"Expression":["define",{"sourceInterval":[629,651]},null,[],["app",{"sourceInterval":[642,651]},"LogicalOr",[]]],"LogicalOr":["define",{"sourceInterval":[654,697]},null,[],["app",{"sourceInterval":[666,697]},"NonemptyListOf",[["app",{"sourceInterval":[681,691]},"LogicalAnd",[]],["terminal",{"sourceInterval":[693,696]},"|"]]]],"LogicalAnd":["define",{"sourceInterval":[700,744]},null,[],["app",{"sourceInterval":[713,744]},"NonemptyListOf",[["app",{"sourceInterval":[728,738]},"LogicalNot",[]],["terminal",{"sourceInterval":[740,743]},"&"]]]],"LogicalNot":["define",{"sourceInterval":[747,772]},null,[],["seq",{"sourceInterval":[760,772]},["star",{"sourceInterval":[760,764]},["terminal",{"sourceInterval":[760,763]},"!"]],["app",{"sourceInterval":[765,772]},"Primary",[]]]],"Primary":["define",{"sourceInterval":[775,819]},null,[],["alt",{"sourceInterval":[787,819]},["app",{"sourceInterval":[789,796]},"Literal",[]],["app",{"sourceInterval":[801,809]},"Grouping",[]],["app",{"sourceInterval":[814,819]},"Chain",[]]]],"Literal":["define",{"sourceInterval":[822,898]},null,[],["alt",{"sourceInterval":[834,898]},["app",{"sourceInterval":[836,842]},"Object",[]],["app",{"sourceInterval":[847,852]},"Array",[]],["app",{"sourceInterval":[857,863]},"number",[]],["app",{"sourceInterval":[868,874]},"String",[]],["app",{"sourceInterval":[879,885]},"regexp",[]],["app",{"sourceInterval":[890,898]},"constant",[]]]],"Grouping":["define",{"sourceInterval":[901,930]},null,[],["seq",{"sourceInterval":[912,930]},["terminal",{"sourceInterval":[912,915]},"("],["app",{"sourceInterval":[916,926]},"Expression",[]],["terminal",{"sourceInterval":[927,930]},")"]]],"Chain":["define",{"sourceInterval":[934,973]},null,[],["app",{"sourceInterval":[942,973]},"NonemptyListOf",[["alt",{"sourceInterval":[957,967]},["app",{"sourceInterval":[958,962]},"Call",[]],["app",{"sourceInterval":[963,966]},"Ref",[]]],["terminal",{"sourceInterval":[969,972]},"."]]]],"Ref":["define",{"sourceInterval":[976,992]},null,[],["app",{"sourceInterval":[982,992]},"identifier",[]]],"Call":["define",{"sourceInterval":[995,1044]},null,[],["seq",{"sourceInterval":[1002,1044]},["app",{"sourceInterval":[1002,1012]},"identifier",[]],["terminal",{"sourceInterval":[1013,1016]},"("],["app",{"sourceInterval":[1017,1040]},"ListOf",[["app",{"sourceInterval":[1024,1034]},"Expression",[]],["terminal",{"sourceInterval":[1036,1039]},","]]],["terminal",{"sourceInterval":[1041,1044]},")"]]],"Object":["define",{"sourceInterval":[1047,1097]},"an object",[],["seq",{"sourceInterval":[1068,1097]},["terminal",{"sourceInterval":[1068,1071]},"{"],["app",{"sourceInterval":[1072,1093]},"ListOf",[["app",{"sourceInterval":[1079,1087]},"Property",[]],["terminal",{"sourceInterval":[1089,1092]},","]]],["terminal",{"sourceInterval":[1094,1097]},"}"]]],"Array":["define",{"sourceInterval":[1100,1148]},"an array",[],["seq",{"sourceInterval":[1119,1148]},["terminal",{"sourceInterval":[1119,1122]},"["],["app",{"sourceInterval":[1123,1144]},"ListOf",[["app",{"sourceInterval":[1130,1138]},"ListItem",[]],["terminal",{"sourceInterval":[1140,1143]},","]]],["terminal",{"sourceInterval":[1145,1148]},"]"]]],"String":["define",{"sourceInterval":[1151,1166]},null,[],["app",{"sourceInterval":[1160,1166]},"string",[]]],"Property_cardinality":["define",{"sourceInterval":[1210,1262]},null,[],["seq",{"sourceInterval":[1210,1247]},["app",{"sourceInterval":[1210,1220]},"Expression",[]],["app",{"sourceInterval":[1221,1232]},"Cardinality",[]],["terminal",{"sourceInterval":[1233,1236]},":"],["app",{"sourceInterval":[1237,1247]},"Expression",[]]]],"Property_default":["define",{"sourceInterval":[1267,1303]},null,[],["seq",{"sourceInterval":[1267,1292]},["app",{"sourceInterval":[1267,1277]},"Expression",[]],["terminal",{"sourceInterval":[1278,1281]},":"],["app",{"sourceInterval":[1282,1292]},"Expression",[]]]],"Property_deny":["define",{"sourceInterval":[1308,1330]},null,[],["seq",{"sourceInterval":[1308,1322]},["app",{"sourceInterval":[1308,1318]},"Expression",[]],["terminal",{"sourceInterval":[1319,1322]},"-"]]],"Property":["define",{"sourceInterval":[1182,1330]},"a property",[],["alt",{"sourceInterval":[1208,1330]},["app",{"sourceInterval":[1210,1247]},"Property_cardinality",[]],["app",{"sourceInterval":[1267,1292]},"Property_default",[]],["app",{"sourceInterval":[1308,1322]},"Property_deny",[]]]],"Cardinality":["define",{"sourceInterval":[1333,1389]},null,[],["alt",{"sourceInterval":[1347,1389]},["terminal",{"sourceInterval":[1347,1350]},"?"],["terminal",{"sourceInterval":[1353,1356]},"*"],["terminal",{"sourceInterval":[1359,1362]},"+"],["terminal",{"sourceInterval":[1365,1368]},"-"],["app",{"sourceInterval":[1371,1389]},"NumericCardinality",[]]]],"NumericCardinality_single":["define",{"sourceInterval":[1417,1442]},null,[],["seq",{"sourceInterval":[1417,1432]},["terminal",{"sourceInterval":[1417,1420]},"{"],["app",{"sourceInterval":[1421,1428]},"natural",[]],["terminal",{"sourceInterval":[1429,1432]},"}"]]],"NumericCardinality_range":["define",{"sourceInterval":[1447,1484]},null,[],["seq",{"sourceInterval":[1447,1475]},["terminal",{"sourceInterval":[1447,1450]},"{"],["app",{"sourceInterval":[1451,1458]},"natural",[]],["terminal",{"sourceInterval":[1459,1463]},".."],["app",{"sourceInterval":[1464,1471]},"natural",[]],["terminal",{"sourceInterval":[1472,1475]},"}"]]],"NumericCardinality":["define",{"sourceInterval":[1392,1484]},null,[],["alt",{"sourceInterval":[1415,1484]},["app",{"sourceInterval":[1417,1432]},"NumericCardinality_single",[]],["app",{"sourceInterval":[1447,1475]},"NumericCardinality_range",[]]]],"ListItem":["define",{"sourceInterval":[1487,1522]},"a list item",[],["app",{"sourceInterval":[1512,1522]},"Expression",[]]],"Declarator":["define",{"sourceInterval":[1525,1567]},null,[],["alt",{"sourceInterval":[1538,1567]},["terminal",{"sourceInterval":[1538,1546]},"import"],["terminal",{"sourceInterval":[1549,1557]},"export"],["terminal",{"sourceInterval":[1560,1567]},"const"]]],"space":["override",{"sourceInterval":[1589,1632]},null,[],["alt",{"sourceInterval":[1598,1632]},["terminal",{"sourceInterval":[1598,1602]},"\t"],["terminal",{"sourceInterval":[1605,1608]}," "],["terminal",{"sourceInterval":[1611,1615]},"\n"],["terminal",{"sourceInterval":[1618,1622]},"\r"],["app",{"sourceInterval":[1625,1632]},"comment",[]]]],"spaceInline":["define",{"sourceInterval":[1634,1674]},null,[],["alt",{"sourceInterval":[1648,1674]},["terminal",{"sourceInterval":[1648,1652]},"\t"],["terminal",{"sourceInterval":[1655,1658]}," "],["app",{"sourceInterval":[1661,1674]},"commentInline",[]]]],"comment":["define",{"sourceInterval":[1676,1715]},null,[],["alt",{"sourceInterval":[1686,1715]},["app",{"sourceInterval":[1686,1698]},"blockComment",[]],["app",{"sourceInterval":[1701,1715]},"lineEndComment",[]]]],"commentInline":["define",{"sourceInterval":[1717,1768]},null,[],["alt",{"sourceInterval":[1733,1768]},["app",{"sourceInterval":[1733,1751]},"blockCommentInline",[]],["app",{"sourceInterval":[1754,1768]},"lineEndComment",[]]]],"blockComment":["define",{"sourceInterval":[1770,1807]},null,[],["seq",{"sourceInterval":[1785,1807]},["terminal",{"sourceInterval":[1785,1789]},"/*"],["star",{"sourceInterval":[1790,1802]},["seq",{"sourceInterval":[1791,1800]},["not",{"sourceInterval":[1791,1796]},["terminal",{"sourceInterval":[1792,1796]},"*/"]],["app",{"sourceInterval":[1797,1800]},"any",[]]]],["terminal",{"sourceInterval":[1803,1807]},"*/"]]],"blockCommentInline":["define",{"sourceInterval":[1809,1868]},null,[],["seq",{"sourceInterval":[1830,1868]},["terminal",{"sourceInterval":[1830,1834]},"/*"],["star",{"sourceInterval":[1835,1863]},["seq",{"sourceInterval":[1836,1861]},["not",{"sourceInterval":[1836,1857]},["alt",{"sourceInterval":[1838,1856]},["terminal",{"sourceInterval":[1838,1842]},"*/"],["terminal",{"sourceInterval":[1845,1849]},"\n"],["terminal",{"sourceInterval":[1852,1856]},"\r"]]],["app",{"sourceInterval":[1858,1861]},"any",[]]]],["terminal",{"sourceInterval":[1864,1868]},"*/"]]],"lineEndComment":["define",{"sourceInterval":[1870,1913]},null,[],["seq",{"sourceInterval":[1887,1913]},["terminal",{"sourceInterval":[1887,1891]},"//"],["star",{"sourceInterval":[1892,1913]},["seq",{"sourceInterval":[1893,1911]},["not",{"sourceInterval":[1893,1907]},["alt",{"sourceInterval":[1895,1906]},["terminal",{"sourceInterval":[1895,1899]},"\n"],["terminal",{"sourceInterval":[1902,1906]},"\r"]]],["app",{"sourceInterval":[1908,1911]},"any",[]]]]]],"term":["define",{"sourceInterval":[1915,1981]},null,[],["alt",{"sourceInterval":[1924,1981]},["seq",{"sourceInterval":[1926,1944]},["star",{"sourceInterval":[1926,1932]},["app",{"sourceInterval":[1926,1931]},"space",[]]],["alt",{"sourceInterval":[1934,1943]},["terminal",{"sourceInterval":[1934,1937]},";"],["app",{"sourceInterval":[1940,1943]},"end",[]]]],["seq",{"sourceInterval":[1949,1981]},["star",{"sourceInterval":[1949,1961]},["app",{"sourceInterval":[1949,1960]},"spaceInline",[]]],["alt",{"sourceInterval":[1963,1980]},["terminal",{"sourceInterval":[1963,1967]},"\r"],["terminal",{"sourceInterval":[1970,1974]},"\n"],["app",{"sourceInterval":[1977,1980]},"end",[]]]]]],"identifier":["define",{"sourceInterval":[1984,2045]},"an indentifier",[],["seq",{"sourceInterval":[2014,2045]},["app",{"sourceInterval":[2014,2029]},"identifierStart",[]],["star",{"sourceInterval":[2030,2045]},["app",{"sourceInterval":[2030,2044]},"identifierPart",[]]]]],"identifierStart":["define",{"sourceInterval":[2047,2090]},null,[],["alt",{"sourceInterval":[2065,2090]},["range",{"sourceInterval":[2065,2073]},"A","Z"],["range",{"sourceInterval":[2076,2084]},"a","z"],["terminal",{"sourceInterval":[2087,2090]},"_"]]],"identifierPart":["define",{"sourceInterval":[2092,2132]},null,[],["alt",{"sourceInterval":[2109,2132]},["app",{"sourceInterval":[2109,2124]},"identifierStart",[]],["app",{"sourceInterval":[2127,2132]},"digit",[]]]],"number":["define",{"sourceInterval":[2135,2203]},"a number",[],["seq",{"sourceInterval":[2155,2203]},["opt",{"sourceInterval":[2155,2159]},["terminal",{"sourceInterval":[2155,2158]},"-"]],["app",{"sourceInterval":[2160,2167]},"natural",[]],["opt",{"sourceInterval":[2168,2189]},["seq",{"sourceInterval":[2169,2187]},["terminal",{"sourceInterval":[2169,2172]},"."],["app",{"sourceInterval":[2173,2187]},"fractionalPart",[]]]],["opt",{"sourceInterval":[2190,2203]},["app",{"sourceInterval":[2190,2202]},"exponentPart",[]]]]],"natural":["define",{"sourceInterval":[2205,2236]},null,[],["alt",{"sourceInterval":[2215,2236]},["app",{"sourceInterval":[2215,2230]},"positiveInteger",[]],["terminal",{"sourceInterval":[2233,2236]},"0"]]],"positiveInteger":["define",{"sourceInterval":[2238,2275]},null,[],["seq",{"sourceInterval":[2256,2275]},["app",{"sourceInterval":[2256,2268]},"nonZeroDigit",[]],["star",{"sourceInterval":[2269,2275]},["app",{"sourceInterval":[2269,2274]},"digit",[]]]]],"fractionalPart":["define",{"sourceInterval":[2277,2300]},null,[],["plus",{"sourceInterval":[2294,2300]},["app",{"sourceInterval":[2294,2299]},"digit",[]]]],"exponentPart":["define",{"sourceInterval":[2302,2348]},null,[],["seq",{"sourceInterval":[2317,2348]},["alt",{"sourceInterval":[2318,2327]},["terminal",{"sourceInterval":[2318,2321]},"e"],["terminal",{"sourceInterval":[2324,2327]},"E"]],["opt",{"sourceInterval":[2329,2341]},["alt",{"sourceInterval":[2330,2339]},["terminal",{"sourceInterval":[2330,2333]},"+"],["terminal",{"sourceInterval":[2336,2339]},"-"]]],["plus",{"sourceInterval":[2342,2348]},["app",{"sourceInterval":[2342,2347]},"digit",[]]]]],"nonZeroDigit":["define",{"sourceInterval":[2350,2373]},null,[],["range",{"sourceInterval":[2365,2373]},"1","9"]],"string":["define",{"sourceInterval":[2376,2422]},"a string",[],["seq",{"sourceInterval":[2396,2422]},["terminal",{"sourceInterval":[2396,2400]},"\""],["star",{"sourceInterval":[2401,2417]},["app",{"sourceInterval":[2401,2416]},"stringCharacter",[]]],["terminal",{"sourceInterval":[2418,2422]},"\""]]],"stringCharacter":["define",{"sourceInterval":[2424,2469]},null,[],["alt",{"sourceInterval":[2442,2469]},["app",{"sourceInterval":[2442,2452]},"normalChar",[]],["app",{"sourceInterval":[2455,2469]},"escapeSequence",[]]]],"normalChar":["define",{"sourceInterval":[2471,2523]},null,[],["seq",{"sourceInterval":[2484,2523]},["not",{"sourceInterval":[2484,2519]},["alt",{"sourceInterval":[2486,2518]},["terminal",{"sourceInterval":[2486,2490]},"\""],["terminal",{"sourceInterval":[2493,2497]},"\\"],["range",{"sourceInterval":[2500,2518]},"\u0000","\u001f"]]],["app",{"sourceInterval":[2520,2523]},"any",[]]]],"escapeSequence":["define",{"sourceInterval":[2525,2557]},null,[],["seq",{"sourceInterval":[2542,2557]},["terminal",{"sourceInterval":[2542,2546]},"\\"],["app",{"sourceInterval":[2547,2557]},"escapeSpec",[]]]],"escapeSpec":["define",{"sourceInterval":[2559,2661]},null,[],["alt",{"sourceInterval":[2574,2661]},["terminal",{"sourceInterval":[2576,2580]},"\""],["terminal",{"sourceInterval":[2585,2589]},"\\"],["terminal",{"sourceInterval":[2594,2599]},"\\/"],["terminal",{"sourceInterval":[2604,2607]},"b"],["terminal",{"sourceInterval":[2612,2615]},"f"],["terminal",{"sourceInterval":[2620,2623]},"n"],["terminal",{"sourceInterval":[2628,2631]},"r"],["terminal",{"sourceInterval":[2636,2639]},"t"],["app",{"sourceInterval":[2644,2661]},"unicodeEscapeSpec",[]]]],"unicodeEscapeSpec":["define",{"sourceInterval":[2663,2722]},null,[],["seq",{"sourceInterval":[2683,2722]},["terminal",{"sourceInterval":[2683,2686]},"u"],["app",{"sourceInterval":[2687,2695]},"hexDigit",[]],["app",{"sourceInterval":[2696,2704]},"hexDigit",[]],["app",{"sourceInterval":[2705,2713]},"hexDigit",[]],["app",{"sourceInterval":[2714,2722]},"hexDigit",[]]]],"regexp":["define",{"sourceInterval":[2725,2787]},"a regular expression",[],["seq",{"sourceInterval":[2757,2787]},["terminal",{"sourceInterval":[2757,2760]},"/"],["app",{"sourceInterval":[2761,2771]},"regexpBody",[]],["terminal",{"sourceInterval":[2772,2775]},"/"],["app",{"sourceInterval":[2776,2787]},"regexpFlags",[]]]],"regexpBody":["define",{"sourceInterval":[2789,2821]},null,[],["plus",{"sourceInterval":[2802,2821]},["alt",{"sourceInterval":[2803,2819]},["terminal",{"sourceInterval":[2803,2808]},"\\/"],["seq",{"sourceInterval":[2811,2819]},["not",{"sourceInterval":[2811,2815]},["terminal",{"sourceInterval":[2812,2815]},"/"]],["app",{"sourceInterval":[2816,2819]},"any",[]]]]]],"regexpFlags":["define",{"sourceInterval":[2823,2859]},null,[],["star",{"sourceInterval":[2837,2859]},["alt",{"sourceInterval":[2838,2857]},["range",{"sourceInterval":[2838,2846]},"A","Z"],["range",{"sourceInterval":[2849,2857]},"a","z"]]]],"constant_this":["define",{"sourceInterval":[2877,2891]},null,[],["terminal",{"sourceInterval":[2877,2883]},"this"]],"constant_null":["define",{"sourceInterval":[2896,2910]},null,[],["terminal",{"sourceInterval":[2896,2902]},"null"]],"constant_true":["define",{"sourceInterval":[2915,2929]},null,[],["terminal",{"sourceInterval":[2915,2921]},"true"]],"constant_false":["define",{"sourceInterval":[2934,2950]},null,[],["terminal",{"sourceInterval":[2934,2941]},"false"]],"constant":["define",{"sourceInterval":[2862,2950]},null,[],["alt",{"sourceInterval":[2875,2950]},["app",{"sourceInterval":[2877,2883]},"constant_this",[]],["app",{"sourceInterval":[2896,2902]},"constant_null",[]],["app",{"sourceInterval":[2915,2921]},"constant_true",[]],["app",{"sourceInterval":[2934,2941]},"constant_false",[]]]]}]