const svg = d3.select(".canvas").append("svg");

let countries;
let countriesData;
d3.csv("data.csv").then((data) => {
  cleanData(data);
});

const cleanData = (data) => {
  let continents = [
    "Asia",
    "Australia",
    "North America",
    "South America",
    "Antartica",
    "Africa",
    "Europe",
    "World",
    "High income",
    "European Union",
    "Upper middle income",
    "Lower middle income",
    "International",
  ];
  let tempCountries = [];
  data.map((item) => {
    let found = false;
    for (let i = 0; i < tempCountries.length; i++) {
      if (tempCountries[i] === item.location) {
        found = true;
        break;
      }
    }

    for (let i = 0; i < continents.length; i++) {
      if (continents[i] === item.location) {
        found = true;
        break;
      }
    }

    if (!found) tempCountries.push(item.location);
  });

  let finalData = [];
  for (let i = 0; i < tempCountries.length; i++) {
    let countryArray = [];
    for (let j = 0; j < data.length && countryArray.length <= 600; j++) {
      if (tempCountries[i] === data[j].location) {
        // console.log(data[j].location);
        countryArray.push(parseInt(data[j].total_cases, 10));
      }
    }
    finalData.push(countryArray);
  }
  countries = tempCountries;
  countriesData = finalData;
};

let render = (data, max) => {
  data.sort((b, a) => {
    return a.value - b.value;
  });
  let xScale = d3.scaleLinear().domain([0, max]).range([0, window.innerWidth-20]);
  let yScale = d3
    .scaleBand()
    .domain(
      data.map((runner, index) => {
        return index;
      })
    )
    .paddingInner(0.1)
    .range([0, 10000]);

  const colorScale = d3.scaleOrdinal(d3["schemeSet3"]).domain(data.map((item) => item.name));

  // let rects = svg
  //   .selectAll("rect")
  //   .data(data, (entry, index) => entry.name)
  //   .join((enter) =>
  //     enter.append("rect").attr("y", (entry, index) => yScale(index))
  //   )
  //   .attr("height", yScale.bandwidth())
  //   .attr("fill", (d) => d.color)
  //   .transition()
  //   .ease(d3.easeLinear)
  //   .duration(200)
  //   .attr("width", (d) => xScale(d.value))
  //   .attr("y", (d, i) => yScale(i));

  let rects = svg.selectAll("rect").data(data, (entry, index) => entry.name);
  rects
    .attr("height", yScale.bandwidth())
    .attr("fill", (d, i) => colorScale(d.name))
    .transition()
    .ease(d3.easeLinear)
    .duration(200)
    .attr("y", (d, i) => yScale(i))
    .attr("width", (d) => xScale(d.value));
  rects
    .enter()
    .append("rect")
    .attr("height", yScale.bandwidth())
    .attr("fill", (d) => colorScale(d.name))
    .attr("y", (d, i) => yScale(i))
    .transition()
    .ease(d3.easeLinear)
    .duration(200)
    .attr("width", (d) => xScale(d.value));

  let texts = svg
    .selectAll("text")
    .data(data, (entry, index) => entry.name)
    .join((enter) =>
      enter.append("text").attr("y", (d, i) => {
        return yScale(i) + yScale.bandwidth() / 2;
      })
    )
    .text((d) => `${d.name} 🦠 @ cases : ${Math.floor(d.value)}`)
    .style("font-family", "Arial")
    .style("font-weight", 600)
    .transition()
    .ease(d3.easeLinear)
    .duration(200)
    .attr("y", (d, i) => {
      return yScale(i) + yScale.bandwidth() / 2;
    });
};

// // 600 -> 1 min
// // db data -> json file me data
let currIdx = 0;
setInterval(() => {
  if (!countries && !countriesData) {
    console.log("DATA NOT HERE");
    return;
  }
  let data = [];
  for (let i = 0; i < countries.length; i++) {
    if (!countriesData[i][currIdx] || countriesData[i][currIdx].isNan) continue;
    data.push({
      name: countries[i],
      value: countriesData[i][currIdx],
      color: "pink",
    });
  }
  currIdx++;

  let max = -1;
  data.map((item) => {
    if (item.value > max) {
      max = item.value;
    }
  });

  render(data, max);
}, 200);
