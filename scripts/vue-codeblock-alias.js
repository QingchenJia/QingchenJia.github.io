hexo.extend.filter.register("before_post_render", function (data) {
    if (!data.content) {
        return data;
    }

    data.content = data.content.replace(
        /^([ \t]*(```|~~~)[ \t]*)vue([^\r\n]*)(\r?)$/gim,
        "$1html$3$4"
    );

    return data;
}, 0);
