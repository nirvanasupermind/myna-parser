"use strict";

// A Myna grammar for a variant of the Mustache and CTemplate template languages
// This grammar works with any template delimiters defaulting to "{{" and "}}"
// - http://mustache.github.io/mustache.5.html
// - https://github.com/olafvdspek/ctemplate
// According to the mustache documentation:
// - `#` indicates a start section
// - `/` indicates an end section
// - `^` indicates an inverted section
// - `!` indcates a comment
// - `&` or `{` indicate an unescaped variable 
// - `>` indicates a *partial* which is effectively a file include with run-time expansion.

function TemplateGrammar(myna, start, end) {
    if (start == undefined)
        start = "{{";
    if (end == undefined)
        end = "}}";

    if (start.length == 0 || end.length == 0)
        throw "Missing start and end delimiters";

    let m = myna;

    // Define a rule so that we can refer to content recursively
    let _this = this;
    this.recursiveContent = m.delay(function() { return _this.content; });            

    // Main grammar rules. 
    // Only those with 'ast' will generate nodes in the parse tree 
    this.key = m.advanceWhileNot(end).ast;
    this.startSection = m.seq(start, "#", this.key, end).ast;
    this.endSection = m.seq(start, "/", this.key, end).ast;
    this.startInvertedSection = m.seq(start, "^", this.key, end);
    this.escapedVar = m.seq(start, m.notAtChar("#/^!{&<"), this.key, end).ast;
    this.unescapedVar = m.seq(start, m.choice(m.seq("{", this.key, "}"), m.seq("&", this.key)), end).ast;
    this.var = m.choice(this.escapedVar, this.unescapedVar);
    this.partial = m.seq(start, ">", m.ws.opt, this.key, end).ast;
    this.comment = m.seq(start, "!", this.key, end).ast;    
    this.section = m.seq(this.startSection, this.recursiveContent, this.endSection).ast;
    this.invertedSection = m.seq(this.startInvertedSection, this.recursiveContent, this.endSection).ast;
    this.plainText = m.advanceWhileNot("{{").ast;

    // Mmanually optimize the grammar here by using a lookup. Every type of special rule 
    // starts with the first char of the delimiter, otherwise we are just advancing through the text.  
    let startChar = start[0];
    this.content = 
        m.lookup(startChar, 
            m.choice(this.invertedSection, this.section, this.comment, this.partial, this.var),
        this.plainText).zeroOrMore;

    this.document = this.content.ast;
}