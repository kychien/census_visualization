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
function updateBotAxis(nScale, xAxis) {
    // Create new axis
    var botRule = d3.axisBottom(nScale);
    // Transition to new axis
    xAxis.transition().duration(1000).call(botRule);

    return xAxis;
}

// Function to update the Y axis on selection change
function updateLftAxis(nScale, yAxis) {
    // Create new axis
    var lftRule = d3.axisLeft(nScale);
    // Transitiont to new axis
    yAxis.transition().duration(1000).call(lftRule);

    return yAxis;
}

function updateXPlots(plotGrp, lblsGrp, xTrans, key) {
    // Move circles
    plotGrp.transition()
        .duration(1000)
        .attr("cx", d => xTrans(d[key]));
    // Move labels
    lblsGrp.transition()
        .duration(1000)
        .attr("x", d => xTrans(d[key]));
    
    return plotGrp;
}

function updateYPlots(plotGrp, lblsGrp, yTrans, key) {
    // Move circles
    plotGrp.transition()
        .duration(1000)
        .attr("cy", d => yTrans(d[key]));
    // Move labels
    lblsGrp.transition()
        .duration(1000)
        .attr("y", d => yTrans(d[key]) + 4);
    
    return plotGrp;
}

function updateToolTips(xKey, yKey, plotGrp, lblsGrp){
    var xDesc = "Household Income: $";
    var xTail = "";
    var yDesc = "Uninsured: ";
    var yTail = "%";
    switch (xKey) {
        case "poverty":
            xDesc = "Poverty: ";
            xTail = "%";
            break;
        case "age":
            xDesc = "Median Age: ";
            break;
    }
    switch (yKey) {
        case "obesity":
            yDesc = "Obesity: ";
            break;
        case "smokes":
            yDesc = "Smoker: ";
            break;
    }
    var toolTip = d3.tip()
        .attr("class", "tooltip d3-tip")
        .offset([88, -60])
        .html(d => `${d.state}<br>${xDesc}${d[xKey]}${xTail}<br>${yDesc}${d[yKey]}${yTail}`);
    
    // plotGrp.call(toolTip);

    // plotGrp
    //     .on("mouseover", d => toolTip.show(d))
    //     .on("mouseout", d => toolTip.hide(d));

    lblsGrp.call(toolTip);

    lblsGrp
        .on("mouseover", d => toolTip.show(d))
        .on("mouseout", d => toolTip.hide(d));
    
    return plotGrp;
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
        row.age = +row.age;
        row.income = +row.income;
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
    var xCurScale = xScale(data, xKeys[x]);
    
    // set Y scales
    var yCurScale = yScale(data, yKeys[y]);

    // Create axes
    var botRule = d3.axisBottom(xCurScale);
    var lftRule = d3.axisLeft(yCurScale);

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
            .attr("cx", d => xCurScale(d[xKeys[x]]))
            .attr("cy", d => yCurScale(d[yKeys[y]]))
            .attr("r", 15)
            .attr("opacity", ".66");

    // Add State abbreviations 
    var lblsGrp = chtGrp.selectAll(".abbr").data(data)
        .enter()
        .append("text")
            .attr("class", "abbr stateText")
            .attr("x", d => xCurScale(d[xKeys[x]]))
            .attr("y", d => yCurScale(d[yKeys[y]]) + 4) // Anchor middle not centering Y coord?
            .text(d => `${d.abbr}`);
    
    // Add Tooltips
    plotGrp = updateToolTips(xKeys[x], yKeys[y], plotGrp, lblsGrp);
    
    // Place X axis options on chart
    var xOptionsGrp = chtGrp.append("g")
        .attr("transform", `translate(${chtWdt/2}, ${chtHgt + 20})`);
    
    xOptionsGrp.selectAll("text").data(xLbls)
        .enter()
        .append("text")
            .attr("x", 0)
            .attr("y", (d,i) => (i+1)*20)
            .attr("value", (d,i) => i)
            .attr("class", (d,i) => (i == x) ? "active" : "inactive")
            .text(d => d);
    
    // Place Y axis options on chart
    var yOptionsGrp = chtGrp.append("g")
        .attr("transform", "rotate(-90)");
    
    yOptionsGrp.selectAll("text").data(yLbls)
        .enter()
        .append("text")
            .attr("x", (0 - (chtHgt / 2)))
            .attr("y", (d,i) => 0 - (2-i)*20 - 30)
            .attr("value", (d,i) => i)
            .attr("class", (d,i) => (i == y) ? "active" : "inactive")
            .text(d => d);
    
    // Axis event listeners
    xOptionsGrp.selectAll("text").on("click", function() {
        // Check what was clicked
        var k = d3.select(this).attr("value");

        // Update if new
        if (k !== x) {
            // Change active label
            xOptionsGrp.selectAll("text")
                .attr("class", (d,i) => (i == k) ? "active" : "inactive");
            // Change active x index
            x = k;
            // Update scale
            xCurScale = xScale(data, xKeys[x]);

            // Update x axis
            xAxis = updateBotAxis(xCurScale, xAxis);

            // Move plots and abbreviations accordingly
            plotGrp = updateXPlots(plotGrp, lblsGrp, xCurScale, xKeys[x]);

            // Update tooltips
            plotGrp = updateToolTips(xKeys[x], yKeys[y], plotGrp, lblsGrp);
        }
    });
    yOptionsGrp.selectAll("text").on("click", function() {
        // Check what was clicked
        var k = d3.select(this).attr("value");

        // Update if new
        if (k !== y) {
            // Change active label
            yOptionsGrp.selectAll("text")
                .attr("class", (d,i) => (i == k) ? "active" : "inactive");
            // Change active y index
            y = k;
            // Update scale
            yCurScale = yScale(data, yKeys[y]);

            // Update y axis
            yAxis = updateLftAxis(yCurScale, yAxis);

            // Move plots and abbreviations accordingly
            plotGrp = updateYPlots(plotGrp, lblsGrp, yCurScale, yKeys[y]);

            // Update tooltips
            plotGrp = updateToolTips(xKeys[x], yKeys[y], plotGrp, lblsGrp);
        }
    });

});