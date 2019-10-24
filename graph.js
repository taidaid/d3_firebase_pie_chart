const dimensions = { height: 300, width: 300, radius: 150 }; // set initial dimensions of chart area
const center = { x: dimensions.width / 2, y: dimensions.height / 2 }; // calculate the center of the chart area

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

const angles = pie([
  // sample data
  {
    name: "rent",
    cost: 500
  },
  {
    name: "bills",
    cost: 300
  },
  {
    name: "gaming",
    cost: 200
  }
]);

const arcPath = d3
  .arc()
  .outerRadius(dimensions.radius)
  .innerRadius(dimensions.radius / 2);

console.log(arcPath(angles[0]));
