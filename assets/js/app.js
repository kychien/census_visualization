// Set up SVG params
var svgHgt = 660;
var svgWdt = 690;
// Set up margins
var margins = {
    top: 30,
    right: 30,
    bottom: 30,
    left: 30
};

var chtHgt = svgHgt - margins.top - margins.bottom;
var chtWdt = svgWdt - margins.left - margins.right;

// Set up SVG in page
var svg = d3.select("#scatter").append("svg")
    .attr("height", svgHgt)
    .attr("width", svgWdt);

var chtGrp = svg.append("g")
    .attr("transform", `tanslate(${margins.left}, ${margins.top})`);

d3.csv("./assets/data/data.csv", (error, rawData) => {
    if (error)
        return console.warn(error);
    
    console.log(rawData);

    rawData.forEach(row =>{
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

    var xPovScl = d3.scaleLinear()
        .domain(d3.extent(rawData, row => row.poverty))
        .range([0, chtWdt]);
    
    var xAgeScl = d3.scaleLinear()
        .domain(d3.extent(rawData, row => row.age))
        .range([0, chtWdt]);

    var xIncScl = d3.scaleLinear()
        .domain(d3.extent(rawData, row => row.income))
        .range([0, chtWdt]);

})