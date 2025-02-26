var d3 = require('d3'),
    fs = require('fs'),
    inputFile = '../religionByCountry.csv';

fs.readFile(inputFile, 'utf8', function (err, data) {
  var data = d3.csv.parse(data);
  var religions = [
    "Christian",
    "Muslim",
    "Unaffiliated",
    "Hindu",
    "Buddhist",
    "Folk Religions",
    "Other Religions",
    "Jewish"
  ];
  var totals = {};

  religions.forEach(function (religion){
    totals[religion] = 0;
  });

  data.forEach(function (d){
    var total = 0;
    religions.forEach(function (religion){
      if(d[religion] === "< 10000"){
        d[religion] = 0;
      } else {
        d[religion] = +d[religion];
      }
      total += d[religion];
      totals[religion] += d[religion];
    });
    d.total = total;
  });

  // Pivot the data so "religion" is a column.
  var religionByCountry = [];
  data.forEach(function (d){
    religions.forEach(function (religion){
      religionByCountry.push({
        country: d.Country,
        religion: religion,
        population: d[religion]
      });
    });
  });
  writeTable("religionByCountry.csv", religionByCountry);


  // Derive a table of worldwide religion totals.
  var religionWorldTotals = religions.map(function (religion){
    return {
      religion: religion,
      population: totals[religion]
    };
  });
  writeTable("religionWorldTotals.csv", religionWorldTotals);


  // Take the top 5 countries by population and sort them.
  data = data
    .filter(function (d){ return d.total > 180000000; })
    .sort(function (a, b){ return b.total - a.total; });

  // Pivot the data so "religion" is a column.
  var religionByCountryTop5 = [];
  data.forEach(function (d){
    religions.forEach(function (religion){
      religionByCountryTop5.push({
        country: d.Country,
        religion: religion,
        population: d[religion]
      });
    });
  });
  writeTable("religionByCountryTop5.csv", religionByCountryTop5);


  // Derive a table of the populations for the top 5 largest countries.
  var countryTotalsTop5 = data.map(function (d){
    return {
      country: d.Country,
      population: d.total
    };
  });
  writeTable("countryTotalsTop5.csv", countryTotalsTop5);

});

function writeTable(fileName, data){
  fs.writeFile(fileName, toCSV(data), function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log("Wrote '" + fileName + "'!");
    }
  }); 
}

function toCSV(data){
  var columns = Object.keys(data[0]);
  return [columns.join(",")].concat(data.map(function(d){
    return columns.map(function(column){
      return d[column];
    }).join(",");
  })).join("\n");
}
