// 数学公式块扩展
hexo.extend.filter.register("marked:extensions", function (extensions) {
    extensions.push({
        name: "displayMath",
        level: "block",
        start(src) {
            return src.match(/^ {0,3}\$\$[ \t]*$/m)?.index;
        },
        tokenizer(src) {
            const match =
                /^ {0,3}\$\$[ \t]*\n([\s\S]+?)\n {0,3}\$\$[ \t]*(?:\n|$)/.exec(
                    src,
                );
            if (match) {
                return { type: "displayMath", raw: match[0], math: match[1] };
            }
        },
        renderer(token) {
            const math = token.math
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
            return `<div class="math-block">$$\n${math}\n$$</div>\n`;
        },
    });
});
