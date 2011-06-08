;['setWildcardCaseInsensitive',
 'setAlertUser',
  'doCheckLuceneQuery',
  'doCheckLuceneQueryValue',
  'removeEscapes',
  'checkAllowedCharacters',
  'checkAsterisk',
  'checkAmpersands',
  'checkCaret',
  'checkSquiggle',
  'checkExclamationMark',
  'checkQuestionMark',
  'checkParentheses',
  'checkPlusMinus',
  'checkANDORNOT',
  'checkQuotes',
  'checkColon'].map( function(name) {
      eval("exports['"+name+"']="+name+";")
  })

})(typeof exports === 'undefined'? window: exports);