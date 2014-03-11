/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


function PieChart(data, onChartOver) {
    this.data = data;

    // event handlers
    this.onChartOver = onChartOver;

    this.workOnElement = function(element) {
        this.element = element;
    };

    this.generateGraph = function() {
        //d3 specific coding
        var width = 400,
            height = 300,
            radius = Math.min(width, height) / 2;

        var color = d3.scale.ordinal()

        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

        var arc = d3.svg.arc()
            .outerRadius(radius - 10)
            .innerRadius(0);

        var pie = d3.layout.pie()
            .sort(null)
            .value(function(d) {
                return d.value;
            });

        d3.select(this.element).select("h4").remove();
        d3.select(this.element).select("svg").remove();

        d3.select("div#pie")
            .append("h4")
            .text('Pie chart');


        var svg = d3.select(this.element).append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        this.data.forEach(function(d) {
            d.value = +d.value;
        });

        var g = svg.selectAll(".arc")
            .data(pie(this.data))
            .enter().append("g")
            .attr("class", "arc");

        var text;

        g.append("path")
            .on("mouseover", function(d, i) {
                onChartOver(i);
            })
            .on("click", function(d, i) {
                console.log(i);
            })
            .attr("d", arc)
            .style("fill", function(d) {
                return color(d.data.row);
            });

        g.append("text")
            .attr("transform", function(d) {
                return "translate(" + arc.centroid(d) + ")";
            })
            .attr("dy", ".35em")
            .style("text-anchor", "middle")
            .text(function(d) {
                return d.data.value;
            });
    };

}


function BarChart(queryId, onChartOver, onChartClick) {

    // event handlers
    this.onChartOver = onChartOver;
    this.onChartClick = onChartClick;

    // chart dimensions
    this.maxSamples = 200;

    this.margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 40
    };
    this.width = 500 - this.margin.left - this.margin.right;
    this.height = 280 - this.margin.top - this.margin.bottom;
    this.barPadding = 1;
    this.queryId = queryId;
    this.datakeys = [];


    this.createSvgGraph = function(title) {
        // store this as a variable to access it later inside un func
        var barChart = this;
        var graphsDiv = d3.select("div#" + this.queryId).select("div#graphs");

        graphsDiv.append("h4")
            .text(title);

        this.svg = graphsDiv.append("svg")
            .attr("width", barChart.width + barChart.margin.left + barChart.margin.right)
            .attr("height", barChart.height + barChart.margin.right + barChart.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + barChart.margin.left + "," + barChart.margin.top + ")");
    };

    this.createScale = function(isInverted) {

        // store this as a variable to access it later inside un func
        var barChart = this;

        this.y = d3.scale.linear()
            .domain([0, d3.max(barChart.datakeys, function(d) {
                return d.value;
            })]);

        this.x = d3.scale.ordinal()
            .rangeRoundBands([0, barChart.width], .1, 1);

        if (isInverted)
            this.y.range([barChart.height, 0]);
        else
            this.y.range([0, barChart.height]);


        this.x = d3.scale.ordinal()
            .rangeRoundBands([0, barChart.width], .1);

    };

    this.drawAxis = function() {
        // Define Y axis and Create Y axis
        this.yAxis = d3.svg.axis()
            .scale(this.y)
            .orient("left")
            .ticks(10);

        // Define Y axis and Create Y axis
        this.xAxis = d3.svg.axis()
            .scale(this.x)
            .orient("bottom");

        this.svg.append("g")
            .attr("class", "y axis")
            .call(this.yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("visits");

    };


    this.drawBarChart = function(title, doInverseY) {

        this.createSvgGraph(title);
        this.createScale(doInverseY);

        // store this reference to access it later inside un func
        var barChart = this;


        var rects = this.svg.selectAll("rect")
            .data(barChart.datakeys)
            .enter()
            .append("rect")
            .on("mouseover", function() {
                barChart.onChartOver(this.id);
            })
            .on("click", function() {
                barChart.onChartClick(this.id);
            })
            .attr("x", function(d, i) {
                return 10 + i * (barChart.width / barChart.datakeys.length);
            })
            .attr("id", function(d, i) {
                return i;
            })
            .attr("class", "bar")
            .attr("width", barChart.width / barChart.datakeys.length - barChart.barPadding);


        // inverse axes
        if (doInverseY) {
            rects
                .attr("y", function(d) {
                    return barChart.y(d.value);
                })
                .attr("height", function(d) {
                    return barChart.height - barChart.y(d.value);
                });
        } else {
            rects
                .attr("y", 0)
                .attr("height", function(d) {
                    return barChart.y(d.value);
                });
        }

        this.drawAxis();

    };

    // main
    this.draw = function(data, title, doSort) {
        // setup datakeys
        this.datakeys = data;


        // cleanup old graphs
        d3.select("div#" + this.queryId).selectAll("div#graphs h4").remove();
        d3.select("div#" + this.queryId).selectAll("div#graphs svg").remove();

        // draw each charts
        this.drawBarChart(title, true);
    };
}



function Trace(onTraceChartOver, onTraceChartClick) {
    this.onTraceChartOver = onTraceChartOver;
    this.onTraceChartClick = onTraceChartClick;
    this.maxSamples = 200;
    this.margin = {
        top: 20,
        right: 80,
        bottom: 30,
        left: 50
    };
    this.width = 960 - this.margin.left - this.margin.right;
    this.height = 140 - this.margin.top - this.margin.bottom;
    this.barPadding = 1;

    // declare arrays
    this.dataset = {};
    this.datakeys = [];

    // methods
    this.key = function(name, d) {
        switch (name) {
            case "id":
                return d.id;
            case "frequency":
                return d.frequency;
            case "timeInterval":
                return d.timeInterval;
            case "download":
                return d.download;
            case "upload":
                return d.upload;
        }
    };
    this.createSvgGraph = function(title) {
        d3.select("div#graphs")
            .append("h4")
            .text(title);

        return d3.select("div#graphs")
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height);
    };
    this.createScale = function(keyName, isInverted) {

        var trace = this;
        var scale = d3.scale.linear()
            .domain([d3.min(trace.datakeys, function(d) {
                return trace.key(keyName, d);
            }), d3.max(trace.datakeys, function(d) {
                return trace.key(keyName, d);
            })]);

        if (isInverted)
            scale.range([trace.height, 1]);
        else
            scale.range([1, trace.height]);

        return scale;
    };
    this.drawAxis = function(svgGraph, scale) {
        //Define Y axis and Create Y axis
        var yAxis = d3.svg.axis().scale(scale)
            .orient("right")
            .ticks(10);

        svgGraph.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + this.width - 30 + ",0)")
            .call(yAxis);
    };
    this.setupData = function() {
        this.datakeys = [];
        for (var i = 0; i < this.dataset.hits.hits.length && i < this.maxSamples; i++) {
            var hit = this.dataset.hits.hits[i]._source;
            this.datakeys.push({
                ipSource: hit.ipSource,
                ipTarget: hit.ipTarget,
                frequency: hit.mostSignificantFrequency,
                timeInterval: hit.avgTimeBetweenTwoFLows,
                upload: hit.avgUploadedBytes,
                download: hit.avgDownloadedBytes
            });
        }
    };
    this.drawBarChart = function(title, keyName, doInverseY) {

        var svgGraph = this.createSvgGraph(title);
        var dataScale = this.createScale(keyName, doInverseY);
        var trace = this;

        var rects = svgGraph.selectAll("rect")
            .data(trace.datakeys)
            .enter()
            .append("rect")
            .on("mouseover", function() {
                onTraceChartOver(trace.datakeys[this.id]);
            })
            .on("click", function() {
                onTraceChartClick(trace.datakeys[this.id]);
            })
            .attr("x", function(d, i) {
                return 30 + i * (trace.width / trace.datakeys.length);
            })
            .attr("id", function(d, i) {
                return i;
            })
            .attr("fill", "teal")
            .attr("width", trace.width / trace.datakeys.length - trace.barPadding);

        // inverse axes
        if (doInverseY) {
            rects
                .attr("y", function(d) {
                    return dataScale(trace.key(keyName, d));
                })
                .attr("height", function(d) {
                    return trace.height - dataScale(trace.key(keyName, d));
                });
        } else {
            rects
                .attr("y", 0)
                .attr("height", function(d) {
                    return dataScale(trace.key(keyName, d));
                });
        }


        this.drawAxis(svgGraph, dataScale);

    };

    // main
    this.draw = function(dataset) {
        // setup datakeys
        this.dataset = dataset;
        this.setupData();

        // cleanup old graphs
        d3.selectAll("div#graphs h4").remove();
        d3.selectAll("div#graphs svg").remove();
        // draw each charts
        this.drawBarChart('Most significant frequency', "frequency", true);
        this.drawBarChart('Average time interval between 2 request', "timeInterval", true);
        this.drawBarChart('Average uploaded data', "upload", true);
        this.drawBarChart('Average downloaded data', "download", false);
    };
}