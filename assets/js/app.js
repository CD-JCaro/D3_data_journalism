// @TODO: YOUR CODE HERE!
var currLabels = 
{
    x: "poverty",
    y: "healthcare"
};

var axisLabels = 
{
    x: ["poverty", "age", "income"],
    y: ["healthcare", "obesity", "smokes"]
};

var axisGroups = 
{
    x: null,
    y: null
};

function prepareData(data)
{
    data.forEach(element => 
    {
        //do i need to do all these? probably not but why not
        element.poverty = +element.poverty;
        element.povertyMoe = +element.povertyMoe;
        element.age = +element.age;
        element.ageMoe = +element.ageMoe;
        element.income = +element.income;
        element.incomeMoe = +element.incomeMoe;
        element.healthcare = +element.healthcare;
        element.healthcareLow = +element.healthcareLow;
        element.healthcareHigh = +element.healthcareHigh;
        element.obesity = +element.obesity;
        element.obesityLow = +element.obesityLow;
        element.obesityHigh = +element.obesityHigh;
        element.smokes = +element.smokes;
        element.smokesLow = +element.smokesLow;
        element.smokesHigh= +element.smokesHigh;
    });
    return data;
}

function setupData(xData, yData)
{

    d3.csv('./assets/data/data.csv').then(function(data) 
    {
        var newData = prepareData(data);

        var svgHeight = 700;
        var svgWidth = 900;

        var margin = {
            top: 50,
            right: 50,
            bottom: 100,
            left: 100
        };

        var chart = 
        {
            height: svgHeight - margin.top - margin.bottom,
            width: svgWidth - margin.left - margin.right
        };

        var svg = d3.select("#scatter").append("svg")
        .attr("height", svgHeight)
        .attr("width", svgWidth);
    
        var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);


        var x = data.map(data => data[xData]);
        var y = data.map(data => data[yData]);

        var yScale = d3.scaleLinear()
        .domain([d3.min(y) * 0.8, d3.max(y) * 1.2])
        .range([chart.height, 0]);

        var xScale = d3.scaleLinear()
        .domain([d3.min(x) * 0.8, d3.max(x) * 1.2])
        .range([0, chart.width]);

        var yAxis = d3.axisLeft(yScale);
        var xAxis = d3.axisBottom(xScale);

        axisGroups.x = chartGroup.append("g")
        .attr("transform", `translate(0, ${chart.height})`)
        .call(xAxis);

        axisGroups.y = chartGroup.append("g")
        .call(yAxis);

        var circles = chartGroup.selectAll("circle")
        .data(newData)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d[xData]))
        .attr("cy", d => yScale(d[yData]))
        .attr("r", 10)
        .attr("fill", "blue")
        .attr("opacity", 0.75);

        updateToolTip(circles);

        var labels = chartGroup.selectAll("labels")
        .data(newData)
        .enter()
        .append("text")
        .attr("x", d => xScale(d[xData]))
        .attr("y", d => yScale(d[yData]))
        .attr("dy", 4)
        .attr("fill", "white")
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .text(d => d.abbr);

        updateToolTip(labels);

        var labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${chart.width / 2}, ${chart.height + 20})`);

        //should this bit be a function... probably
        labelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("id", "poverty")
            .attr("value", "poverty") 
            .classed("active", true)
            .text("In Poverty (%)");

        labelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("id", "age")
            .attr("value", "age")
            .classed("inactive", true)
            .text("Age (Median)");

        labelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("id", "income")
            .attr("value", "income")
            .classed("inactive", true)
            .text("Household Income (Median)");

        var labelsGroup2 = chartGroup.append("g")
        .attr("transform", `translate(-50, ${chart.height / 2})`);

        // should probably be a function
        labelsGroup2.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0)
        .attr("y", 0)
        .attr("id", "healthcare")
        .attr("value", "healthcare")
        .classed("active", true)
        .text("Lacks Healthcare (%)");

        labelsGroup2.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0)
        .attr("y", -20)
        .attr('id', "smokes")
        .attr("value", "smokes")
        .classed("inactive", true)
        .text("Smokes (%)");

        labelsGroup2.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0)
        .attr("y", -40)
        .attr("id", "obesity")
        .attr("value", "obesity")
        .classed("inactive", true)
        .text("Obese (%)");

        labelsGroup.selectAll("text").on("click", function()
        {
            updateTable(d3.select(this).attr("value"),'x', chart, newData, circles, labels);
        });

        labelsGroup2.selectAll("text").on("click", function()
        {
            updateTable(d3.select(this).attr("value"),'y', chart, newData, circles, labels);
        });
    });
}

function updateTable(value, axis, chart, data, circles, labels)
{
    if (value !== currLabels[axis]) 
    {
        currLabels[axis] = value;

        axisLabels[axis].forEach(axis=> d3.select(`#${axis}`).classed("active", false).classed("inactive", true));
        d3.select(`#${currLabels[axis]}`).classed("active", true).classed("inactive", false);

        linearScale = updateAxis(value, chart, data, axis);

        transitionAxis(linearScale, axis);

        circles = movePoints(linearScale, axis, value, circles, 'c');
        labels = movePoints(linearScale, axis, value, labels);

        updateToolTip(circles);
        updateToolTip(labels);
    }
}

function transitionAxis(scale, axis) 
{
    var newAxis = null;
    if(axis === 'y')
    {
      newAxis = d3.axisLeft(scale);
    }
    else
    {
      newAxis = d3.axisBottom(scale);
    }

  
    axisGroups[axis].transition()
      .duration(500)
      .call(newAxis);

    return axisGroups[axis];
  }

function movePoints(scale, axis, value, group, prefix = '') 
{

    group.transition()
      .duration(500)
      .attr(`${prefix}${axis}`, d => scale(d[value]));
  
    return group;
}

function updateToolTip(group)
{
  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-5, 0])
    .html(function(d) 
    {
      return (`<h5>${d['state']}</h5>${currLabels.x}: ${d[currLabels.x]}<br>${currLabels.y}: ${d[currLabels.y]}`);
    });

  group.call(toolTip);

  group.on("mouseover", function(data) 
  {
    toolTip.show(data);
  })
  .on("mouseout", function(data) 
  {
    toolTip.hide(data);
  });
}

function updateAxis(value, chart, data, axis)
{
  var axisData = data.map(data => data[value]);

  var range = [0, chart.width];
  
  if(axis === 'y')
  {
    range = [chart.height,0];
  }
  var linearScale = d3.scaleLinear()
    .domain([d3.min(axisData) * 0.8,
      d3.max(axisData) * 1.2
    ])
    .range(range);

  return linearScale;
}

setupData(currLabels.x, currLabels.y);
