var toggle = 1;
var simulation;
var svg1;
var temp, width, height;
var tooltip = floatingTooltip('gates_tooltip', 240);

var myBubbleChart = bubbleChart();
d3.csv('data/emails.csv', display);

function bubbleChart() {
  // Constants for sizing
  width = 640;
  height = 640;

  // Locations to move bubbles towards, depending
  // on which view mode is selected.
  var center = { x: width / 2, y: height / 2 };

  // @v4 strength to apply to the position forces
  var forceStrength = 0.03;
  var bubbles = null;
  var nodes = [];

  function charge(d) {
    return -Math.pow(d.radius, 2.0) * forceStrength;
  }

  var simulation = d3.forceSimulation()
    .velocityDecay(0.2)
    .force('x', d3.forceX().strength(forceStrength).x(center.x))
    .force('y', d3.forceY().strength(forceStrength).y(center.y))
    .force('charge', d3.forceManyBody().strength(charge))
    .on('tick', ticked);

  simulation.stop();

    var fillColor = d3.scaleOrdinal(d3.schemeCategory20c);

  function createNodes(rawData) {
    var maxAmount = d3.max(rawData, function (d) { return 200; });

    var radiusScale = d3.scalePow()
      .exponent(0.5)
      .range([2, 85])
      .domain([0, maxAmount]);

    var myNodes = rawData.map(function (d) {
      return {
        id: d.senderId,
        radius: radiusScale(+d.value),
        sentmails: +d.sentmails,
        name: d.sender,
        x: Math.random() * 900,
        y: Math.random() * 800
      };
    });

    // sort them to prevent occlusion of smaller nodes.
    myNodes.sort(function (a, b) { return b.value - a.value; });

    return myNodes;
  }

  var chart = function chart(selector, rawData) {
    // convert raw data into nodes data
    nodes = createNodes(rawData);

      svg1 = d3.select(selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    // Bind nodes data to what will become DOM elements to represent them.
    bubbles = svg1.selectAll('.bubble')
      .data(nodes, function (d) { return d.id; });

    var bubblesE = bubbles.enter().append('circle')
      .classed('bubble', true)
      .attr('r', 0)
      .attr('fill', function (d) { return fillColor(d.group); })
      .attr('stroke', function (d) { return d3.rgb(fillColor(d.group)).darker(); })
      .attr('stroke-width', 2)
      .on('mouseover', showDetail)
      .on('mouseout', hideDetail)
      .on('click', function(d) {
          var active = vis.active ? false : true,
          newOpacity = active ? 0 : 1;
          toggle = active ? 0 : 1;
          var sender = d.name;
          if (toggle == 0) {
            showNetwork();
            createNetwork(sender);
            createLadder(sender);
            createBar(sender);
          }
          vis.active = active;
          });

    bubbles = bubbles.merge(bubblesE);
    bubbles.transition()
      .duration(2000)
      .attr('r', function (d) { return d.radius; });

    simulation.nodes(nodes);

    groupBubbles();
  };

  function ticked() {
    bubbles
      .attr('cx', function (d) { return d.x; })
      .attr('cy', function (d) { return d.y; });
  }

  function nodeYearPos(d) {
    return yearCenters[d.year].x;
  }

  function groupBubbles() {
    simulation.force('x', d3.forceX().strength(forceStrength).x(center.x));
    simulation.alpha(1).restart();
  }

  function showDetail(d) {
      if(toggle == 1) {
        d3.select(this).attr('stroke', 'black');

        var content = '<span class="name">Sender: </span><span class="value">' +
                      d.name +
                      '</span><br/>' +
                      '<span class="name">SenderId: </span><span class="value">' +
                      d.id +
                      '</span><br/>' +
                      '<span class="name">Sent mails: </span><span class="value">' +
                      d.sentmails +
                      '</span><br/>';

        tooltip.showTooltip(content, d3.event);
      }
  }

  function hideDetail(d) {
    // reset outline
    d3.select(this)
        .attr('stroke', d3.rgb(fillColor(d.group)).darker());

    tooltip.hideTooltip();
  }
    
    function showNetwork(d) {
        tooltip.hideTooltip();
        svg1.remove();
        d3.selectAll("#vis *").remove();
    }

  return chart;
}

function display(error, data) {
  if (error) {
    console.log(error);
  }

  myBubbleChart("#vis", data);
}

function addCommas(nStr) {
  nStr += '';
  var x = nStr.split('.');
  var x1 = x[0];
  var x2 = x.length > 1 ? '.' + x[1] : '';
  var rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + ',' + '$2');
  }

  return x1 + x2;
}

function start() {
    myBubbleChart = bubbleChart();
    d3.csv('data/emails.csv', display);
}

/*--------------------------------------Chart 2 begins-----------------------------------------*/
var margin;
var widther;
var width2;
var height2;
var svg2;
var color2 ;
var simulation2;
var node;
var node_text;
var link;

function layCanvas() {
    margin = {top: 0, right: 0, bottom: 0, left: 0};
    
    widther = d3.select("#vis").node().clientWidth;
    
    width2 = widther - margin.left - margin.right,
    height2 = 650 - margin.top - margin.bottom;
    
    svg2 = d3.select("#vis").append("svg")
    .attr("width", width2 + margin.left + margin.right)
    .attr("height", height2 + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    //Sets color scale
    color2 = d3.scaleOrdinal(["#005689", "#4bc6df", "#dcdcdc"]);
    
    //Sets force between bubbles
    simulation2 = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(10))
    .force("charge", d3.forceManyBody().strength(-100))
    .force("collide", d3.forceCollide().radius(function(d) { return (10) + 30; }).iterations(1))
    .force("center", d3.forceCenter(width2 / 2, height2 / 2));
}


function createNetwork(sender) {
    layCanvas();
    
    //Loads the data
    d3.json('data/count_network.json', function(error, network) {
            if (error) throw error;
            
            //Extract data
            graph = getdata(sender, network);
            
            //Establishes link
            link = svg2.append("g")
            .selectAll("line")
            .data(graph.links)
            .enter().append("line")
            .attr("stroke-width", function(d) { return Math.sqrt(d.value); })
            .attr("class", function(d) {
                  if(d.value === 1) {
                  return "links";
                  }
                  else {
                  return "imp-links";
                  }
                  });
            
            //Establishes bubble
            node = svg2.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(graph.nodes)
            .enter().append("circle")
            .attr("r", function(d) { return d.size / 2; })
            .attr("fill", function(d) { return color2(d.group); })
            .on("click", bubbleUp)
            .call(d3.drag()
                  .on("start", dragstarted)
                  .on("drag", dragged)
                  .on("end", dragended));
            
            node_text = svg2.selectAll(".nodetext")
            .data(graph.nodes)
            .enter().append("text")
            .attr("class", function(d) {
                  if(d.group === 1 & d.id === sender) {
                  return "thiel-label"
                  }
                  else if(d.group === 1) {
                  return "big-label"
                  }
                  else {
                  return "small-label"
                  }
                  })
            .attr("text-anchor", "middle")
            .attr("dx", -20)
            .attr("dy", function(d) {
                  if(d.group === 1 & d.id === sender) {
                  return 35;
                  }
                  else if (d.group === 1) {
                  return 45
                  }
                  else {
                  return 45;
                  }
                  })
            .text(function(d) { return d.id; });
            
            simulation2
            .nodes(graph.nodes)
            .on("tick", ticked);
            
            simulation2.force("link")
            .links(graph.links);
            
            //Places and sizes elements
            function ticked() {
            link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
            
            node
            .attr("cx", function(d) { return d.x = Math.max(d.connections, Math.min((width2 - 20) - d.connections, d.x)); })
            .attr("cy", function(d) { return d.y = Math.max(d.connections, Math.min((height2 - 20) - d.connections, d.y)); });
            
            node_text
            .attr("x", function(d) { return d.x + 20; })
            .attr("y", function(d) { return d.y - 30; });
            }
            });

}

//Drag events
function dragstarted(d) {
    if (!d3.event.active) simulation2.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) simulation2.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

function bubbleUp(d) {
    svg2.remove();
    svg3.remove("*");
    svg4.remove();
    d3.selectAll("#vis *").remove();
    start();
}

function getdata(sender, network) {
    var short = {"nodes": [], "links": []};
    nodelist = [];
    linklist = [];
    rec = [];
    rec.push(sender);
    flag = 0;
    for (var i = 0; i < network["links"].length; i++) {
        var obj = network["links"][i];
        if (obj["source"] == sender) {
            linklist.push(obj);
            rec.push(obj["target"]);
        }
    }
    for (var j =0; j < network["nodes"].length; j++) {
        var obj = network["nodes"][j];
        for (var k = 0; k < rec.length; k++) {
            if (obj["id"] == rec[k]){
                flag = 1;
                break;
            }
        }
        if (flag == 1) {
            nodelist.push(obj);
        }
        flag = 0;
    }
    short["nodes"] = nodelist;
    short["links"] = linklist;
    return short;
}

/*--------------------------------------Chart 3 begins-----------------------------------------*/

var noOfCharts;
var dataLength;
var xTickValues = []

var colour = d3.scaleSequential(d3.interpolatePlasma)
.domain([100, 0])

var formatTime = d3.timeFormat('%Y');

const gradientColours = [
                         { "offset": 0 },
                         { "offset": 21 },
                         { "offset": 60 },
                         { "offset": 100 }
                         ];

const xDiagonal = 180;
const zDiagonal = 520;
const yHeight = 30;

const xAngleDegrees = 25;
const xzAngleDegrees = 95 + xAngleDegrees;
const zAngleDegrees = 180 - xzAngleDegrees - xAngleDegrees;

const xzAngle = xzAngleDegrees * (Math.PI / 180);
const xAngle = xAngleDegrees * (Math.PI / 180); //between xDiagonal and horizontal
const zAngle = zAngleDegrees * (Math.PI / 180);

var xWidth = adjacentCos(xAngle, xDiagonal);
var zWidth = adjacentCos(zAngle, zDiagonal);

var xHeight = triangleSide(xWidth, xDiagonal);
var zHeight = triangleSide(zWidth, zDiagonal);

const margin3 = { "top": 50, "right": 150, "bottom": 50, "left": 150 };
const containerHeight = xHeight + zHeight + yHeight;
const containerWidth = xWidth + zWidth;

var xScale = d3.scaleTime()
.range([0, xWidth]);

var yScale = d3.scaleLinear()
//.domain([0, d3.max(data)])
.range([yHeight, 0]);

var activityScale = d3.scaleBand()
.range([0, zWidth]);

var zScale = d3.scaleLinear()
.domain([0, (noOfCharts - 1)])
.range([0, zWidth])

var area = d3.area()
.x(function (d, i) {
   return xScale(d.time);
   })
.y0(function (d, i) {
    return yArea(0, i);
    })
.y1(function (d, i) {
    return yArea(d.value, i);
    });

var svg3 = d3.select(".ladder")
.append("svg")
.attr("width", containerWidth + margin3.left + margin3.right)
.attr("height", containerHeight + margin3.top + margin3.bottom);

var defs = svg3.append("defs");

var gradient = defs.append("linearGradient")
.attr("id", "gradient")
.attr("x1", 0)
.attr("y1", 0)
.attr("x2", 0)
.attr("y2", yHeight)
.attr("gradientUnits", "userSpaceOnUse")
.attr("gradientTransform", "rotate(-" + xAngleDegrees + ",0,0)")

gradient.selectAll("stop")
.data(gradientColours)
.enter()
.append("stop")
.attr("offset", function (d) { return d.offset + "%"; })
.attr("stop-color", function (d) { return colour(d.offset); });

var axes = svg3.append("g").attr("transform", "translate(" + margin3.left + "," + margin3.top + ")")
.attr("class", "axes")

var charts = svg3.append("g")
.attr("transform", "translate(" + margin3.left + "," + margin3.top + ")")
.attr("class", "charts");

var nsend;

function layCanvas2() {
    xTickValues = []
    
    colour = d3.scaleSequential(d3.interpolatePlasma)
    .domain([100, 0])
    
    formatTime = d3.timeFormat('%I %p');
    
    xWidth = adjacentCos(xAngle, xDiagonal);
    zWidth = adjacentCos(zAngle, zDiagonal);
    
    xHeight = triangleSide(xWidth, xDiagonal);
    zHeight = triangleSide(zWidth, zDiagonal);
    
    xScale = d3.scaleTime()
    .range([0, xWidth]);
    
    yScale = d3.scaleLinear()
    //.domain([0, d3.max(data)])
    .range([yHeight, 0]);
    
    activityScale = d3.scaleBand()
    .range([0, zWidth]);
    
    zScale = d3.scaleLinear()
    .domain([0, (noOfCharts - 1)])
    .range([0, zWidth])
    
    area = d3.area()
    .x(function (d, i) {
       return xScale(d.time);
       })
    .y0(function (d, i) {
        return yArea(0, i);
        })
    .y1(function (d, i) {
        return yArea(d.value, i);
        });
    
    svg3 = d3.select(".ladder")
    .append("svg")
    .attr("width", containerWidth + margin3.left + margin3.right)
    .attr("height", containerHeight + margin3.top + margin3.bottom);
    
    svg3.append("g")
    .append("text")
    .attr("x", 420)
    .attr("y", 38)
    .attr("dx", "0.71em")
    .attr("text-anchor", "end")
    .text("Isometric joyplot for sentiment analysis")
    .attr("stroke", "white")
    .attr("sharp-rendering", "crispEdges");
    
    defs = svg3.append("defs");
    
    gradient = defs.append("linearGradient")
    .attr("id", "gradient")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", 0)
    .attr("y2", yHeight)
    .attr("gradientUnits", "userSpaceOnUse")
    .attr("gradientTransform", "rotate(-" + xAngleDegrees + ",0,0)")
    
    gradient.selectAll("stop")
    .data(gradientColours)
    .enter()
    .append("stop")
    .attr("offset", function (d) { return d.offset + "%"; })
    .attr("stop-color", function (d) { return colour(d.offset); });
    
    axes = svg3.append("g").attr("transform", "translate(" + margin3.left + "," + margin3.top + ")")
    .attr("class", "axes")
    
    charts = svg3.append("g")
    .attr("transform", "translate(" + margin3.left + "," + margin3.top + ")")
    .attr("class", "charts");
}

function createLadder(sender) {
    svg3.remove("*");
    layCanvas2();
    
    nsend = sender;
    d3.tsv('data/records.tsv', row, function (error, dataFlat) {
           if (error) throw error;
           
           // Sort by time
           dataFlat.sort(function (a, b) { return a.time - b.time; });
           
           var data = d3.nest()
           .key(function (d) { return d.activity; })
           .entries(dataFlat);
           
           // Sort activities by peak activity time
           function peakTime(d) {
           var i = d3.scan(d.values, function (a, b) { return b.value - a.value; });
           return d.values[i].time;
           };
           data.sort(function (a, b) { return peakTime(b) - peakTime(a); });
           
           noOfCharts = data.length;
           dataLength = data[0].values.length;
           xScale.domain(d3.extent(dataFlat, function (d) { return d.time; }));
           
           activityScale.domain(data.map(function (d) { return d.key; }));
           
           yScale.domain(d3.extent(dataFlat, function (d) { return d.value }));
           
           xTickValues = [0,0.25,0.5,0.75,1]
           
           axes.call(drawXAxis);
           
           data.forEach(function (d, i) {
                        
                        let series = i;
                        let activity = d.key;
                        let chartData = d.values;
                        
                        let g = charts.append("g")
                        .attr("transform", "translate(" + areaOffsetX(series) + "," + areaOffsetY(series) + ")");
                        
                        g.append("text")
                        .attr("class", "series-label")
                        .text(activity)
                        .attr("x", -8)
                        .attr("y", yHeight + 8)
                        .style("text-anchor", "end")
                        
                        let areaChart = g.append("path")
                        .datum(chartData)
                        .style("fill", "url(#gradient"/* + series + ")"*/)
                        .attr("stroke", "DarkSlateBlue")
                        .attr("stroke-linejoin", "round")
                        .attr("stroke-linecap", "round")
                        .attr("stroke-width", 1.5)
                        .style("opacity", 0.8)
                        .attr("d", area)
                        .on("mouseover", function(d){
                            showSentiment(d);
                            d3.selectAll("path, .series-label").style("opacity", 0.1)
                            d3.select(this).style("opacity", 1)
                            d3.select(this.parentNode).select(".series-label").style("opacity", 1)
                            })
                        .on("mouseout", function(d){
                            hideSentiment(d);
                            d3.selectAll("path").style("opacity", 0.8)
                            d3.selectAll(".series-label").style("opacity", 1)
                            })
                        
                        })
           })

}

function row(d) {
    if (d.sender == nsend)
    {
        return {
        sender: d.sender,
        activity: d.activity,
        time: parseTime(d.time),
        value: +d.p_smooth,
        year: +d.time
        };
    }
};

function parseTime(offset) {
    var date = new Date(2017, 0, 1); // chose an arbitrary day
    return d3.timeMinute.offset(date, offset);
}

function areaOffsetX(i) {
    return i * (zWidth / (noOfCharts - 1))
};

function areaOffsetY(i) {
    let defaultY = containerHeight - zHeight - yHeight;
    let offset = i * (zHeight / (noOfCharts - 1));
    return defaultY + offset;
};

function yArea(d, i) {
    let n = xHeight * (i / dataLength);
    return yScale(d) - n;
};

function xCoord(x, y, z) {
    let x1 = xScale(x);
    let z1 = zScale(z);
    return seriesWidth + xScale(x) - zScale(z)
};

function yCoord(x, y, z) {
    let x1 = xHeight * (x / dataLength);
    let y1 = chartHeight - yScale(y);
    let z1 = zHeight * (z / noOfCharts);
    return height - (y1 + x1 + z1)
};

function drawXAxis(sel) {
    
    let xAxis = sel.append("g")
    .attr("id", "x-axis")
    .attr("transform", "translate(" + areaOffsetX(0) + "," + areaOffsetY(0) + ")");
    
    let xTicks = xAxis.selectAll(".ticks")
    .data(xTickValues)
    .enter()
    .append("g")
    .attr("class", "tick")
    .attr("transform", function (d) {
          let x = xWidth * (d);
          let y = yArea(0, (dataLength * (d)));
          return "translate(" + x + "," + y + ")"
          });
    
    let tickLength = zDiagonal + 25;
    let tickText = tickLength + 5;
    
    xTicks.append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", adjacentCos(zAngle, tickLength))
    .attr("y2", oppositeSin(zAngle, tickLength));
    
//    xTicks.append("text")
//    .attr("class", "axis-label")
//    .attr("x", adjacentCos(zAngle, tickText))
//    .attr("y", oppositeSin(zAngle, tickText));
    
//    xTicks.append("text")
//    .attr("class", "axis-label")
//    .text(function (d) { return formatTime(xScale.invert(xWidth * (d.time))); })
//    .attr("x", adjacentCos(zAngle, tickText))
//    .attr("y", oppositeSin(zAngle, tickText));
};

function showSentiment(d) {
    sender = d[0].sender;
    receiver = d[0].activity;
    max_polarity = 0;
    time = 2009;
    
    for(i = 0; i < d.length; i++) {
        if (d[i].value != 0) {
            max_polarity = d[i].value;
            time = d[i].year;
        }
    }
    
    var content = '<span class="name">Sender: </span><span class="value">' +
    sender +
    '</span><br/>' +
    '<span class="name">Receiver: </span><span class="value">' +
    receiver +
    '</span><br/>' +
    '<span class="name">Year: </span><span class="value">' +
    time +
    '</span><br/>' +
    '<span class="name">Polarity: </span><span class="value">' +
    max_polarity +
    '</span><br/>';
    
    tooltip.showTooltip(content, d3.event);
}

function hideSentiment(d) {
    tooltip.hideTooltip();
}


/*--------------------------------------Chart 4 begins-----------------------------------------*/


// set the dimensions and margins of the graph
var margin4 = {top: 20, right: 20, bottom: 30, left: 40},
width4 = 300 - margin4.left - margin4.right,
height4 = 200 - margin4.top - margin4.bottom;

// set the ranges
var x4 = d3.scaleBand()
.range([0, width4])
.padding(0.1);
var y4 = d3.scaleLinear()
.range([height4, 0]);

var svg4 = d3.select("body").append("svg")
.attr("width", width4 + margin4.left + margin4.right)
.attr("height", height4 + margin4.top + margin4.bottom)
.append("g")
.attr("transform",
      "translate(" + margin4.left + "," + margin4.top + ")");

function showInfo(d) {
    var content = '<span class="name">Sender: </span><span class="value">' +
    d.sender +
    '</span><br/>' +
    '<span class="name">Year: </span><span class="value">' +
    d.year +
    '</span><br/>' +
    '<span class="name">No. of emails: </span><span class="value">' +
    d.count +
    '</span><br/>';
    
    tooltip.showTooltip(content, d3.event);
    
}

function hideInfo(d) {
    tooltip.hideTooltip();
}

function layCanvas4() {
    // set the dimensions and margins of the graph
    margin4 = {top: 20, right: 20, bottom: 30, left: 40},
    width4 = 300 - margin4.left - margin4.right,
    height4 = 200 - margin4.top - margin4.bottom;
    
    // set the ranges
    x4 = d3.scaleBand()
    .range([0, width4])
    .padding(0.1);
    y4 = d3.scaleLinear()
    .range([height4, 0]);
    
    svg4 = d3.selectAll(".bar").append("svg")
    .attr("width", width4 + margin4.left + margin4.right)
    .attr("height", height4 + margin4.top + margin4.bottom)
    .append("g")
    .attr("transform",
          "translate(" + margin4.left + "," + margin4.top + ")");
}

function createBar(sender) {
    d3.selectAll(".bar *").remove();
    layCanvas4();
    // get the data
    d3.csv("data/count.csv", function(error, data) {
           if (error) throw error;

           // format the data
           data.forEach(function(d) {
                        d.count = +d.count;
                        });

           // Scale the range of the data in the domains
           x4.domain(data.map(function(d) { if(d.sender == "Jake Sullivan"){return d.year; }}));
           y4.domain([0, d3.max(data, function(d) { if(d.sender == sender){return d.count; }})]);

           // append the rectangles for the bar chart
           svg4.selectAll(".bar")
           .data(data)
           .enter().append("rect")
           .attr("class", "bar1")
           .attr("x", function(d) { if(d.sender == sender){return x4(d.year); } })
           .attr("width", x4.bandwidth())
           .attr("y", function(d) { if(d.sender == sender){return y4(d.count); } })
           .attr("height", function(d) {if(d.sender == sender) {return height4 - y4(d.count);} })
           .on("mouseover", showInfo)
           .on("mouseout", hideInfo);

           // add the x Axis
           svg4.append("g")
           .attr("transform", "translate(0," + height4 + ")")
           .call(d3.axisBottom(x4))
           .attr("stroke", "red")
           .attr("sharp-rendering", "crispEdges");

           // add the y Axis
           svg4.append("g")
           .call(d3.axisLeft(y4))
           .attr("stroke", "red")
           .attr("sharp-rendering", "crispEdges");
           
           // add the legend on y Axis
           svg4.append("g")
           .append("text")
           .attr("transform", "rotate(-90)")
           .attr("y", -40)
           .attr("dy", "0.71em")
           .attr("text-anchor", "end")
           .text("No of emails")
           .attr("stroke", "red")
           .attr("sharp-rendering", "crispEdges");
           
           //add the legend on x Axis
           svg4.append("g")
           .append("text")
           .attr("x", 35)
           .attr("y", 180)
           .attr("dx", "0.71em")
           .attr("text-anchor", "end")
           .text("Year")
           .attr("stroke", "red")
           .attr("sharp-rendering", "crispEdges");
           
           svg4.append("g")
           .append("text")
           .attr("x", 235)
           .attr("y", -10)
           .attr("dx", "0.71em")
           .attr("text-anchor", "end")
           .text("Breakdown of number of emails per year")
           .attr("stroke", "white")
           .attr("sharp-rendering", "crispEdges");
           
           
           });
}

