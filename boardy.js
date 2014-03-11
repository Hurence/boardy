/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

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