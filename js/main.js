
// check parameters to customise this by source:
var source = $.url().param("source");

var sources = [
  // Teams
  {
    source: 'firefox',
    name: 'Coding Firefox Desktop',
    target: 4000,
    type: 'team',
    rule: 'https://wiki.mozilla.org/Contribute/Conversion_points#Coding',
    system: 'Bugzilla:Firefox:: & Github:mozilla/gecko-dev'
  },
  {
    source: 'firefoxos',
    name: 'Coding Firefox OS',
    target: 1200,
    type: 'team',
    rule: 'https://wiki.mozilla.org/Contribute/Conversion_points#Coding',
    system: 'Bugzilla:Firefox OS:: & Github: 80 repos'
  },
  {
    source: 'firefoxforandroid',
    name: 'Coding Firefox for Android',
    target: 300,
    type: 'team',
    rule: 'https://wiki.mozilla.org/Contribute/Conversion_points#Coding',
    system: 'Bugzilla:Firefox for Android'
  },
  {
    source: 'qa',
    name: 'Quality Assurance',
    target: 500,
    type: 'team',
    rule: 'https://wiki.mozilla.org/Contribute/Conversion_points#QA',
    system: 'Bugzilla & Github: 7 repos'
  },
  {
    source: 'sumo',
    name: 'Support',
    target: 1500,
    type: 'team',
    rule: 'https://wiki.mozilla.org/Contribute/Conversion_points#Support',
    system: 'support.mozilla.org'
  },
  {
    source: 'reps',
    name: 'Reps',
    target: 500,
    type: 'team',
    rule: 'https://wiki.mozilla.org/Contribute/Conversion_points#Reps',
    system: 'reps.mozilla.org'
  },
  //Systems
  {
    source: 'sumo',
    name: 'support.mozilla.org',
    target: 1500,
    type: 'system',
    rule: 'https://wiki.mozilla.org/Contribute/Conversion_points#Support',
    system: 'support.mozilla.org'
  },
  {
    source: 'github',
    name: 'github.com',
    target: 6000,
    type: 'system',
    rule: 'https://wiki.mozilla.org/Contribute/Conversion_points',
    system: 'github.com'
  },
  {
    source: 'reps',
    name: 'reps.mozilla.org',
    target: 500,
    type: 'system',
    rule: 'https://wiki.mozilla.org/Contribute/Conversion_points#Reps',
    system: 'reps.mozilla.org'
  },
  {
    source: 'bugzilla',
    name: 'bugzilla.mozilla.org',
    target: 6000,
    type: 'system',
    rule: 'https://wiki.mozilla.org/Contribute/Conversion_points',
    system: 'bugzilla.mozilla.org'
  }
];

function isInSources (s) {
  for (var i = sources.length - 1; i >= 0; i--) {
    if (sources[i].source === s) {
      return true;
    }
  }
  return false;
}

// Default data (All Mozilla)
var GRAPH_DATA = "http://doctodash.herokuapp.com/tab/all";
var TARGET = 20000;
var TITLE = 'All Mozilla';

function setupPageForSource (source) {
  for (var i = sources.length - 1; i >= 0; i--) {
    if (sources[i].source === source) {
      GRAPH_DATA = "http://doctodash.herokuapp.com/tab/" + source;
      TARGET = sources[i].target;
      TITLE = sources[i].name;
    }
  }
}

if (source && isInSources (source)) {
  setupPageForSource(source);
}



$('#sourceName').text(TITLE);

// Graph settings
var Y_SCALE_MAX_DEFAULT = TARGET * 1.25;
var TARGET_25_percent = Math.round(TARGET * 0.25),
    TARGET_50_percent = Math.round(TARGET * 0.5),
    TARGET_75_percent = Math.round(TARGET * 0.75);

var margin = {top: 20, right: 80, bottom: 80, left: 100};
  margin.vertical = margin.top + margin.bottom;
  margin.horizontal = margin.left + margin.right;

var width = 900 - margin.horizontal,
    height = 500 - margin.vertical;

var VIEWBOX = "0 0 " + (width + margin.horizontal) + " " + (height + margin.vertical);

var TICK_VALUES = [TARGET_25_percent, TARGET_50_percent, TARGET_75_percent, TARGET, Y_SCALE_MAX_DEFAULT];

var now = new Date();

// CONTAINER
d3.select("#chart")
  .attr("width", width + margin.horizontal)
  .attr("height", height + margin.vertical)
  .attr("viewBox", VIEWBOX); // this is used for SVG proportional resizing

// Build the graph
function draw(data) {
  var chart = d3.select("#chart");

  // SCALE
  var y_scale_max = Y_SCALE_MAX_DEFAULT;
  var contributor_extent = d3.extent(data, function (d) { return d.totalactive; });
  if (contributor_extent[1] > y_scale_max) {
    y_scale_max = contributor_extent[1];
  }
  var y_scale = d3.scale.linear()
    .range([height + margin.top, margin.top])
    .domain([0,y_scale_max]);

  // secondary Y axis
  var contributor_new_extent = d3.extent(data, function (d) { return d.new; });
  var y_scale_2 = d3.scale.linear()
    .range([height + margin.top, margin.top + (height/5*3)])
    .domain([0,contributor_new_extent[1]*15]);

  var time_extent = d3.extent(data, function (d) { return new Date(d.wkcommencing); });
  var x_scale = d3.time.scale()
    .domain(time_extent)
    .range([margin.left, margin.left + width]);

  // TOOL TIP
  var tip = d3.tip();

  tip
    .attr('class', 'd3-tip')
    .offset([35, 0])
    .html(function(d) {
      return "<span style='color:#FFF;'>" + $.number(d.totalactive) + "</span> Active<br /><span style='color:#3793D4;'>" + $.number(d.new) + "</span> New";
    });

  chart.call(tip);

  // REFERENCE LINES
  function addRefLine (amount, scale, cssClass) {
    chart
      .append("line")
      .attr("x1",         margin.left)
      .attr("x2",         margin.left + width - 20)
      .attr("y1",         scale(amount))
      .attr("y2",         scale(amount))
      .attr("class",      cssClass);
  }
  addRefLine(TARGET_25_percent, y_scale, "target milestone");
  addRefLine(TARGET_50_percent, y_scale, "target milestone");
  addRefLine(TARGET_75_percent, y_scale, "target milestone");
  addRefLine(TARGET, y_scale, "target goal");

  // Bars
  var barWidth = width / data.length;
  var halfBar = (barWidth / 2) - 1;

  // INFO-AREA HOVER BARS
  chart
    .selectAll("g")
    .data(data)
    .enter()
    .append("rect")
      .attr("class",      function (d) { return "info-area"; })
      .attr("x",          function (d) { return x_scale(new Date(d.wkcommencing)); })
      .attr("y",          function (d) { return margin.top; })
      .attr("height",     function (d) { return height; })
      .attr("width",      barWidth - 1)
      .on("mouseover",    function (d, i) {
                            d3.select(this).style("opacity", 0.1);
                            tip.show(d);
                          })
      .on("mouseout",     function (d, i) {
                            d3.select(this).style("opacity", 0);
                            tip.hide(d);
                          });

  // NEW CONTRIBUTOR BARS
  chart
    .selectAll("g")
    .data(data.filter(    function (d) { return (d.new > 0); }))
    .enter()
    .append("rect")
      .attr("class",      "new-contributors")
      .attr("x",          function (d) { return x_scale(new Date(d.wkcommencing)); })
      .attr("y",          function (d) { return y_scale_2(d.new); })
      .attr("height",     function (d) { return height+margin.top - y_scale_2(d.new); })
      .attr("width",      barWidth - 1);


  // ACTIVE CONTRIBUTOR LINE
  // Line
  var line = d3.svg.line()
    .x(function (d) { return x_scale(new Date(d.wkcommencing)) + halfBar; })
    .y(function (d) { return y_scale(d.totalactive); });

  chart
    .append("path")
    .datum(data.filter(   function (d) {
                            return (d.totalactive > 0) && (new Date(d.wkcommencing) < now);
                          }))
    .attr("class",        "line active-contributors")
    .attr("d",            line);

  // Points
  chart
    .selectAll("points")
    .data(data.filter(    function (d) {
                            return (d.totalactive > 0) && (new Date(d.wkcommencing) < now);
                          }))
    .enter()
    .append("circle")
    .attr("cx",           function (d) { return x_scale(new Date(d.wkcommencing)) + halfBar; })
    .attr("cy",           function (d) { return y_scale(d.totalactive); })
    .attr("r",            function (d) { return 2.0; })
    .attr("class",        "active-contributors");



  // X AXIS
  var x_axis  = d3.svg.axis();
  x_axis
    .scale(x_scale)
    .ticks(d3.time.months, 1)
    .tickFormat(           function (d) {
                              var format_month = d3.time.format('%b'); // short name month e.g. Feb
                              var format_year = d3.time.format('%Y');
                              var label = format_month(d);
                              if (label === "Jan") {
                                label = format_year(d);
                              }
                              return label;
                            });

  chart
    .append("g")
      .attr("class",        "x axis")
      .attr("transform",     "translate(0," + (height + margin.top) + ")")
      .call(x_axis)
    .selectAll("text") // rotate text
      .attr("y",            0)
      .attr("x",            0)
      .attr("dy",           ".35em")
      .attr("transform",    "rotate(270) translate(-15,0)")
      .style("text-anchor", "end");

  // Y AXIS LEFT
  var y_axis = d3.svg.axis();
  y_axis
    .scale(y_scale)
    .orient("left")
    .tickValues(TICK_VALUES);

  chart
  .append("g")
    .attr("class",          "y axis")
    .attr("transform",      "translate(" + margin.left + ", 0 )")
  .call(y_axis);

  // Y AXIS RIGHT
  var y_axis_2 = d3.svg.axis();
  y_axis_2
    .scale(y_scale_2)
    .orient("right")
      .ticks(4);

  chart
  .append("g")
    .attr("class",          "y axis new")
    .attr("transform",      "translate(" + (width + margin.left) + ", 0 )")
  .call(y_axis_2);

  // label
  chart.append("text")
    .attr("class",          "label-y2")
    .attr("text-anchor",     "end")
    .attr("x", 0)
    .attr("y", 0)
    .attr("transform",      "rotate(270) translate(-" + (height/5*4) + "," + (width + margin.left + (margin.right/4*3)) + ")")
    .text("New");

}

// Draw the D3 chart
d3.json(GRAPH_DATA, draw);

// Make the chart responsive
var chart = $("#chart"),
    aspect = chart.width() / chart.height(),
    container = chart.parent();

function resize_chart () {
  var targetWidth = container.width();
  chart.attr("width", targetWidth);
  chart.attr("height", Math.round(targetWidth / aspect));
}

$(window).on("resize", function() {
    resize_chart();
}).trigger("resize");



// TOTAL
function display_latest (data) {

  d3.select("#active-total")
    .data([data])
    .text(function (d) {
      // show the total of the latest date that has data
      var total = 0;
      var latestData = new Date(2013,01,01);
      for (var i = 0; i < d.length; i++) {
        var wkcommencing = new Date(d[i].wkcommencing);
        if (wkcommencing >= latestData) {
          if(d[i].totalactive) {
            total = d[i].totalactive;
          }
        }
      }
      return $.number(total);
    });

}

d3.json(GRAPH_DATA, display_latest);


$( document ).ready(function() {
  // Build the source menu list and add links for rules and systems
  var teamMenu = $('#teamMenu');
  var systemMenu = $('#systemMenu');
  $('#rules-link').attr("href", "https://wiki.mozilla.org/Contribute/Conversion_points" );
  $('#rules-tooltip').attr("title", "Bugzilla, SUMO, Github repos" );
  $.each(sources, function (index, value) {
    if (value.type === 'team') {
      teamMenu.append('<li><a href="?source='+ value.source + '&">'+value.name+'</a></li>');
    }
    if (value.type === 'system') {
      systemMenu.append('<li><a href="?source='+ value.source + '&">'+value.name+'</a></li>');
    }
    if (value.source === $.url().param("source")) {
      $('#rules-link').attr("href", value.rule );
      $('#rules-tooltip').attr("title", value.system );
    }
  });
  $('#rules-tooltip').tooltip();
});


