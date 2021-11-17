
var formatDatedmY = d3.timeFormat("%d-%m-%Y"),
    formatDatedm = d3.timeFormat("%d-%m"),
    formatDateYmd =  d3.timeFormat("%Y-%m-%d"),
    formatDateYmdCompact = d3.timeFormat("%Y%m%d"),
    formatDateDbY  = d3.timeFormat("%d %b %Y"),
    formatDateDbyS  = d3.timeFormat("%d %b %y"),
    formatDateDby  = d3.timeFormat("%d-%b-%y"),
    formatDatebY  = d3.timeFormat("%b %Y"),
    formatDateby  = d3.timeFormat("%b-%y"),
    isoDateFormat = d3.timeFormat("%Y-%m-%dT%H:%M:%S"),
    isoDateWithTimeZone = d3.timeFormat("%Y-%m-%dT%H:%M:%S%Z"),
    formatDateYmdMediumFormat =  d3.timeFormat("%b %d %Y"),
    formatDateDbySAndTime  = d3.timeFormat("%d %b %y, %H:%M:%S");

var formatInteger = d3.format("d"),
    formatSmallIntegerK = d3.format(".2s");
    formatLargeIntegerK = d3.format(".1s");
