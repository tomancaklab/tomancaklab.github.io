(function() {
  /* Helper to generate the Table of Contents entries */
  var toPlainText = function(list) {
    var result = '';
    list.forEach(function(el) {
      if (typeof(el) == 'string')
        result += el;
      else if (el instanceof Array) {
        if (el[0] == 'inlinecode' || el[0] == 'em')
          result += toPlainText(el.slice(1));
        else {
          console.log('Unhandled type: ' + el[0]);
          console.log(el);
        }
      }
    });
    return result;
  };

  var insertTOC = function(textarea) {
    if (!textarea) {
      console.log('No markdown editor found!');
      return;
    }

    /* Obtain markdown from Edit box */
    var md = textarea.innerHTML || textarea.value;

    /* Strip out existing TOC, if any */
    var tocStart = '** Table of contents **\n\n';
    if (md.startsWith(tocStart))
      md = md.substring(tocStart.length).replace(/[^]*?\n\n/m, '');

    /* Generate the Table of Contents */
    var parsed = window.markdown.parse(md);
    var toc = tocStart;
    parsed.forEach(function(el) {
      if (el instanceof Array && el[0] == 'header') {
        for (var i = 1; i < el[1].level; i++)
          toc += '\t';
        var plainText = toPlainText(el.slice(2));
        var anchor = plainText.toLowerCase()
          .replace(/ /g, '-')
          .replace(/[^-A-Za-z0-9]/g, '');
        toc += '* [' + plainText + '](#' + anchor + ')\n';
      }
    });
    toc += '\n';

    /* Insert the Table of Contents */
    textarea.value = toc + md;
  };

  var textarea = document.getElementById('gollum-editor-body');
  if (textarea)
    /* We are running as a bookmarklet */
    insertTOC(textarea);
  else {
    var button = document.getElementById('insert-toc-expand');
    textarea = document.getElementById('insert-toc-textarea');
    if (button && textarea) {
      button.onclick = function() {
        textarea.style.display = 'block';
      };

      textarea.onpaste = function(e) {
        setTimeout(function() {
          insertTOC(textarea);
          textarea.select();
        }, 50);
      };
    }
  }
})();
