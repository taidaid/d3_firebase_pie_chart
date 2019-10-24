const dimensions = { height: 300, width: 300, radius: 150 }; // set initial dimensions of chart area
const center = { x: dimensions.width / 2 + 5, y: dimensions.height / 2 + 5 }; // calculate the center of the chart area

const svg = d3
  .select(".canvas")
  .append("svg")
  .attr("width", dimensions.width + 150) // adding 150px to x-axis to leave room for legend
  .attr("height", dimensions.height + 150); // adding 150px to y-axis for some breahting room

const graph = svg // create the group for containing the chart elements
  .append("g")
  .attr("transform", `translate(${center.x},${center.y})`); // move the graph group to center of chart area

const pie = d3
  .pie() // generates angles for each object based on value; angles will add up to (2 * PI) radians
  .sort(null) // .sort(null) to prevent .pie() from sorting data based on size of value
  .value(d => d.cost);

const arcPath = d3
  .arc()
  .outerRadius(dimensions.radius)
  .innerRadius(dimensions.radius / 2);

// sets a color() function with chosen color scheme
const color = d3.scaleOrdinal(d3.schemeSet3);

// legend setup
const legendGroup = svg
  .append("g")
  .attr("transform", `translate(${dimensions.width + 40}, ${10})`);

const legend = d3
  .legendColor()
  .shape("circle")
  .scale(color);

// update function
const update = data => {
  // update color scale domain
  color.domain(data.map(d => d.name));

  //update and call legend
  legendGroup
    .call(legend)
    .attr("stroke", "#fff")
    .attr("stroke-width", 1)
    .selectAll("text")
    .attr("fill", "white")
    .style("font-size", "1.5rem")
    .attr("stroke-width", 0.25);

  legendGroup.selectAll(".cell").style("margin", 50);

  // join enhanced (pie) data to path elements
  const paths = graph.selectAll("path").data(pie(data));

  // handle the exit selection
  paths
    .exit()
    .transition()
    .duration(750)
    .attrTween("d", arcTweenExit)
    .remove();

  // handle the current DOM path updates
  paths
    .attr("class", "arc")
    .attr("d", arcPath) // The 'd' refers to <path d="">
    .attr("stroke", "#fff")
    .attr("stroke-width", 3)
    .attr("fill", d => color(d.data.name));

  // handle adding new path elements as needed to match data
  paths
    .attr("d", arcPath)
    .transition()
    .duration(750)
    .attrTween("d", arcTweenUpdate);

  paths
    .enter()
    .append("path")
    .attr("class", "arc")
    // .attr("d", arcPath) // The 'd' refers to <path d="">
    .attr("stroke", "#fff")
    .attr("stroke-width", 3)
    .attr("fill", d => color(d.data.name))
    .each(function(d) {
      this._current = d;
    })
    .transition()
    .duration(750)
    .attrTween("d", arcTweenEnter);
};

// data array and firestore
let data = [];
db.collection("expenses").onSnapshot(res => {
  res.docChanges().forEach(change => {
    const doc = { ...change.doc.data(), id: change.doc.id };
    switch (change.type) {
      case "added":
        data.push(doc);
        break;
      case "modified":
        const index = data.findIndex(item => item.id === doc.id);
        data[index] = doc;
        break;
      case "removed":
        data = data.filter(item => item.id !== doc.id);
        break;
      default:
        break;
    }
  });
  update(data);
});

const arcTweenEnter = d => {
  let i = d3.interpolate(d.endAngle, d.startAngle);

  return function(t) {
    d.startAngle = i(t);
    return arcPath(d);
  };
};

const arcTweenExit = d => {
  let i = d3.interpolate(d.startAngle, d.endAngle);

  return function(t) {
    d.startAngle = i(t);
    return arcPath(d);
  };
};

// use function keyword for appropriate 'this'
function arcTweenUpdate(d) {
  // interpolate between the two objects, original (_current) and updated (d)
  let i = d3.interpolate(this._current, d);

  // update the current prop with new updated data
  this._current = i(1); // 1 represents the end value which is the same as the updated (d)

  return function(t) {
    return arcPath(i(t));
  };
}
