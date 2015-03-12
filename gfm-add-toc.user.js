// ==UserScript==
// @name           Add a "TOC" button to GitHub wiki pages
// @namespace      tomancaklab
// @include        http://github.com/*/wiki/*/_edit*
// @include        https://github.com/*/wiki/*/_edit*
// @grant          none
// ==/UserScript==

(function(){
  if (window.location.host != 'github.com' ||
      !window.location.pathname.match(/.*\/wiki\/.*\/_edit#?$/))
    return; // not editing a GitHub wiki page

  var textarea = document.getElementById('gollum-editor-body');
  var h1Button = document.getElementById('function-h1');
  if (!textarea || !h1Button) {
    console.log("Could not find text area or <h1> button");
    console.log(textarea);
    console.log(h1Button);
    return;
  }

  var self = this;

  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://tomancaklab.github.io/markdown.min.js';
  h1Button.parentNode.insertBefore(script, h1Button);

  var button = document.createElement('a');
  button.id = 'function-toc';
  button.href = '#';
  button.className = 'minibutton function-button';
  button.setAttribute('tabindex', '-1');
  button.setAttribute('title', 'Refresh table of contents');
  button.setAttribute('role', 'button');
  button.innerHTML = '<b>TOC</b>'
  button.onclick = function() {
    self.insertTOC(textarea);
  };
  h1Button.parentNode.insertBefore(button, h1Button);

  /* GitHub disables this button ;-) */
  setTimeout(function() { button.className = 'minibutton function-button'; }, 100);

  /* Helper to generate the Table of Contents entries */
  var toPlainText = function(list) {
    var result = '';
    list.forEach(function(el) {
      if (typeof(el) == 'string')
        result += el;
      else if (Array.isArray(el)) {
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

  this.insertTOC = function(textarea) {
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
    var parsed = window.markdown.parse(md, 'Maruku');
    var toc = tocStart;
    parsed.forEach(function(el) {
      if (Array.isArray(el) && el[0] == 'header') {
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
    textarea.innerHTML = toc + md;
  };
})();
