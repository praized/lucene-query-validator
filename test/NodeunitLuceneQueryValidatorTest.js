var fs = require( 'fs')
var srcdir = fs.realpathSync(__dirname+"/../lib")
with(require(srcdir+'/query-validator.js')){

    setAlertUser(false);
    // testCheckParentheses()

    exports['testRemoveEscapes()'] = function(test)
     {
        test.expect(3)

        var query = "\\* foo \\haha";
        test.equals(removeEscapes(query)," foo aha" );
        query = "\\\\foo";
        test.equals( removeEscapes(query), "foo");
        query = "foo\\\"";
        test.equals(removeEscapes(query), "foo");
        test.done()
    }

    exports['testCheckAllowedCharacters()'] = function(test)
     {
        test.expect(2)

        var query = "a-zA-Z0-9_+\-:.()\"*?&|!{}\[\]\^~\\@#/$%'= ";
        test.ok(checkAllowedCharacters(query));

        query = "foobar";
        test.ok(!checkAllowedCharacters(query));
        test.done()
    }

    exports['testQueryParser()'] = function(test)
     {
        test.expect(33)

        // taken from TestQueryParser.java
        query = "a AND b";
        test.ok(doCheckLuceneQueryValue(query));
        query = "(a AND b)";
        test.ok(doCheckLuceneQueryValue(query));
        query = "+a +b";
        test.ok(doCheckLuceneQueryValue(query));
        query = "c OR (a AND b)";
        test.ok(doCheckLuceneQueryValue(query));
        query = "c (+a +b)";
        test.ok(doCheckLuceneQueryValue(query));
        query = "a AND NOT b";
        test.ok(doCheckLuceneQueryValue(query));
        query = "+a -b";
        test.ok(doCheckLuceneQueryValue(query));
        query = "a AND -b";
        test.ok(doCheckLuceneQueryValue(query));
        //query = "a AND !b";
        //test.ok(doCheckLuceneQueryValue(query));
        query = "a && b";
        test.ok(doCheckLuceneQueryValue(query));
        //query = "a && ! b";
        //test.ok(doCheckLuceneQueryValue(query));
        query = "a OR b";
        test.ok(doCheckLuceneQueryValue(query));
        query = "a b";
        test.ok(doCheckLuceneQueryValue(query));
        query = "a || b";
        test.ok(doCheckLuceneQueryValue(query));
        //query = "a OR !b";
        //test.ok(doCheckLuceneQueryValue(query));
        //query = "a OR ! b";
        //test.ok(doCheckLuceneQueryValue(query));
        query = "a OR -b";
        test.ok(doCheckLuceneQueryValue(query));
        query = "+term -term term";
        test.ok(doCheckLuceneQueryValue(query));
        query = "foo:term AND field:anotherTerm";
        test.ok(doCheckLuceneQueryValue(query));
        query = "term AND \"phrase phrase\"";
        test.ok(doCheckLuceneQueryValue(query));
        query = "\"hello there\"";
        test.ok(doCheckLuceneQueryValue(query));
        query = "germ term^2.0";
        test.ok(doCheckLuceneQueryValue(query));
        query = "(term)^2.0";
        test.ok(doCheckLuceneQueryValue(query));
        query = "term^2.0";
        test.ok(doCheckLuceneQueryValue(query));
        query = "(germ term)^2.0";
        test.ok(doCheckLuceneQueryValue(query));
        query = "term^2.0";
        test.ok(doCheckLuceneQueryValue(query));
        query = "term^2";
        test.ok(doCheckLuceneQueryValue(query));
        query = "\"germ term\"^2.0";
        test.ok(doCheckLuceneQueryValue(query));
        query = "\"term germ\"^2";
        test.ok(doCheckLuceneQueryValue(query));
        query = "(foo OR bar) AND (baz OR boo)";
        test.ok(doCheckLuceneQueryValue(query));
        query = "+(foo bar) +(baz boo)";
        test.ok(doCheckLuceneQueryValue(query));
        query = "((a OR b) AND NOT c) OR d";
        test.ok(doCheckLuceneQueryValue(query));
        query = "(+(a b) -c) d";
        test.ok(doCheckLuceneQueryValue(query));
        query = "+(apple \"steve jobs\") -(foo bar baz)";
        test.ok(doCheckLuceneQueryValue(query));
        query = "+(apple \"steve jobs\") -(foo bar baz)";
        test.ok(doCheckLuceneQueryValue(query));
        query = "+title:(dog OR cat) -author:\"bob dole\"";
        test.ok(doCheckLuceneQueryValue(query));
        query = "+(title:dog title:cat) -author:\"bob dole\"";
        test.ok(doCheckLuceneQueryValue(query));
        test.done()
    }

    exports['testCheckAsterisk()'] = function(test)
     {
        test.expect(13)

        var query = "foo bar is ok";
        test.ok(checkAsterisk(query));

        query = "foo bar12* is ok*";
        test.ok(checkAsterisk(query));

        query = "foo bar12*sdsd";
        test.ok(checkAsterisk(query));

        query = "foo bar12*sd**sd";
        test.ok(checkAsterisk(query));

        query = "*bar12";
        test.ok(!checkAsterisk(query));

        query = "*ba12r*";
        test.ok(!checkAsterisk(query));

        query = "bar* *bar";
        test.ok(!checkAsterisk(query));

        query = "*";
        test.ok(!checkAsterisk(query));

        query = "*bar";
        test.ok(!checkAsterisk(query));

        // test with a space in front
        query = " *bar";
        test.ok(!checkAsterisk(query));

        // test the escaped case
        query = "bar* \\*bar";
        test.ok(checkAsterisk(query));

        // try including other special characters
        query = "foo:bar*ba?r";
        test.ok(checkAsterisk(query));

        query = "foo:(ba*ba?r zoo \"zaa zoo\")";
        test.ok(checkAsterisk(query));
        test.done()
    }

    exports['testCheckAmpersands()'] = function(test)
     {
        test.expect(8)

        var query = "foo bar is ok";
        test.ok(checkAmpersands(query));

        query = "foo & bar";
        test.ok(checkAmpersands(query));

        query = "foo & bar& metoo &";
        test.ok(checkAmpersands(query));

        query = "foo && bar12isok";
        test.ok(checkAmpersands(query));

        query = "foo && ! bar";
        test.ok(checkAmpersands(query));

        query = "bar12 &&";
        test.ok(!checkAmpersands(query));

        query = "bar12 && bar12 &&";
        test.ok(!checkAmpersands(query));

        query = "bar12 && ";
        test.ok(!checkAmpersands(query));
        test.done()
    }

    exports['testCheckCaret()'] = function(test)
     {
        test.expect(12)

        var query = "foo bar is ok";
        test.ok(checkCaret(query));

        var query = "foo bar12isok^1.0";
        test.ok(checkCaret(query));

        query = "\"jakarta apache\"^10";
        test.ok(checkCaret(query));

        query = "bar12^";
        test.ok(!checkCaret(query));

        query = "bar12^10 bar12^";
        test.ok(!checkCaret(query));

        query = "bar12^ ";
        test.ok(!checkCaret(query));

        query = "bar12^ me too";
        test.ok(!checkCaret(query));

        query = "bar12^foo";
        test.ok(!checkCaret(query));

        query = "bar12^1.foo";
        test.ok(!checkCaret(query));

        // test the escaped case
        query = "\\^";
        test.ok(checkCaret(query));

        query = "bar\\^";
        test.ok(checkCaret(query));

        // try including other special characters
        query = "bar*ba?r^1.0";
        test.ok(checkCaret(query));
        test.done()
    }

    exports['testCheckSquiggle()'] = function(test)
     {
        test.expect(11)

        var query = "foo bar is ok";
        test.ok(checkSquiggle(query));

        var query = "foo bar12isok~10";
        test.ok(checkSquiggle(query));

        query = "\"jakarta apache\"~10";
        test.ok(checkSquiggle(query));

        query = "bar12~";
        test.ok(checkSquiggle(query));

        query = "bar12~10 bar12~";
        test.ok(checkSquiggle(query));

        query = "bar12~ ";
        test.ok(checkSquiggle(query));

        query = "bar12~foo";
        test.ok(!checkSquiggle(query));

        query = "bar12~1f";
        test.ok(!checkSquiggle(query))

        // test the escaped case
        query = "\\~";
        test.ok(checkSquiggle(query));

        query = "bar\\~";
        test.ok(checkSquiggle(query));

        // try including other special characters
        query = "bar*ba?r~10";
        test.ok(checkSquiggle(query));

        // FIXME: how about floating point proximity searches, e.g. foo~2.5
        test.done()
    }

    exports['testCheckExclamationMark()'] = function(test)
     {
        test.expect(15)

        var query = "foo bar is ok";
        test.ok(checkExclamationMark(query));

        query = "foo ! bar";
        test.ok(checkExclamationMark(query));

        query = "\"foo\" ! \"bar\"";
        test.ok(checkExclamationMark(query));

        query = "foo!";
        test.ok(checkExclamationMark(query));

        query = "foo && ! bar";
        test.ok(checkExclamationMark(query));

        query = "foo && !bar";
        test.ok(checkExclamationMark(query));

        query = "! bar";
        test.ok(!checkExclamationMark(query));

        query = "foo !";
        test.ok(!checkExclamationMark(query));

        query = "foo ! ";
        test.ok(!checkExclamationMark(query));

        // test escaped case
        query = "foo \\!";
        test.ok(checkExclamationMark(query));

        query = "foo ! bar \\!";
        test.ok(checkExclamationMark(query));

        query = "foo ! bar ! car";
        test.ok(checkExclamationMark(query));

        query = "foo ! bar !";
        test.ok(!checkExclamationMark(query));

        query = "foo ! bar !   ";
        test.ok(!checkExclamationMark(query));

        // try more complex queries
        query = "(foo bar) ! (car:dog*)";
        test.ok(checkExclamationMark(query));
        test.done()
    }

    exports['testCheckQuestionMark()'] = function(test)
     {
        test.expect(11)

        var query = "foo bar is ok";
        test.ok(checkQuestionMark(query));

        query = "foo bar12? is ok?";
        test.ok(checkQuestionMark(query));

        query = "foo bar12?sdsd";
        test.ok(checkQuestionMark(query));

        query = "foo bar12?sd??sd";
        test.ok(checkQuestionMark(query));

        query = "?bar12";
        test.ok(!checkQuestionMark(query));

        query = "?ba12r?";
        test.ok(!checkQuestionMark(query));

        query = "bar? ?bar";
        test.ok(!checkQuestionMark(query));

        // test with a space in front
        query = " ?bar";
        test.ok(!checkQuestionMark(query));

        // test the escaped case
        query = "bar? \\?bar";
        test.ok(checkQuestionMark(query));

        // try including other special characters
        query = "foo:bar*ba?r";
        test.ok(checkQuestionMark(query));

        query = "foo:(ba*ba?r zoo \"zaa zoo\")";
        test.ok(checkQuestionMark(query));
        test.done()
    }

    exports['testCheckParentheses()'] = function(test)
     {
        test.expect(16)

        var query = "foo bar is ok";
        test.ok(checkParentheses(query));

        query = "(foobar12:isok)";
        test.ok(checkParentheses(query));

        query = "(foobar12):(sdsd* me too)";
        test.ok(checkParentheses(query));

        query = "(bar12";
        test.ok(!checkParentheses(query));

        query = "ba12r)";
        test.ok(!checkParentheses(query));

        query = "()";
        test.ok(!checkParentheses(query));

        query = "))";
        test.ok(!checkParentheses(query));

        query = "(foo bar) (bar";
        test.ok(!checkParentheses(query));

        query = "(foo bar) bar) me too";
        test.ok(!checkParentheses(query));

        // test with a space in front
        query = " (bar";
        test.ok(!checkParentheses(query));

        // test the escaped case
        query = "foo\\)";
        test.ok(doCheckLuceneQueryValue(query));

        query = "foo\\) (foo bar)";
        test.ok(doCheckLuceneQueryValue(query));

        // try including other special characters
        query = "-(foo bar*ba?r)";
        test.ok(checkParentheses(query));

        query = "+foo:(ba*ba?r zoo -(zaa zoo))";
        test.ok(checkParentheses(query));

        query = "((bar12";
        test.ok(!checkParentheses(query));

        query = "((bar12)";
        test.ok(!checkParentheses(query));
        test.done()
    }

    exports['testCheckPlusMinus()'] = function(test)
     {
        test.expect(10)

        var query = "foo bar is ok";
        test.ok(checkPlusMinus(query));

        query = "+bar -foo";
        test.ok(checkPlusMinus(query));

        // is this allowed?
        query = "baa+foo +foo-bar";
        test.ok(checkPlusMinus(query));

        query = "baa+";
        test.ok(!checkPlusMinus(query));

        query = "++baa";
        test.ok(!checkPlusMinus(query));

        query = "+";
        test.ok(!checkPlusMinus(query));

        query = "-";
        test.ok(!checkPlusMinus(query));

        // test the escaped case
        query = "foo\\+";
        test.ok(doCheckLuceneQueryValue(query));

        // try including other special characters
        query = "-(foo bar*ba?r)";
        test.ok(checkParentheses(query));

        query = "+foo:(ba*ba?r zoo -(zaa zoo))";
        test.ok(checkParentheses(query));
        test.done()
    }

    exports['testCheckANDORNOT()'] = function(test)
     {
        test.expect(18)

        var query = "foo bar is ok";
        test.ok(checkANDORNOT(query));

        query = "foo AND bar";
        test.ok(checkANDORNOT(query));

        query = "foo OR bar";
        test.ok(checkANDORNOT(query));

        query = "foo NOT bar";
        test.ok(checkANDORNOT(query));

        query = "foo AND NOT bar";
        test.ok(checkANDORNOT(query));

        query = "foo NOT bar -foobar";
        test.ok(checkANDORNOT(query));

        query = "foo AND bar dog AND NOT fox";
        test.ok(checkANDORNOT(query));

        query = "foo and";
        test.ok(checkANDORNOT(query));

        query = "and bar";
        test.ok(checkANDORNOT(query));

        query = "fooAND bar";
        test.ok(checkANDORNOT(query));

        query = "foo ANDbar";
        test.ok(checkANDORNOT(query));

        query = "AND bar";
        test.ok(!checkANDORNOT(query));

        query = "OR bar";
        test.ok(!checkANDORNOT(query));

        query = "NOT bar";
        test.ok(!checkANDORNOT(query));

        query = "foo AND";
        test.ok(!checkANDORNOT(query));

        query = "foo AND ";
        // note the space
        test.ok(!checkANDORNOT(query));

        query = "AND AND";
        test.ok(!checkANDORNOT(query));

        query = "AND";
        test.ok(!checkANDORNOT(query));
        test.done()
    }

    exports['testCheckQuotes()'] = function(test)
     {
        test.expect(15)

        var query = "foo bar is ok";
        test.ok(checkQuotes(query));

        query = "\"foobar12:isok\"";
        test.ok(checkQuotes(query));

        query = "\"(foobar12)\":(sdsd* me too)";
        test.ok(checkQuotes(query));

        query = "\"bar12";
        test.ok(!checkQuotes(query));

        query = "\"\"";
        test.ok(!checkQuotes(query));

        query = "ba12r\"";
        test.ok(!checkQuotes(query));

        query = "\"foo bar\" \"bar";
        test.ok(!checkQuotes(query));

        query = "\"foo bar\" bar\" me too";
        test.ok(!checkQuotes(query));

        // test with a space in front
        query = " \"bar";
        test.ok(!checkQuotes(query));

        // test the escaped case
        query = "foo\\\"";
        test.ok(doCheckLuceneQueryValue(query));

        query = "foo\\\" \"foo bar\"";
        test.ok(doCheckLuceneQueryValue(query));

        // try including other special characters
        query = "\"foo bar*ba?r\"";
        test.ok(checkQuotes(query));

        query = "foo:(ba*ba?r zoo \"zaa zoo\")";
        test.ok(checkQuotes(query));

        query = "\\\"\\\"bar12\\\"";
        test.ok(doCheckLuceneQueryValue(query));

        query = "\\\"\\\"bar12\\\"\\\"";
        test.ok(doCheckLuceneQueryValue(query));
        test.done()
    }

    exports['testCheckColon()'] = function(test)
     {
        test.expect(12)

        var query = "foo bar is ok";
        test.ok(checkColon(query));

        query = "foobar12:isok";
        test.ok(checkColon(query));

        query = "(foobar12):(sdsd* me too)";
        test.ok(checkColon(query));

        query = "bar12:";
        test.ok(!checkColon(query));

        query = ":ba12r";
        test.ok(!checkColon(query));

        query = "foo:bar :bar";
        test.ok(!checkColon(query));

        query = "foo:bar bar: me too";
        test.ok(!checkColon(query));

        // test with a space in front
        query = " :bar";
        test.ok(!checkColon(query));

        // test the escaped case
        query = "foo\\:";
        test.ok(checkColon(query));

        query = "foo\\: foo:bar";
        test.ok(checkColon(query));

        // try including other special characters
        query = "foo:bar*ba?r";
        test.ok(checkColon(query));

        query = "foo:(ba*ba?r zoo \"zaa zoo\")";
        test.ok(checkColon(query));
        test.done()
    }    
}
