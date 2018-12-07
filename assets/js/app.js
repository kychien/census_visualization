// Set up SVG params
var svgHgt = 670;
var svgWdt = 820;
// Set up margins
var margins = {
    top: 30,
    right: 30,
    bottom: 90,
    left: 90
};

var chtHgt = svgHgt - margins.top - margins.bottom;
var chtWdt = svgWdt - margins.left - margins.right;

// Set up SVG in page
var svg = d3.select("#scatter").append("svg")
    .attr("height", svgHgt)
    .attr("width", svgWdt);

// Set up space for chart with margins
var chtGrp = svg.append("g")
    .attr("transform", `translate(${margins.left}, ${margins.top})`);

// Function to create scale for x coord
function xScale(data, key) {
    return d3.scaleLinear().domain([
        d3.min(data, d => d[key]) * 0.8,
        d3.max(data, d => d[key]) * 1.2
        ]).range([0, chtWdt]);
}

// Function to create scale for y coord
function yScale(data, key) {
    return d3.scaleLinear().domain([
        d3.min(data, d => d[key]) * 0.8,
        d3.max(data, d => d[key]) * 1.2
        ]).range([chtHgt, 0]);
}

// Function to update the X axis on selection change
function updateBotAxis(scale, axis) {
    var botAx = d3.axisBottom(scale);

    axis.transition().duration(1000).call(botAx);

    return axis;
}

// Function to update the Y axis on selection change
function updateLeftAxis(scale, axis) {
    var leftAx = d3.axisLeft(scale);

    axis.transition().duration(1000).call(leftAx);

    return axis;
}

// Open csv to get source data
d3.csv("./assets/data/data.csv", (error, data) => {
    
    // Handle errors
    if (error)
        return console.warn(error);
    
    // log data
    console.log(data);

    // convert strings to numbers
    data.forEach(row => {
        row.poverty = +row.poverty;
        row.povertyMoe = +row.povertyMoe;
        row.age = +row.age;
        row.ageMoe = +row.ageMoe;
        row.income = +row.income;
        row.incomeMoe = +row.incomeMoe;
        row.noHealthInsurance = +row.noHealthInsurance;
        row.obesity = +row.obesity;
        row.smokes = +row.smokes;
    });
    
    // Data keys and corresponding display labels
    var xKeys = ["poverty", "age", "income"];
    var xLbls = ["Poverty Level (%)", "Median Age", "Median Household Income"];

    var yKeys = ["obesity", "smokes", "noHealthInsurance"];
    var yLbls = ["Obese (%)", "Smoker (%)", "Lacks Health Insurance (%)"];

    // Selection trackers
    var x = 0;
    var y = 2;

    // set X scales
    var xCurrent = xScale(data, xKeys[x]);
    
    // set Y scales
    var yCurrent = yScale(data, yKeys[y]);

    // Create axes
    var botRule = d3.axisBottom(xCurrent);
    var lftRule = d3.axisLeft(yCurrent);

    // Add axes to chart
    var yAxis = chtGrp.append("g").attr("class", "axis")
        .call(lftRule);
    var xAxis = chtGrp.append("g").attr("class", "axis")
        .attr("transform", `translate(0, ${chtHgt})`)
        .call(botRule);
    
    // Add initial data plots
    var plotGrp = chtGrp.selectAll("circle").data(data)
        .enter()
        .append("circle")
            .attr("class", "stateCircle")
            .attr("cx", d => xCurrent(d[xKeys[x]]))
            .attr("cy", d => yCurrent(d[yKeys[y]]))
            .attr("r", 15)
            .attr("opacity", ".66");
    var lblsGrp = chtGrp.selectAll(".abbr").data(data)
        .enter()
        .append("text")
            .attr("x", d => xCurrent(d[xKeys[x]]))
            .attr("y", d => yCurrent(d[yKeys[y]]) + 4)
            .attr("class", "abbr stateText")
            .text(d => `${d.abbr}`);
    
    
});