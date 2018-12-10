/**
 * marked - a markdown parser
 * Copyright (c) 2011-2013, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/chjj/marked
 */

;(function() {

/**
 * Block-Level Grammar
 */

var block = {
  newline: /^\n+/,
  code: /^( {4}[^\n]+\n*)+/,
  fences: noop,
  hr: /^( *[-*_]){3,} *(?:\n+|$)/,
  heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
  nptable: noop,
  lheading: /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,
  blockquote: /^( *>[^\n]+(\n[^\n]+)*\n*)+/,
  list: /^( *)(bull) [\s\S]+?(?:hr|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
  html: /^ *(?:comment|closed|closing) *(?:\n{2,}|\s*$)/,
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
  table: noop,
  paragraph: /^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,
  text: /^[^\n]+/
};

block.bullet = /(?:[*+-]|\d+\.)/;
block.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
block.item = replace(block.item, 'gm')
  (/bull/g, block.bullet)
  ();

block.list = replace(block.list)
  (/bull/g, block.bullet)
  ('hr', /\n+(?=(?: *[-*_]){3,} *(?:\n+|$))/)
  ();

block._tag = '(?!(?:'
  + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code'
  + '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo'
  + '|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|@)\\b';

block.html = replace(block.html)
  ('comment', /<!--[\s\S]*?-->/)
  ('closed', /<(tag)[\s\S]+?<\/\1>/)
  ('closing', /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)
  (/tag/g, block._tag)
  ();

block.paragraph = replace(block.paragraph)
  ('hr', block.hr)
  ('heading', block.heading)
  ('lheading', block.lheading)
  ('blockquote', block.blockquote)
  ('tag', '<' + block._tag)
  ('def', block.def)
  ();

/**
 * Normal Block Grammar
 */

block.normal = merge({}, block);

/**
 * GFM Block Grammar
 */

block.gfm = merge({}, block.normal, {
  fences: /^ *(`{3,}|~{3,}) *(\S+)? *\n([\s\S]+?)\s*\1 *(?:\n+|$)/,
  paragraph: /^/
});

block.gfm.paragraph = replace(block.paragraph)
  ('(?!', '(?!'
    + block.gfm.fences.source.replace('\\1', '\\2') + '|'
    + block.list.source.replace('\\1', '\\3') + '|')
  ();

/**
 * GFM + Tables Block Grammar
 */

block.tables = merge({}, block.gfm, {
  nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
  table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/
});

/**
 * Block Lexer
 */

function Lexer(options) {
  this.tokens = [];
  this.tokens.links = {};
  this.options = options || marked.defaults;
  this.rules = block.normal;

  if (this.options.gfm) {
    if (this.options.tables) {
      this.rules = block.tables;
    } else {
      this.rules = block.gfm;
    }
  }
}

/**
 * Expose Block Rules
 */

Lexer.rules = block;

/**
 * Static Lex Method
 */

Lexer.lex = function(src, options) {
  var lexer = new Lexer(options);
  return lexer.lex(src);
};

/**
 * Preprocessing
 */

Lexer.prototype.lex = function(src) {
  src = src
    .replace(/\r\n|\r/g, '\n')
    .replace(/\t/g, '    ')
    .replace(/\u00a0/g, ' ')
    .replace(/\u2424/g, '\n');

  return this.token(src, true);
};

/**
 * Lexing
 */

Lexer.prototype.token = function(src, top) {
  var src = src.replace(/^ +$/gm, '')
    , next
    , loose
    , cap
    , bull
    , b
    , item
    , space
    , i
    , l;

  while (src) {
    // newline
    if (cap = this.rules.newline.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[0].length > 1) {
        this.tokens.push({
          type: 'space'
        });
      }
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      cap = cap[0].replace(/^ {4}/gm, '');
      this.tokens.push({
        type: 'code',
        text: !this.options.pedantic
          ? cap.replace(/\n+$/, '')
          : cap
      });
      continue;
    }

    // fences (gfm)
    if (cap = this.rules.fences.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'code',
        lang: cap[2],
        text: cap[3]
      });
      continue;
    }

    // heading
    if (cap = this.rules.heading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[1].length,
        text: cap[2]
      });
      continue;
    }

    // table no leading pipe (gfm)
    if (top && (cap = this.rules.nptable.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i].split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // lheading
    if (cap = this.rules.lheading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[2] === '=' ? 1 : 2,
        text: cap[1]
      });
      continue;
    }

    // hr
    if (cap = this.rules.hr.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'hr'
      });
      continue;
    }

    // blockquote
    if (cap = this.rules.blockquote.exec(src)) {
      src = src.substring(cap[0].length);

      this.tokens.push({
        type: 'blockquote_start'
      });

      cap = cap[0].replace(/^ *> ?/gm, '');

      // Pass `top` to keep the current
      // "toplevel" state. This is exactly
      // how markdown.pl works.
      this.token(cap, top);

      this.tokens.push({
        type: 'blockquote_end'
      });

      continue;
    }

    // list
    if (cap = this.rules.list.exec(src)) {
      src = src.substring(cap[0].length);
      bull = cap[2];

      this.tokens.push({
        type: 'list_start',
        ordered: bull.length > 1
      });

      // Get each top-level item.
      cap = cap[0].match(this.rules.item);

      next = false;
      l = cap.length;
      i = 0;

      for (; i < l; i++) {
        item = cap[i];

        // Remove the list item's bullet
        // so it is seen as the next token.
        space = item.length;
        item = item.replace(/^ *([*+-]|\d+\.) +/, '');

        // Outdent whatever the
        // list item contains. Hacky.
        if (~item.indexOf('\n ')) {
          space -= item.length;
          item = !this.options.pedantic
            ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
            : item.replace(/^ {1,4}/gm, '');
        }

        // Determine whether the next list item belongs here.
        // Backpedal if it does not belong in this list.
        if (this.options.smartLists && i !== l - 1) {
          b = block.bullet.exec(cap[i + 1])[0];
          if (bull !== b && !(bull.length > 1 && b.length > 1)) {
            src = cap.slice(i + 1).join('\n') + src;
            i = l - 1;
          }
        }

        // Determine whether item is loose or not.
        // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
        // for discount behavior.
        loose = next || /\n\n(?!\s*$)/.test(item);
        if (i !== l - 1) {
          next = item.charAt(item.length - 1) === '\n';
          if (!loose) loose = next;
        }

        this.tokens.push({
          type: loose
            ? 'loose_item_start'
            : 'list_item_start'
        });

        // Recurse.
        this.token(item, false);

        this.tokens.push({
          type: 'list_item_end'
        });
      }

      this.tokens.push({
        type: 'list_end'
      });

      continue;
    }

    // html
    if (cap = this.rules.html.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: this.options.sanitize
          ? 'paragraph'
          : 'html',
        pre: cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style',
        text: cap[0]
      });
      continue;
    }

    // def
    if (top && (cap = this.rules.def.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.links[cap[1].toLowerCase()] = {
        href: cap[2],
        title: cap[3]
      };
      continue;
    }

    // table (gfm)
    if (top && (cap = this.rules.table.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/(?: *\| *)?\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i]
          .replace(/^ *\| *| *\| *$/g, '')
          .split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // top-level paragraph
    if (top && (cap = this.rules.paragraph.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'paragraph',
        text: cap[1].charAt(cap[1].length - 1) === '\n'
          ? cap[1].slice(0, -1)
          : cap[1]
      });
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      // Top-level should never reach here.
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'text',
        text: cap[0]
      });
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return this.tokens;
};

/**
 * Inline-Level Grammar
 */

var inline = {
  escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
  autolink: /^<([^ >]+(@|:\/)[^ >]+)>/,
  url: noop,
  tag: /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,
  link: /^!?\[(inside)\]\(href\)/,
  reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
  nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
  strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
  em: /^\b_((?:__|[\s\S])+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
  code: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
  br: /^ {2,}\n(?!\s*$)/,
  del: noop,
  text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/
};

inline._inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;
inline._href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

inline.link = replace(inline.link)
  ('inside', inline._inside)
  ('href', inline._href)
  ();

inline.reflink = replace(inline.reflink)
  ('inside', inline._inside)
  ();

/**
 * Normal Inline Grammar
 */

inline.normal = merge({}, inline);

/**
 * Pedantic Inline Grammar
 */

inline.pedantic = merge({}, inline.normal, {
  strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
  em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
});

/**
 * GFM Inline Grammar
 */

inline.gfm = merge({}, inline.normal, {
  escape: replace(inline.escape)('])', '~|])')(),
  url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
  del: /^~~(?=\S)([\s\S]*?\S)~~/,
  text: replace(inline.text)
    (']|', '~]|')
    ('|', '|https?://|')
    ()
});

/**
 * GFM + Line Breaks Inline Grammar
 */

inline.breaks = merge({}, inline.gfm, {
  br: replace(inline.br)('{2,}', '*')(),
  text: replace(inline.gfm.text)('{2,}', '*')()
});

/**
 * Inline Lexer & Compiler
 */

function InlineLexer(links, options) {
  this.options = options || marked.defaults;
  this.links = links;
  this.rules = inline.normal;
  this.renderer = this.options.renderer || new Renderer;

  if (!this.links) {
    throw new
      Error('Tokens array requires a `links` property.');
  }

  if (this.options.gfm) {
    if (this.options.breaks) {
      this.rules = inline.breaks;
    } else {
      this.rules = inline.gfm;
    }
  } else if (this.options.pedantic) {
    this.rules = inline.pedantic;
  }
}

/**
 * Expose Inline Rules
 */

InlineLexer.rules = inline;

/**
 * Static Lexing/Compiling Method
 */

InlineLexer.output = function(src, links, options) {
  var inline = new InlineLexer(links, options);
  return inline.output(src);
};

/**
 * Lexing/Compiling
 */

InlineLexer.prototype.output = function(src) {
  var out = ''
    , link
    , text
    , href
    , cap;

  while (src) {
    // escape
    if (cap = this.rules.escape.exec(src)) {
      src = src.substring(cap[0].length);
      out += cap[1];
      continue;
    }

    // autolink
    if (cap = this.rules.autolink.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[2] === '@') {
        text = cap[1].charAt(6) === ':'
          ? this.mangle(cap[1].substring(7))
          : this.mangle(cap[1]);
        href = this.mangle('mailto:') + text;
      } else {
        text = escape(cap[1]);
        href = text;
      }
      out += this.renderer.link(href, null, text);
      continue;
    }

    // url (gfm)
    if (cap = this.rules.url.exec(src)) {
      src = src.substring(cap[0].length);
      text = escape(cap[1]);
      href = text;
      out += this.renderer.link(href, null, text);
      continue;
    }

    // tag
    if (cap = this.rules.tag.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.options.sanitize
        ? escape(cap[0])
        : cap[0];
      continue;
    }

    // link
    if (cap = this.rules.link.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.outputLink(cap, {
        href: cap[2],
        title: cap[3]
      });
      continue;
    }

    // reflink, nolink
    if ((cap = this.rules.reflink.exec(src))
        || (cap = this.rules.nolink.exec(src))) {
      src = src.substring(cap[0].length);
      link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
      link = this.links[link.toLowerCase()];
      if (!link || !link.href) {
        out += cap[0].charAt(0);
        src = cap[0].substring(1) + src;
        continue;
      }
      out += this.outputLink(cap, link);
      continue;
    }

    // strong
    if (cap = this.rules.strong.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.strong(this.output(cap[2] || cap[1]));
      continue;
    }

    // em
    if (cap = this.rules.em.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.em(this.output(cap[2] || cap[1]));
      continue;
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.codespan(escape(cap[2], true));
      continue;
    }

    // br
    if (cap = this.rules.br.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.br();
      continue;
    }

    // del (gfm)
    if (cap = this.rules.del.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.del(this.output(cap[1]));
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      src = src.substring(cap[0].length);
      out += escape(this.smartypants(cap[0]));
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return out;
};

/**
 * Compile Link
 */

InlineLexer.prototype.outputLink = function(cap, link) {
  var href = escape(link.href)
    , title = link.title ? escape(link.title) : null;

  return cap[0].charAt(0) !== '!'
    ? this.renderer.link(href, title, this.output(cap[1]))
    : this.renderer.image(href, title, escape(cap[1]));
};

/**
 * Smartypants Transformations
 */

InlineLexer.prototype.smartypants = function(text) {
  if (!this.options.smartypants) return text;
  return text
    // em-dashes
    .replace(/--/g, '\u2014')
    // opening singles
    .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
    // closing singles & apostrophes
    .replace(/'/g, '\u2019')
    // opening doubles
    .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
    // closing doubles
    .replace(/"/g, '\u201d')
    // ellipses
    .replace(/\.{3}/g, '\u2026');
};

/**
 * Mangle Links
 */

InlineLexer.prototype.mangle = function(text) {
  var out = ''
    , l = text.length
    , i = 0
    , ch;

  for (; i < l; i++) {
    ch = text.charCodeAt(i);
    if (Math.random() > 0.5) {
      ch = 'x' + ch.toString(16);
    }
    out += '&#' + ch + ';';
  }

  return out;
};

/**
 * Renderer
 */

function Renderer() {}

Renderer.prototype.code = function(code, lang, escaped, options) {
  options = options || {};

  if (options.highlight) {
    var out = options.highlight(code, lang);
    if (out != null && out !== code) {
      escaped = true;
      code = out;
    }
  }

  if (!lang) {
    return '<pre><code>'
      + (escaped ? code : escape(code, true))
      + '\n</code></pre>';
  }

  return '<pre><code class="'
    + options.langPrefix
    + lang
    + '">'
    + (escaped ? code : escape(code))
    + '\n</code></pre>\n';
};

Renderer.prototype.blockquote = function(quote) {
  return '<blockquote>\n' + quote + '</blockquote>\n';
};

Renderer.prototype.html = function(html) {
  return html;
};

Renderer.prototype.heading = function(text, level, raw, options) {
  return '<h'
    + level
    + ' id="'
    + options.headerPrefix
    + raw.toLowerCase().replace(/[^\w]+/g, '-')
    + '">'
    + text
    + '</h'
    + level
    + '>\n';
};

Renderer.prototype.hr = function() {
  return '<hr>\n';
};

Renderer.prototype.list = function(body, ordered) {
  var type = ordered ? 'ol' : 'ul';
  return '<' + type + '>\n' + body + '</' + type + '>\n';
};

Renderer.prototype.listitem = function(text) {
  return '<li>' + text + '</li>\n';
};

Renderer.prototype.paragraph = function(text) {
  return '<p>' + text + '</p>\n';
};

Renderer.prototype.table = function(header, body) {
  return '<table>\n'
    + '<thead>\n'
    + header
    + '</thead>\n'
    + '<tbody>\n'
    + body
    + '</tbody>\n'
    + '</table>\n';
};

Renderer.prototype.tablerow = function(content) {
  return '<tr>\n' + content + '</tr>\n';
};

Renderer.prototype.tablecell = function(content, flags) {
  var type = flags.header ? 'th' : 'td';
  var tag = flags.align
    ? '<' + type + ' style="text-align:' + flags.align + '">'
    : '<' + type + '>';
  return tag + content + '</' + type + '>\n';
};

// span level renderer
Renderer.prototype.strong = function(text) {
  return '<strong>' + text + '</strong>';
};

Renderer.prototype.em = function(text) {
  return '<em>' + text + '</em>';
};

Renderer.prototype.codespan = function(text) {
  return '<code>' + text + '</code>';
};

Renderer.prototype.br = function() {
  return '<br>';
};

Renderer.prototype.del = function(text) {
  return '<del>' + text + '</del>';
};

Renderer.prototype.link = function(href, title, text) {
  var out = '<a href="' + href + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += '>' + text + '</a>';
  return out;
};

Renderer.prototype.image = function(href, title, text) {
  var out = '<img src="' + href + '" alt="' + text + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += '>';
  return out;
};

/**
 * Parsing & Compiling
 */

function Parser(options) {
  this.tokens = [];
  this.token = null;
  this.options = options || marked.defaults;
  this.options.renderer = this.options.renderer || new Renderer;
  this.renderer = this.options.renderer;
}

/**
 * Static Parse Method
 */

Parser.parse = function(src, options, renderer) {
  var parser = new Parser(options, renderer);
  return parser.parse(src);
};

/**
 * Parse Loop
 */

Parser.prototype.parse = function(src) {
  this.inline = new InlineLexer(src.links, this.options, this.renderer);
  this.tokens = src.reverse();

  var out = '';
  while (this.next()) {
    out += this.tok();
  }

  return out;
};

/**
 * Next Token
 */

Parser.prototype.next = function() {
  return this.token = this.tokens.pop();
};

/**
 * Preview Next Token
 */

Parser.prototype.peek = function() {
  return this.tokens[this.tokens.length - 1] || 0;
};

/**
 * Parse Text Tokens
 */

Parser.prototype.parseText = function() {
  var body = this.token.text;

  while (this.peek().type === 'text') {
    body += '\n' + this.next().text;
  }

  return this.inline.output(body);
};

/**
 * Parse Current Token
 */

Parser.prototype.tok = function() {
  switch (this.token.type) {
    case 'space': {
      return '';
    }
    case 'hr': {
      return this.renderer.hr();
    }
    case 'heading': {
      return this.renderer.heading(
        this.inline.output(this.token.text),
        this.token.depth,
        this.token.text,
        this.options
      );
    }
    case 'code': {
      return this.renderer.code(this.token.text,
        this.token.lang,
        this.token.escaped,
        this.options);
    }
    case 'table': {
      var header = ''
        , body = ''
        , i
        , row
        , cell
        , flags
        , j;

      // header
      cell = '';
      for (i = 0; i < this.token.header.length; i++) {
        flags = { header: true, align: this.token.align[i] };
        cell += this.renderer.tablecell(
          this.inline.output(this.token.header[i]),
          { header: true, align: this.token.align[i] }
        );
      }
      header += this.renderer.tablerow(cell);

      for (i = 0; i < this.token.cells.length; i++) {
        row = this.token.cells[i];

        cell = '';
        for (j = 0; j < row.length; j++) {
          cell += this.renderer.tablecell(
            this.inline.output(row[j]),
            { header: false, align: this.token.align[j] }
          );
        }

        body += this.renderer.tablerow(cell);
      }
      return this.renderer.table(header, body);
    }
    case 'blockquote_start': {
      var body = '';

      while (this.next().type !== 'blockquote_end') {
        body += this.tok();
      }

      return this.renderer.blockquote(body);
    }
    case 'list_start': {
      var body = ''
        , ordered = this.token.ordered;

      while (this.next().type !== 'list_end') {
        body += this.tok();
      }

      return this.renderer.list(body, ordered);
    }
    case 'list_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.token.type === 'text'
          ? this.parseText()
          : this.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'loose_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'html': {
      var html = !this.token.pre && !this.options.pedantic
        ? this.inline.output(this.token.text)
        : this.token.text;
      return this.renderer.html(html);
    }
    case 'paragraph': {
      return this.renderer.paragraph(this.inline.output(this.token.text));
    }
    case 'text': {
      return this.renderer.paragraph(this.parseText());
    }
  }
};

/**
 * Helpers
 */

function escape(html, encode) {
  return html
    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function replace(regex, opt) {
  regex = regex.source;
  opt = opt || '';
  return function self(name, val) {
    if (!name) return new RegExp(regex, opt);
    val = val.source || val;
    val = val.replace(/(^|[^\[])\^/g, '$1');
    regex = regex.replace(name, val);
    return self;
  };
}

function noop() {}
noop.exec = noop;

function merge(obj) {
  var i = 1
    , target
    , key;

  for (; i < arguments.length; i++) {
    target = arguments[i];
    for (key in target) {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        obj[key] = target[key];
      }
    }
  }

  return obj;
}


/**
 * Marked
 */

function marked(src, opt, callback) {
  if (callback || typeof opt === 'function') {
    if (!callback) {
      callback = opt;
      opt = null;
    }

    opt = merge({}, marked.defaults, opt || {});

    var highlight = opt.highlight
      , tokens
      , pending
      , i = 0;

    try {
      tokens = Lexer.lex(src, opt)
    } catch (e) {
      return callback(e);
    }

    pending = tokens.length;

    var done = function() {
      var out, err;

      try {
        out = Parser.parse(tokens, opt);
      } catch (e) {
        err = e;
      }

      opt.highlight = highlight;

      return err
        ? callback(err)
        : callback(null, out);
    };

    if (!highlight || highlight.length < 3) {
      return done();
    }

    delete opt.highlight;

    if (!pending) return done();

    for (; i < tokens.length; i++) {
      (function(token) {
        if (token.type !== 'code') {
          return --pending || done();
        }
        return highlight(token.text, token.lang, function(err, code) {
          if (code == null || code === token.text) {
            return --pending || done();
          }
          token.text = code;
          token.escaped = true;
          --pending || done();
        });
      })(tokens[i]);
    }

    return;
  }
  try {
    if (opt) opt = merge({}, marked.defaults, opt);
    return Parser.parse(Lexer.lex(src, opt), opt);
  } catch (e) {
    e.message += '\nPlease report this to https://github.com/chjj/marked.';
    if ((opt || marked.defaults).silent) {
      return '<p>An error occured:</p><pre>'
        + escape(e.message + '', true)
        + '</pre>';
    }
    throw e;
  }
}

/**
 * Options
 */

marked.options =
marked.setOptions = function(opt) {
  merge(marked.defaults, opt);
  return marked;
};

marked.defaults = {
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: false,
  silent: false,
  highlight: null,
  langPrefix: 'lang-',
  smartypants: false,
  headerPrefix: '',
  renderer: new Renderer
};

/**
 * Expose
 */

marked.Parser = Parser;
marked.parser = Parser.parse;

marked.Renderer = Renderer;

marked.Lexer = Lexer;
marked.lexer = Lexer.lex;

marked.InlineLexer = InlineLexer;
marked.inlineLexer = InlineLexer.output;

marked.parse = marked;

if (typeof exports === 'object') {
  module.exports = marked;
} else if (typeof define === 'function' && define.amd) {
  define(function() { return marked; });
} else {
  this.marked = marked;
}

}).call(function() {
  return this || (typeof window !== 'undefined' ? window : global);
}());

/**
 * Angular directive to render Markdown text. It's built on blazingly fast markdown parser 'marked'.
 * @version v1.0.0 - 2014-03-12
 * @link https://github.com/yaru22/angular-md
 * @author Brian Park <yaru22@gmail.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
"use strict";angular.module("yaru22.md",[]).directive("md",function(){return"undefined"!=typeof hljs&&marked.setOptions({highlight:function(a,b){return b?hljs.highlight(b,a).value:hljs.highlightAuto(a).value}}),{restrict:"E",require:"?ngModel",link:function(a,b,c,d){if(!d){var e=marked(b.text());return b.html(e),void 0}d.$render=function(){var a=marked(d.$viewValue||"");b.html(a)}}}});
"use strict";
angular.module('arethusa.comments', ['yaru22.md']);

"use strict";

angular.module('arethusa.comments').directive('comment', [
  'comments',
  function(comments) {
    return {
      restrict: 'A',
      scope: {
        comment: '='
      },
      link: function(scope, element, attrs) {
      },
      templateUrl: 'js/arethusa.comments/templates/comment.html'
    };
  }
]);

"use strict";

angular.module('arethusa.comments').directive('commentCreator', [
  'comments',
  'state',
  function(comments, state, keyCapture, notifier, plugins) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        var ids;

        scope.comments = comments;
        scope.state = state;
        scope.hasSelections = state.hasClickSelections;

        function currentTokens() {
          return scope.active ? 'on ' + state.toTokenStrings(scope.ids) : '';
        }

        scope.$watchCollection('state.clickedTokens', function(newVal, oldVal) {
          scope.ids = Object.keys(newVal).sort();
          scope.active = scope.ids.length;
          scope.currentTokenStrings = currentTokens();
        });

        scope.submit = function() {
          comments.createNewComment(ids, scope.comment);
        };
      },
      templateUrl: 'js/arethusa.comments/templates/comment_creator.html'
    };
  }
]);

"use strict";

angular.module('arethusa.comments').directive('commentFilter', [
  'comments',
  'state',
  'translator',
  function(comments, state, translator) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        var style = { "background-color": "rgb(142, 255, 142)" };
        scope.comments = comments;
        scope.total = state.totalTokens;
        scope.filter = comments.filter;

        var highlightOn;
        var watcher;

        function addHighlighting() {
          angular.forEach(scope.ids, function(id, i) {
            state.addStyle(id, style);
          });
        }

        function removeHighlighting() {
          angular.forEach(scope.ids, function(id, i) {
            var styles = Object.keys(style);
            state.removeStyle(id, styles);
          });
        }

        scope.highlightCommented = function() {
          if (highlightOn) {
            removeHighlighting();
          } else {
            addHighlighting();
          }
          highlightOn = !highlightOn;
        };

        scope.selectCommented = function() {
          removeHighlighting();
          state.multiSelect(scope.ids);
        };

        scope.$watchCollection('comments.reverseIndex', function(newVal, oldVal) {
          scope.ids = Object.keys(newVal);
          scope.count = scope.ids.length;
        });

        translator('uth.tooltip', function(trsl) {
          scope.tooltip = trsl();
        });
      },
      templateUrl: 'js/arethusa.comments/templates/comment_filter.html'
    };
  }
]);

"use strict";

angular.module('arethusa.comments').directive('commentInputForm', [
  'comments',
  'translator',
  function(comments, translator) {
    return {
      restrict: 'A',
      scope: {
        active: "=commentInputForm",
        target: "="
      },
      link: function(scope, element, attrs) {
        scope.submit = function() {
          comments.createNewComment(scope.target, scope.comment, function() {
            scope.comment = '';
          });
        };

        function markdownPlaceholder(translation) {
          scope.markdownPlaceholder = translation();
        }

        translator('markdownEnabled', markdownPlaceholder);
      },
      templateUrl: 'js/arethusa.comments/templates/comment_input_form.html'
    };
  }
]);

"use strict";

angular.module('arethusa.comments').directive('commentTargets', [
  'comments',
  'idHandler',
  function(comments, idHandler) {
    return {
      restrict: 'A',
      scope: {
        tokens: "=commentTargets"
      },
      link: function(scope, element, attrs) {
        function ids() {
          return arethusaUtil.map(scope.tokens, function(token) {
            return token.id;
          }).sort();
        }

        scope.nonSequential = idHandler.nonSequentialIds(ids());
      },
      templateUrl: 'js/arethusa.comments/templates/comment_targets.html'

    };
  }
]);

"use strict";

// This directive is temporarily renamed to commentsX because of
// https://github.com/latin-language-toolkit/arethusa/issues/384

angular.module('arethusa.comments').directive('commentsX', [
  'comments',
  'state',
  function(comments, state) {
    return {
      restrict: 'A',
      scope: {
        comments: "=commentsX",
      },
      compile: function(tElement, tAttrs, transclude) {
        return {
          pre: function(scope, iElement, iAttrs) {
            // Need to define the token in a pre-compile function,
            // otherwise the directive in the template cannot render!
            scope.tokens = arethusaUtil.map(scope.comments.ids, function(id) {
              return state.getToken(id);
            });
          },
          post: function(scope, iElement, iAttrs) {
            scope.select = function() {
              state.multiSelect(scope.comments.ids);
            };
          }
        };
      },
      templateUrl: 'js/arethusa.comments/templates/comments.directive.html'
    };
  }
]);

"use strict";

angular.module('arethusa.comments').directive('commentsOnDocLevel', [
  'comments',
  function(comments) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        scope.c = comments;

        scope.count = function() {
          return comments.docLevelComments.length;
        };
      },
      templateUrl: 'js/arethusa.comments/templates/comments_on_doc_level.html'
    };
  }
]);

"use strict";

angular.module('arethusa.comments').factory('CommentsRetriever', [
  'configurator',
  'idHandler',
  'state',
  function(configurator, idHandler, state) {
    var comments = { document: [] };
    var alreadyLoaded;

    function splitIdAndComment(comment) {
      var i = lastIndexOfHeaderSection(comment);
      var header = comment.slice(0, i - 1);
      var comm   = comment.slice(i);
      var regexp = new RegExp('^##(.*?)##');
      var match = regexp.exec(header);
      return match ? [match[1], comm] : [null, comment];
    }

    function lastIndexOfHeaderSection(comment) {
      var i = comment.indexOf('#!#\n\n');
      // Backwards compabitilty for comments that didn't
      // have the token strings attached
      return i === -1 ? comment.indexOf('##\n\n') + 4 : i + 5;
    }

    function WrappedComment(ids, comment) {
      this.ids = ids;
      this.comments = [comment];
    }

    function addComments(id, comment) {
      // We might be provided with document level comments, that come
      // without token identifiers.
      if (!id) return comments.document.push(comment);

      var sentenceIdAndWIds = id.split('.');

      var sentenceId  = sentenceIdAndWIds[0];
      var wIds = arethusaUtil.map(sentenceIdAndWIds[1].split(','), function(id) {
        return idHandler.getId(id, sentenceId);
      });

      var arr = arethusaUtil.getProperty(comments, sentenceId);
      if (!arr) {
        arr = [];
        arethusaUtil.setProperty(comments, sentenceId, arr);
      }

      var span = sameSpan(arr, wIds);
      if (span) {
        span.comments.push(comment);
      } else {
        // We unshift on purpose - we want newly added comments on runtime to
        // appear on top of the list.
        span = new WrappedComment(wIds, comment);
        arr.unshift(span);
      }
      return span;
    }

    function sameSpan(arr, ids) {
      var ret;
      for (var i = 0; i < arr.length; i++) {
        var span = arr[i];
        if (angular.equals(span.ids, ids)) {
          ret = span;
          break;
        }
      }
      return ret;
    }

    function parseComment(commentObj, i) {
      var comment = commentObj.comment;
      var extracted = splitIdAndComment(comment);
      commentObj.comment = extracted[1];
      return addComments(extracted[0], commentObj);
    }

    function parseComments(res) {
      angular.forEach(res, parseComment);
      sortComments();
    }

    function sortCommentsOfChunk(wrappedComments, sentenceId) {
      comments[sentenceId] = wrappedComments.sort(function(a, b) {
        return a.ids > b.ids;
      });
    }


    function sortComments() {
      angular.forEach(comments, sortCommentsOfChunk);
    }

    function addFakeIdsAndStrings(comment) {
      var sentenceId = comment.sentenceId;
      var ids = comment.ids;
      var sourceIds = arethusaUtil.map(ids, function(id) {
        return idHandler.formatId(id, '%w');
      });
      var fakeId = '##' + sentenceId + '.' + sourceIds.join(',') + '##\n\n';
      var strings = '#!# ' + state.toTokenStrings(ids) + ' #!#\n\n';
      comment.comment = fakeId + strings + comment.comment;
    }

    return function(conf) {
      var self = this;
      var resource = configurator.provideResource(conf.resource);

      this.getData = function(chunkId, callback) {
        if (alreadyLoaded) {
          callback(comments[chunkId]);
        } else {
          resource.get().then(function(res) {
            parseComments(res.data);
            callback(comments[chunkId] || []);
          });
          alreadyLoaded = true;
        }
      };

      this.saveData = function(comment, success, error) {
        addFakeIdsAndStrings(comment);
        resource.save(comment).then(function(res) {
          success(parseComment(res.data));
        }, error);
      };

      this.docLevelComments = function() {
        return comments.document;
      };
    };
  }
]);

"use strict";

angular.module('arethusa.comments').service('comments', [
  'state',
  'configurator',
  'navigator',
  'notifier',
  'plugins',
  'keyCapture',
  'translator',
  function(state, configurator, navigator, notifier,
           plugins, keyCapture, translator) {
    var self = this;
    this.name = "comments";

    var retriever, persister;
    var idMap;
    var commentIndex;
    var fullTextIndex;

    var translations = translator({
      'comments.successMessage': 'success',
      'comments.errorMessage': 'error',
      'comments.selectFirst': 'selectFirst'
    });

    this.externalDependencies = [
      "https://cdnjs.cloudflare.com/ajax/libs/lunr.js/0.5.12/lunr.min.js"
    ];

    this.filter = {};
    this.reverseIndex = {};

    this.defaultConf = {
      template: "js/arethusa.comments/templates/comments.html",
      contextMenu: true,
      contextMenuTemplate: "js/arethusa.comments/templates/context_menu.html"
    };

    this.init = function() {
      configure();
      retrieveComments();
    };

    ////////// Backend Calls

    function configure() {
      configurator.getConfAndDelegate(self);
      retriever = configurator.getRetriever(self.conf.retriever);
      persister = retriever;
    }

    // Currently only supports single sentences!
    function retrieveComments() {
      self.comments = [];
      self.docLevelComments = [];
      retriever.getData(navigator.status.currentIds[0], function(comments) {
        self.comments = comments;
        self.docLevelComments = retriever.docLevelComments();
        createIndices();
      });
    }

    function createIndices() {
      commentIndex = {};
      self.reverseIndex = {};
      fullTextIndex = lunrIndex();
      angular.forEach(self.comments, addToIndex);
    }

    function lunrIndex() {
      return lunr(function() {
        this.field('body');
        this.ref('id');
      });
    }

    function addToIndex(commentContainer) {
      var ids = commentContainer.ids;
      var id = ids.join('|'); // using a . would interfere with aU.setProperty

      commentIndex[id] = commentContainer;
      fullTextIndex.add({ id: id, body: fullText(commentContainer) });

      angular.forEach(ids, function(tId) {
        arethusaUtil.setProperty(self.reverseIndex, tId + '.' + id, true);
      });
    }

    function fullText(commentContainer) {
      return arethusaUtil.map(commentContainer.comments, function(el) {
        return el.comment;
      }).join(' ');
    }

    ///////// Frontend Calls

    this.commentCountFor = function(token) {
      var count = 0;
      var commentIds = self.reverseIndex[token.id];
      if (commentIds) {
        var idArr = Object.keys(commentIds);
        angular.forEach(getFromIndex(idArr), function(commentObj) {
          count = count + commentObj.comments.length;
        });
      }
      return count;
    };

    this.goToComments = function(tId) {
      state.deselectAll();
      state.selectToken(tId);
      self.filter.selection = true;
      self.filter.fullText = '';
      plugins.setActive(self);
    };

    this.currentComments = function() {
      return filteredComments() || self.comments;
    };

    function filteredComments() {
      var sel = self.filter.selection;
      var txt = self.filter.fullText;

      if (sel || txt) {
        var ids;
        if (sel) { ids = selectionFilter(); }
        if (txt) { ids = searchText(txt, ids); }
        return getFromIndex(ids);
      }
    }

    function selectionFilter() {
      var targets = {};
      angular.forEach(state.selectedTokens, function(token, id) {
        angular.extend(targets, self.reverseIndex[id]);
      });
      return Object.keys(targets).sort();
    }

    function searchText(txt, otherIds) {
      // A former filter returned empty, so we can just return,
      // but it could also be that this fn is the first filter
      // applied.
      if (otherIds && !otherIds.length) return otherIds;

      var hits = fullTextIndex.search(txt);
      var ids = arethusaUtil.map(hits, function(el) { return el.ref; });
      return otherIds ? arethusaUtil.intersect(ids, otherIds) : ids;
    }

    function getFromIndex(ids) {
      return arethusaUtil.map(ids, function(el) {
        return commentIndex[el];
      });
    }

    // Bad system - not compatible with multi sentences
    this.createNewComment = function(ids, comment, successFn) {
      var newComment = new Comment(ids, navigator.status.currentIds[0], comment);
      persister.saveData(newComment, saveSuccess(successFn), saveError);
    };

    function Comment(ids, sentenceId, comment, type) {
      this.ids = ids;
      this.sentenceId = sentenceId;
      this.comment = comment;
    }

    function saveSuccess(fn) {
      return function(commentContainer) {
        // Could be that this chunk had no comments before,
        // so we need to get the just newly created object
        // from the retriever and build up all our indices.
        if (self.comments.length !== 0) {
          addToIndex(commentContainer);
        } else {
          retrieveComments();
        }
        fn();
        notifier.success(translations.success());
      };
    }

    function saveError() {
      notifier.error(translations.error());
    }

    /////////// Register plugin keymaps

    keyCapture.initCaptures(function(kC) {
      return {
        comments: [
          kC.create('create', openCommentField, 'ctrl-K')
        ]
      };
    });

    function openCommentField() {
      if (state.hasClickSelections()) {
        self.creator = true;
        plugins.setActive(self);
      } else {
        notifier.info(translations.selectFirst());
      }
    }

  }
]);

angular.module('arethusa.comments').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('js/arethusa.comments/templates/comment.html',
    "<div class=\"comment\">\n" +
    "  <div class=\"comment-header\">\n" +
    "    <span><strong>{{ comment.user }}</strong></span>\n" +
    "    <span class=\"right note\">{{ comment.updated_at | date: 'short' }}</span>\n" +
    "  </div>\n" +
    "  <div class=\"comment-body\">\n" +
    "    <md ng-model=\"comment.comment\"/>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('js/arethusa.comments/templates/comment_creator.html',
    "<div>\n" +
    "  <div delimiter/>\n" +
    "  <div>\n" +
    "    <span\n" +
    "      ng-click=\"comments.creator = (!comments.creator && active)\"\n" +
    "      ng-disabled=\"!active\"\n" +
    "      class=\"button radius micro\"\n" +
    "      translate=\"comments.newComment\">\n" +
    "    </span>\n" +
    "    <span class=\"italic\">{{ currentTokenStrings }}</span>\n" +
    "  </div>\n" +
    "  <p>\n" +
    "    <div comment-input-form=\"comments.creator\" target=\"ids\">\n" +
    "  </p>\n" +
    "</div>\n"
  );


  $templateCache.put('js/arethusa.comments/templates/comment_filter.html',
    "<div class=\"small-12 columns\">\n" +
    "  <label>\n" +
    "    <span translate=\"comments.fullTextSearch\"/>\n" +
    "    <input\n" +
    "      type=\"search\"\n" +
    "      style=\"margin: 0\"\n" +
    "      ng-model=\"filter.fullText\"/>\n" +
    "  </label>\n" +
    "<div class=\"small-6 columns\">\n" +
    "  <label>\n" +
    "    <span translate=\"comments.filterSelected\"/>\n" +
    "    <input\n" +
    "      type=\"checkbox\"\n" +
    "      style=\"margin: 0\"\n" +
    "      ng-model=\"filter.selection\"/>\n" +
    "  </label>\n" +
    "</div>\n" +
    "<div class=\"small-6 columns\">\n" +
    "  <label\n" +
    "    class=\"right clickable\"\n" +
    "    tooltip-html-unsafe=\"{{ tooltip }}\"\n" +
    "    tooltip-popup-delay=\"700\"\n" +
    "    tooltip-placement=\"left\"\n" +
    "    ng-click=\"highlightCommented()\"\n" +
    "    ng-dblclick=\"selectCommented()\">\n" +
    "    <span\n" +
    "      translate=\"comments.count\"\n" +
    "      translate-value-count=\"{{ count }}\"\n" +
    "      translate-value-total=\"{{ total }}\"/>\n" +
    "  </label>\n" +
    "</div>\n"
  );


  $templateCache.put('js/arethusa.comments/templates/comment_input_form.html',
    "<form ng-if=\"active\">\n" +
    "  <!-- ngIf opens a new scope - we therefore need a -->\n" +
    "  <!-- parent reference in our model -->\n" +
    "  <textarea\n" +
    "    focus-me=\"active\"\n" +
    "    rows=\"3\"\n" +
    "    placeholder=\"{{ markdownPlaceholder}}\"\n" +
    "    ng-model=\"$parent.comment\"/>\n" +
    "  <span\n" +
    "    ng-disabled=\"!comment\"\n" +
    "    ng-click=\"submit()\"\n" +
    "    class=\"button micro radius\"\n" +
    "    translate=\"submit\">\n" +
    "  </span>\n" +
    "</form>\n"
  );


  $templateCache.put('js/arethusa.comments/templates/comment_targets.html',
    "<span translate=\"comments.on\"/>\n" +
    "<span ng-repeat=\"token in tokens\">\n" +
    "  <span\n" +
    "    class=\"normal-size\"\n" +
    "    token=\"token\"\n" +
    "    colorize=\"true\"\n" +
    "    click=\"true\"\n" +
    "    hover=\"true\">\n" +
    "  </span>\n" +
    "  <span>\n" +
    "  <span ng-if=\"nonSequential[$index]\">\n" +
    "    ...\n" +
    "  </span>\n" +
    "</span>\n"
  );


  $templateCache.put('js/arethusa.comments/templates/comments.directive.html',
    "<div class=\"comments\">\n" +
    "  <div class=\"italic\">\n" +
    "    <span comment-targets=\"tokens\"/>\n" +
    "    <span class=\"right\">\n" +
    "      <span class=\"button nano radius success\"\n" +
    "        ng-click=\"inputOpen = !inputOpen\">\n" +
    "        <i class=\"fa fa-reply\"></i>\n" +
    "      </span>\n" +
    "      <span class=\"button nano radius\"\n" +
    "        ng-click=\"select()\">\n" +
    "        <i class=\"fa fa-crosshairs\"></i>\n" +
    "      </span>\n" +
    "    </span>\n" +
    "  </div>\n" +
    "  <div\n" +
    "    class=\"fade-in\"\n" +
    "    ng-repeat=\"comment in comments.comments\"\n" +
    "    comment=\"comment\"/>\n" +
    "  <div class=\"text-center\">\n" +
    "    <div comment-input-form=\"inputOpen\" target=\"comments.ids\"/>\n" +
    "    <span class=\"ornament-delimiter\" style=\"margin-top: 0.5rem\"/>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('js/arethusa.comments/templates/comments.html',
    "<div comment-filter/>\n" +
    "<div comment-creator/>\n" +
    "<hr class=\"small\"/>\n" +
    "<div\n" +
    "  class=\"fade-in\"\n" +
    "  ng-repeat=\"comments in plugin.currentComments()\"\n" +
    "  comments-x=\"comments\">\n" +
    "</div>\n" +
    "<div delimiter/>\n" +
    "<div comments-on-doc-level/>\n"
  );


  $templateCache.put('js/arethusa.comments/templates/comments_on_doc_level.html',
    "<div ng-if=\"count()\" class=\"comments\">\n" +
    "  <div ng-click=\"visible = !visible\">\n" +
    "    <span class=\"italic clickable\">\n" +
    "      <span translate=\"comments.docLevelComm\"/>\n" +
    "      <span>({{ count() }})</span>\n" +
    "    </span>\n" +
    "  </div>\n" +
    "  <div delimiter/>\n" +
    "  <div ng-if=\"visible\" class=\"fade fast\">\n" +
    "    <div ng-repeat=\"comment in c.docLevelComments\" comment=\"comment\"/>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('js/arethusa.comments/templates/context_menu.html',
    "<div>\n" +
    "  <span\n" +
    "    class=\"clickable\"\n" +
    "    ng-click=\"plugin.goToComments(token.id)\"\n" +
    "    ng-pluralize count=\"plugin.commentCountFor(token)\"\n" +
    "    when=\"{ '0': 'No comments', 'one': '1 comment', 'other': '{} comments'}\">\n" +
    " </span>\n" +
    "</div>\n"
  );

}]);
